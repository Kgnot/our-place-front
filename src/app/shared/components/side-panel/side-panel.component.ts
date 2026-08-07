import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './side-panel.component.html',
  styleUrl: './side-panel.component.css',
})
export class SidePanelComponent {
  isOpen = input<boolean>(false);
  title = input<string>('');
  subtitle = input<string|undefined>('');

  // Evento de salida
  closePanel = output<void>();

  close() {
    this.closePanel.emit();
  }
}
