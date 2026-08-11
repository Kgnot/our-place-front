import { inject, Injectable, signal, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { environments } from '../../environments/environments';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { AuthService } from './auth.service';
import { AppNotification, PageResponse } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  private apiUrl = `${environments.apiUrl}/notification`;

  readonly notifications = signal<AppNotification[]>([]);
  readonly unreadCount = signal<number>(0);

  private stompClient?: Client;

  constructor() {
    if (isPlatformBrowser(this.platformId) && this.auth.isLoggedIn()) {
      this.connectWebSocket();
      this.loadInitialData();
    }
  }

  private connectWebSocket(): void {
    const token = localStorage.getItem('op_token');
    if (!token) return;

    const wsBase = environments.apiUrl.replace('/api/v1', '');

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(`${wsBase}/ws?token=${token}`),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.stompClient.onConnect = () => {
      this.stompClient?.subscribe('/user/queue/notifications', (message: IMessage) => {
        const newNotification: AppNotification = JSON.parse(message.body);
        this.handleNewNotification(newNotification);
      });
    };

    this.stompClient.onStompError = (frame) => {
      console.error('Error en STOMP', frame.headers?.['message'], frame.body);
    };

    this.stompClient.activate();
  }

  private handleNewNotification(notification: AppNotification): void {
    this.notifications.update((prev) => [notification, ...prev]);
    if (!notification.isRead) {
      this.unreadCount.update((count) => count + 1);
    }
  }

  // --- Llamadas REST ---

  loadInitialData(): void {
    this.getUnreadCount().subscribe((res) => this.unreadCount.set(res.unreadCount));
    this.getNotifications().subscribe((page) => this.notifications.set(page.content));
  }

  getNotifications(page = 0, size = 20) {
    return this.http.get<PageResponse<AppNotification>>(
      `${this.apiUrl}/notifications?page=${page}&size=${size}&sort=createdAt,desc`,
    );
  }

  getUnreadCount() {
    return this.http.get<{ unreadCount: number }>(`${this.apiUrl}/notifications/unread-count`);
  }

  markAsRead(notificationIds?: number[]) {
    return this.http.patch<{ updatedCount: number }>(
      `${this.apiUrl}/notifications/read`,
      notificationIds ?? [],
    );
  }

  // Marca localmente sin esperar respuesta del server (optimista) + llama al backend
  markAsReadOptimistic(notificationIds: number[]): void {
    this.notifications.update((list) =>
      list.map((n) => (notificationIds.includes(n.id) ? { ...n, isRead: true } : n)),
    );
    this.unreadCount.update((count) => Math.max(0, count - notificationIds.length));
    this.markAsRead(notificationIds).subscribe({
      error: () => this.loadInitialData(), // si falla, resincronizamos con el server
    });
  }

  disconnect(): void {
    if (this.stompClient?.active) {
      this.stompClient.deactivate();
    }
  }
}
