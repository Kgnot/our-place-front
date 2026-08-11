import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomService } from '../../../../services/room.service';

interface PendingInvitation {
  token: string;
  roomName: string;
  invitedBy: string;
}

@Component({
  selector: 'app-accept-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accept-panel.component.html',
  styleUrl: './accept-panel.component.css',
})
export class AcceptPanelComponent {
  private roomService = inject(RoomService);

  invitations = signal<PendingInvitation[]>([
    // Estos vendrían de un endpoint real. Por ahora simulados o cargados desde el servicio.
    { token: 'abc123', roomName: 'Diario de Viajes', invitedBy: 'maria@ejemplo.com' },
    { token: 'def456', roomName: 'Recuerdos Familiares', invitedBy: 'carlos@ejemplo.com' },
  ]);

  isLoading = signal(false);
  acceptingToken = signal<string | null>(null);

  loadInvitations() {
    // TODO: Cuando tengas el endpoint, descomenta esto:
    // this.isLoading.set(true);
    // this.http.get<PendingInvitation[]>(`${apiUrl}/invitations/pending`).subscribe({
    //   next: (data) => { this.invitations.set(data); this.isLoading.set(false); },
    //   error: () => this.isLoading.set(false),
    // });
  }

  acceptInvitation(token: string) {
    this.acceptingToken.set(token);
    this.roomService.acceptInvitation(token).subscribe({
      next: () => {
        this.invitations.update((list) => list.filter((i) => i.token !== token));
        this.acceptingToken.set(null);
      },
      error: (err) => {
        console.error('Error al aceptar invitación', err);
        this.acceptingToken.set(null);
      },
    });
  }
}
