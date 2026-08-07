import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SavedPlace } from '../../../../models/map.model';

@Component({
  selector: 'app-map-place-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-place-detail.component.html',
  styleUrl: './map-place-detail.component.css',
})
export class MapPlaceDetailComponent {
  // Recibimos el lugar seleccionado
  place = input<SavedPlace | null>(null);

  getCategoryIcon(code: string): string {
    switch (code) {
      case 'restaurant':
        return 'restaurant';
      case 'park':
        return 'park';
      case 'hotel':
        return 'hotel';
      case 'first_date':
        return 'favorite';
      default:
        return 'push_pin';
    }
  }
}
