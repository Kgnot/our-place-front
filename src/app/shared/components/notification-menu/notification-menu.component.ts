import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconButtonComponent } from '../icon-button/icon-button.component';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { NotificationService } from '../../../services/notification.service';
import { toNotificationView } from '../../../utils/notification-display.util';

@Component({
  selector: 'app-notification-menu',
  standalone: true,
  imports: [CommonModule, IconButtonComponent, DropdownComponent],
  templateUrl: './notification-menu.component.html',
  styleUrl: './notification-menu.component.css',
})
export class NotificationMenuComponent {
  private notificationService = inject(NotificationService);

  readonly unreadCount = this.notificationService.unreadCount;

  readonly notifications = computed(() =>
    this.notificationService.notifications().map((n) => toNotificationView(n)),
  );

  onNotificationClick(id: number, isRead: boolean): void {
    if (!isRead) {
      this.notificationService.markAsReadOptimistic([id]);
    }
  }
}
