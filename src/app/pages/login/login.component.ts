import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { PhotoCardComponent } from '../../shared/components/photo-card/photo-card.component';
import { MEMORY_PHOTOS } from './config/login.config';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, PhotoCardComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  protected auth = inject(AuthService);

  email = signal('');
  password = signal('');
  firstName = signal('');
  lastName = signal('');
  isLoginMode = signal(true);

  // Computamos leyendo del mapa directamente
  protected readonly memoryPhotos = computed(() =>
    this.isLoginMode() ? MEMORY_PHOTOS.login : MEMORY_PHOTOS.register,
  );

  toggleMode() {
    this.isLoginMode.update((value) => !value);
  }

  onSubmit() {
    if (this.isLoginMode()) {
      this.auth.login(this.email(), this.password());
    } else {
      this.auth.register(this.email(), this.password(), this.firstName(), this.lastName(), () => {
        this.isLoginMode.set(true);
      });
    }
  }
}
