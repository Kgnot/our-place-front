import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environments } from '../../environments/environments';
import {
  Room,
  CreateRoomPayload,
  RelationshipType,
  RoomMember,
  InvitationResponse,
} from '../models/room.model';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private http = inject(HttpClient);
  private apiUrl = `${environments.apiUrl}/rooms`;
  private lkpApiUrl = `${environments.apiUrl}/room`;

  readonly rooms = signal<Room[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly relationshipTypes = signal<RelationshipType[]>([]);

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

  searchRooms(query: string) {
    this.isLoading.set(true);
    this.http.get<Room[]>(`${this.apiUrl}/mine/search?q=${query}`).subscribe({
      next: (data) => {
        this.rooms.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al buscar rooms', err);
        this.isLoading.set(false);
      },
    });
  }

  loadRelationshipTypes() {
    this.http.get<RelationshipType[]>(`${this.lkpApiUrl}/relationship-types`).subscribe({
      next: (data) => this.relationshipTypes.set(data),
      error: (err) => console.error('Error al obtener tipos de relación', err),
    });
  }

  createRoom(payload: CreateRoomPayload) {
    return this.http.post<Room>(this.apiUrl, payload);
  }

  getRoom(roomId: string) {
    return this.http.get<Room>(`${this.apiUrl}/${roomId}`);
  }

  // Invitaciones y miembros
  inviteMember(roomId: string, invitedEmail: string, roleCode: string) {
    return this.http.post<InvitationResponse>(`${this.apiUrl}/${roomId}/invitations`, {
      invitedEmail,
      roleCode,
    });
  }

  acceptInvitation(token: string) {
    return this.http.post<Room>(`${this.apiUrl}/invitations/${token}/accept`, {});
  }

  listMembers(roomId: string) {
    return this.http.get<RoomMember[]>(`${this.apiUrl}/${roomId}/members`);
  }

  updateNickname(roomId: string, nickname: string) {
    return this.http.patch(`${this.apiUrl}/${roomId}/members/me/nickname`, { nickname });
  }

  leaveRoom(roomId: string) {
    return this.http.delete(`${this.apiUrl}/${roomId}/members/me`);
  }

  setRelationship(roomId: string, payload: any) {
    return this.http.post(`${this.apiUrl}/${roomId}/relationships`, payload);
  }
}
