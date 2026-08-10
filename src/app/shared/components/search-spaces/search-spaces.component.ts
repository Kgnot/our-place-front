import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UiService } from '../../../services/ui.service';
import { RoomService } from '../../../services/room.service';

@Component({
  selector: 'app-search-spaces',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-spaces.component.html',
  styleUrl: './search-spaces.component.css'
})
export class SearchSpacesComponent {
  ui = inject(UiService);
  private roomService = inject(RoomService);
  private router = inject(Router);

  rooms = this.roomService.rooms;
  searchTerm = signal('');

  onSearch(query: string) {
    this.searchTerm.set(query);
    if (query.trim() === '') {
      this.roomService.loadMyRooms();
    } else {
      this.roomService.searchRooms(query);
    }
  }

  openRoom(roomId: string) {
    this.ui.closeSearch();
    this.router.navigate(['/rooms', roomId]);
  }

  close() {
    this.ui.closeSearch();
  }
}
