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
  { id: 'm1', name: 'M1', price: 100, maxParticipants: 1000 },
  { id: 'm2', name: 'M2', price: 200, maxParticipants: 800 },
  { id: 'm3', name: 'M3', price: 500, maxParticipants: 600 },
  { id: 'm4', name: 'M4', price: 1000, maxParticipants: 400 },
  { id: 'm5', name: 'M5', price: 2000, maxParticipants: 300 },
  { id: 'm6', name: 'M6', price: 5000, maxParticipants: 300 },
];