import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { ProfileMenuComponent } from '../profile-menu/profile-menu.component';
import { NotificationMenuComponent } from '../notification-menu/notification-menu.component';
import { IconButtonComponent } from '../icon-button/icon-button.component';

@Component({
  selector: 'app-room-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    ProfileMenuComponent,
    NotificationMenuComponent,
    IconButtonComponent,
  ],
  templateUrl: './room-header.component.html',
  styleUrl: './room-header.component.css',
})
export class RoomHeaderComponent {
  private route = inject(ActivatedRoute);

  get roomId() {
    return this.route.snapshot.paramMap.get('roomId') || '';
  }

  addNewElement() {
    console.log('Añadir nuevo elemento');
  }
}
