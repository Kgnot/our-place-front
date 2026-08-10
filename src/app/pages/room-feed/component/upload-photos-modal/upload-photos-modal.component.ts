import { Component, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { GalleryService } from '../../../../services/gallery.service';
import { extractExif } from '../../../../utils/exif.util';

@Component({
  selector: 'app-upload-photos-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './upload-photos-modal.component.html',
  styleUrl: 'upload-photos-modal.component.css',
})
export class UploadPhotosModalComponent {
  private galleryService = inject(GalleryService);

  isOpen = input<boolean>(false);
  roomId = input<string>('');

  closeModal = output<void>();
  uploadComplete = output<any[]>();

  selectedFiles = signal<File[]>([]);
  previewUrls = signal<string[]>([]);
  isUploading = signal(false);
  uploadStatus = signal<string>('');

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      this.selectedFiles.update((prev) => [...prev, ...files]);
      this.previewUrls.update((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    }
    // Limpiar el input para permitir seleccionar los mismos archivos si se quitan
    input.value = '';
  }

  removePhoto(index: number) {
    this.selectedFiles.update((files) => files.filter((_, i) => i !== index));
    this.previewUrls.update((urls) => urls.filter((_, i) => i !== index));
  }

  close() {
    this.selectedFiles.set([]);
    this.previewUrls.set([]);
    this.closeModal.emit();
  }

  // Subida en lotes de 5 para no saturar el navegador
  async upload() {
    const files = this.selectedFiles();
    if (files.length === 0) return;

    this.isUploading.set(true);
    this.uploadStatus.set('Leyendo metadatos...');

    try {
      const exifData = await Promise.all(files.map((file) => extractExif(file)));
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

      const allConfirmedMedia: any[] = [];
      const batchSize = 5;

      for (let i = 0; i < presignedItems.length; i += batchSize) {
        const chunk = presignedItems.slice(i, i + batchSize);
        this.uploadStatus.set(
          `Subiendo fotos ${i + 1} a ${Math.min(i + batchSize, presignedItems.length)} de ${presignedItems.length}...`,
        );

        const chunkResults = await Promise.all(
          chunk.map(async (item, indexInChunk) => {
            const originalIndex = i + indexInChunk;
            const file = files[originalIndex];

            try {
              const success = await firstValueFrom(
                this.galleryService.uploadToR2(item.uploadUrl, file),
              );
              if (success) {
                return {
                  mediaId: item.mediaId,
                  r2Key: item.r2Key,
                  mediaTypeCode: file.type.startsWith('video') ? 'video' : 'photo',
                  mimeType: file.type,
                  fileSizeBytes: file.size,
                  takenAt: exifData[originalIndex].takenAt,
                  latitude: exifData[originalIndex].latitude,
                  longitude: exifData[originalIndex].longitude,
                  caption: null,
                };
              }
              return null;
            } catch (err) {
              console.error(`Error al subir la foto ${originalIndex + 1} a R2:`, err);
              return null;
            }
          }),
        );

        const succeededInChunk = chunkResults.filter((item): item is any => item !== null);

        if (succeededInChunk.length > 0) {
          this.uploadStatus.set(`Confirmando lote con el servidor...`);
          const confirmed = await firstValueFrom(
            this.galleryService.confirmUpload(this.roomId(), succeededInChunk),
          );
          allConfirmedMedia.push(...confirmed);
        }
      }

      if (allConfirmedMedia.length > 0) {
        this.uploadComplete.emit(allConfirmedMedia);
        this.isUploading.set(false);
        this.close();
      } else {
        alert('Ninguna foto pudo subirse a R2. Revisa la consola para ver los errores de red.');
        this.isUploading.set(false);
      }
    } catch (error) {
      console.error('Error general en el flujo de subida', error);
      alert('Ocurrió un error crítico durante la subida. Revisa la consola (F12).');
      this.isUploading.set(false);
    }
  }
}
