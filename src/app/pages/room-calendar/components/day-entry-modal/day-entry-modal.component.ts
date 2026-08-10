import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ModalComponent } from '../../../../shared/components/modal/modal.component';

export interface DayMedia {
  id: string;
  thumbnailUrl: string;
}

export interface DayDetail {
  content: string;
  mediaIds: DayMedia[];
}

/**
 * Contenido del modal "Recuerdo del día". Usa el <app-modal> compartido
 * como cascarón y solo aporta el contenido específico de room-calendar
 * (nota existente, form de nueva nota, botón de subir foto).
 */
@Component({
  selector: 'app-day-entry-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './day-entry-modal.component.html',
  styleUrl: './day-entry-modal.component.css',
})
export class DayEntryModalComponent {
  isOpen = input(false);
  selectedDate = input('');
  dayDetail = input<DayDetail | null>(null);
  newNoteContent = input('');
  isSaving = input(false);

  closeModal = output<void>();
  save = output<void>();
  noteContentChange = output<string>();
  uploadPhotoClick = output<void>();
}
