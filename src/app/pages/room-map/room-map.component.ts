import {
  Component,
  ElementRef,
  ViewChild,
  inject,
  afterNextRender,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MapService } from '../../services/map.service';
import { MapManagerService } from '../../services/map-manager.service'; // <-- Nuevo!
import { RoomHeaderComponent } from '../../shared/components/room-header/room-header.component';
import { FormsModule } from '@angular/forms';
import { PlaceCategory, SavedPlace } from '../../models/map.model';
import { SidePanelService } from '../../services/side-panel.service';
import { MapPlaceDetailComponent } from './components/map-place-detail/map-place-detail.component';
import { SidePanelComponent } from '../../shared/components/side-panel/side-panel.component';

@Component({
  selector: 'app-room-map',
  standalone: true,
  imports: [
    CommonModule,
    RoomHeaderComponent,
    FormsModule,
    MapPlaceDetailComponent,
    SidePanelComponent,
  ],
  templateUrl: './room-map.component.html',
  styleUrl: './room-map.component.css',
})
export class RoomMapComponent {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  private route = inject(ActivatedRoute);
  private mapManager = inject(MapManagerService);
  private mapService = inject(MapService);
  sidePanel = inject(SidePanelService);

  roomId = signal('');
  categories = signal<PlaceCategory[]>([]);
  savedPlaces = signal<SavedPlace[]>([]);
  selectedPlace = signal<SavedPlace | null>(null);

  // Modal Crear
  isCreateModalOpen = signal(false);
  newPlaceCoords = signal<{ lng: number; lat: number } | null>(null);
  newPlaceName = signal('');
  newPlaceDesc = signal('');
  newPlaceCategory = signal('');
  isSaving = signal(false);

  constructor() {
    afterNextRender(() => {
      // 1. Inicializamos el mapa a través del manager
      this.mapManager.init(this.mapContainer.nativeElement);

      const id = this.route.snapshot.paramMap.get('roomId');
      if (id) {
        this.roomId.set(id);
        this.loadCategories();
        this.loadSavedPlaces();
      }
    });

    // 2. Reaccionamos a los eventos del mapa usando Signals
    effect(() => {
      const place = this.mapManager.placeClicked();
      if (place) {
        this.openViewPanel(place);
        this.mapManager.placeClicked.set(null);
      }
    });

    effect(() => {
      const coords = this.mapManager.emptyMapClicked();
      if (coords) {
        this.openCreateModal(coords);
        this.mapManager.emptyMapClicked.set(null); // Resetear
      }
    });
  }

  loadCategories() {
    this.mapService.getPlaceCategories().subscribe((cats) => {
      this.categories.set(cats);
      if (cats.length > 0) this.newPlaceCategory.set(cats[0].code);
    });
  }

  loadSavedPlaces() {
    this.mapService.getSavedPlaces(this.roomId()).subscribe((places) => {
      this.savedPlaces.set(places);
      this.mapManager.renderPlaces(places);
    });
  }

  // --- SidePanel ---
  openViewPanel(place: SavedPlace) {
    this.selectedPlace.set(place);
    this.sidePanel.open();
  }

  // --- Modal Crear ---
  openCreateModal(coords: { lng: number; lat: number }) {
    this.newPlaceCoords.set(coords);
    this.newPlaceName.set('');
    this.newPlaceDesc.set('');
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal() {
    this.isCreateModalOpen.set(false);
    this.newPlaceCoords.set(null);
  }

  savePlace() {
    if (!this.newPlaceCoords() || !this.newPlaceName().trim()) return;

    this.isSaving.set(true);
    const coords = this.newPlaceCoords();
    const payload = {
      categoryCode: this.newPlaceCategory(),
      name: this.newPlaceName(),
      description: this.newPlaceDesc(),
      locationWkt: this.mapService.toWkt(coords!.lng, coords!.lat),
      visitedAt: null,
    };

    this.mapService.createSavedPlace(this.roomId(), payload).subscribe({
      next: (newPlace) => {
        this.savedPlaces.update((prev) => {
          const updated = [...prev, newPlace];
          this.mapManager.renderPlaces(updated);
          return updated;
        });
        this.isSaving.set(false);
        this.closeCreateModal();
      },
      error: (err) => {
        console.error('Error al guardar lugar', err);
        this.isSaving.set(false);
      },
    });
  }
}
