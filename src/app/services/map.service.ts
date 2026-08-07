import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  getOSMStyle(): any {
    return {
      version: 8,
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        },
      },
      layers: [
        {
          id: 'osm-layer',
          type: 'raster',
          source: 'osm-tiles',
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    };
  }
}
