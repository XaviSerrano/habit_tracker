/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import LoginModal from './components/LoginModal';
import { Habit, HabitLog, HabitCategory } from './types';
import {
  getLocalDateString,
  getWeekDates,
  getFormattedDisplayDate
} from './utils/dateUtils';

// Subcomponents
import WeeklyCalGrid from './components/WeeklyCalGrid';
import HabitStats from './components/HabitStats';
import HabitListItem from './components/HabitListItem';
import CreateHabitModal from './components/CreateHabitModal';
import ActiveFocusBreather from './components/ActiveFocusBreather';

import {
  Plus,
  Search,
  Download,
  Trash2,
  Sparkles,
  RotateCcw,
  SlidersHorizontal,
  Archive,
  Menu,
  X,
  Target,
  BrainCircuit
} from 'lucide-react';

export default function App() {
  const { user, token, isLoading, logout } = useAuth();

  // --- Persistent States from API ---
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [apiLoading, setApiLoading] = useState(true);

  // --- Layout States ---
  const [selectedDate, setSelectedDate] = useState<string>(() => getLocalDateString(new Date()));
  const [weekPivot, setWeekPivot] = useState<Date>(() => new Date());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | 'all'>('all');
  const [showArchived, setShowArchived] = useState(false);

  // Computed week dates
  const currentWeek = getWeekDates(weekPivot);

  // Fetch habits and logs from API
  useEffect(() => {
    if (!token) {
      setApiLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setApiLoading(true);
        const [habitsRes, logsRes] = await Promise.all([
          fetch('http://localhost:8000/api/habits', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('http://localhost:8000/api/logs', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (habitsRes.ok && logsRes.ok) {
          const habitsData = await habitsRes.json();
          const logsData = await logsRes.json();
          setHabits(habitsData);
          setLogs(logsData);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setApiLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // --- Week Controls ---
  const prevWeek = () => {
    const nextPivot = new Date(weekPivot.getTime());
    nextPivot.setDate(nextPivot.getDate() - 7);
    setWeekPivot(nextPivot);
  };

  const nextWeek = () => {
    const nextPivot = new Date(weekPivot.getTime());
    nextPivot.setDate(nextPivot.getDate() + 7);
    setWeekPivot(nextPivot);
  };

  const resetWeek = () => {
    const today = new Date();
    setWeekPivot(today);
    setSelectedDate(getLocalDateString(today));
  };

  // --- Logging and Modification callbacks ---
  const handleUpdateLog = async (habitId: string, logDate: string, value: number, note?: string) => {
    if (!token) return;

    try {
      const response = await fetch('http://localhost:8000/api/logs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          habit_id: habitId,
          date: logDate,
          value,
          note
        })
      });

      if (response.ok) {
        const newLog = await response.json();
        setLogs(prevLogs => {
          const idx = prevLogs.findIndex(l => l.habitId === habitId && l.date === logDate);
          if (idx >= 0) {
            const updated = [...prevLogs];
            updated[idx] = {
              id: newLog.id,
              habitId: newLog.habit_id,
              date: newLog.date,
              value: newLog.value,
              note: newLog.note,
              timestamp: newLog.timestamp
            };
            return updated;
          }
          return [...prevLogs, {
            id: newLog.id,
            habitId: newLog.habit_id,
            date: newLog.date,
            value: newLog.value,
            note: newLog.note,
            timestamp: newLog.timestamp
          }];
        });
      }
    } catch (error) {
      console.error('Failed to update log:', error);
    }
  };

  const handleCreateHabit = async (newHabitValues: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => {
    if (!token) return;

    try {
      const response = await fetch('http://localhost:8000/api/habits', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newHabitValues.name,
          description: newHabitValues.description,
          category: newHabitValues.category,
          frequency: newHabitValues.frequency,
          specific_days: newHabitValues.specificDays,
          target: newHabitValues.target,
          target_unit: newHabitValues.targetUnit,
          color: newHabitValues.color
        })
      });

      if (response.ok) {
        const newHabit = await response.json();
        setHabits(prev => [{
          id: newHabit.id,
          name: newHabit.name,
          description: newHabit.description,
          category: newHabit.category,
          frequency: newHabit.frequency,
          specificDays: newHabit.specific_days,
          target: newHabit.target,
          targetUnit: newHabit.target_unit,
          createdAt: newHabit.created_at,
          archived: newHabit.archived,
          color: newHabit.color
        }, ...prev]);
        setIsCreateOpen(false);
      }
    } catch (error) {
      console.error('Failed to create habit:', error);
    }
  };

  const handleArchiveHabit = async (id: string, archive: boolean) => {
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8000/api/habits/${id}/archive?archive=${archive}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setHabits(prev =>
          prev.map(h => h.id === id ? { ...h, archived: archive } : h)
        );
      }
    } catch (error) {
      console.error('Failed to archive habit:', error);
    }
  };

  const handleDeleteHabit = async (id: string) => {
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8000/api/habits/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setHabits(prev => prev.filter(h => h.id !== id));
        setLogs(prev => prev.filter(l => l.habitId !== id));
      }
    } catch (error) {
      console.error('Failed to delete habit:', error);
    }
  };

  // --- Reset/Export Actions ---
  const handleExportData = () => {
    const backup = {
      habits,
      logs,
      exportedAt: new Date().toISOString(),
      app: 'Habit Index'
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit-index-export-${getLocalDateString(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleWipeData = async () => {
    if (!token) return;

    if (window.confirm('WARNING: This will delete all habits and logs. Reset?')) {
      try {
        // Delete all habits (cascade deletes logs)
        await Promise.all(
          habits.map(h =>
            fetch(`http://localhost:8000/api/habits/${h.id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            })
          )
        );

        setHabits([]);
        setLogs([]);
        setSelectedDate(getLocalDateString(new Date()));
        setWeekPivot(new Date());
      } catch (error) {
        console.error('Failed to wipe data:', error);
      }
    }
  };

  // --- Filtering Logic ---
  const filteredHabits = habits.filter((h) => {
    // Archived filter
    if (h.archived !== showArchived) return false;

    // Search term match
    const searchMatch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (h.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category match
    const categoryMatch = selectedCategory === 'all' || h.category === selectedCategory;

    // Is active on the currently selected weekday?
    // (Only if they want specific week days filtering, otherwise let's show all active habits)
    const selectedDateObj = new Date(selectedDate + 'T00:00:00');
    const dayOfWeek = selectedDateObj.getDay();
    const scheduleMatch = h.frequency === 'daily' || h.specificDays.includes(dayOfWeek);

    return searchMatch && categoryMatch && scheduleMatch;
  });

  if (isLoading || apiLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-zinc-900 mx-auto mb-4 animate-spin" />
          <p className="text-zinc-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !token) {
    return <LoginModal />;
  }

  return (
    <div className="bg-[#F9FAFB] text-zinc-800 min-h-screen font-sans border-t-4 border-zinc-900 relative overflow-x-hidden" id="desktop-wrapper">
      
      {/* Primary Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 relative z-10">
        
        {/* Navigation & Brand Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 pb-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-950 text-white">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-zinc-955 tracking-tight font-sans flex items-center gap-2 text-zinc-950">
                HABIT INDEX
                <span className="text-[10px] font-mono font-bold uppercase py-0.5 px-2 rounded-full border border-zinc-200 bg-white text-zinc-500">v1.1</span>
              </h1>
              <p className="text-xs text-zinc-450 mt-1 leading-relaxed tracking-wide font-sans">
                Systematic daily logging, physiological calibration, & behavioral feedback loops.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0" id="header-tools-block">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-950 hover:bg-black text-white text-xs font-bold font-mono tracking-tight rounded-lg transition cursor-pointer shadow-sm"
              id="anchor-habit-trigger"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Anchor Habit
            </button>

            <button
              onClick={handleExportData}
              className="p-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-600 hover:text-zinc-900 rounded-lg transition cursor-pointer shadow-xs"
              title="Backup / Export Data as JSON"
            >
              <Download className="w-4.5 h-4.5" />
            </button>

            <button
              onClick={logout}
              className="p-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-400 hover:text-zinc-600 rounded-lg transition cursor-pointer shadow-xs"
              title="Logout"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <button
              onClick={handleWipeData}
              className="p-2 bg-white hover:bg-red-50 border border-zinc-200 text-zinc-400 hover:text-red-650 rounded-lg transition cursor-pointer shadow-xs"
              title="Wipe Data"
            >
              <RotateCcw className="w-4.5 h-4.5" />
            </button>
          </div>
        </header>

        {/* Dynamic Metric dashboard */}
        <section className="mb-8" id="stats-dashboard-grid">
          <HabitStats habits={habits} logs={logs} />
        </section>

        {/* Central Layout Columns */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-5" id="main-content-flow">
          
          {/* Main Feed Column (Left / Two Thirds Width) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Timeline Week Grid */}
            <WeeklyCalGrid
              currentWeek={currentWeek}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onPrevWeek={prevWeek}
              onNextWeek={nextWeek}
              onResetWeek={resetWeek}
              habits={habits}
              logs={logs}
            />

            {/* 2. Filters & Searches Deck */}
            <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 shadow-sm" id="filters-container">
              <div className="flex flex-col sm:flex-row gap-3.5 justify-between items-stretch sm:items-center">
                
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search habits or keywords..."
                    className="w-full bg-zinc-50/50 border border-zinc-250 rounded-lg pl-10 pr-4 py-2 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-800 focus:bg-white transition"
                  />
                </div>

                {/* Filter Categories Horizontal Scroll */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none" id="category-scroller">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-tight border transition shrink-0 cursor-pointer font-bold
                      ${selectedCategory === 'all'
                        ? 'bg-zinc-900 border-zinc-950 text-white'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-zinc-800'
                      }`}
                  >
                    All Areas
                  </button>
                  <button
                    onClick={() => setSelectedCategory('focus')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-tight border transition shrink-0 cursor-pointer font-bold
                      ${selectedCategory === 'focus'
                        ? 'bg-teal-50 border-teal-200 text-teal-800 font-bold'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-zinc-800'
                      }`}
                  >
                    Professional
                  </button>
                  <button
                    onClick={() => setSelectedCategory('health')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-tight border transition shrink-0 cursor-pointer font-bold
                      ${selectedCategory === 'health'
                        ? 'bg-[#0ea5e9]/5 border-[#0ea5e9]/20 text-[#0ea5e9]'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-zinc-805'
                      }`}
                  >
                    Health
                  </button>
                  <button
                    onClick={() => setSelectedCategory('mind')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-tight border transition shrink-0 cursor-pointer font-bold
                      ${selectedCategory === 'mind'
                        ? 'bg-[#8b5cf6]/5 border-[#8b5cf6]/20 text-[#8b5cf6]'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-zinc-805'
                      }`}
                  >
                    Mindfulness
                  </button>
                  <button
                    onClick={() => setSelectedCategory('body')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-tight border transition shrink-0 cursor-pointer font-bold
                      ${selectedCategory === 'body'
                        ? 'bg-[#f97316]/5 border-[#f97316]/20 text-[#f97316]'
                        : 'bg-zinc-50 border-zinc-250 text-zinc-500 hover:text-zinc-850'
                      }`}
                  >
                    Training
                  </button>

                  <div className="w-[1px] h-4 bg-zinc-200 mx-1.5 shrink-0" />

                  {/* Archive toggler */}
                  <button
                    onClick={() => setShowArchived(!showArchived)}
                    className={`p-1.5 rounded-md border transition shrink-0 cursor-pointer
                      ${showArchived
                        ? 'bg-zinc-900 border-zinc-950 text-white'
                        : 'bg-white border-zinc-200 text-zinc-450 hover:text-zinc-850'
                      }`}
                    title={showArchived ? 'Showing Archived' : 'Show Archived'}
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>

            {/* 3. The Interactive Habits Checklist list */}
            <div className="space-y-4" id="habits-checklist-box">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-xs font-bold font-mono tracking-wider text-zinc-500 uppercase flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-zinc-400" />
                  Scheduled Habits ({getFormattedDisplayDate(selectedDate)})
                </h2>
                <span className="text-[10px] text-zinc-450 font-mono">
                  {filteredHabits.length} habits match
                </span>
              </div>

              {filteredHabits.length > 0 ? (
                <div className="grid grid-cols-1 gap-4" id="habits-loop-grid">
                  {filteredHabits.map((habit) => {
                    const logEntry = logs.find((l) => l.habitId === habit.id && l.date === selectedDate);
                    return (
                      <HabitListItem
                        key={habit.id}
                        habit={habit}
                        date={selectedDate}
                        log={logEntry}
                        allLogs={logs}
                        onUpdateLog={handleUpdateLog}
                        onDeleteHabit={handleDeleteHabit}
                        onArchiveHabit={handleArchiveHabit}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white border border-zinc-200 rounded-xl p-10 text-center shadow-xs" id="empty-state">
                  <SlidersHorizontal className="w-8 h-8 text-zinc-300 mx-auto stroke-[1.5] mb-3" />
                  <p className="text-sm font-bold text-zinc-800">Zero focus directives active</p>
                  <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto font-sans">
                    No habits match your active parameters or are scheduled on this day. Change the filters or click Anchor Habit above.
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Right Column (Sidebar Tools - One Third Width) */}
          <div className="space-y-6" id="sidebar-tools-stack">
            
            {/* 1. Tactical Breathing biohacking module */}
            <ActiveFocusBreather />

            {/* 2. Systemic Coaching Advice details */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm" id="behavioral-laws-panel">
              <h3 className="text-xs font-bold tracking-wider text-zinc-500 uppercase font-mono mb-3">
                Behavioral Protocols
              </h3>
              
              <ul className="space-y-3.5 text-xs text-zinc-500" id="coaching-laws">
                <li className="flex gap-2.5 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 mt-1.5 shrink-0" />
                  <div>
                    <span className="font-bold text-zinc-800">Law 1: Atomic Compounding</span>
                    <p className="mt-0.5 leading-relaxed text-zinc-400 font-sans">
                      Streaks represent progressive neuro-association. Completing a tiny 1% daily action compounding over 365 days yields a 37x performance gain.
                    </p>
                  </div>
                </li>
                <li className="flex gap-2.5 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 mt-1.5 shrink-0" />
                  <div>
                    <span className="font-bold text-zinc-800">Law 2: Temporal Friction</span>
                    <p className="mt-0.5 leading-relaxed text-zinc-400 font-sans">
                      Start timed sessions immediately with the countdown utility. Getting over the initial 4-minute initiation friction is 90% of the cognitive battle.
                    </p>
                  </div>
                </li>
                <li className="flex gap-2.5 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 mt-1.5 shrink-0" />
                  <div>
                    <span className="font-bold text-zinc-800">Law 3: Calibrated Execution</span>
                    <p className="mt-0.5 leading-relaxed text-zinc-400 font-sans">
                      Before jumping into high-importance habits, complete 3 Box Breathing cycles. It triggers vagal tone activation and slows heartbeat.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

          </div>

        </main>

        {/* Footer */}
        <footer className="mt-16 pt-6 border-t border-zinc-200 text-center text-[10px] text-zinc-400 font-mono tracking-wider flex flex-col sm:flex-row justify-between items-center gap-3">
          <span>DESIGN COMPENSATED TO AN AGENTIC MINIMAL CANVAS</span>
          <span>LOCAL PERSISTED DATA STORES ENHANCED</span>
        </footer>

      </div>

      {/* Anchor Habit Modal Overlay Drawer */}
      {isCreateOpen && (
        <CreateHabitModal
          onClose={() => setIsCreateOpen(false)}
          onCreateHabit={handleCreateHabit}
        />
      )}

    </div>
  );
}
