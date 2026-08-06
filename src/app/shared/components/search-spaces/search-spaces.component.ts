import { Component, inject, signal } from '@angular/core';
import { UiService } from '../../../services/ui.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-spaces',
  imports: [FormsModule],
  templateUrl: './search-spaces.component.html',
  styleUrl: './search-spaces.component.css',
})
export class SearchSpacesComponent {
  ui = inject(UiService);
  searchTerm = signal('');

  close() {
    this.ui.closeSearch();
  }
}
