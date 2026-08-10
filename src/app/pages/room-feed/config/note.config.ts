export enum NoteType {
  Appreciation = 'appreciation',
  Encouragement = 'encouragement',
  LoveNote = 'love_note',
  Memory = 'memory',
}

export interface NoteTypeConfig {
  code: NoteType;
  label: string;
  icon: string;
  tapeColor: 'pink' | 'green' | 'mustard' | 'terracotta';
  bgColor: string;
}

// Mapa temporal mientras implementas la BD no relacional
export const NOTE_TYPES: Record<NoteType, NoteTypeConfig> = {
  [NoteType.Appreciation]: {
    code: NoteType.Appreciation,
    label: 'Apreciación',
    icon: 'volunteer_activism',
    tapeColor: 'mustard',
    bgColor: '#fff8e1',
  },
  [NoteType.Encouragement]: {
    code: NoteType.Encouragement,
    label: 'Ánimo',
    icon: 'rocket_launch',
    tapeColor: 'green',
    bgColor: '#e8f5e9',
  },
  [NoteType.LoveNote]: {
    code: NoteType.LoveNote,
    label: 'Nota de Amor',
    icon: 'favorite',
    tapeColor: 'pink',
    bgColor: '#ffe4e1',
  },
  [NoteType.Memory]: {
    code: NoteType.Memory,
    label: 'Recuerdo',
    icon: 'history',
    tapeColor: 'terracotta',
    bgColor: '#f5f1e7',
  },
};
