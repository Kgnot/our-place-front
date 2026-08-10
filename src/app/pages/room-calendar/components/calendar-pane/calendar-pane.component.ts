import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  CalendarDayCellComponent,
  DayInfo,
} from '../calendar-day-cell/calendar-day-cell.component';

export interface CalendarDay {
  day: number;
  dayInfo: DayInfo | undefined;
  isToday: boolean;
}

/**
 * Tarjeta del calendario: header con navegación de mes + grid de días.
 * No conoce el servicio: recibe los datos del mes ya resueltos por el
 * contenedor (room-calendar.component) y solo emite eventos.
 */
@Component({
  selector: 'app-calendar-pane',
  standalone: true,
  imports: [CommonModule, CalendarDayCellComponent],
  templateUrl: './calendar-pane.component.html',
  styleUrl: './calendar-pane.component.css',
  host: { class: 'calendar-pane' },
})
export class CalendarPaneComponent {
  monthLabel = input.required<string>();
  weekDays = input.required<string[]>();
  blankDaysCount = input(0);
  days = input.required<CalendarDay[]>();

  previousMonth = output<void>();
  nextMonth = output<void>();
  todayClick = output<void>();
  dayClick = output<number>();

  get blankDaysArray(): number[] {
    return Array(this.blankDaysCount()).fill(0);
  }
}
