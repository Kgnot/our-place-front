import { Component, input } from '@angular/core';

export type TapeColor = 'terracotta' | 'sage' | 'mustard';

/**
 * Tarjeta de foto tipo "polaroid" con cinta washi, siguiendo el mismo
 * lenguaje visual que .room-card (card-inner, washi-tape, sombra suave).
 * Se usa en el mood board del login, pero es reutilizable en cualquier
 * lugar donde queramos mostrar una imagen con este estilo.
 */
@Component({
  selector: 'app-photo-card',
  imports: [],
  templateUrl: 'photo-card.component.html',
  styleUrl: 'photo-card.component.css',
})
export class PhotoCardComponent {
  imageUrl = input.required<string>();
  alt = input<string>('');
  tape = input<TapeColor>('terracotta');
  /** Rotación en grados para el efecto "foto pegada a mano" */
  rotate = input<number>(0);
}
