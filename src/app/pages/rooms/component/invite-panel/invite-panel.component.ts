import { Component, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../../../services/room.service';
import { RelationshipType } from '../../../../models/room.model';

@Component({
  selector: 'app-invite-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invite-panel.component.html',
  styleUrl: './invite-panel.component.css',
})
export class InvitePanelComponent {
  private roomService = inject(RoomService);

  roomId = input.required<string>();
  relationshipTypes = input<RelationshipType[]>([]);

  email = signal('');
  selectedRole = signal('');
  isSending = signal(false);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);

  sendInvitation() {
    const emailVal = this.email().trim();
    const roleVal = this.selectedRole();

    if (!emailVal || !roleVal) {
      this.errorMsg.set('Completa el email y el rol.');
      return;
    }

    this.isSending.set(true);
    this.errorMsg.set(null);
    this.successMsg.set(null);

    this.roomService.inviteMember(this.roomId(), emailVal, roleVal).subscribe({
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
