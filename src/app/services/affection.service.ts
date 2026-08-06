import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoveNote, CreateLoveNotePayload } from '../models/love-note.model';
import { environments } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class AffectionService {
  private http = inject(HttpClient);
  private apiUrl = `${environments.apiUrl}/rooms`;

  // Signal para guardar las notas del room actual
  readonly notes = signal<LoveNote[]>([]);
  readonly isLoading = signal<boolean>(false);

  loadNotes(roomId: string) {
    this.isLoading.set(true);
    this.http.get<LoveNote[]>(`${this.apiUrl}/${roomId}/love-notes`).subscribe({
      next: (data) => {
        this.notes.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al obtener notas', err);
        this.isLoading.set(false);
      },
    });
  }

  createNote(roomId: string, payload: CreateLoveNotePayload) {
    return this.http.post<LoveNote>(`${this.apiUrl}/${roomId}/love-notes`, payload);
  }
}
