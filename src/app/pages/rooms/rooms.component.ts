import { Component, inject, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // <-- Importar Router
import { RoomService } from '../../services/room.service';
import { Room } from '../../models/room.model';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.css',
})
export class RoomsComponent {
  private roomService = inject(RoomService);
  private router = inject(Router); // <-- Inyectar Router

  rooms = this.roomService.rooms;
  isLoading = this.roomService.isLoading;

  constructor() {
    afterNextRender(() => {
      this.roomService.loadMyRooms();
    });
  }

  // para navegar al feed del room
  openRoom(roomId: string) {
    this.router.navigate(['/rooms', roomId]);
  }

  getRoomColor(room: Room): string {
    switch (room.relationshipTypeCode) {
      case 'couple':
        return 'var(--color-tertiary)';
      case 'family':
        return 'var(--color-secondary)';
      default:
        return 'var(--color-primary)';
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }
}
