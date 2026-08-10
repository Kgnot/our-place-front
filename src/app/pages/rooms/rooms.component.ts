import { Component, inject, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../services/room.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { RoomCardComponent } from './component/room-card/room-card.component';
import { CreateRoomModalComponent } from './component/create-room-modal/create-room-modal.component';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    RoomCardComponent,
    CreateRoomModalComponent,
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

  constructor() {
    afterNextRender(() => {
      this.roomService.loadMyRooms();
      this.roomService.loadRelationshipTypes();
    });
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
