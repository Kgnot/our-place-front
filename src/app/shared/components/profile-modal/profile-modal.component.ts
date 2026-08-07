import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiService } from '../../../services/ui.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-profile-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-modal.component.html',
  styleUrl: './profile-modal.component.css',
})
export class ProfileModalComponent {
  protected ui = inject(UiService);
  private userService = inject(UserService);

  firstName = signal('');
  lastName = signal('');
  email = signal('');
  avatarUrl = signal('');
  birthDate = signal('');
  isSaving = signal(false);

  constructor() {
    effect(() => {
      const user = this.userService.currentUser();
      if (user) {
        this.firstName.set(user.firstName || '');
        this.lastName.set(user.lastName || '');
        this.email.set(user.email || '');
        this.avatarUrl.set(user.avatarUrl || '');
        this.birthDate.set(user.birthDate || '');
      }
    });
  }

  closeModal() {
    this.ui.closeProfileModal();
  }

  saveProfile() {
    this.isSaving.set(true);
    const payload = {
      firstName: this.firstName(),
      lastName: this.lastName(),
      avatarUrl: this.avatarUrl(),
      birthDate: this.birthDate() || null,
      timezone: 'America/Colombia/Bogota',
      locale: 'es-CO',
    };

    this.userService.updateProfile(payload).subscribe({
      next: (updatedUser) => {
        this.userService.currentUser.set(updatedUser);
        this.isSaving.set(false);
        this.closeModal();
      },
      error: (err) => {
        console.error('Error al guardar', err);
        this.isSaving.set(false);
      },
    });
  }
}
