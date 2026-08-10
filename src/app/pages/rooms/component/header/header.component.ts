import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiService } from '../../../../services/ui/ui.service';
import { ProfileMenuComponent } from '../profile-menu/profile-menu.component';
import { SearchSpacesComponent } from '../../../../shared/components/search-spaces/search-spaces.component';
import { ProfileModalComponent } from '../../../../shared/components/profile-modal/profile-modal.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ProfileMenuComponent, SearchSpacesComponent, ProfileModalComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  ui = inject(UiService);
}
