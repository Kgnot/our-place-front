export interface PreviewPhoto {
  id: string;
  thumbnailUrl: string;
  mediaTypeCode: string;
  takenAt: string | null;
}

export interface CalendarImportantDate {
  id: string;
  typeCode: string;
  typeName: string;
  title: string;
  isRecurring: boolean;
}

export interface CalendarDay {
  date: string;
  hasEntry: boolean;
  moodEmoji: string | null;
  hasPhotos: boolean;
  photoCount: number;
  previewPhotos: PreviewPhoto[];
  importantDates: CalendarImportantDate[];
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
  mediaIds: PreviewPhoto[];
  importantDates: CalendarImportantDate[];
}
