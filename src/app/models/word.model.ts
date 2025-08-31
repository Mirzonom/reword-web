export interface Word {
  id: string;
  original: string;
  translation: string;
  categoryId: string;
  level: number;
  lastReviewed: number;
  createdAt: number;
}

export interface Mode {
  id: 'new' | 'review' | 'mixed';
  label: string;
}
