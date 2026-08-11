import { Component, inject, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../services/room.service';
import { HeaderComponent } from './component/header/header.component';
import { RoomCardComponent } from './component/room-card/room-card.component';
import { CreateRoomModalComponent } from './component/create-room-modal/create-room-modal.component';
import { SidePanelComponent } from '../../shared/components/side-panel/side-panel.component';
import {
  InviteAcceptTabsComponent,
  TabMode,
} from './component/invite-accept/invite-accept-tabs.component';
import { InvitePanelComponent } from './component/invite-panel/invite-panel.component';
import { AcceptPanelComponent } from './component/accept-panel/accept-panel.component';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    RoomCardComponent,
    CreateRoomModalComponent,
    SidePanelComponent,
    InviteAcceptTabsComponent,
    InvitePanelComponent,
    AcceptPanelComponent,
  ],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.css',
})
export class RoomsComponent {
  private roomService = inject(RoomService);
  private router = inject(Router);

  rooms = this.roomService.rooms;
  isLoading = this.roomService.isLoading;
  relationshipTypes = this.roomService.relationshipTypes;

  isModalOpen = signal(false);
  isSaving = signal(false);

  // --- Side Panel de Invitaciones ---
  isPanelOpen = signal(false);
  panelMode = signal<TabMode | null>(null);
  pendingInvitationsCount = this.roomService.pendingInvitationsCount;

  constructor() {
    afterNextRender(() => {
      this.roomService.loadMyRooms();
      this.roomService.loadRelationshipTypes();
      this.roomService.loadPendingInvitations();
    });
  }

  // --- Tabs de Invitar/Aceptar ---
  onTabClick(mode: TabMode) {
    this.panelMode.set(mode);
    this.isPanelOpen.set(true);
  }

  closePanel() {
    this.isPanelOpen.set(false);
    this.panelMode.set(null);
  }

  // --- Navegación ---
  openRoom(roomId: string) {
    this.router.navigate(['/rooms', roomId]);
  }

  // --- Búsqueda ---
  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const query = input.value;
    if (query.trim() === '') {
      this.roomService.loadMyRooms();
    } else {
      this.roomService.searchRooms(query);
    }
  }

  // --- Modal Crear ---
  openModal() {
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  saveRoom(payload: any) {
    this.isSaving.set(true);
    this.roomService.createRoom(payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeModal();
        this.roomService.loadMyRooms();
      },
      error: (err) => {
        console.error('Error al crear room', err);
        this.isSaving.set(false);
      },
    });
  }

  // --- Salir de Room ---
  leaveRoom(roomId: string) {
    if (confirm('¿Estás seguro de que quieres salir de este espacio?')) {
      this.roomService.leaveRoom(roomId).subscribe({
        next: () => this.roomService.loadMyRooms(),
        error: (err) => console.error('Error al salir del room', err),
      });
    }
  }
}
