
export enum AppView {
  HOME = 'home',
  CALCULATORS = 'calculators',
  ACADEMY = 'academy',
  TUTOR = 'tutor',
  SETTINGS = 'settings'
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export type ActivityType = 'lesson' | 'lab' | 'case';

export interface Lesson {
  id: string;
  title: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  content: string;
  quiz: QuizQuestion;
  type: ActivityType;
  // Specific for Lab/Case
  labData?: {
    scenario: string;
    readings: { label: string; value: string }[];
    targetValue?: string;
  };
}

export interface Module {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  lessons: Lesson[];
}

export interface CalculationResult {
  label: string;
  value: string;
  unit: string;
  color: string;
  details?: string;
}
