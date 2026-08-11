import { Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../../../services/room.service';
import { RelationshipType, Room } from '../../../../models/room.model';

@Component({
  selector: 'app-invite-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invite-panel.component.html',
  styleUrl: './invite-panel.component.css',
})
export class InvitePanelComponent {
  private roomService = inject(RoomService);

  rooms = input.required<Room[]>();
  relationshipTypes = input<RelationshipType[]>([]);
  // Opcional: si se abre el panel desde un room concreto (ej. desde room-card), se preselecciona.
  preselectedRoomId = input<string | null>(null);

  selectedRoomId = signal('');
  email = signal('');
  selectedRole = signal('');
  isSending = signal(false);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);

  constructor() {
    effect(() => {
      const preselected = this.preselectedRoomId();
      if (preselected) {
        this.selectedRoomId.set(preselected);
      }
    });
  }

  sendInvitation() {
    const roomIdVal = this.selectedRoomId();
    const emailVal = this.email().trim();
    const roleVal = this.selectedRole();

    if (!roomIdVal) {
      this.errorMsg.set('Selecciona un espacio.');
      return;
    }
    if (!emailVal || !roleVal) {
      this.errorMsg.set('Completa el email y el rol.');
      return;
    }

    this.isSending.set(true);
    this.errorMsg.set(null);
    this.successMsg.set(null);

    this.roomService.inviteMember(roomIdVal, emailVal, roleVal).subscribe({
      next: () => {
        this.successMsg.set('Invitación enviada correctamente.');
        this.email.set('');
        this.selectedRole.set('');
        this.isSending.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Error al enviar la invitación.');
        this.isSending.set(false);
      },
    });
  }
}
