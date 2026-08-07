import { Injectable, inject, signal } from '@angular/core';
import { Map, Marker, NavigationControl } from 'maplibre-gl';
import { MapService } from './map.service';
import { SavedPlace } from '../models/map.model';

@Injectable({
  providedIn: 'root',
})
export class MapManagerService {
  private mapConfig = inject(MapService);

  private mapInstance!: Map;

  private markers: Marker[] = [];

  placeClicked = signal<SavedPlace | null>(null);

  emptyMapClicked = signal<{ lng: number; lat: number } | null>(null);

  init(container: HTMLElement) {
    this.mapInstance = new Map({
      container,
      style: this.mapConfig.getOSMStyle(),
      center: [-74.0721, 4.711],
      zoom: 11,
    });

    this.mapInstance.addControl(new NavigationControl(), 'top-right');

    // SOLO detecta clicks sobre el mapa
    this.mapInstance.on('click', (e) => {
      this.emptyMapClicked.set({
        lng: e.lngLat.lng,
        lat: e.lngLat.lat,
      });
    });
  }

  renderPlaces(places: SavedPlace[]) {
    this.clearMarkers();

    places.forEach((place) => this.addMarker(place));
  }

  private addMarker(place: SavedPlace) {
    const coords = this.mapConfig.parseWkt(place.locationWkt);
    if (!coords) return;
    const el = document.createElement('div');
    el.className = 'map-place-marker';
    el.innerHTML = `
      <span class="material-symbols-outlined">
            ${this.getIcon(place.categoryCode)}
      </span>
    `;
    console.log(el.outerHTML);
    // El marcador maneja su propio click
    el.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      this.placeClicked.set(place);
    });
    const marker = new Marker({ element: el })
      .setLngLat([coords.lng, coords.lat])
      .addTo(this.mapInstance);
    console.log(marker.getElement().outerHTML);
    this.markers.push(marker);
  }

  private clearMarkers() {
    this.markers.forEach((marker) => marker.remove());
    this.markers = [];
  }

  private getIcon(code: string): string {
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
