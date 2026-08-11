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

  // Tamaño del botón/caja circular (ej: 40px)
  size = input<string>('40px');

  // Tamaño del glifo del ícono en sí. Si no se pasa, usa un tamaño proporcional al botón.
  iconSize = input<string>('22px');

  // Evento que se emite al hacer click
  btnClick = output<void>();
}
