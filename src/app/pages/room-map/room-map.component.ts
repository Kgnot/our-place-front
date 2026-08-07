import { Component, ElementRef, ViewChild, inject, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MapService } from '../../services/map.service';
import { RoomHeaderComponent } from '../../shared/components/room-header/room-header.component';
import { Map, NavigationControl, Marker } from 'maplibre-gl'; // <-- IMPORT CORREGIDO

@Component({
  selector: 'app-room-map',
  standalone: true,
  imports: [CommonModule, RoomHeaderComponent],
  templateUrl: './room-map.component.html',
  styleUrl: './room-map.component.css',
})
export class RoomMapComponent {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  private mapService = inject(MapService);
  private route = inject(ActivatedRoute);

  constructor() {
    // afterNextRender garantiza que el div del mapa exista en el navegador
    afterNextRender(() => {
      this.initMap();
    });
  }

  initMap() {
    // Obtenemos el estilo en línea (sin petición HTTP, sin CORS)
    const style = this.mapService.getOSMStyle();

    const map = new Map({
      container: this.mapContainer.nativeElement,
      style: style,
      center: [-74.0721, 4.711], // Sigue abriendo en Bogotá
      zoom: 11,
    });

    map.addControl(new NavigationControl());

    map.on('load', () => {
      // Agregamos marcadores de ejemplo
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

    // Usamos la clase Marker importada
    new Marker(el).setLngLat([lng, lat]).addTo(map);
  }
}
