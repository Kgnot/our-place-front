import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environments } from '../../environments/environments';
import { Observable } from 'rxjs';
import { PlaceCategory, SavedPlace, CreateSavedPlacePayload } from '../models/map.model';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private http = inject(HttpClient);
  private apiUrl = `${environments.apiUrl}/map`;

  getOSMStyle(): any {
    return {
      version: 8,
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap contributors',
        },
      },
      layers: [{ id: 'osm-layer', type: 'raster', source: 'osm-tiles', minzoom: 0, maxzoom: 19 }],
    };
  }

  getPlaceCategories(): Observable<PlaceCategory[]> {
    return this.http.get<PlaceCategory[]>(`${this.apiUrl}/place-categories`);
  }

  getSavedPlaces(roomId: string): Observable<SavedPlace[]> {
    return this.http.get<SavedPlace[]>(`${this.apiUrl}/room/${roomId}/saved-places`);
  }

  createSavedPlace(roomId: string, payload: CreateSavedPlacePayload): Observable<SavedPlace> {
    return this.http.post<SavedPlace>(`${this.apiUrl}/room/${roomId}/saved-places`, payload);
  }

  deleteSavedPlace(roomId: string, placeId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/room/${roomId}/saved-places/${placeId}`);
  }

  // --- Utilidades WKT ---
  // Convierte lng/lat a formato WKT: "POINT (lng lat)"
  toWkt(lng: number, lat: number): string {
    return `POINT (${lng} ${lat})`;
  }

  // Extrae lng/lat de un WKT
  parseWkt(wkt: string): { lng: number; lat: number } | null {
    const match = wkt.match(/POINT\s*\(([-\d.]+)\s+([-\d.]+)\)/i);
    if (match) {
      return { lng: parseFloat(match[1]), lat: parseFloat(match[2]) };
    }
    return null;
  }
}
