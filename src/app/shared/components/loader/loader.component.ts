import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-state" [style.padding]="padding()">
      <div class="spinner" [style.width.px]="size()" [style.height.px]="size()"></div>
      @if (message()) {
        <p>{{ message() }}</p>
      }
    </div>
  `,
  styles: [
    `
      .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        color: var(--color-text-light);
      }

      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid var(--color-border);
        border-top-color: var(--color-primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class LoaderComponent {
  message = input<string>('');
  size = input<number>(40);
  padding = input<string>('3rem');
}
