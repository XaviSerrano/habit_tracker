/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Habit, HabitCategory } from '../types';
import { Sparkles, Calendar, Info, Target, X } from 'lucide-react';

interface CreateHabitModalProps {
  onClose: () => void;
  onCreateHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => void;
}

export default function CreateHabitModal({ onClose, onCreateHabit }: CreateHabitModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory>('focus');
  const [frequency, setFrequency] = useState<'daily' | 'specific_days'>('daily');
  const [specificDays, setSpecificDays] = useState<number[]>([1, 2, 3, 4, 5]); // Default Mon-Fri
  
  // Progress/Target States
  const [targetType, setTargetType] = useState<'checkbox' | 'counter'>('checkbox');
  const [targetVal, setTargetVal] = useState(1);
  const [targetUnit, setTargetUnit] = useState('times');

  const categories: { key: HabitCategory; label: string; color: string }[] = [
    { key: 'focus', label: 'Professional / Focus', color: '#0d9488' }, // Teal
    { key: 'health', label: 'Physical Health', color: '#0ea5e9' },    // Sky
    { key: 'mind', label: 'Mindfulness / Calm', color: '#8b5cf6' },   // Violet
    { key: 'body', label: 'Conditioning / Sport', color: '#f97316' }, // Orange
    { key: 'routine', label: 'Routine / Habit', color: '#ec4899' },   // Rose
  ];

  const weekdayNames = [
    { label: 'Su', val: 0 },
    { label: 'Mo', val: 1 },
    { label: 'Tu', val: 2 },
    { label: 'We', val: 3 },
    { label: 'Th', val: 4 },
    { label: 'Fr', val: 5 },
    { label: 'Sa', val: 6 },
  ];

  const handleWeekdayToggle = (dayVal: number) => {
    if (specificDays.includes(dayVal)) {
      setSpecificDays(specificDays.filter(d => d !== dayVal));
    } else {
      setSpecificDays([...specificDays, dayVal].sort());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Compile values based on target type
    const finalTarget = targetType === 'checkbox' ? 1 : targetVal;
    const finalUnit = targetType === 'checkbox' ? 'reflection' : targetUnit;
    const finalColor = categories.find(c => c.key === category)?.color || '#0d9488';

    onCreateHabit({
      name: name.trim(),
      description: description.trim() || undefined,
      category,
      frequency,
      specificDays: frequency === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : specificDays,
      target: finalTarget,
      targetUnit: finalUnit,
      color: finalColor,
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div 
        className="w-full max-w-lg bg-white border border-zinc-200 rounded-2xl shadow-xl p-6 relative"
        id="create-habit-box"
      >
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-base sm:text-[16px] font-bold tracking-tight text-zinc-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-zinc-800" />
              Configure Performance Habit
            </h3>
            <p className="text-xs text-zinc-400 mt-1 font-sans">
              Design a consistent, deliberate feedback parameter.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-800 transition cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Label Title */}
          <div>
            <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase block mb-1.5 font-bold">
              Habit Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Deep Focus Work, Aerobic Threshold..."
              className="w-full bg-white border border-zinc-250 rounded-lg px-3.5 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-800 focus:ring-1 focus:ring-zinc-800 transition"
              id="input-name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase block mb-1.5 flex items-center gap-1 font-bold">
              <Info className="w-3 h-3 text-zinc-400" /> Description (Purpose / Context)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context or rules of engagement..."
              className="w-full bg-white border border-zinc-250 rounded-lg px-3.5 py-2 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-800 focus:ring-1 focus:ring-zinc-800 transition"
              rows={2}
            />
          </div>

          {/* Categories Segment */}
          <div>
            <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase block mb-1.5 font-bold">
              High-Value Category Focus
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" id="category-radio-group">
              {categories.map((c) => (
                <button
                  type="button"
                  key={c.key}
                  onClick={() => setCategory(c.key)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs text-left transition cursor-pointer
                    ${category === c.key
                      ? 'border-zinc-800 bg-zinc-900 text-white font-semibold shadow-sm'
                      : 'border-zinc-200 bg-zinc-50/50 hover:border-zinc-350 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                    }`}
                >
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: c.color }}
                  />
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target type selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase block mb-1.5 flex items-center gap-1 font-bold">
                <Target className="w-3.5 h-3.5 text-zinc-400" /> Target Protocol
              </label>
              <div className="flex bg-zinc-100 p-1 border border-zinc-200 rounded-lg">
                <button
                  type="button"
                  onClick={() => setTargetType('checkbox')}
                  className={`flex-1 text-center py-1 rounded text-xs font-bold cursor-pointer transition
                    ${targetType === 'checkbox'
                      ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50'
                      : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                >
                  Checkoff
                </button>
                <button
                  type="button"
                  onClick={() => setTargetType('counter')}
                  className={`flex-1 text-center py-1 rounded text-xs font-bold cursor-pointer transition
                    ${targetType === 'counter'
                      ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50'
                      : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                >
                  Value Goal
                </button>
              </div>
            </div>

            {targetType === 'counter' && (
              <div className="grid grid-cols-2 gap-2" id="counter-setup">
                <div>
                  <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase block mb-1.5 font-bold">
                    Target Goal
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={targetVal}
                    onChange={(e) => setTargetVal(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-white border border-zinc-250 rounded-lg px-2.5 py-1 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-850 text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase block mb-1.5 font-bold">
                    Unit Symbol
                  </label>
                  <input
                    type="text"
                    required
                    value={targetUnit}
                    onChange={(e) => setTargetUnit(e.target.value)}
                    placeholder="glasses, mins"
                    className="w-full bg-white border border-zinc-250 rounded-lg px-2.5 py-1 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-850 text-center"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Time Scheduling Settings */}
          <div>
            <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase block mb-1.5 flex items-center gap-1 font-bold">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Scheduling Cadence
            </label>
            <div className="flex bg-zinc-100 p-1 border border-zinc-200 rounded-lg mb-3">
              <button
                type="button"
                onClick={() => setFrequency('daily')}
                className={`flex-1 text-center py-1 rounded text-xs font-bold cursor-pointer transition
                  ${frequency === 'daily'
                    ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50'
                    : 'text-zinc-500 hover:text-zinc-800'
                  }`}
              >
                Daily Frequency
              </button>
              <button
                type="button"
                onClick={() => setFrequency('specific_days')}
                className={`flex-1 text-center py-1 rounded text-xs font-bold cursor-pointer transition
                  ${frequency === 'specific_days'
                    ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50'
                    : 'text-zinc-500 hover:text-zinc-800'
                  }`}
              >
                Active Weekdays
              </button>
            </div>

            {frequency === 'specific_days' && (
              <div className="flex justify-between gap-1 bg-zinc-50 p-2 border border-zinc-200 rounded-lg" id="weekdays-selector">
                {weekdayNames.map((day) => {
                  const isSelected = specificDays.includes(day.val);
                  return (
                    <button
                      type="button"
                      key={day.val}
                      onClick={() => handleWeekdayToggle(day.val)}
                      className={`w-9 h-9 rounded-full text-xs font-mono font-bold flex items-center justify-center transition cursor-pointer select-none border
                        ${isSelected
                          ? 'bg-zinc-900 text-white border-zinc-950 shadow-sm'
                          : 'bg-white text-zinc-500 border-zinc-200 hover:text-zinc-800'
                        }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Submit Action Buttons */}
          <div className="flex justify-end gap-2.5 pt-4 border-t border-zinc-150">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-650 hover:text-zinc-900 border border-zinc-200 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-zinc-950 hover:bg-black text-white font-bold rounded-lg text-xs tracking-wide transition cursor-pointer shadow-sm"
              id="submit-create-habit"
            >
              Anchor Habit Structure
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
