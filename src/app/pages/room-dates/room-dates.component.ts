import { Component, inject, afterNextRender, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RoomHeaderComponent } from '../../shared/components/room-header/room-header.component';
import { CalendarService } from '../../services/calendar.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { extractExif } from '../../utils/exif.util';
import { firstValueFrom, forkJoin } from 'rxjs';
import { GalleryService } from '../../services/gallery.service';
import { WashiCardComponent } from '../../shared/components/washi-card/washi-card.component';

@Component({
  selector: 'app-room-dates',
  standalone: true,
  imports: [CommonModule, RoomHeaderComponent, FormsModule, ModalComponent, WashiCardComponent],
  templateUrl: './room-dates.component.html',
  styleUrl: './room-dates.component.css',
})
export class RoomDatesComponent {
  private route = inject(ActivatedRoute);
  private calendarService = inject(CalendarService);
  private galleryService = inject(GalleryService);

  importantDates = this.calendarService.importantDates;
  dateTypes = this.calendarService.dateTypes; // Tipos dinámicos
  roomId = signal('');

  // Modal Crear
  isModalOpen = signal(false);
  newTitle = signal('');
  newDate = signal('');
  newType = signal('anniversary');
  isSaving = signal(false);

  // Manejo de fotos:
  @ViewChild('fileInput') fileInput!: ElementRef;
  selectedFiles = signal<File[]>([]);
  previewUrls = signal<string[]>([]);

  constructor() {
    afterNextRender(() => {
      const id = this.route.snapshot.paramMap.get('roomId');
      if (id) {
        this.roomId.set(id);
        // cargamos ambos apartados
        this.calendarService.loadImportantDates(id);
        this.calendarService.loadDateTypes();
      }
    });
  }
  // logica de las fotos
  openFilePicker() {
    this.fileInput.nativeElement.click();
  }
  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      this.selectedFiles.set(files);
      this.previewUrls.set(files.map((file) => URL.createObjectURL(file)));
    }
  }

  removePhoto(index: number) {
    this.selectedFiles.update((files) => files.filter((_, i) => i !== index));
    this.previewUrls.update((urls) => urls.filter((_, i) => i !== index));
  }

  // Calcular "Days Away" o "Since then"
  getTimeInfo(eventDate: string): { label: string; value: string } {
    const date = new Date(eventDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return { label: 'Days Away', value: diffDays.toString() };
    } else {
      // Calcular años y meses pasados
      let years = now.getFullYear() - date.getFullYear();
      let months = now.getMonth() - date.getMonth();
      if (months < 0) {
        years--;
        months += 12;
      }
      let value = '';
      if (years > 0) value += `${years} yr${years !== 1 ? 's' : ''}`;
      if (months > 0) value += `${years > 0 ? ', ' : ''}${months} mo${months !== 1 ? 's' : ''}`;
      return { label: 'Since then:', value: value || 'Today' };
    }
  }

  // Formatear fecha "October 15, 2024"
  formatDate(eventDate: string): string {
    return new Date(eventDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // lógica del modal
  openModal() {
    this.newTitle.set('');
    this.newDate.set('');
    // Seleccionamos el primer tipo por defecto si existe
    if (this.dateTypes().length > 0) this.newType.set(this.dateTypes()[0].code);
    this.selectedFiles.set([]);
    this.previewUrls.set([]);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  async saveDate() {
    if (!this.newTitle().trim() || !this.newDate()) return;

    this.isSaving.set(true);
    const files = this.selectedFiles();
    let mediaItems: any[] = [];

    try {
      if (files.length > 0) {
        // 1. Extraer EXIF
        const exifData = await Promise.all(files.map((file) => extractExif(file)));

        // 2. Presign
        const entries = files.map((file) => ({
          mediaTypeCode: file.type.startsWith('video') ? 'video' : 'photo',
          mimeType: file.type,
          fileSizeBytes: file.size,
        }));
        const presignRes = await firstValueFrom(
          this.galleryService.presignUpload(this.roomId(), entries),
        );

        // 3. Subida a R2 en paralelo
        const uploadObservables = presignRes.items.map((item, i) =>
          this.galleryService.uploadToR2(item.uploadUrl, files[i]),
        );
        const uploadResults = await firstValueFrom(forkJoin(uploadObservables));

        // 4. Mapear los que subieron OK
        mediaItems = presignRes.items
          .map((item, index) => ({ item, index }))
          .filter(({ index }) => uploadResults[index])
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
      }

      // 5. Crear la fecha con el payload completo
      const payload = {
        typeCode: this.newType(),
        title: this.newTitle(),
        eventDate: this.newDate(),
        isRecurring: false,
        notifyDaysBefore: 0,
        media: mediaItems, // Array de fotos (vacío si no subió ninguna)
      };

      const newDate = await firstValueFrom(
        this.calendarService.createImportantDate(this.roomId(), payload),
      );

      this.calendarService.importantDates.update((prev) => [...prev, newDate]);
      this.isSaving.set(false);
      this.closeModal();
    } catch (error) {
      console.error('Error al guardar fecha con fotos', error);
      this.isSaving.set(false);
    }
  }
}
