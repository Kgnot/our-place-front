import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiService } from '../../../../services/ui/ui.service';
import { AuthService } from '../../../../services/auth.service';
import { UserService } from '../../../../services/user.service';
import {DropdownComponent} from '../../../../shared/components/dropdown/dropdown.component';

@Component({
  selector: 'app-profile-menu',
  standalone: true,
  imports: [CommonModule, DropdownComponent],
  templateUrl: './profile-menu.component.html',
  styleUrl: './profile-menu.component.css',
})
export class ProfileMenuComponent {
  ui = inject(UiService);
  auth = inject(AuthService);
  userService = inject(UserService);

  isDropdownOpen = signal(false);

  toggleDropdown() {
    this.isDropdownOpen.update((v) => !v);
  }

  closeDropdown() {
    this.isDropdownOpen.set(false);
  }

  openProfile() {
    this.closeDropdown();
    this.ui.openProfileModal();
    console.log("Aqui abre y no hace nada mas")
  }

  logout() {
    this.closeDropdown();
    this.auth.logout();
  }
}
