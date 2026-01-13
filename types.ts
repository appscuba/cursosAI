
export interface User {
  id: string;
  email: string;
  password?: string;
  role: 'admin' | 'user';
  subscription: 'free' | 'pro' | 'agency';
  createdAt: string;
  status: 'active' | 'pending' | 'blocked';
}

export interface SiteConfig {
  heroTitle: string;
  heroSubtitle: string;
  accentColor: string;
  features: { icon: string; title: string; desc: string }[];
  pricing: {
    free: { name: string; price: string; features: string[] };
    pro: { name: string; price: string; features: string[] };
    agency: { name: string; price: string; features: string[] };
  };
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
