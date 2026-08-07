import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environments } from '../../environments/environments';
import { CalendarMonth, DayEntryDetail } from '../models/calendar.model';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private http = inject(HttpClient);
  private apiUrl = `${environments.apiUrl}/rooms`;

  readonly currentMonth = signal<CalendarMonth | null>(null);
  readonly selectedDayDetail = signal<DayEntryDetail | null>(null);
  readonly isLoading = signal(false);

  loadMonth(roomId: string, year: number, month: number) {
    this.isLoading.set(true);
    this.http
      .get<CalendarMonth>(`${this.apiUrl}/${roomId}/calendar?year=${year}&month=${month}`)
      .subscribe({
        next: (data) => {
          this.currentMonth.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error al cargar el calendario', err);
          this.isLoading.set(false);
        },
      });
  }

  // Obtener detalle de un día específico
  getDayDetail(roomId: string, date: string) {
    this.http.get<DayEntryDetail>(`${this.apiUrl}/${roomId}/calendar/${date}`).subscribe({
      next: (data) => this.selectedDayDetail.set(data),
      error: (err) => {
        console.error('Error al obtener el día', err);
        this.selectedDayDetail.set(null); // Si no hay entrada, lo dejamos en null
      },
    });
  }

  // Crear o actualizar la nota de un día
  createDayEntry(roomId: string, date: string, content: string, moodEmoji: string = '😊') {
    return this.http.post(`${this.apiUrl}/${roomId}/day-entries`, {
      entryDate: date,
      content: content,
      moodEmoji: moodEmoji,
    });
  }
}
