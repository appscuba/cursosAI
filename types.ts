
export interface CourseData {
  niche: string;
  marketAnalysis: string;
  avatar: string;
  promise: string;
  titles: string[];
  structure: Module[];
  scripts: string;
  salesCopy: string;
  bonuses: string[];
  launchStrategy: string;
  contentPlan: string[];
  pricing: string;
}

export interface Module {
  title: string;
  lessons: Lesson[];
}

export interface Lesson {
  title: string;
  objective: string;
  tasks: string;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
