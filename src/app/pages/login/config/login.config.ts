import { TapeColor } from '../../../shared/components/photo-card/photo-card.component';

export interface MemoryPhoto {
  url: string;
  alt: string;
  tape: TapeColor;
  rotate: number;
}

export const MEMORY_PHOTOS: Record<'login' | 'register', MemoryPhoto[]> = {
  login: [
    { url: 'login/memory-1.png', alt: 'Recuerdo compartido 1', tape: 'terracotta', rotate: -6 },
    { url: 'login/memory-2.png', alt: 'Recuerdo compartido 2', tape: 'sage', rotate: 4 },
    { url: 'login/memory-3.png', alt: 'Recuerdo compartido 3', tape: 'mustard', rotate: -3 },
  ],
  register: [
    { url: 'login/memory-4.png', alt: 'Recuerdo compartido 4', tape: 'sage', rotate: -4 },
    { url: 'login/memory-5.png', alt: 'Recuerdo compartido 5', tape: 'mustard', rotate: 5 },
    { url: 'login/memory-6.png', alt: 'Recuerdo compartido 6', tape: 'terracotta', rotate: -2 },
    { url: 'login/memory-7.png', alt: 'Recuerdo compartido 7', tape: 'sage', rotate: 3 },
  ],
};
