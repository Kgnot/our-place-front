import { Component, ElementRef, ViewChild, inject, afterNextRender, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapService } from '../../../services/map.service';
import { Map, NavigationControl, Marker } from 'maplibre-gl';

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule],
  template: `<div #mapContainer class="map-container"></div>`,
  styles: [
    `
      .map-container {
        width: 100%;
        height: 100%;
        background: #e5e2dc;
        filter: sepia(20%) saturate(80%) brightness(95%);
      }
    `,
  ],
})
export class MapViewComponent {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  private mapService = inject(MapService);

  // Inputs para poder reutilizar el componente en diferentes páginas
  center = input<[number, number]>([-74.0721, 4.711]); // Bogotá por defecto
  zoom = input<number>(11);

  constructor() {
    afterNextRender(() => {
      this.initMap();
    });
  }

  initMap() {
    const style = this.mapService.getOSMStyle();

    const map = new Map({
      container: this.mapContainer.nativeElement,
      style: style,
      center: this.center(),
      zoom: this.zoom(),
    });

    map.addControl(new NavigationControl(), 'top-right');

    map.on('load', () => {
      // Marcadores de ejemplo
      this.addPhotoMarker(
        map,
        -74.0721,
        4.711,
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDT1EbQ9t5uFuXT-RAnhVw1Ady0Rhw1c-9LJfQBHjS_HE8BPBk5ghWQb3ibuB-QLvwxTKGp7MkkDYwOVQ96RqpU4o1M9Ec_no3eB56LUGK7bvS8_mYFMTor_t_SaY8U_31lw7k6FnOYM1dftu0u9_OUL3wx2t0BahRB9hpDfQDuU7q8UsFu-pL15sHzucYBYBRqrx9H-PhMyRd1PUkcmKrM9JQTZBdbMF0eNlzXPXF6v4sxhQCQcMq2YQ',
      );
      this.addPhotoMarker(
        map,
        -74.0821,
        4.701,
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDBof-pbMRl3-uC3ED_caIxKp8t3MFsGqaDDcERQlH9cX74pcwxuzZMRUZ1aqQ91clNtNm4eBYugSNPAsq-x9qftMYfIs5N_H-eeb9y7ESHu0QsFFymYsIhV1L5GSa3RoOb8F-8EaSDckvJNs6n8yFtCfci5_oHgrckXCppRFHtstoPo946QOfPHOpbSKLc_QeBc0TdoPcoOG90f01KCUVriKubCm81AHUP1oHZKA264EnY5Up5ikIpIQ',
      );
    });
  }

  private addPhotoMarker(map: Map, lng: number, lat: number, imgUrl: string) {
    const el = document.createElement('div');
    el.className = 'map-photo-marker';
    el.style.backgroundImage = `url(${imgUrl})`;

    new Marker(el).setLngLat([lng, lat]).addTo(map);
  }
}
