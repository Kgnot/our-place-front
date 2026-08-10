import { Component, inject, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AffectionService } from '../../services/affection.service';
import { GalleryService } from '../../services/gallery.service';
import { PetService } from '../../services/pet.service';
import { RoomHeaderComponent } from '../../shared/components/room-header/room-header.component';
import { UploadPhotosModalComponent } from './component/upload-photos-modal/upload-photos-modal.component';
import { AddNoteModalComponent } from './component/add-note-modal/add-note-modal.component';
import { PetsRailComponent } from './component/pets-rail/pets-rail.component';
import { FeedMediaCardComponent } from './component/feed-media-card/feed-media-card.component';
import { FeedNoteCardComponent } from './component/feed-note-card/feed-note-card.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { FormsModule } from '@angular/forms';
import { CreatePetPayload } from '../../models/pet.model';
import { LoveNote } from '../../models/love-note.model';
import { PhotoViewerModalComponent } from './component/photo-viewer-modal/photo-viewer-modal.component';

@Component({
  selector: 'app-room-feed',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RoomHeaderComponent, ModalComponent, UploadPhotosModalComponent, AddNoteModalComponent,
    PetsRailComponent, FeedMediaCardComponent, FeedNoteCardComponent, PhotoViewerModalComponent,
  ],
  templateUrl: './room-feed.component.html',
  styleUrl: './room-feed.component.css',
})
export class RoomFeedComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private affectionService = inject(AffectionService);
  private galleryService = inject(GalleryService);
  private petService = inject(PetService);

  notes = this.affectionService.notes;
  mediaItems = signal<any[]>([]);
  pets = this.petService.pets;
  species = this.petService.species;

  roomId = signal<string>('');

  // Estados de Modales (Solo booleanos)
  isUploadOpen = signal(false);
  isAddNoteOpen = signal(false);
  isAddPetOpen = signal(false);
  selectedMedia = signal<any | null>(null);

  // Formulario de mascotas (Lo dejamos aquí porque es pequeño)
  isSavingPet = signal(false);
  petForm: CreatePetPayload = { speciesCode: '', name: '', breed: '', birthDate: '' };

  constructor() {
    afterNextRender(() => {
      const id = this.route.snapshot.paramMap.get('roomId');
      if (id) {
        this.roomId.set(id);
        this.affectionService.loadNotes(id);
        this.loadMedia(id);
        this.petService.loadPetsByRoom(id);
        this.petService.loadSpecies();
      }
    });
  }

  loadMedia(roomId: string) {
    this.galleryService.getMediaList(roomId).subscribe({
      next: (page) => this.mediaItems.set(page.content || []),
    });
  }

  // --- Manejadores de Eventos ---
  onUploadComplete(newMedia: any[]) {
    this.mediaItems.update((prev) => [...newMedia, ...prev]);
  }

  onNoteCreated(newNote: LoveNote) {
    this.affectionService.notes.update((notes) => [newNote, ...notes]);
  }

  // --- Mascotas ---
  savePet() {
    if (!this.petForm.name.trim() || !this.petForm.speciesCode) return;
    this.isSavingPet.set(true);
    this.petService.createPet(this.roomId(), this.petForm).subscribe({
      next: (pet) => {
        this.petService.pets.update((list) => [...list, pet]);
        this.isSavingPet.set(false);
        this.isAddPetOpen.set(false);
        this.petForm = { speciesCode: '', name: '', breed: '', birthDate: '' };
      },
      error: (err) => {
        console.error('Error al crear mascota', err);
        this.isSavingPet.set(false);
      },
    });
  }

  goToPet(petId: string) {
    this.router.navigate(['/rooms', this.roomId(), 'pets', petId]);
  }
}
