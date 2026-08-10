import { Component, input, output, computed, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GalleryService } from '../../../../services/gallery.service';
import { MediaDetail, MediaComment } from '../../../../models/media.model';

@Component({
  selector: 'app-photo-viewer-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './photo-viewer-modal.component.html',
  styleUrl: './photo-viewer-modal.component.css',
})
export class PhotoViewerModalComponent {
  private galleryService = inject(GalleryService);

  isOpen = input<boolean>(false);
  roomId = input<string>('');
  media = input<any | null>(null);

  closeModal = output<void>();

  detail = signal<MediaDetail | null>(null);
  comments = signal<MediaComment[]>([]);
  newComment = signal('');
  isLiked = signal(false);

    // un efecto cuando la foto cambia
  constructor() {
    effect(() => {
      if (this.isOpen() && this.media() && this.roomId()) {
        this.loadData();
      }
    });
  }

  // Por simplicidad, llamaremos a loadData desde el HTML o un hook cuando se abre.
  // Aquí lo dejamos preparado para cargar comentarios.
  loadData() {
    const mediaId = this.media()?.mediaId || this.media()?.id;
    if (!mediaId) return;

    this.galleryService.getMediaDetail(this.roomId(), mediaId).subscribe({
      next: (res) => {
        this.detail.set(res);
        this.isLiked.set(res.currentUserReactionType === 'love');
      },
    });

    this.galleryService.listComments(this.roomId(), mediaId).subscribe({
      next: (res) => this.comments.set(res),
    });
  }

  toggleLike() {
    const mediaId = this.media()?.mediaId || this.media()?.id;
    if (!mediaId) return;

    const wasLiked = this.isLiked();
    this.isLiked.set(!wasLiked);

    const req = wasLiked
      ? this.galleryService.removeReaction(this.roomId(), mediaId)
      : this.galleryService.react(this.roomId(), mediaId, 'love');

    req.subscribe({
      error: () => this.isLiked.set(wasLiked), // Revertir
    });
  }

  addComment() {
    if (!this.newComment().trim()) return;
    const mediaId = this.media()?.mediaId || this.media()?.id;

    this.galleryService.addComment(this.roomId(), mediaId!, this.newComment()).subscribe({
      next: () => {
        this.comments.update((prev) => [
          ...prev,
          {
            id: 'temp',
            userLoginId: 'yo',
            content: this.newComment(),
            createdAt: new Date().toISOString(),
          },
        ]);
        this.newComment.set('');
      },
    });
  }
}
