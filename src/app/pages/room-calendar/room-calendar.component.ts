import { Component, inject, afterNextRender, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { CalendarService } from '../../services/calendar.service';
import { GalleryService } from '../../services/gallery.service';

import { RoomHeaderComponent } from '../../shared/components/room-header/room-header.component';

import {
  CalendarPaneComponent,
  CalendarDay,
} from './components/calendar-pane/calendar-pane.component';
import { MonthPhotosPaneComponent } from './components/month-photos-pane/month-photos-pane.component';
import { DayEntryModalComponent } from './components/day-entry-modal/day-entry-modal.component';

import { MONTHS, WEEK_DAYS } from '../../utils/calendar.constants';

@Component({
  selector: 'app-room-calendar',
  standalone: true,
  imports: [
    CommonModule,
    RoomHeaderComponent,
    CalendarPaneComponent,
    MonthPhotosPaneComponent,
    DayEntryModalComponent,
  ],
  templateUrl: './room-calendar.component.html',
  styleUrl: './room-calendar.component.css',
})
export class RoomCalendarComponent {
  private route = inject(ActivatedRoute);
  private calendarService = inject(CalendarService);
  private galleryService = inject(GalleryService);

  isLoading = this.calendarService.isLoading;
  selectedDayDetail = this.calendarService.selectedDayDetail;
  currentMonth = this.calendarService.currentMonth;

  isUploadOpen = signal(false);
  monthPhotos = signal<any[]>([]);
  viewDate = signal(new Date());
  roomId = signal('');

  isModalOpen = signal(false);
  selectedDate = signal('');
  newNoteContent = signal('');
  isSaving = signal(false);

  weekDays = WEEK_DAYS;
  months = MONTHS;

  monthLabel = computed(
    () => `${this.months[this.viewDate().getMonth()]} ${this.viewDate().getFullYear()}`,
  );

  blankDaysCount = computed(() => {
    const date = this.viewDate();
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  });

  /** Arma la lista de días del mes ya resuelta (dayInfo + isToday incluidos),
   *  así calendar-pane / calendar-day-cell no necesitan tocar servicios. */
  calendarDays = computed<CalendarDay[]>(() => {
    const date = this.viewDate();
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const month = this.currentMonth();
    const today = new Date();

    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const isoDate = this.toIsoDate(date, day);
      const dayInfo = month?.days.find((d) => d.date === isoDate);
      const isToday =
        day === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      return { day, dayInfo, isToday };
    });
  });

  constructor() {
    afterNextRender(() => {
      const id = this.route.snapshot.paramMap.get('roomId');

      if (!id) return;

      this.roomId.set(id);
      this.fetchMonthData();
    });
  }

  private toIsoDate(date: Date, day: number): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      day,
    ).padStart(2, '0')}`;
  }

  fetchMonthData(): void {
    const date = this.viewDate();
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Enero = 1, Marzo = 3

    this.calendarService.loadMonth(this.roomId(), year, month);

    this.galleryService.getMediaForMonth(this.roomId(), year, month).subscribe({
      next: (response) => {
        const photoList = Array.isArray(response) ? response : response?.content || [];
        this.monthPhotos.set(photoList);
      },
      error: (err) => console.error('Error al obtener fotos del mes', err),
    });
  }

  goToToday(): void {
    this.viewDate.set(new Date());
    this.fetchMonthData();
  }

  openDayModal(day: number): void {
    const isoDate = this.toIsoDate(this.viewDate(), day);

    this.selectedDate.set(isoDate);
    this.newNoteContent.set('');
    this.isModalOpen.set(true);

    this.calendarService.getDayDetail(this.roomId(), isoDate);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  saveNote(): void {
    if (!this.newNoteContent().trim()) return;

    this.isSaving.set(true);

    this.calendarService
      .createDayEntry(this.roomId(), this.selectedDate(), this.newNoteContent())
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.fetchMonthData();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error al guardar nota', err);
          this.isSaving.set(false);
        },
      });
  }

  previousMonth(): void {
    const date = new Date(this.viewDate());
    date.setMonth(date.getMonth() - 1);
    this.viewDate.set(date);
    this.fetchMonthData();
  }

  nextMonth(): void {
    const date = new Date(this.viewDate());
    date.setMonth(date.getMonth() + 1);
    this.viewDate.set(date);
    this.fetchMonthData();
  }

  onPhotosUploaded(newMedia: any[]): void {
    console.log('Fotos subidas:', newMedia);
  }
}
