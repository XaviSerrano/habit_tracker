/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Habit, HabitLog } from '../types';
import { calculateStreaks, getFormattedDisplayDate } from '../utils/dateUtils';
import { playCheckSound, playMilestoneSound } from '../utils/audio';
import { 
  Check, 
  Plus, 
  Minus, 
  Clock, 
  Notebook, 
  Trash2, 
  Archive, 
  ArchiveRestore,
  Play, 
  Pause, 
  RotateCcw,
  Sparkles,
  Flame,
  Activity
} from 'lucide-react';

interface HabitListItemProps {
  habit: Habit;
  date: string; // The focused YYYY-MM-DD logging date
  log: HabitLog | undefined;
  onUpdateLog: (habitId: string, date: string, value: number, note?: string) => void;
  onDeleteHabit: (id: string) => void;
  onArchiveHabit: (id: string, archive: boolean) => void;
  allLogs: HabitLog[];
  key?: string | number;
}

export default function HabitListItem({
  habit,
  date,
  log,
  onUpdateLog,
  onDeleteHabit,
  onArchiveHabit,
  allLogs,
}: HabitListItemProps) {
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [noteText, setNoteText] = useState(log?.note || '');
  
  // Timer States
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(habit.target * 60); // convert mins to secs
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state if log changes
  useEffect(() => {
    setNoteText(log?.note || '');
  }, [log]);

  // Sync timer if target changes
  useEffect(() => {
    if (!timerRunning) {
      setTimeLeft(habit.target * 60);
    }
  }, [habit.target, timerRunning]);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Calculate streaks dynamically
  const { currentStreak, completionRate } = calculateStreaks(habit, allLogs);

  // Status computation
  const currentValue = log?.value || 0;
  const isCompleted = currentValue >= habit.target;

  // Handle simple toggle
  const handleToggleCheck = () => {
    if (isCompleted) {
      // Undo
      onUpdateLog(habit.id, date, 0, log?.note);
    } else {
      // Complete
      onUpdateLog(habit.id, date, habit.target, log?.note);
      playCheckSound();
      // If creating a 3, 5, 7, 10 streak, play the milestone celebration
      if (currentStreak + 1 === 3 || currentStreak + 1 === 5 || currentStreak + 1 === 10) {
        setTimeout(() => playMilestoneSound(), 400);
      }
    }
  };

  // Handle Increments
  const adjustProgress = (increment: number) => {
    const nextVal = Math.max(0, currentValue + increment);
    onUpdateLog(habit.id, date, nextVal, log?.note);
    
    // Play chime if we just reached or passed target
    if (nextVal >= habit.target && currentValue < habit.target) {
      playCheckSound();
    }
  };

  // Note Saver
  const handleSaveNote = () => {
    onUpdateLog(habit.id, date, currentValue, noteText.trim());
    setShowNoteEditor(false);
  };

  // Timer Control Functions
  const startTimer = () => {
    if (timerRunning) return;
    setTimerRunning(true);
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer finished!
          clearInterval(timerIntervalRef.current!);
          setTimerRunning(false);
          // Complete the habit
          onUpdateLog(habit.id, date, habit.target, log?.note);
          playCheckSound();
          playMilestoneSound();
          return habit.target * 60;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setTimerRunning(false);
  };

  const resetTimer = () => {
    pauseTimer();
    setTimeLeft(habit.target * 60);
  };

  const skipTimer = () => {
    pauseTimer();
    setTimeLeft(0);
    onUpdateLog(habit.id, date, habit.target, log?.note);
    playCheckSound();
  };

  // Timer formatting helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Verify if it is a time-based timed habit
  const isTimeBased = habit.targetUnit.toLowerCase().includes('min') || habit.targetUnit.toLowerCase().includes('sec');

  const categoryLabels: Record<string, string> = {
    health: 'Health',
    mind: 'Mindfulness',
    focus: 'Professional',
    body: 'Conditioning',
    routine: 'Routine',
  };

  return (
    <div 
      className={`bg-white border rounded-xl overflow-hidden p-4 sm:p-5 transition-all duration-300 relative group shadow-sm
        ${isCompleted 
          ? 'border-zinc-350 bg-zinc-50/70 shadow-inner' 
          : 'border-zinc-200 bg-white'
        }`}
      id={`habit-card-${habit.id}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Side Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {/* Category tag */}
            <span 
              className="text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono border"
              style={{ 
                color: habit.color, 
                borderColor: `${habit.color}25`, 
                backgroundColor: `${habit.color}08` 
              }}
              id={`cat-badge-${habit.id}`}
            >
              {categoryLabels[habit.category]}
            </span>

            {/* Streak Indicator */}
            {currentStreak > 0 && (
              <span className="text-[10px] text-amber-600 font-mono font-bold flex items-center gap-0.5" id={`streak-flame-${habit.id}`}>
                <Flame className="w-3.5 h-3.5 fill-amber-500/10" />
                {currentStreak}d Streak
              </span>
            )}

            {/* Completion rate badge */}
            {completionRate > 0 && (
              <span className="text-[9.5px] text-zinc-400 font-mono flex items-center gap-0.5">
                <Sparkles className="w-3 h-3" />
                {completionRate}% rate
              </span>
            )}
          </div>

          <h3 className="text-[15px] sm:text-[16px] font-bold text-zinc-850 tracking-tight leading-tight group-hover:text-black transition">
            {habit.name}
          </h3>

          {habit.description && (
            <p className="text-xs text-zinc-500 mt-1 mr-4 leading-relaxed max-w-2xl font-sans" id={`desc-${habit.id}`}>
              {habit.description}
            </p>
          )}

          {/* Connected journal notes list showing active log note */}
          {currentValue > 0 && log?.note && (
            <div className="mt-3.5 bg-zinc-50 border-l-2 border-zinc-400 p-2.5 rounded-r-md text-xs italic text-zinc-600 flex items-start gap-1.5 line-clamp-2 max-w-2xl">
              <Notebook className="w-3.5 h-3.5 mt-0.5 shrink-0 text-zinc-400" />
              <span>"{log.note}"</span>
            </div>
          )}
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto" id="habit-progress-deck">
          
          {/* Target adjustment block */}
          <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-lg p-1 shadow-sm" id="increment-box">
            {habit.target > 1 ? (
              <>
                <button
                  onClick={() => adjustProgress(-1)}
                  className="p-1 text-zinc-400 hover:text-black hover:bg-zinc-200/50 rounded transition cursor-pointer"
                  title="Decrement"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="px-3 text-center min-w-[70px]">
                  <span className="text-xs font-mono font-bold text-zinc-900 block">
                    {currentValue} <span className="text-zinc-400 font-normal">/ {habit.target}</span>
                  </span>
                  <span className="text-[9px] font-mono tracking-wider text-zinc-400 uppercase block mt-0.5">
                    {habit.targetUnit}
                  </span>
                </div>
                <button
                  onClick={() => adjustProgress(1)}
                  className="p-1 text-zinc-400 hover:text-black hover:bg-zinc-200/50 rounded transition cursor-pointer"
                  title="Increment"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              // Simple checkoff toggle
              <button
                onClick={handleToggleCheck}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-mono font-bold tracking-tight transition cursor-pointer border shadow-sm
                  ${isCompleted
                    ? 'bg-zinc-950 hover:bg-black text-white border-zinc-950'
                    : 'bg-white text-zinc-700 border-zinc-250 hover:border-zinc-400 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                id={`btn-checkbox-${habit.id}`}
              >
                {isCompleted ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3px]" />
                    Done
                  </>
                ) : (
                  'Mark Done'
                )}
              </button>
            )}
          </div>

          {/* Action Tools: Reflection Note & Management */}
          <div className="flex items-center gap-1">
            
            {/* Note Editor Trigger */}
            <button
              onClick={() => setShowNoteEditor(!showNoteEditor)}
              className={`p-1.5 rounded-md hover:bg-zinc-50 border transition cursor-pointer
                ${log?.note 
                  ? 'border-violet-300 text-violet-600 bg-violet-50' 
                  : 'border-zinc-200 text-zinc-400 hover:text-zinc-800'
                }`}
              title="Add Reflection log"
              id={`btn-note-${habit.id}`}
            >
              <Notebook className="w-4 h-4" />
            </button>

            {/* Archive Habit */}
            <button
              onClick={() => onArchiveHabit(habit.id, !habit.archived)}
              className="p-1.5 rounded-md hover:bg-zinc-50 border border-zinc-200 text-zinc-450 hover:text-zinc-805 transition cursor-pointer"
              title={habit.archived ? 'Restore' : 'Archive'}
            >
              <Archive className="w-4 h-4" />
            </button>

            {/* Delete Habit */}
            <button
              onClick={() => {
                if (window.confirm('Delete this habit and all its history permanently?')) {
                  onDeleteHabit(habit.id);
                }
              }}
              className="p-1.5 rounded-md hover:bg-red-50 border border-zinc-200 hover:border-red-200 hover:text-red-600 text-zinc-450 transition cursor-pointer"
              title="Delete Habit permanently"
            >
              <Trash2 className="w-4 h-4" />
            </button>

          </div>
        </div>
      </div>

      {/* Embedded High-Value Focus/Countdown Timer */}
      {isTimeBased && habit.target > 1 && !isCompleted && (
        <div className="mt-4 bg-zinc-50 border border-zinc-200 p-3 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 text-zinc-700 ${timerRunning ? 'animate-pulse' : ''}`} />
            <span className="text-xs text-zinc-500 font-mono font-medium">Session Focus Timer:</span>
            <span className="text-sm font-mono font-bold text-zinc-800 tracking-wider">
              {formatTime(timeLeft)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
            <button
              onClick={timerRunning ? pauseTimer : startTimer}
              className={`p-1 px-3 rounded-md text-xs font-mono font-bold cursor-pointer transition flex items-center gap-1 border shadow-sm
                ${timerRunning 
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200' 
                  : 'bg-zinc-950 hover:bg-black text-white border-zinc-950'
                }`}
            >
              {timerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              {timerRunning ? 'Pause' : 'Start'}
            </button>

            <button
              onClick={resetTimer}
              className="p-1 px-2.5 bg-white hover:bg-zinc-50 text-zinc-500 hover:text-zinc-800 border border-zinc-200 rounded-md text-xs font-mono font-medium transition cursor-pointer"
              title="Reset"
            >
              <RotateCcw className="w-3 h-3" />
            </button>

            <button
              onClick={skipTimer}
              className="p-1 px-2.5 bg-white hover:bg-zinc-50 text-zinc-500 hover:text-zinc-800 border border-zinc-205 rounded-md text-xs font-mono font-medium transition cursor-pointer"
              title="Fast Forward to Complete"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* Note Editor Drawer Block */}
      {showNoteEditor && (
        <div className="mt-4 pt-3.5 border-t border-zinc-200" id="note-editor">
          <h4 className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase mb-2 font-bold">
            Journal entry for {getFormattedDisplayDate(date)}:
          </h4>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Log insights, mental state, barriers encountered, or wins..."
            className="w-full bg-white border border-zinc-200 rounded-lg p-3 text-xs text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-800 transition"
            rows={2.5}
            id="text-note-input"
          />
          <div className="flex justify-end gap-1.5 mt-2.5">
            <button
              onClick={() => setShowNoteEditor(false)}
              className="px-3 py-1 bg-white hover:bg-zinc-50 text-zinc-500 hover:text-zinc-800 border border-zinc-200 rounded-md text-[11px] font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveNote}
              className="px-3.5 py-1 bg-zinc-950 hover:bg-black text-white rounded-md text-[11px] font-bold transition cursor-pointer"
            >
              Save Reflection Note
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
