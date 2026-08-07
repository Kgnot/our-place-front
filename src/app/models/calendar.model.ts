export interface PreviewPhoto {
  id: string;
  thumbnailUrl: string;
  mediaTypeCode: string;
  takenAt: string | null;
}

export interface CalendarDay {
  date: string;
  hasEntry: boolean;
  moodEmoji: string | null;
  hasPhotos: boolean;
  photoCount: number;
  previewPhotos: PreviewPhoto[];
}

export interface CalendarMonth {
  year: number;
  month: number;
  days: CalendarDay[];
}

export interface DayEntryDetail {
  date: string;
  content: string;
  moodEmoji: string;
  mediaIds: PreviewPhoto[]; // Actualizamos esto también
}
