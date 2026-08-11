import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomService } from '../../../../services/room.service';

@Component({
  selector: 'app-accept-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accept-panel.component.html',
  styleUrl: './accept-panel.component.css',
})
export class AcceptPanelComponent implements OnInit {
  private roomService = inject(RoomService);

  invitations = this.roomService.pendingInvitations;
  isLoading = this.roomService.isLoadingInvitations;

  acceptingToken = signal<string | null>(null);
  errorMsg = signal<string | null>(null);

  ngOnInit() {
    this.roomService.loadPendingInvitations();
  }

  acceptInvitation(token: string) {
    this.acceptingToken.set(token);
    this.errorMsg.set(null);

    this.roomService.acceptInvitation(token).subscribe({
      next: () => {
        this.acceptingToken.set(null);
      },
      error: (err) => {
        console.error('Error al aceptar invitación', err);
        this.errorMsg.set(err.error?.message || 'No se pudo aceptar la invitación.');
        this.acceptingToken.set(null);
      },
    });
  }
}
