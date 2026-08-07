import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User, UpdateUserPayload } from '../models/user.model';
import { environments } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  // Signal exclusiva del usuario
  readonly currentUser = signal<User | null>(null);

  private apiUrl = `${environments.apiUrl}/auth`;

  // Cargar la información del usuario
  loadMe() {
    this.http.get<User>(`${this.apiUrl}/me`).subscribe({
      next: (user) => this.currentUser.set(user),
      error: (err) => console.error('Error al obtener usuario', err),
    });
    console.log("[users.service.ts] Usuario cargado", this.currentUser());
  }

  // Actualizar perfil
  updateProfile(data: UpdateUserPayload) {
    return this.http.patch<User>(`${this.apiUrl}/me`, data);
  }

  // Limpiar usuario al cerrar sesión
  clearUser() {
    this.currentUser.set(null);
  }
}
