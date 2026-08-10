import { Component, inject, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { CalendarService } from '../../services/calendar.service';
import { GalleryService } from '../../services/gallery.service';

import { RoomHeaderComponent } from '../../shared/components/room-header/room-header.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';

import { FormsModule } from '@angular/forms';
import { MONTHS, WEEK_DAYS } from '../../utils/calendar.constants';

@Component({
  selector: 'app-room-calendar',
  standalone: true,
  imports: [CommonModule, RoomHeaderComponent, ModalComponent, FormsModule],
  templateUrl: './room-calendar.component.html',
  styleUrl: './room-calendar.component.css',
})
export class RoomCalendarComponent {
  private route = inject(ActivatedRoute);
  private calendarService = inject(CalendarService);
  private galleryService = inject(GalleryService);

  currentMonth = this.calendarService.currentMonth;
  isLoading = this.calendarService.isLoading;
  selectedDayDetail = this.calendarService.selectedDayDetail;

  monthPhotos = signal<any[]>([]);

  viewDate = signal(new Date());
  roomId = signal('');

  isModalOpen = signal(false);
  selectedDate = signal('');
  newNoteContent = signal('');
  isSaving = signal(false);

  weekDays = WEEK_DAYS;

  months = MONTHS;

  constructor() {
    afterNextRender(() => {
      const id = this.route.snapshot.paramMap.get('roomId');

      if (!id) return;

      this.roomId.set(id);
      this.fetchMonthData();
    });
  }

  fetchMonthData() {
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

  get blankDays(): number[] {
    const date = this.viewDate();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    return Array(firstDay).fill(0);
  }

  get daysInMonth(): number[] {
    const date = this.viewDate();

    const days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    return Array.from({ length: days }, (_, i) => i + 1);
  }

  getDayInfo(day: number) {
    const date = this.viewDate();

    const isoDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      '0',
    )}-${String(day).padStart(2, '0')}`;

    return this.currentMonth()?.days.find((d) => d.date === isoDate);
  }

  isToday(day: number): boolean {
    const date = this.viewDate();
    const today = new Date();

    return (
      day === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  openDayModal(day: number) {
    const date = this.viewDate();

    const isoDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      '0',
    )}-${String(day).padStart(2, '0')}`;

    this.selectedDate.set(isoDate);
    this.newNoteContent.set('');
    this.isModalOpen.set(true);

    this.calendarService.getDayDetail(this.roomId(), isoDate);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  saveNote() {
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

  previousMonth() {
    const date = new Date(this.viewDate());

    date.setMonth(date.getMonth() - 1);

    this.viewDate.set(date);

    this.fetchMonthData();
  }

  nextMonth() {
    const date = new Date(this.viewDate());

    date.setMonth(date.getMonth() + 1);

    this.viewDate.set(date);

    this.fetchMonthData();
  }
}
