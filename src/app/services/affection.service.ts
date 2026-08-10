import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoveNote, CreateLoveNotePayload } from '../models/love-note.model';
import { environments } from '../../environments/environments';

// Modelo nuevo basado en tu backend record
export interface LkpNoteType {
  code: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class AffectionService {
  private http = inject(HttpClient);
  private apiUrl = `${environments.apiUrl}/rooms`;
  private lkpApiUrl = `${environments.apiUrl}/affection/note-types`;

  readonly notes = signal<LoveNote[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly noteTypes = signal<LkpNoteType[]>([]); // <-- NUEVO SIGNAL

  loadNoteTypes() {
    this.http.get<LkpNoteType[]>(this.lkpApiUrl).subscribe({
      next: (data) => this.noteTypes.set(data),
      error: (err) => console.error('Error al obtener tipos de nota', err),
    });
  }

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
