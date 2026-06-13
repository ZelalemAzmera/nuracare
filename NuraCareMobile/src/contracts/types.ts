export interface User {
  id: string;
  name?: string;
  age?: number;
  conditions?: string[];
  medications?: string[];
  fastingMode?: string;
  location?: {
    country?: string;
    code?: string;
    city?: string;
  };
  records?: CheckIn[];
}

export interface CheckIn {
  id: string;
  date: string;
  mood: number;
  energy: number;
  sleep: number;
  stress: number;
  tension: string;
  urgency: 'low' | 'mid' | 'high';
  tags: string[];
}

export interface WellnessScore {
  score: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface OuraData {
  readinessScore: number;
  sleepScore: number;
  activityScore: number;
  lastSync: string;
}
