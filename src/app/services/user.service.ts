import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User, UpdateUserPayload } from '../models/user.model';
import { environments } from '../../environments/environments';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environments.apiUrl}/auth`;

  readonly currentUser = signal<User | null>(null);

  loadMe() {
    this.http.get<User>(`${this.apiUrl}/me`).subscribe({
      next: (user) => this.currentUser.set(user),
      error: (err) => console.error('Error al obtener usuario', err),
    });
  }

  updateProfile(data: UpdateUserPayload) {
    return this.http.patch<User>(`${this.apiUrl}/me`, data);
  }

  clearUser() {
    this.currentUser.set(null);
  }
}
