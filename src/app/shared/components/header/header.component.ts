import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiService } from '../../../services/ui.service';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { SearchSpacesComponent } from '../search-spaces/search-spaces.component';
import { ProfileModalComponent } from '../profile-modal/profile-modal.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, SearchSpacesComponent, ProfileModalComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
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
  }

  logout() {
    this.closeDropdown();
    this.auth.logout();
  }
}
