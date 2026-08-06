import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  protected auth = inject(AuthService);

  email = signal('');
  password = signal('');
  isLoginMode = signal(true);

  toggleMode() {
    this.isLoginMode.update((value) => !value);
  }

  onSubmit() {
    if (this.isLoginMode()) {
      this.auth.login(this.email(), this.password());
    } else {
      // Lógica de registro (puedes llamar a /register aquí)
      console.log('Registrando...', this.email());
    }
  }
}
