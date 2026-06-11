/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Habit, HabitLog } from '../types';
import { calculateStreaks, getLocalDateString } from '../utils/dateUtils';
import { Flame, Trophy, Percent, TrendingUp } from 'lucide-react';

interface HabitStatsProps {
  habits: Habit[];
  logs: HabitLog[];
}

export default function HabitStats({ habits, logs }: HabitStatsProps) {
  const activeHabits = habits.filter((h) => !h.archived);
  
  // Calculate general stats
  const totalActive = activeHabits.length;
  
  // Find maximum current streak and longest streak across all habits
  let maxCurrentStreak = 0;
  let maxLongestStreak = 0;
  let averageCompletionSum = 0;

  activeHabits.forEach((habit) => {
    const { currentStreak, longestStreak, completionRate } = calculateStreaks(habit, logs);
    if (currentStreak > maxCurrentStreak) maxCurrentStreak = currentStreak;
    if (longestStreak > maxLongestStreak) maxLongestStreak = longestStreak;
    averageCompletionSum += completionRate;
  });

  const avgCompletionRate = totalActive > 0 ? Math.round(averageCompletionSum / totalActive) : 0;

  // Let's generate a 28-day grid for the mini heatmap
  // Past 28 days, starting from 27 days ago to today
  const last28Dates: string[] = [];
  const today = new Date();
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    last28Dates.push(getLocalDateString(d));
  }

  const getHeatmapDayIntensity = (dateStr: string) => {
    // Habits active on that day
    const activeOnDay = habits.filter((h) => {
      const isCreated = new Date(h.createdAt || 0) <= new Date(dateStr + 'T23:59:59');
      return isCreated && !h.archived;
    });

    if (activeOnDay.length === 0) return 'bg-zinc-50 border-zinc-100';

    const completedOnDay = activeOnDay.filter((h) => {
      const log = logs.find((l) => l.habitId === h.id && l.date === dateStr);
      return log && log.value >= h.target;
    }).length;

    const ratio = completedOnDay / activeOnDay.length;
    if (ratio === 0) return 'bg-zinc-100 border-zinc-200/60';
    if (ratio <= 0.35) return 'bg-zinc-200 border-zinc-300';
    if (ratio <= 0.65) return 'bg-zinc-400 border-zinc-550';
    if (ratio <= 0.9) return 'bg-zinc-700 border-zinc-800';
    return 'bg-zinc-950 border-zinc-950';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" id="habit-stats-dashboard">
      
      {/* Dynamic Key Stats Panel */}
      <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl p-5 grid grid-cols-2 sm:grid-cols-3 gap-4 shadow-sm">
        
        {/* Metric 1 */}
        <div className="flex items-center gap-3.5 p-3 rounded-lg bg-zinc-50 border border-zinc-200/80 hover:border-zinc-300 transition" id="stat-max-streak">
          <div className="p-2 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20" id="stat-icon-flame">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase block">Active Streak</span>
            <span className="text-xl font-bold text-zinc-900 tracking-tight block">
              {maxCurrentStreak} {maxCurrentStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="flex items-center gap-3.5 p-3 rounded-lg bg-zinc-50 border border-zinc-200/80 hover:border-zinc-300 transition" id="stat-all-time">
          <div className="p-2 rounded bg-violet-500/10 text-violet-600 border border-violet-500/20">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase block">Best Streak</span>
            <span className="text-xl font-bold text-zinc-900 tracking-tight block">
              {maxLongestStreak} {maxLongestStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="col-span-2 sm:col-span-1 flex items-center gap-3.5 p-3 rounded-lg bg-zinc-50 border border-zinc-200/80 hover:border-zinc-300 transition" id="stat-efficiency">
          <div className="p-2 rounded bg-zinc-900/10 text-zinc-900 border border-zinc-200">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase block">Consistency</span>
            <span className="text-xl font-bold text-zinc-900 tracking-tight block">
              {avgCompletionRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Mini Heatmap Visualization */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 flex flex-col justify-between shadow-sm" id="heatmap-panel">
        <div className="flex justify-between items-center mb-2.5">
          <h3 className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase font-mono flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            Consistency Matrix
          </h3>
          <span className="text-[9px] font-mono text-zinc-400">Past 4 weeks</span>
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-7 gap-1 mt-1.5 max-w-[210px] mx-auto lg:mx-0" id="heatmap-grid">
          {last28Dates.map((dateStr, idx) => {
            const intensityClass = getHeatmapDayIntensity(dateStr);
            const dateDisplay = new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return (
              <div
                key={dateStr}
                className={`w-5 h-5 rounded-sm border ${intensityClass} transition-colors duration-300 relative group`}
                id={`heatmap-cell-${idx}`}
              >
                {/* Micro tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-0.5 pointer-events-none opacity-0 group-hover:opacity-100 transition duration-150 z-20">
                  <div className="bg-zinc-950 text-[9px] text-zinc-100 px-1.5 py-0.5 rounded border border-zinc-800 whitespace-nowrap shadow-xl">
                    {dateDisplay}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-1.5 text-[9px] text-zinc-400 font-mono mt-3" id="heatmap-legend">
          <span>Less</span>
          <div className="w-2 h-2 bg-zinc-50 border border-zinc-100 rounded-sm" />
          <div className="w-2 h-2 bg-zinc-100 border border-zinc-200/60 rounded-sm" />
          <div className="w-2 h-2 bg-zinc-200 border border-zinc-300 rounded-sm" />
          <div className="w-2 h-2 bg-zinc-400 border border-zinc-550 rounded-sm" />
          <div className="w-2 h-2 bg-zinc-700 border border-zinc-850 rounded-sm" />
          <div className="w-2 h-2 bg-zinc-950 border border-zinc-950 rounded-sm" />
          <span>More</span>
        </div>
      </div>

    </div>
  );
}
