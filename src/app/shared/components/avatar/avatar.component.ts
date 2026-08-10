import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="avatar" [style.width.px]="size()" [style.height.px]="size()">
      @if (src()) {
        <img [src]="src()" [alt]="alt()" />
      } @else if (initials()) {
        <span [style.font-size.px]="size() / 2.5">{{ initials() }}</span>
      } @else {
        <span class="material-symbols-outlined" [style.font-size.px]="size() / 2">{{
          icon()
        }}</span>
      }
    </div>
  `,
})
export class AvatarComponent {
  src = input<string | null | undefined>(null);
  alt = input<string>('Avatar');
  name = input<string>(''); // Para calcular iniciales si no hay imagen
  icon = input<string>('person'); // Icono por defecto
  size = input<number>(40);

  initials = computed(() => {
    const name = this.name();
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  });
}
