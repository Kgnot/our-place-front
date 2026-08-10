import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
})
export class ModalComponent {
  // Señales de entrada
  isOpen = input<boolean>(false);
  title = input<string>('');
  subtitle = input<string>('');

  // Evento de salida
  closeModal = output<void>();

  close() {
    this.closeModal.emit();
  }
}
