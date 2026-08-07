export interface ImportantDate {
  id: string;
  typeCode: string;
  typeName: string;
  title: string;
  eventDate: string; // YYYY-MM-DD
  isRecurring: boolean;
}

export interface CreateImportantDatePayload {
  typeCode: string;
  title: string;
  eventDate: string;
  isRecurring: boolean;
  notifyDaysBefore: number;
}
