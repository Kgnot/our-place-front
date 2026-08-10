import { Component, inject, signal, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PetService } from '../../services/pet.service';
import { Pet } from '../../models/pet.model';

@Component({
  selector: 'app-room-pet-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './room-pet-profile.component.html',
  styleUrl: './room-pet-profile.component.css',
})
export class RoomPetProfileComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private petService = inject(PetService);

  pet = signal<Pet | null>(null);
  isLoading = signal(true);
  notFound = signal(false);
  roomId = signal<string>('');

  constructor() {
    afterNextRender(() => {
      const roomId = this.route.snapshot.paramMap.get('roomId');
      const petId = this.route.snapshot.paramMap.get('petId');

      if (roomId) this.roomId.set(roomId);

      if (!petId) {
        this.notFound.set(true);
        this.isLoading.set(false);
        return;
      }

      this.petService.getPetById(petId).subscribe({
        next: (pet) => {
          this.pet.set(pet);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error al cargar la mascota', err);
          this.notFound.set(true);
          this.isLoading.set(false);
        },
      });
    });
  }

  // Edad legible a partir de birthDate (si existe)
  get age(): string | null {
    const pet = this.pet();
    if (!pet?.birthDate) return null;

    const birth = new Date(pet.birthDate);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    if (years <= 0) {
      return `${months} ${months === 1 ? 'mes' : 'meses'}`;
    }
    const monthsPart = months > 0 ? ` y ${months} ${months === 1 ? 'mes' : 'meses'}` : '';
    return `${years} ${years === 1 ? 'año' : 'años'}${monthsPart}`;
  }

  formatDate(dateStr?: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  goBack() {
    this.router.navigate(['/rooms', this.roomId(), 'feed']);
  }
}
