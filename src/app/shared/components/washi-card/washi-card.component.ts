import { Component, input } from '@angular/core';

export type TapeColor = 'terracotta' | 'sage' | 'mustard' | 'pink' | 'green';

/**
 * Primitivo compartido: el "shell" visual de cinta washi + tarjeta blanca
 * con sombra que usan room-card, photo-card (login) y las tarjetas del feed.
 * No sabe nada de fotos, notas ni comentarios: solo envuelve lo que le pases
 * por <ng-content> con el marco de washi tape + sombra + rotación.
 *
 * El tamaño/padding/radio/sombra de .card-inner se controlan con variables
 * CSS (--washi-card-radius, --washi-card-padding, --washi-card-shadow) para
 * que cada consumidor pueda ajustar el look sin tocar este componente.
 */
@Component({
  selector: 'app-washi-card',
  imports: [],
  templateUrl: './washi-card.component.html',
  styleUrl: './washi-card.component.css',
})
export class WashiCardComponent {
  tape = input<TapeColor>('terracotta');
  /** Rotación en grados para el efecto "pegado a mano" */
  rotate = input<number>(0);
}
