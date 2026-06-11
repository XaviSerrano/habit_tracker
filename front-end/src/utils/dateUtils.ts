/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Habit, HabitLog } from '../types';

/**
 * Returns YYYY-MM-DD from a local Date object.
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns formatted label for display (e.g. "Jun 06" or "Today")
 */
export function getFormattedDisplayDate(dateStr: string): string {
  const today = getLocalDateString(new Date());
  if (dateStr === today) return 'Today';
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateStr === getLocalDateString(yesterday)) return 'Yesterday';

  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  
  // Parse month name
  const dateObj = new Date(dateStr + 'T12:00:00');
  const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });
  const dayName = dateObj.toLocaleDateString('en-US', { day: 'numeric' });
  return `${monthName} ${dayName}`;
}

/**
 * Returns the Monday-to-Sunday Date objects for the week containing pivotDate.
 */
export function getWeekDates(pivotDate: Date = new Date()): Date[] {
  const dates: Date[] = [];
  const day = pivotDate.getDay();
  // 0 = Sunday, 1 = Monday, 2 = Tuesday, etc.
  // Calculate difference to Monday
  const diff = pivotDate.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(pivotDate.getTime());
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday.getTime());
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }
  return dates;
}

/**
 * Calculates current streak, longest streak and completion rate for a habit from logs.
 */
export function calculateStreaks(habit: Habit, logs: HabitLog[]): {
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
} {
  // Filter for logs of this habit that meet or exceed target completion
  const completedDates = new Set(
    logs
      .filter((l) => l.habitId === habit.id && l.value >= habit.target)
      .map((l) => l.date)
  );

  if (completedDates.size === 0) {
    return { currentStreak: 0, longestStreak: 0, completionRate: 0 };
  }

  // Convert Set to sorted array of date strings in ascending order
  const sortedDates = Array.from(completedDates).sort();
  
  // Calculate longest streak
  let longest = 0;
  let currentRun = 0;
  let prevDate: Date | null = null;

  for (const dateStr of sortedDates) {
    const currentDate = new Date(dateStr + 'T00:00:00');
    if (prevDate === null) {
      currentRun = 1;
    } else {
      const diffTime = currentDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentRun++;
      } else if (diffDays > 1) {
        currentRun = 1;
      }
    }
    if (currentRun > longest) {
      longest = currentRun;
    }
    prevDate = currentDate;
  }

  // Calculate current streak
  let current = 0;
  const todayStr = getLocalDateString(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  if (completedDates.has(todayStr)) {
    current = 1;
    const checkDate = new Date();
    while (true) {
      checkDate.setDate(checkDate.getDate() - 1);
      const checkStr = getLocalDateString(checkDate);
      if (completedDates.has(checkStr)) {
        current++;
      } else {
        break;
      }
    }
  } else if (completedDates.has(yesterdayStr)) {
    current = 1;
    const checkDate = new Date(yesterday.getTime());
    while (true) {
      checkDate.setDate(checkDate.getDate() - 1);
      const checkStr = getLocalDateString(checkDate);
      if (completedDates.has(checkStr)) {
        current++;
      } else {
        break;
      }
    }
  } else {
    current = 0;
  }

  // Base completion rate on the last 30 days
  const trackingWindow = 30;
  let completedCount = 0;
  for (let i = 0; i < trackingWindow; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (completedDates.has(getLocalDateString(d))) {
      completedCount++;
    }
  }
  const completionRate = Math.round((completedCount / trackingWindow) * 100);

  return {
    currentStreak: current,
    longestStreak: Math.max(longest, current),
    completionRate,
  };
}
