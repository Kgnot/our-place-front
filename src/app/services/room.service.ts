import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environments } from '../../environments/environments';
import {
  Room,
  CreateRoomPayload,
  RelationshipType,
  RoomMember,
  InvitationResponse,
} from '../models/room.model';

export interface PendingInvitation {
  invitationId: number;
  roomId: string;
  roomName: string;
  invitedEmail: string;
  roleCode: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class RoomService {
  private http = inject(HttpClient);
  private apiUrl = `${environments.apiUrl}/rooms`;
  private lkpApiUrl = `${environments.apiUrl}/room`;

  readonly rooms = signal<Room[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly relationshipTypes = signal<RelationshipType[]>([]);

  // --- Invitaciones pendientes (estado compartido entre rooms.component y accept-panel) ---
  readonly pendingInvitations = signal<PendingInvitation[]>([]);
  readonly pendingInvitationsCount = computed(() => this.pendingInvitations().length);
  readonly isLoadingInvitations = signal<boolean>(false);

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
    this.http.get<Room[]>(`${this.apiUrl}/mine/search?q=${encodeURIComponent(query)}`).subscribe({
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

  loadPendingInvitations() {
    this.isLoadingInvitations.set(true);
    this.http.get<PendingInvitation[]>(`${this.apiUrl}/invitations/pending`).subscribe({
      next: (data) => {
        this.pendingInvitations.set(data);
        this.isLoadingInvitations.set(false);
        console.log('Invitaciones: ', data);
      },
      error: (err) => {
        console.error('Error al obtener invitaciones pendientes', err);
        this.isLoadingInvitations.set(false);
      },
    });
  }

  acceptInvitation(token: string) {
    return this.http.post<Room>(`${this.apiUrl}/invitations/${token}/accept`, {}).pipe(
      tap(() => {
        this.pendingInvitations.update((list) => list.filter((i) => i.token !== token));
      }),
    );
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
