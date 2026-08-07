export interface MediaDetail {
  id: string;
  url: string;
}

export interface CalendarDay {
  date: string; // ISO string (YYYY-MM-DD)
  hasEntry: boolean;
  moodEmoji: string | null;
  medias: MediaDetail[];
  mediaCount: number;
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
  mediaIds: MediaDetail[];
}
