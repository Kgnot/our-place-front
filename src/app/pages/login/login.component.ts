import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import {
  PhotoCardComponent,
  TapeColor,
} from '../../shared/components/photo-card/photo-card.component';

interface MemoryPhoto {
  url: string;
  alt: string;
  tape: TapeColor;
  rotate: number;
}

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

  // Reemplaza estas rutas por tus propias imágenes en /assets/login/
  protected readonly memoryPhotos: MemoryPhoto[] = [
    {
      url: 'assets/login/memory-1.jpg',
      alt: 'Recuerdo compartido 1',
      tape: 'terracotta',
      rotate: -6,
    },
    { url: 'assets/login/memory-2.jpg', alt: 'Recuerdo compartido 2', tape: 'sage', rotate: 4 },
    { url: 'assets/login/memory-3.jpg', alt: 'Recuerdo compartido 3', tape: 'mustard', rotate: -3 },
  ];

  toggleMode() {
    this.isLoginMode.update((value) => !value);
  }

  onSubmit() {
    if (this.isLoginMode()) {
      this.auth.login(this.email(), this.password());
    } else {
      this.auth.register(this.email(), this.password(), this.firstName(), this.lastName(), () => {
        // Tras registrarse, lo mandamos a iniciar sesión con el correo ya cargado
        this.isLoginMode.set(true);
      });
    }
  }
}
