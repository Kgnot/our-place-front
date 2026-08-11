import { AppNotification, NotificationView } from '../models/notification.model';

// Mapeo icon + template de texto por cada typeCode del catálogo lkp_notification_type
const TYPE_CONFIG: Record<string, { icon: string; text: string }> = {
  media_uploaded: { icon: 'add_a_photo', text: 'añadió una nueva foto al Feed.' },
  media_comment_added: { icon: 'chat_bubble', text: 'comentó en una foto.' },
  media_reaction_added: { icon: 'favorite', text: 'reaccionó a una foto.' },
  day_entry_added: { icon: 'edit_note', text: 'escribió una nueva entrada.' },
  place_added: { icon: 'location_on', text: 'añadió un lugar nuevo.' },
  member_joined: { icon: 'person_add', text: 'se unió a la room.' },
};

const DEFAULT_CONFIG = { icon: 'notifications', text: 'tiene una actualización.' };

export function toNotificationView(notif: AppNotification, actorName?: string): NotificationView {
  const config = TYPE_CONFIG[notif.typeCode] ?? DEFAULT_CONFIG;
  const prefix = actorName ? `${actorName} ` : 'Alguien ';
  return {
    id: notif.id,
    icon: config.icon,
    text: prefix + config.text,
    time: formatRelativeTime(notif.createdAt),
    isRead: notif.isRead,
  };
}

export function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'Ahora';
  if (diffMin < 60) return `Hace ${diffMin}min`;

  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Hace ${diffH}h`;

  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `Hace ${diffD}d`;

  return new Date(isoDate).toLocaleDateString();
}
