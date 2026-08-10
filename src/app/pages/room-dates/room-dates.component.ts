import { Component, inject, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RoomHeaderComponent } from '../../shared/components/room-header/room-header.component';
import { CalendarService } from '../../services/calendar.service';
import { ImportantDate } from '../../models/important-date.model';
import { AddDateModalComponent } from './components/add-date-modal/add-date-modal.component';
import { TimelineItemComponent } from './components/timeline-item/timeline-item.component';

@Component({
  selector: 'app-room-dates',
  standalone: true,
  imports: [CommonModule, RoomHeaderComponent, AddDateModalComponent, TimelineItemComponent],
  templateUrl: './room-dates.component.html',
  styleUrl: './room-dates.component.css',
})
export class RoomDatesComponent {
  private route = inject(ActivatedRoute);
  private calendarService = inject(CalendarService);

  importantDates = this.calendarService.importantDates;
  roomId = signal('');
  isModalOpen = signal(false);

  constructor() {
    afterNextRender(() => {
      const id = this.route.snapshot.paramMap.get('roomId');
      if (id) {
        this.roomId.set(id);
        this.calendarService.loadImportantDates(id);
      }
    });
  }

  deleteDate(date: ImportantDate) {
    if (confirm(`¿Estás seguro de que quieres eliminar "${date.title}"?`)) {
      this.calendarService.deleteImportantDate(this.roomId(), date.id).subscribe({
        next: () => {
          this.calendarService.importantDates.update((prev) =>
            prev.filter((d) => d.id !== date.id),
          );
        },
        error: (err) => console.error('Error al eliminar la fecha', err),
      });
    }
  }

  openModal() {
    this.isModalOpen.set(true);
  }

  onDateCreated(newDate: ImportantDate) {
    this.calendarService.importantDates.update((prev) => [...prev, newDate]);
    setTimeout(() => {
      this.calendarService.loadImportantDates(this.roomId());
    }, 3000);
  }
}
