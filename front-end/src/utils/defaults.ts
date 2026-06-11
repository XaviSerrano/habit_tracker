/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Habit, HabitLog } from '../types';
import { getLocalDateString } from './dateUtils';

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'habit-hydration',
    name: 'Hydration Target',
    description: 'Consume sufficient clean water (approx. 2.5 liters) to maintain high cognitive & cellular health.',
    category: 'health',
    frequency: 'daily',
    specificDays: [0, 1, 2, 3, 4, 5, 6],
    target: 8,
    targetUnit: 'glasses',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    archived: false,
    color: '#0ea5e9' // sky-500 (Clean Blue)
  },
  {
    id: 'habit-focus',
    name: 'Deep Focus Session',
    description: '45 minutes of elite, high-intensity work with zero desktop notifications or distraction loops.',
    category: 'focus',
    frequency: 'specific_days',
    specificDays: [1, 2, 3, 4, 5], // Monday to Friday
    target: 45,
    targetUnit: 'mins',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    archived: false,
    color: '#0d9488' // teal-600 (Focus Green)
  },
  {
    id: 'habit-mind',
    name: 'Mindful Evening Journal',
    description: 'Record 3 core daily victories and analyze one high-leverage area for professional growth.',
    category: 'mind',
    frequency: 'daily',
    specificDays: [0, 1, 2, 3, 4, 5, 6],
    target: 1,
    targetUnit: 'reflection',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    archived: false,
    color: '#8b5cf6' // violet-500 (Mind Indigo)
  },
  {
    id: 'habit-strength',
    name: 'Cardio & Strength Training',
    description: 'Aerobic threshold workouts, core stability routines, or compound lift sessions.',
    category: 'body',
    frequency: 'specific_days',
    specificDays: [1, 3, 5], // Monday, Wednesday, Friday
    target: 30,
    targetUnit: 'mins',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    archived: false,
    color: '#f97316' // orange-500 (Energy Orange)
  },
  {
    id: 'habit-read',
    name: 'High-Value Material Text',
    description: 'Consume 15 pages of philosophy, cognitive science, or technical architecture documentation.',
    category: 'routine',
    frequency: 'daily',
    specificDays: [0, 1, 2, 3, 4, 5, 6],
    target: 15,
    targetUnit: 'pages',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    archived: false,
    color: '#ec4899' // rose-500 (Routine Pink)
  }
];

export function getInitialLogs(): HabitLog[] {
  const logs: HabitLog[] = [];
  const today = new Date();
  
  // Backfill 14 days of realistic logs to demonstrate streaks and history curves
  for (let i = 18; i >= 0; i--) {
    const checkDate = new Date();
    checkDate.setDate(today.getDate() - i);
    const dateStr = getLocalDateString(checkDate);
    const dayOfWeek = checkDate.getDay();

    const checkDateTime = checkDate.getTime();

    // 1. Hydration (Daily) - ~85% success rate
    if (Math.random() < 0.85) {
      logs.push({
        id: `preload-hyd-${i}`,
        habitId: 'habit-hydration',
        date: dateStr,
        value: Math.floor(Math.random() * 3) + 7, // 7 to 9 glasses
        note: i === 0 ? 'Felt crisp and fully focused during executive sessions.' : undefined,
        timestamp: new Date(checkDateTime + 18 * 3600 * 1000).toISOString()
      });
    }

    // 2. Deep Focus Session (Mon-Fri) - ~80% success
    if ([1, 2, 3, 4, 5].includes(dayOfWeek)) {
      if (Math.random() < 0.80) {
        logs.push({
          id: `preload-foc-${i}`,
          habitId: 'habit-focus',
          date: dateStr,
          value: 45,
          note: i % 4 === 0 ? 'Structured deeply. Handled hard tasks during first hour.' : undefined,
          timestamp: new Date(checkDateTime + 14 * 3600 * 1000).toISOString()
        });
      }
    }

    // 3. Mindful Evening Journal (Daily) - ~90% success
    if (Math.random() < 0.90) {
      logs.push({
        id: `preload-mnd-${i}`,
        habitId: 'habit-mind',
        date: dateStr,
        value: 1,
        note: i % 3 === 0 ? 'Reflected on interpersonal communications. Realized room for faster listening loops.' : 'Solid day. Clean execution of morning schedule.',
        timestamp: new Date(checkDateTime + 21 * 3600 * 1000).toISOString()
      });
    }

    // 4. Strength Conditioning (Mon, Wed, Fri) - ~75% success
    if ([1, 3, 5].includes(dayOfWeek)) {
      if (Math.random() < 0.75) {
        logs.push({
          id: `preload-str-${i}`,
          habitId: 'habit-strength',
          date: dateStr,
          value: 30,
          timestamp: new Date(checkDateTime + 8 * 3600 * 1000).toISOString()
        });
      }
    }

    // 5. High-Value Material Text (Daily) - ~80% success
    if (Math.random() < 0.80) {
      logs.push({
        id: `preload-red-${i}`,
        habitId: 'habit-read',
        date: dateStr,
        value: Math.floor(Math.random() * 8) + 15, // 15 to 22 pages
        note: i === 1 ? 'Read Marcus Aurelius. Beautiful passage on accepting self-discipline with poise.' : undefined,
        timestamp: new Date(checkDateTime + 22 * 180 * 1000).toISOString()
      });
    }
  }

  return logs;
}
