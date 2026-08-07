import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dropdown-wrapper">
      <!-- El botón disparador -->
      <div (click)="toggle($event)">
        <ng-content select="[trigger]"></ng-content>
      </div>

      <!-- El menú flotante -->
      @if (isOpen()) {
        <div class="backdrop" (click)="close()"></div>
        <div class="dropdown-menu" (click)="$event.stopPropagation()">
          <ng-content select="[content]"></ng-content>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .dropdown-wrapper {
        position: relative;
        display: inline-flex;
        align-items: center;
      }
      .backdrop {
        position: fixed;
        inset: 0;
        z-index: 99;
        background: transparent;
      }
      .dropdown-menu {
        position: absolute;
        top: 50px;
        right: 0;
        background: var(--color-white);
        border-radius: 12px;
        z-index: 100;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        overflow: hidden;
        border: 1px solid var(--color-border);
        animation: fadeIn 0.15s ease;
        min-width: 240px;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-5px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class DropdownComponent {
  isOpen = signal(false);

  toggle(e: Event) {
    e.stopPropagation();
    this.isOpen.update((v) => !v);
  }

  close() {
    this.isOpen.set(false);
  }
}
