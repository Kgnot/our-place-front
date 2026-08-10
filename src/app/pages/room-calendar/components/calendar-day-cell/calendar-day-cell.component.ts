import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CalendarPhoto {
  id: string;
  thumbnailUrl: string;
}

export interface ImportantDate {
  title: string;
}

export interface DayInfo {
  date: string;
  hasEntry?: boolean;
  hasPhotos?: boolean;
  moodEmoji?: string | null;
  importantDates?: ImportantDate[];
  previewPhotos?: CalendarPhoto[];
}

/**
 * Celda individual del calendario. Componente "tonto": no conoce el mes
 * ni el servicio, solo recibe el día ya resuelto y emite el click.
 */
@Component({
  selector: 'app-calendar-day-cell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-day-cell.component.html',
  styleUrl: './calendar-day-cell.component.css',
})
export class CalendarDayCellComponent {
  day = input.required<number>();
  dayInfo = input<DayInfo | undefined>();
  isToday = input(false);

  dayClick = output<number>();

  get hasMemory(): boolean {
    const info = this.dayInfo();
    return info?.hasEntry || info?.hasPhotos || (info?.importantDates?.length ?? 0) > 0;
  }

  onClick(): void {
    this.dayClick.emit(this.day());
  }
}
