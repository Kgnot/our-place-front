import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { environments } from '../../environments/environments';
import { UpdateUserPayload, User } from '../models/user.model';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private userService = inject(UserService);

  readonly isLoggedIn = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);

  // Usamos environment
  private apiUrl = `${environments.apiUrl}/auth`;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('op_token');
      const refreshToken = localStorage.getItem('op_refreshToken');
      if (token && refreshToken) {
        this.isLoggedIn.set(true);
        this.userService.loadMe();
      }
    }
  }

  login(email: string, password: string) {
    this.isLoading.set(true);
    this.http
      .post<{ userId: string; accessToken: string; refreshToken: string }>(`${this.apiUrl}/login`, {
        email,
        password,
      })
      .subscribe({
        next: (res) => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('op_token', res.accessToken);
            localStorage.setItem('op_refreshToken', res.refreshToken);
          }
          this.isLoggedIn.set(true);
          this.isLoading.set(false);
          this.router.navigate(['/rooms']).then((r) => console.info('navegando a rooms', r));
        },
        error: (err) => {
          console.error(`error en login`, err);
          this.isLoading.set(false);
        },
      });
  }

  /**
   * Llama a POST /api/v1/auth/register (RegisterUserController).
   * El endpoint devuelve RegisterUserOutput (sin tokens), así que no
   * autenticamos automáticamente: se invoca `onSuccess` para que el
   * componente pueda, por ejemplo, cambiar a modo login.
   */
  register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    onSuccess?: () => void,
  ) {
    this.isLoading.set(true);
    this.http
      .post<{ userId: string }>(`${this.apiUrl}/register`, {
        email,
        password,
        firstName,
        lastName,
      })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          onSuccess?.();
        },
        error: (err) => {
          console.error('error en registro', err);
          this.isLoading.set(false);
        },
      });
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('op_token');
      localStorage.removeItem('op_refreshToken');
    }
    this.isLoggedIn.set(false);
    this.router.navigate(['/login']).then((r) => console.info('navegando a login', r));
  }
}
