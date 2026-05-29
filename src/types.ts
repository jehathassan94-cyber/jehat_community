export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  email: string;
  role: string; // 'doctor', 'secretary', 'market_manager', 'cashier', 'accountant', etc.
  doctorId?: string;
  doctorName?: string;
}

export interface Patient {
  id: string;
  name: string;
  phone?: string;
  datetime?: string;
  age?: string;
  height?: string;
  weight?: string;
  status: 'waiting' | 'pending_approval' | 'admitted' | 'completed';
  secretaryId: string;
  doctorId: string;
  amountPaid?: number;
  isReview?: boolean;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  medicines: string;
  xrays: string;
  tests: string;
  other?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  action: string;
  emailAffected: string;
  details: string;
}
