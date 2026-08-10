import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UiService {
  //controlar visibilidad del modal de perfil
  isProfileModalOpen = signal<boolean>(false);
  //controlar visibilidad de busqueda
  isSearchOpen = signal<boolean>(false);

  openProfileModal() {
    this.isProfileModalOpen.set(true);
  }
  openSearch() {
    this.isSearchOpen.set(true);
  }

  toggleSearch() {
    this.isSearchOpen.update((v) => !v);
  }

  closeProfileModal() {
    this.isProfileModalOpen.set(false);
  }

  closeSearch() {
    this.isSearchOpen.set(false);
  }
}
