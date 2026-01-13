
export interface User {
  id: string;
  email: string;
  password?: string;
  role: 'admin' | 'user';
  subscription: 'free' | 'pro' | 'agency';
  createdAt: string;
}

export interface CourseProject {
  id: string;
  userId: string;
  topic: string;
  content: string;
  timestamp: number;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface Stats {
  totalGenerations: number;
  totalRevenue: number;
  activeUsers: number;
  conversions: number;
}
