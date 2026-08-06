import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environments } from '../../environments/environments';
import { Room } from '../models/room.model';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private http = inject(HttpClient);
  private apiUrl = `${environments.apiUrl}/rooms`;

  // Signals para el estado de los rooms
  readonly rooms = signal<Room[]>([]);
  readonly isLoading = signal<boolean>(false);

  constructor() {
  }

  // Obtener mis rooms
  loadMyRooms() {
    this.isLoading.set(true);
    this.http.get<Room[]>(`${this.apiUrl}/mine`).subscribe({
      next: (data) => {
        this.rooms.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al obtener rooms', err);
        this.isLoading.set(false);
      },
    });
  }

  createRoom(roomName: string, relationshipTypeCode: string) {
    return this.http.post<Room>(this.apiUrl, { roomName, relationshipTypeCode });
  }
}
