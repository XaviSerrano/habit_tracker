export type HabitCategory = 'health' | 'mind' | 'focus' | 'body' | 'routine';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: HabitCategory;
  frequency: 'daily' | 'specific_days';
  specificDays: number[]; // 0 = Sunday, 1 = Monday, 2 = Tuesday, etc.
  target: number; // e.g. 1 (for normal checkoff) or custom values like 30
  targetUnit: string; // e.g. 'times', 'mins', 'glasses', 'km'
  createdAt: string; // ISO date string
  archived: boolean;
  color: string; // Hex color code or Tailwind class
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // Format: YYYY-MM-DD
  value: number; // The amount completed on this day
  note?: string; // Optional reflection note
  timestamp: string; // ISO string
}

export interface WeeklySummary {
  [date: string]: {
    completedCount: number;
    totalCount: number;
  };
}
