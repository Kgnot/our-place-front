import { Component, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom, forkJoin } from 'rxjs';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { GalleryService } from '../../../../services/gallery.service';
import { extractExif } from '../../../../utils/exif.util';

@Component({
  selector: 'app-upload-photos-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './upload-photos-modal.component.html',
})
export class UploadPhotosModalComponent {
  private galleryService = inject(GalleryService);

  isOpen = input<boolean>(false);
  roomId = input<string>('');

  closeModal = output<void>();
  uploadComplete = output<any[]>(); // Emite las fotos nuevas

  selectedFiles = signal<File[]>([]);
  previewUrls = signal<string[]>([]);
  isUploading = signal(false);
  uploadStatus = signal<string>('');

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      this.selectedFiles.set(files);
      this.previewUrls.set(files.map((file) => URL.createObjectURL(file)));
    }
  }

  close() {
    this.selectedFiles.set([]);
    this.previewUrls.set([]);
    this.closeModal.emit();
  }

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
      this.uploadStatus.set(`Subiendo ${files.length} fotos...`);

      const uploadObservables = presignRes.items.map((item, i) =>
        this.galleryService.uploadToR2(item.uploadUrl, files[i]),
      );
      const uploadResults = await firstValueFrom(forkJoin(uploadObservables));

      const succeededItems = presignRes.items
        .map((item, index) => ({ item, index }))
        .filter(({ index }) => uploadResults[index] === true)
        .map(({ item, index }) => ({
          mediaId: item.mediaId,
          r2Key: item.r2Key,
          mediaTypeCode: files[index].type.startsWith('video') ? 'video' : 'photo',
          mimeType: files[index].type,
          fileSizeBytes: files[index].size,
          takenAt: exifData[index].takenAt,
          latitude: exifData[index].latitude,
          longitude: exifData[index].longitude,
          caption: null,
        }));

      if (succeededItems.length === 0) {
        alert('Ninguna foto pudo subirse.');
        this.isUploading.set(false);
        return;
      }

      this.uploadStatus.set('Confirmando con el servidor...');
      const confirmedMedia = await firstValueFrom(
        this.galleryService.confirmUpload(this.roomId(), succeededItems),
      );

      this.uploadComplete.emit(confirmedMedia);
      this.isUploading.set(false);
      this.close();
    } catch (error) {
      console.error('Error en subida', error);
      this.isUploading.set(false);
      alert('Ocurrió un error durante la subida.');
    }
  }
}
