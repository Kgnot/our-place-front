import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { ProfileMenuComponent } from '../../../pages/rooms/component/profile-menu/profile-menu.component';
import { NotificationMenuComponent } from '../notification-menu/notification-menu.component';

@Component({
  selector: 'app-room-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    ProfileMenuComponent,
    NotificationMenuComponent,
  ],
  templateUrl: './room-header.component.html',
  styleUrl: './room-header.component.css',
})
export class RoomHeaderComponent {
  private route = inject(ActivatedRoute);

  get roomId() {
    return this.route.snapshot.paramMap.get('roomId') || '';
  }
}
