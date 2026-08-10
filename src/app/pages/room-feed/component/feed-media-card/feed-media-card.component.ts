import { Component, input, output, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleryService } from '../../../../services/gallery.service';
import { WashiCardComponent } from '../../../../shared/components/washi-card/washi-card.component';

@Component({
  selector: 'app-feed-media-card',
  standalone: true,
  imports: [CommonModule, WashiCardComponent],
  templateUrl: './feed-media-card.component.html',
  styleUrls: ['./feed-media-card.component.css'],
})
export class FeedMediaCardComponent {
  private galleryService = inject(GalleryService);

  media = input<any>();
  roomId = input<string>('');

  openViewer = output<any>();

  isLiked = signal(false);

  // Inicializamos el estado del like basado en la media
  // (Si tu backend ya devuelve currentUserReactionType en la lista, úsalo)
  constructor() {
    effect(() => {
      this.isLiked.set(this.media()?.currentUserReactionType === 'love');
    });
  }

  toggleLike(event: Event) {
    event.stopPropagation(); // Evita que abra el visor
    const mediaId = this.media()?.mediaId || this.media()?.id;
    if (!mediaId) return;

    const wasLiked = this.isLiked();
    this.isLiked.set(!wasLiked);

    const req = wasLiked
      ? this.galleryService.removeReaction(this.roomId(), mediaId)
      : this.galleryService.react(this.roomId(), mediaId, 'love');

    req.subscribe({ error: () => this.isLiked.set(wasLiked) });
  }
}
