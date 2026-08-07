import { Component, ElementRef, ViewChild, inject, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MapService } from '../../services/map.service';
import { RoomHeaderComponent } from '../../shared/components/room-header/room-header.component';
import { FormsModule } from '@angular/forms';
import { Map, NavigationControl, Marker, LngLat } from 'maplibre-gl';
import { PlaceCategory, SavedPlace } from '../../models/map.model';

@Component({
  selector: 'app-room-map',
  standalone: true,
  imports: [CommonModule, RoomHeaderComponent, FormsModule],
  templateUrl: './room-map.component.html',
  styleUrl: './room-map.component.css',
})
export class RoomMapComponent {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  private mapService = inject(MapService);
  private route = inject(ActivatedRoute);

  roomId = signal('');
  private mapInstance!: Map;

  // Estado de categorías y lugares
  categories = signal<PlaceCategory[]>([]);
  savedPlaces = signal<SavedPlace[]>([]);

  // Estado del modal de creación
  isModalOpen = signal(false);
  newPlaceCoords = signal<{ lng: number; lat: number } | null>(null);
  newPlaceName = signal('');
  newPlaceDesc = signal('');
  newPlaceCategory = signal('');
  isSaving = signal(false);

  constructor() {
    afterNextRender(() => {
      this.initMap();
      this.loadCategories();
    });
  }

  initMap() {
    const id = this.route.snapshot.paramMap.get('roomId');
    if (id) this.roomId.set(id);

    const map = new Map({
      container: this.mapContainer.nativeElement,
      style: this.mapService.getOSMStyle(),
      center: [-74.0721, 4.711],
      zoom: 11,
    });

    map.addControl(new NavigationControl(), 'top-right');
    this.mapInstance = map;

    map.on('load', () => {
      this.loadSavedPlaces();
    });

    // Al hacer clic en el mapa (no en un marker), abrimos el modal
    map.on('click', (e: any) => {
      this.openCreateModal(e.lngLat);
    });
  }

  loadCategories() {
    this.mapService.getPlaceCategories().subscribe({
      next: (cats) => {
        this.categories.set(cats);
        if (cats.length > 0) this.newPlaceCategory.set(cats[0].code);
      },
    });
  }

  loadSavedPlaces() {
    this.mapService.getSavedPlaces(this.roomId()).subscribe({
      next: (places) => {
        this.savedPlaces.set(places);
        // Pintar markers en el mapa
        places.forEach((place) => this.addPlaceMarker(place));
      },
    });
  }

  addPlaceMarker(place: SavedPlace) {
    const coords = this.mapService.parseWkt(place.locationWkt);
    if (!coords) return;

    const el = document.createElement('div');
    el.className = 'map-place-marker';
    el.innerHTML = `<span class="material-symbols-outlined">${this.getCategoryIcon(place.categoryCode)}</span>`;

    el.addEventListener('click', (e) => {
      e.stopPropagation(); // Evita que se abra el modal de crear
      alert(`Lugar: ${place.name}\n${place.description}`);
    });

    new Marker(el).setLngLat([coords.lng, coords.lat]).addTo(this.mapInstance);
  }

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

  // --- Modal Creación ---
  openCreateModal(lngLat: LngLat) {
    this.newPlaceCoords.set({ lng: lngLat.lng, lat: lngLat.lat });
    this.newPlaceName.set('');
    this.newPlaceDesc.set('');
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
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
      visitedAt: null, // Puedes añadir un datepicker si quieres
    };

    this.mapService.createSavedPlace(this.roomId(), payload).subscribe({
      next: (newPlace) => {
        this.savedPlaces.update((prev) => [...prev, newPlace]);
        this.addPlaceMarker(newPlace);
        this.isSaving.set(false);
        this.closeModal();
      },
      error: (err) => {
        console.error('Error al guardar lugar', err);
        this.isSaving.set(false);
      },
    });
  }
}
