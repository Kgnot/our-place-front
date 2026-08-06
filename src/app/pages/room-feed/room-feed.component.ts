import { Component, inject, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AffectionService } from '../../services/affection.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-room-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-feed.component.html',
  styleUrl: './room-feed.component.css',
})
export class RoomFeedComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private affectionService = inject(AffectionService);

  notes = this.affectionService.notes;
  isLoading = this.affectionService.isLoading;

  roomId = signal<string>('');
  isAddModalOpen = signal(false);

  // Campos del modal
  newNoteContent = signal('');
  isSaving = signal(false);

  constructor() {
    afterNextRender(() => {
      const id = this.route.snapshot.paramMap.get('roomId');
      if (id) {
        this.roomId.set(id);
        this.affectionService.loadNotes(id);
      }
    });
  }

  openAddModal() {
    this.isAddModalOpen.set(true);
  }

  closeAddModal() {
    this.isAddModalOpen.set(false);
    this.newNoteContent.set('');
  }

  saveNote() {
    if (!this.newNoteContent().trim()) return;

    this.isSaving.set(true);
    const payload = {
      typeCode: 'text', // O el tipo que maneje tu backend | TODO: esto lo pasaré por backedn
      content: this.newNoteContent(),
    };

    this.affectionService.createNote(this.roomId(), payload).subscribe({
      next: (newNote) => {
        // Añadimos la nueva nota al principio de la lista
        this.affectionService.notes.update((notes) => [newNote, ...notes]);
        this.isSaving.set(false);
        this.closeAddModal();
      },
      error: (err) => {
        console.error('Error al crear nota', err);
        this.isSaving.set(false);
      },
    });
  }

  goBack() {
    this.router.navigate(['/rooms']);
  }
}
