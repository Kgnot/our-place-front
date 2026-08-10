import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoveNote } from '../../../../models/love-note.model';
import { NOTE_TYPES, NoteType } from '../../config/note.config';

@Component({
  selector: 'app-feed-note-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feed-note-card.component.html',
  styleUrl: './feed-note-card.component.css',
})
export class FeedNoteCardComponent {
  note = input.required<LoveNote>();
  config = computed(() => {
    // Si el typeCode no existe en nuestro enum, usamos Memory por defecto
    const code = (this.note().typeCode as NoteType) || NoteType.Memory;
    return NOTE_TYPES[code] || NOTE_TYPES[NoteType.Memory];
  });
}
