import { Component, inject, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RoomHeaderComponent } from '../../shared/components/room-header/room-header.component';
import { CalendarService } from '../../services/calendar.service';

@Component({
  selector: 'app-room-dates',
  standalone: true,
  imports: [CommonModule, RoomHeaderComponent, FormsModule],
  templateUrl: './room-dates.component.html',
  styleUrl: './room-dates.component.css',
})
export class RoomDatesComponent {
  private route = inject(ActivatedRoute);
  private calendarService = inject(CalendarService);

  importantDates = this.calendarService.importantDates;
  roomId = signal('');

  // Modal Crear
  isModalOpen = signal(false);
  newTitle = signal('');
  newDate = signal('');
  newType = signal('anniversary');
  isSaving = signal(false);

  constructor() {
    afterNextRender(() => {
      const id = this.route.snapshot.paramMap.get('roomId');
      if (id) {
        this.roomId.set(id);
        this.calendarService.loadImportantDates(id);
      }
    });
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

  openModal() {
    this.newTitle.set('');
    this.newDate.set('');
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  saveDate() {
    if (!this.newTitle().trim() || !this.newDate()) return;

    this.isSaving.set(true);
    const payload = {
      typeCode: this.newType(),
      title: this.newTitle(),
      eventDate: this.newDate(),
      isRecurring: false,
      notifyDaysBefore: 0,
    };

    this.calendarService.createImportantDate(this.roomId(), payload).subscribe({
      next: (newDate) => {
        this.calendarService.importantDates.update((prev) => [...prev, newDate]);
        this.isSaving.set(false);
        this.closeModal();
      },
      error: (err) => {
        console.error('Error al guardar fecha', err);
        this.isSaving.set(false);
      },
    });
  }
}
