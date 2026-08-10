import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environments } from '../../environments/environments';
import { CalendarMonth, DayEntryDetail } from '../models/calendar.model';
import {
  CreateImportantDatePayload,
  ImportantDate,
  LkpImportantDateType,
} from '../models/important-date.model';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private http = inject(HttpClient);
  private apiUrl = `${environments.apiUrl}/rooms`;
  private lkpApiUrl = `${environments.apiUrl}/calendar`;

  readonly importantDates = signal<ImportantDate[]>([]);
  readonly currentMonth = signal<CalendarMonth | null>(null);
  readonly selectedDayDetail = signal<DayEntryDetail | null>(null);
  readonly isLoading = signal(false);
  readonly dateTypes = signal<LkpImportantDateType[]>([]);

  loadDateTypes() {
    this.http.get<LkpImportantDateType[]>(`${this.lkpApiUrl}/important-dates/lkp`).subscribe({
      next: (data) => this.dateTypes.set(data),
      error: (err) => console.error('Error al obtener tipos de fecha', err),
    });
  }

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

  loadImportantDates(roomId: string) {
    this.http.get<ImportantDate[]>(`${this.apiUrl}/${roomId}/important-dates`).subscribe({
      next: (data) => this.importantDates.set(data),
      error: (err) => console.error('Error al obtener fechas importantes', err),
    });
  }

  createImportantDate(roomId: string, payload: CreateImportantDatePayload) {
    return this.http.post<ImportantDate>(`${this.apiUrl}/${roomId}/important-dates`, payload);
  }
  // delete
  deleteImportantDate(roomId:string, dateId: string) {
    return this.http.delete<void>(`${this.apiUrl}/${roomId}/important-dates/${dateId}`);
  }
}
