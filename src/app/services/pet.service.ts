import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environments } from '../../environments/environments';
import { Pet, CreatePetPayload, UpdatePetPayload, LkpSpecies } from '../models/pet.model';

@Injectable({ providedIn: 'root' })
export class PetService {
  private http = inject(HttpClient);

  private apiUrl = `${environments.apiUrl}/pet`;

  readonly pets = signal<Pet[]>([]);
  readonly species = signal<LkpSpecies[]>([]);

  loadSpecies() {
    this.http.get<LkpSpecies[]>(`${this.apiUrl}/species`).subscribe({
      next: (data) => this.species.set(data),
      error: (err) => console.error('Error al obtener especies', err),
    });
  }

  loadPetsByRoom(roomId: string) {
    this.http.get<Pet[]>(`${this.apiUrl}/rooms/${roomId}`).subscribe({
      next: (data) => this.pets.set(data),
      error: (err) => console.error('Error al obtener mascotas', err),
    });
  }

  // Asume GET /pet/:petId siguiendo el mismo patrón que update/delete.
  getPetById(petId: string) {
    return this.http.get<Pet>(`${this.apiUrl}/${petId}`);
  }

  createPet(roomId: string, payload: CreatePetPayload) {
    return this.http.post<Pet>(`${this.apiUrl}/rooms/${roomId}`, payload);
  }

  updatePet(petId: string, payload: UpdatePetPayload) {
    return this.http.put<Pet>(`${this.apiUrl}/${petId}`, payload);
  }

  deletePet(petId: string) {
    return this.http.delete(`${this.apiUrl}/${petId}`);
  }
}
