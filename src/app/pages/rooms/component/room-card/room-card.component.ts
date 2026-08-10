import { Component, input, output, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Room } from '../../../../models/room.model';
import { UserService } from '../../../../services/user.service';


@Component({
  selector: 'app-room-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './room-card.component.html',
  styleUrl: './room-card.component.css',
})
export class RoomCardComponent {
  room = input.required<Room>();
  openRoom = output<string>();
  leaveRoom = output<string>();

  private userService = inject(UserService);

  // Extraemos solo el ID (string) del usuario actual. Si no hay usuario, devolvemos string vacío.
  currentUserId = computed(() => this.userService.currentUser()?.userId || '');

  getRoomColor = computed(() => {
    switch (this.room().relationshipTypeCode) {
      case 'couple':
        return 'var(--color-tertiary)';
      case 'family':
        return 'var(--color-secondary)';
      default:
        return 'var(--color-primary)';
    }
  });

  getInitials = computed(() => {
    return this.room()
      .roomName.split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  });

  onOpen() {
    this.openRoom.emit(this.room().roomId);
  }

  onLeave(event: Event) {
    event.stopPropagation();
    this.leaveRoom.emit(this.room().roomId);
  }
}
