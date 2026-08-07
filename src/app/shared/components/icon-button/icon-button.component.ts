import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon-button.component.html',
  styleUrl: './icon-button.component.css',
})
export class IconButtonComponent {
  // Nombre del icono de Material Symbols (ej: 'notifications', 'search')
  icon = input<string>('');

  // Tamaño opcional (ej: 24px, 28px)
  size = input<string>('24px');

  // Evento que se emite al hacer click
  btnClick = output<void>();
}
