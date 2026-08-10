export interface LkpImportantDateType {
  code: string;
  name: string;
}

export interface MediaItemPayload {
  r2Key: string;
  mediaTypeCode: string;
  mimeType: string;
  fileSizeBytes: number;
  takenAt: string | null;
  latitude: number | null;
  longitude: number | null;
  caption: string | null;
}

export interface CreateImportantDatePayload {
  typeCode: string;
  title: string;
  eventDate: string;
  isRecurring: boolean;
  notifyDaysBefore: number;
  media: MediaItemPayload[];
}

export interface ImportantDateMedia {
  id: string;
  thumbnailUrl: string;
  mediaTypeCode: string;
  takenAt: string | null;
}

export interface ImportantDate {
  id: string;
  typeCode: string;
  typeName: string;
  title: string;
  eventDate: string; // YYYY-MM-DD
  isRecurring: boolean;
  thumbnailUrl?: string | null; // para la foto en el listado (compatibilidad hacia atrás)
  photos: ImportantDateMedia[];
}
