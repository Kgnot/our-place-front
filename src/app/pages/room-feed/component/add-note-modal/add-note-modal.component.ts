import { Component, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { AffectionService } from '../../../../services/affection.service';
import { LoveNote } from '../../../../models/love-note.model';

@Component({
  selector: 'app-add-note-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './add-note-modal.component.html',
})
export class AddNoteModalComponent {
  private affectionService = inject(AffectionService);

  isOpen = input<boolean>(false);
  roomId = input<string>('');

  closeModal = output<void>();
  noteCreated = output<LoveNote>(); // Emite la nota nueva

  noteTypes = this.affectionService.noteTypes;
  selectedType = signal('love_note');
  content = signal('');
  isSaving = signal(false);

  constructor() {
    // Aseguramos que los tipos de nota estén cargados
    this.affectionService.loadNoteTypes();
  }

  close() {
    this.content.set('');
    this.closeModal.emit();
  }

  save() {
    if (!this.content().trim()) return;
    this.isSaving.set(true);

    this.affectionService
      .createNote(this.roomId(), { typeCode: this.selectedType(), content: this.content() })
      .subscribe({
        next: (newNote) => {
          this.noteCreated.emit(newNote);
          this.isSaving.set(false);
          this.close();
        },
        error: (err) => {
          console.error('Error al crear nota', err);
          this.isSaving.set(false);
        },
      });
  }
}
