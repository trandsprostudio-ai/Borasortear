export type RoomStatus = 'open' | 'closed' | 'processing' | 'finished';

export interface Module {
  id: string;
  name: string;
  price: number;
  maxParticipants: number;
}

export interface Room {
  id: string;
  moduleId: string;
  status: RoomStatus;
  currentParticipants: number;
  maxParticipants: number;
  expiresAt: string;
  createdAt: string;
}

export const MODULES: Module[] = [
  { id: 'm1', name: 'M100', price: 100, maxParticipants: 50 },
  { id: 'm2', name: 'M200', price: 200, maxParticipants: 20 },
  { id: 'm3', name: 'M500', price: 500, maxParticipants: 20 },
  { id: 'm4', name: 'M1000', price: 1000, maxParticipants: 10 },
  { id: 'm5', name: 'M2000', price: 2000, maxParticipants: 10 },
  { id: 'm6', name: 'M5000', price: 5000, maxParticipants: 5 },
];