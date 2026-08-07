import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconButtonComponent } from '../icon-button/icon-button.component';
import { DropdownComponent } from '../dropdown/dropdown.component';

@Component({
  selector: 'app-notification-menu',
  standalone: true,
  imports: [CommonModule, IconButtonComponent, DropdownComponent],
  templateUrl: './notification-menu.component.html',
  styleUrl: './notification-menu.component.css',
})
export class NotificationMenuComponent {
  // Aqui TODO: websocket
  notifications = signal([
    { id: 1, text: 'Alex añadió una nueva foto al Feed.', time: 'Hace 2h', icon: 'add_a_photo' },
    { id: 2, text: 'Sam comentó en tu nota.', time: 'Hace 1d', icon: 'chat_bubble' },
  ]);
}
