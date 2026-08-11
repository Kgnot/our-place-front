export interface AppNotification {
  id: number;
  roomId: string;
  actorUserId: string;
  typeCode: string;
  entityType: string;
  entityId: string;
  isRead: boolean;
  createdAt: string;
}

export interface LkpNotificationType {
  code: string;
  name: string;
}

// Respuesta de Spring Data Page<T> — así llega /notifications realmente
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // página actual (0-based)
  size: number;
  first: boolean;
  last: boolean;
}

// Vista ya "traducida" para pintar en el dropdown
export interface NotificationView {
  id: number;
  icon: string;
  text: string;
  time: string;
  isRead: boolean;
}
