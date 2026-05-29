export type EventCategory = 'CULTURE' | 'SPORT' | 'ANIMATION' | 'COMMERCE' | 'AUTRE';
export type EventStatus = 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';

export interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  category: EventCategory;
  location: string;
  externalUrl?: string;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FilterOptions {
  category?: EventCategory;
  startDate?: string;
  endDate?: string;
}
