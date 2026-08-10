import { Component, input, output, signal, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom, forkJoin } from 'rxjs';
import { CalendarService } from '../../../../services/calendar.service';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { GalleryService } from '../../../../services/gallery.service';
import { ImportantDate } from '../../../../models/important-date.model';
import { extractExif } from '../../../../utils/exif.util';

@Component({
  selector: 'app-add-date-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './add-date-modal.component.html',
  styleUrl: './add-date-modal.component.css',
})
export class AddDateModalComponent {
  private calendarService = inject(CalendarService);
  private galleryService = inject(GalleryService);

  isOpen = input<boolean>(false);
  roomId = input<string>('');

  closeModal = output<void>();
  dateCreated = output<ImportantDate>();

  dateTypes = this.calendarService.dateTypes;

  newTitle = signal('');
  newDate = signal('');
  newType = signal('anniversary');
  isSaving = signal(false);

  @ViewChild('fileInput') fileInput!: ElementRef;
  selectedFiles = signal<File[]>([]);
  previewUrls = signal<string[]>([]);

  constructor() {
    this.calendarService.loadDateTypes();
  }

  openFilePicker() {
    this.fileInput.nativeElement.click();
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      this.selectedFiles.update((prev) => [...prev, ...files]);
      this.previewUrls.update((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    }
  }

  removePhoto(index: number) {
    this.selectedFiles.update((files) => files.filter((_, i) => i !== index));
    this.previewUrls.update((urls) => urls.filter((_, i) => i !== index));
  }

  close() {
    this.newTitle.set('');
    this.newDate.set('');
    this.selectedFiles.set([]);
    this.previewUrls.set([]);
    this.closeModal.emit();
  }

  async save() {
    // 1. Validación visual
    if (!this.newTitle().trim() || !this.newDate()) {
      alert('Por favor, completa el título y la fecha.');
      return;
    }

    this.isSaving.set(true);
    const files = this.selectedFiles();
    let mediaItems: any[] = [];

    try {
      if (files.length > 0) {
        const exifData = await Promise.all(files.map((file) => extractExif(file)));
        const entries = files.map((file) => ({
          mediaTypeCode: file.type.startsWith('video') ? 'video' : 'photo',
          mimeType: file.type,
          fileSizeBytes: file.size,
        }));

        const presignRes = await firstValueFrom(
          this.galleryService.presignUpload(this.roomId(), entries),
        );
        const uploadObservables = presignRes.items.map((item, i) =>
          this.galleryService.uploadToR2(item.uploadUrl, files[i]),
        );
        const uploadResults = await firstValueFrom(forkJoin(uploadObservables));

        mediaItems = presignRes.items
          .map((item, index) => ({ item, index }))
          .filter(({ index }) => uploadResults[index] === true)
          .map(({ item, index }) => ({
            r2Key: item.r2Key,
            mediaTypeCode: files[index].type.startsWith('video') ? 'video' : 'photo',
            mimeType: files[index].type,
            fileSizeBytes: files[index].size,
            takenAt: exifData[index].takenAt,
            latitude: exifData[index].latitude,
            longitude: exifData[index].longitude,
            caption: null,
          }));

        // Si las fotos fallaron al subir a R2, le avisamos al usuario
        if (mediaItems.length === 0 && files.length > 0) {
          alert('Hubo un problema al subir las fotos. Intenta de nuevo.');
          this.isSaving.set(false);
          return;
        }
      }

      const payload = {
        typeCode: this.newType(),
        title: this.newTitle(),
        eventDate: this.newDate(),
        isRecurring: false,
        notifyDaysBefore: 0,
        media: mediaItems,
      };

      const newDate = await firstValueFrom(
        this.calendarService.createImportantDate(this.roomId(), payload),
      );
      this.dateCreated.emit(newDate);
      this.isSaving.set(false);
      this.close();
    } catch (error) {
      console.error('Error al guardar fecha con fotos', error);
      // 2. Le mostramos el error al usuario en pantalla
      alert('Ocurrió un error al guardar. Revisa la consola (F12) para ver el detalle.');
      this.isSaving.set(false);
    }
  }
  }
