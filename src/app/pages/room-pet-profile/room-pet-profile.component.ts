import { Component, inject, signal, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PetService } from '../../services/pet.service';
import { Pet, UpdatePetPayload } from '../../models/pet.model';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-room-pet-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, LoaderComponent, AvatarComponent],
  templateUrl: './room-pet-profile.component.html',
  styleUrl: './room-pet-profile.component.css',
})
export class RoomPetProfileComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected petService = inject(PetService);

  pet = signal<Pet | null>(null);
  isLoading = signal(true);
  notFound = signal(false);
  roomId = signal<string>('');
  petId = signal<string>('');

  // Modal de Editar
  isEditOpen = signal(false);
  isSaving = signal(false);
  editForm: UpdatePetPayload = {
    name: '',
    speciesCode: '',
    breed: '',
    birthDate: '',
    avatarUrl: '',
  };

  constructor() {
    afterNextRender(() => {
      const roomId = this.route.snapshot.paramMap.get('roomId');
      const petId = this.route.snapshot.paramMap.get('petId');

      if (roomId) this.roomId.set(roomId);
      if (petId) this.petId.set(petId);

      if (!petId) {
        this.notFound.set(true);
        this.isLoading.set(false);
        return;
      }

      // Cargar especies por si queremos editar
      this.petService.loadSpecies();
      this.loadPet();
    });
  }

  loadPet() {
    this.isLoading.set(true);
    this.petService.getPetById(this.roomId(), this.petId()).subscribe({
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
  }

  // --- Editar Mascota ---
  openEditModal() {
    const p = this.pet();
    if (!p) return;
    this.editForm = {
      name: p.name,
      speciesCode: p.speciesCode,
      breed: p.breed || '',
      birthDate: p.birthDate || '',
      avatarUrl: p.avatarUrl || '',
    };
    this.isEditOpen.set(true);
  }

  saveChanges() {
    if (!this.editForm.name.trim()) return;
    this.isSaving.set(true);
    this.petService.updatePet(this.roomId(), this.petId(), this.editForm).subscribe({
      next: (updatedPet) => {
        this.pet.set(updatedPet);
        this.isSaving.set(false);
        this.isEditOpen.set(false);
      },
      error: (err) => {
        console.error('Error al actualizar', err);
        this.isSaving.set(false);
      },
    });
  }

  // --- Eliminar Mascota ---
  deletePet() {
    if (
      confirm(`¿Estás seguro de eliminar a ${this.pet()?.name}? Esta acción no se puede deshacer.`)
    ) {
      this.petService.deletePet(this.roomId(), this.petId()).subscribe({
        next: () => this.goBack(),
        error: (err) => console.error('Error al eliminar', err),
      });
    }
  }

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
    this.router.navigate(['/rooms', this.roomId()]);
  }
}
