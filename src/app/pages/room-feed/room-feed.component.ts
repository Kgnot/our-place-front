import { Component, inject, afterNextRender, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AffectionService } from '../../services/affection.service';
import { GalleryService } from '../../services/gallery.service';
import { FormsModule } from '@angular/forms';
import { RoomHeaderComponent } from '../../shared/components/room-header/room-header.component';
import { firstValueFrom, forkJoin } from 'rxjs';
import { extractExif } from '../../utils/exif.util'; // <-- IMPORT EXIF

@Component({
  selector: 'app-room-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, RoomHeaderComponent],
  templateUrl: './room-feed.component.html',
  styleUrl: './room-feed.component.css',
})
export class RoomFeedComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private affectionService = inject(AffectionService);
  private galleryService = inject(GalleryService);

  notes = this.affectionService.notes;
  isLoading = this.affectionService.isLoading;

  // NUEVO: Estado para las fotos del Feed
  mediaItems = signal<any[]>([]);

  roomId = signal<string>('');
  isAddModalOpen = signal(false);
  newNoteContent = signal('');
  isSaving = signal(false);

  // Variables de subida
  @ViewChild('fileInput') fileInput!: ElementRef;
  selectedFiles = signal<File[]>([]);
  isPreviewOpen = signal(false);
  previewUrls = signal<string[]>([]);

  // NUEVO: Estado de la subida
  isUploading = signal(false);
  uploadStatus = signal<string>('');

  constructor() {
    afterNextRender(() => {
      const id = this.route.snapshot.paramMap.get('roomId');
      if (id) {
        this.roomId.set(id);
        this.affectionService.loadNotes(id);
        this.loadMedia(id); // Cargamos fotos existentes
      }
    });
  }

  // NUEVO: Cargar fotos iniciales
  loadMedia(roomId: string) {
    this.galleryService.getMediaList(roomId).subscribe({
      next: (page) => this.mediaItems.set(page.content || []),
    });
  }

  // --- Lógica de Subir Fotos (El Workflow completo) ---
  openFilePicker() {
    this.fileInput.nativeElement.click();
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      this.selectedFiles.set(files);
      this.previewUrls.set(files.map((file) => URL.createObjectURL(file)));
      this.isPreviewOpen.set(true);
    }
  }

  closePreview() {
    this.isPreviewOpen.set(false);
    this.selectedFiles.set([]);
    this.previewUrls.set([]);
    if (this.fileInput) this.fileInput.nativeElement.value = '';
  }

  async uploadPhotos() {
    const files = this.selectedFiles();
    if (files.length === 0) return;

    this.isUploading.set(true);
    this.uploadStatus.set('Leyendo metadatos de las fotos...');

    try {
      // 0. EXTRAER EXIF de cada archivo (en paralelo)
      const exifData = await Promise.all(files.map((file) => extractExif(file)));

      // 1. PRESIGN
      this.uploadStatus.set('Preparando subida...');
      const entries = files.map((file) => ({
        mediaTypeCode: file.type.startsWith('video') ? 'video' : 'photo',
        mimeType: file.type,
        fileSizeBytes: file.size,
      }));

      const presignRes = await firstValueFrom(
        this.galleryService.presignUpload(this.roomId(), entries),
      );
      const presignedItems = presignRes.items;

      // 2. SUBIDA A R2 EN PARALELO
      this.uploadStatus.set(`Subiendo ${files.length} fotos a almacenamiento...`);
      const uploadObservables = presignedItems.map((item, i) =>
        this.galleryService.uploadToR2(item.uploadUrl, files[i]),
      );

      const uploadResults = await firstValueFrom(forkJoin(uploadObservables));

      // Filtrar las que sí subieron y mapear con el EXIF
      const succeededItems = presignedItems
        .map((item, index) => ({ item, index }))
        .filter(({ index }) => uploadResults[index] === true)
        .map(({ item, index }) => ({
          mediaId: item.mediaId,
          r2Key: item.r2Key,
          mediaTypeCode: files[index].type.startsWith('video') ? 'video' : 'photo',
          mimeType: files[index].type,
          fileSizeBytes: files[index].size,
          // ↓↓↓ Metadatos del EXIF ↓↓↓
          takenAt: exifData[index].takenAt,
          latitude: exifData[index].latitude,
          longitude: exifData[index].longitude,
          caption: null,
        }));

      if (succeededItems.length === 0) {
        alert('Ninguna foto pudo subirse. Inténtalo de nuevo.');
        this.isUploading.set(false);
        return;
      }

      // 3. CONFIRM con los datos del EXIF
      this.uploadStatus.set('Confirmando con el servidor...');
      const confirmedMedia = await firstValueFrom(
        this.galleryService.confirmUpload(this.roomId(), succeededItems),
      );

      // Añadimos al estado local
      this.mediaItems.update((prev) => [...confirmedMedia, ...prev]);

      this.isUploading.set(false);
      this.closePreview();

      // 4. POLLING para thumbnails
      this.pollForThumbnails(confirmedMedia.map((m: any) => m.id || m.mediaId)); // Validamos si viene id o mediaId
    } catch (error) {
      console.error('Error en el flujo de subida', error);
      this.isUploading.set(false);
      alert('Ocurrió un error durante la subida.');
    }
  }

  // NUEVO: Polling para thumbnails
  pollForThumbnails(mediaIds: string[]) {
    const remaining = new Set(mediaIds);
    const interval = setInterval(() => {
      this.galleryService.getMediaList(this.roomId(), 0, 50).subscribe((page) => {
        page.content.forEach((media: any) => {
          if (media.thumbnailUrl && remaining.has(media.mediaId)) {
            remaining.delete(media.mediaId);
            // Actualizar la foto en el estado local
            this.mediaItems.update((items) =>
              items.map((it) =>
                it.mediaId === media.mediaId ? { ...it, thumbnailUrl: media.thumbnailUrl } : it,
              ),
            );
          }
        });

        if (remaining.size === 0) {
          clearInterval(interval); // Todos listos!
        }
      });
    }, 3000); // Cada 3 segundos

    // Safety: parar después de 60 seg
    setTimeout(() => clearInterval(interval), 60000);
  }

  // --- Lógica de Notas (igual que antes) ---
  openAddModal() {
    this.isAddModalOpen.set(true);
  }
  closeAddModal() {
    this.isAddModalOpen.set(false);
    this.newNoteContent.set('');
  }

  saveNote() {
    if (!this.newNoteContent().trim()) return;
    this.isSaving.set(true);
    this.affectionService
      .createNote(this.roomId(), { typeCode: 'text', content: this.newNoteContent() })
      .subscribe({
        next: (newNote) => {
          this.affectionService.notes.update((notes) => [newNote, ...notes]);
          this.isSaving.set(false);
          this.closeAddModal();
        },
        error: (err) => {
          console.error('Error al crear nota', err);
          this.isSaving.set(false);
        },
      });
  }
}
