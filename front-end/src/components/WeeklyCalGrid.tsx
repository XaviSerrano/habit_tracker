/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { getLocalDateString } from '../utils/dateUtils';
import { Habit, HabitLog } from '../types';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

interface WeeklyCalGridProps {
  currentWeek: Date[];
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onResetWeek: () => void;
  habits: Habit[];
  logs: HabitLog[];
}

export default function WeeklyCalGrid({
  currentWeek,
  selectedDate,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
  onResetWeek,
  habits,
  logs,
}: WeeklyCalGridProps) {
  // Helper to calculate completions for any date
  const getDayProgress = (dateStr: string) => {
    const dateObj = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = dateObj.getDay();

    // Active habits on this day
    const activeHabits = habits.filter(h => {
      // Habit must be created on or before this date, and not archived
      const isCreated = new Date(h.createdAt || 0) <= new Date(dateStr + 'T23:59:59');
      if (!isCreated || h.archived) return false;

      // Check frequency alignment
      if (h.frequency === 'daily') return true;
      return h.specificDays?.includes(dayOfWeek) ?? false;
    });

    if (activeHabits.length === 0) return { completed: 0, total: 0, percent: 0 };

    // Fully completed habits on this day
    const completedCount = activeHabits.filter(h => {
      const log = logs.find(l => l.habitId === h.id && l.date === dateStr);
      return log && log.value >= h.target;
    }).length;

    return {
      completed: completedCount,
      total: activeHabits.length,
      percent: Math.round((completedCount / activeHabits.length) * 100),
    };
  };

  const todayStr = getLocalDateString(new Date());

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 shadow-sm" id="weekly-grid-container">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <div>
          <h2 className="text-xs font-bold tracking-wider text-zinc-550 uppercase font-mono flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-zinc-400" />
            Performance Timeline
          </h2>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Select an active parameter day to record, review and analyze logs.
          </p>
        </div>
        
        {/* Navigation Controls */}
        <div className="flex items-center gap-1.5 self-stretch sm:self-auto justify-end">
          <button
            onClick={onPrevWeek}
            className="p-1 px-2.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 rounded-md border border-zinc-200/80 transition text-xs flex items-center justify-center cursor-pointer font-medium"
            id="btn-prev-week"
            title="Previous Week"
          >
            <ChevronLeft className="w-3.5 h-3.5 mr-0.5 text-zinc-500" /> Prev
          </button>
          
          <button
            onClick={onResetWeek}
            className="p-1 px-3 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 rounded-md border border-zinc-200/80 transition text-xs font-semibold cursor-pointer"
            id="btn-current-week"
          >
            Today
          </button>

          <button
            onClick={onNextWeek}
            className="p-1 px-2.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 rounded-md border border-zinc-200/80 transition text-xs flex items-center justify-center cursor-pointer font-medium"
            id="btn-next-week"
            title="Next Week"
          >
            Next <ChevronRight className="w-3.5 h-3.5 ml-0.5 text-zinc-500" />
          </button>
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-2 sm:gap-3" id="week-days-grid">
        {currentWeek.map((dateObj) => {
          const formattedStr = getLocalDateString(dateObj);
          const { completed, total, percent } = getDayProgress(formattedStr);
          const isSelected = formattedStr === selectedDate;
          const isToday = formattedStr === todayStr;
          
          // Labels
          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          const dayNum = dateObj.getDate();

          return (
            <button
              key={formattedStr}
              onClick={() => onSelectDate(formattedStr)}
              className={`relative flex flex-col items-center p-2.5 rounded-lg border text-center transition cursor-pointer select-none group 
                ${isSelected 
                  ? 'bg-zinc-900 border-zinc-950 text-white shadow-sm' 
                  : isToday
                    ? 'bg-zinc-100 border-zinc-400 text-zinc-900 hover:bg-zinc-200/60' 
                    : 'bg-zinc-50/50 border-zinc-100 hover:border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/40'
                }`}
              id={`day-${formattedStr}`}
            >
              {/* Day Name */}
              <span className={`text-[10px] sm:text-xs tracking-wider uppercase font-mono font-bold block ${isSelected ? 'text-zinc-400' : 'text-zinc-400'}`}>
                {dayName}
              </span>

              {/* Day Number */}
              <span className={`text-base sm:text-lg font-bold mt-1 block tracking-tight ${isSelected ? 'text-white' : 'text-zinc-850'} ${isToday ? 'underline decoration-black decoration-2 underline-offset-4' : ''}`}>
                {dayNum}
              </span>

              {/* Progress Indicator (Bottom Dots or Minimal Bar) */}
              <div className="w-full mt-2.5">
                {total > 0 ? (
                  <div className="flex flex-col items-center">
                    {/* Ring or Mini Gauge */}
                    <div className={`w-full h-1 rounded-full overflow-hidden ${isSelected ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                      <div 
                        className={`h-full transition-all duration-300 rounded-full ${
                          isSelected
                            ? 'bg-white'
                            : percent === 0 
                              ? 'bg-zinc-300' 
                              : percent < 50 
                                ? 'bg-zinc-400' 
                                : percent < 100 
                                  ? 'bg-zinc-600' 
                                  : 'bg-zinc-900'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    {/* Text count */}
                    <span className={`text-[9.5px] font-mono mt-1 block font-bold ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                      {completed}/{total}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-1.5 h-1 bg-zinc-300 rounded-full" />
                    <span className={`text-[9.5px] font-mono mt-1 block ${isSelected ? 'text-zinc-400' : 'text-zinc-400'}`}>
                      —
                    </span>
                  </div>
                )}
              </div>

              {/* Little Today Indicator dot top right */}
              {isToday && !isSelected && (
                <div className="absolute top-1 right-1 w-1 h-1 bg-black rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
