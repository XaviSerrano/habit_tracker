/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Activity, Play, Pause, RotateCcw, Award } from 'lucide-react';
import { playCheckSound } from '../utils/audio';

type BreathState = 'Inhale' | 'Hold' | 'Exhale' | 'Rest' | 'Idle';

export default function ActiveFocusBreather() {
  const [isActive, setIsActive] = useState(false);
  const [breathState, setBreathState] = useState<BreathState>('Idle');
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [pattern, setPattern] = useState<'box' | 'calm'>('box'); // box: 4-4-4-4, calm: 4-7-8

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Define patterns
  // Box: Inhale 4s -> Hold 4s -> Exhale 4s -> Hold 4s
  // Calm: Inhale 4s -> Hold 7s -> Exhale 8s -> Rest 2s
  
  useEffect(() => {
    if (!isActive) {
      setBreathState('Idle');
      setSecondsLeft(4);
      return;
    }

    setBreathState('Inhale');
    setSecondsLeft(4);
  }, [isActive, pattern]);

  useEffect(() => {
    if (!isActive || breathState === 'Idle') return;

    timerRef.current = setTimeout(() => {
      if (secondsLeft > 1) {
        setSecondsLeft((s) => s - 1);
      } else {
        // State transition logic
        if (pattern === 'box') {
          switch (breathState) {
            case 'Inhale':
              setBreathState('Hold');
              setSecondsLeft(4);
              break;
            case 'Hold':
              setBreathState('Exhale');
              setSecondsLeft(4);
              break;
            case 'Exhale':
              setBreathState('Rest'); // represents the hold after exhale
              setSecondsLeft(4);
              break;
            case 'Rest':
              setBreathState('Inhale');
              setSecondsLeft(4);
              setCompletedCycles((c) => {
                const next = c + 1;
                if (next > 0 && next % 4 === 0) {
                  playCheckSound(); // sound congratulates every 4 cycles (Zen master)
                }
                return next;
              });
              break;
          }
        } else {
          // calm pattern (4-7-8)
          switch (breathState) {
            case 'Inhale':
              setBreathState('Hold');
              setSecondsLeft(7);
              break;
            case 'Hold':
              setBreathState('Exhale');
              setSecondsLeft(8);
              break;
            case 'Exhale':
              setBreathState('Rest');
              setSecondsLeft(2);
              break;
            case 'Rest':
              setBreathState('Inhale');
              setSecondsLeft(4);
              setCompletedCycles((c) => {
                const next = c + 1;
                if (next > 0 && next % 3 === 0) {
                  playCheckSound();
                }
                return next;
              });
              break;
          }
        }
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [secondsLeft, breathState, isActive, pattern]);

  const toggleBreathing = () => {
    setIsActive(!isActive);
  };

  const resetBreathing = () => {
    setIsActive(false);
    setBreathState('Idle');
    setSecondsLeft(4);
    setCompletedCycles(0);
  };

  // Compute scale and color based on current breathing state
  const getCircleStyle = () => {
    switch (breathState) {
      case 'Inhale':
        return {
          scale: 1.35,
          borderColor: 'rgba(24, 24, 27, 0.85)', // zinc-900 style
          backgroundColor: 'rgba(24, 24, 27, 0.02)',
          text: 'Inhale Deeply (Nose)',
          desc: 'Expand your diaphragm fully'
        };
      case 'Hold':
        return {
          scale: 1.35,
          borderColor: 'rgba(63, 63, 70, 0.85)', // zinc-700 style
          backgroundColor: 'rgba(63, 63, 70, 0.02)',
          text: 'Retain / Lock Breath',
          desc: 'Maintain quiet mental stillness'
        };
      case 'Exhale':
        return {
          scale: 0.95,
          borderColor: 'rgba(113, 113, 122, 0.85)', // zinc-500 style
          backgroundColor: 'rgba(113, 113, 122, 0.02)',
          text: 'Slow Exhale (Mouth)',
          desc: 'Release all cognitive tension'
        };
      case 'Rest':
        return {
          scale: 0.9,
          borderColor: 'rgba(161, 161, 170, 0.85)', // zinc-405 style
          backgroundColor: 'rgba(161, 161, 170, 0.02)',
          text: pattern === 'box' ? 'Hold / Recover' : 'Rest / Reset',
          desc: 'Empty body stillness'
        };
      default:
        return {
          scale: 1.0,
          borderColor: 'rgba(215, 215, 219, 1)',
          backgroundColor: 'rgba(244, 244, 245, 0.4)',
          text: 'Ready to Calibrate',
          desc: 'Align your physiology for focus'
        };
    }
  };

  const style = getCircleStyle();

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-5 flex flex-col justify-between shadow-sm" id="breathing-calibration-panel">
      <div>
        <h2 className="text-xs font-bold tracking-wider text-zinc-550 uppercase font-mono flex items-center gap-2">
          <Activity className="w-4 h-4 text-zinc-400" />
          Physiological Calibrator
        </h2>
        <p className="text-xs text-zinc-400 mt-1 font-sans">
          Box or calming breathing loops to enhance deep task focus & clarity.
        </p>
      </div>

      <div className="flex flex-col items-center my-6 py-2">
        {/* Animated Breathing Circle */}
        <div 
          className="relative w-28 h-28 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-1000 ease-in-out"
          style={{ 
            transform: `scale(${style.scale})`, 
            borderColor: style.borderColor,
            backgroundColor: style.backgroundColor
          }}
          id="breathing-circle"
        >
          {/* Inner Counter digit */}
          <span className="text-2xl font-bold font-mono text-zinc-900 tracking-tight">
            {isActive ? secondsLeft : '—'}
          </span>
          <span className="text-[9px] font-mono tracking-wider text-zinc-400 uppercase mt-0.5">
            {isActive ? breathState : 'READY'}
          </span>
        </div>

        {/* Action Text */}
        <div className="mt-8 text-center min-h-[36px]" id="breathing-action-info">
          <p className="text-xs font-bold text-zinc-800 tracking-tight">
            {style.text}
          </p>
          <p className="text-[10px] text-zinc-500 mt-0.5 font-sans">
            {style.desc}
          </p>
        </div>
      </div>

      {/* Selector and Controls */}
      <div className="space-y-4">
        {/* Toggle Selector */}
        <div className="flex bg-zinc-100 border border-zinc-200 p-1 rounded-lg">
          <button
            onClick={() => setPattern('box')}
            className={`flex-1 py-1 rounded text-[11px] font-mono font-bold cursor-pointer transition
              ${pattern === 'box'
                ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50'
                : 'text-zinc-450 hover:text-zinc-805'
              }`}
          >
            Tactical Box (4-4)
          </button>
          <button
            onClick={() => setPattern('calm')}
            className={`flex-1 py-1 rounded text-[11px] font-mono font-bold cursor-pointer transition
              ${pattern === 'calm'
                ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50'
                : 'text-zinc-450 hover:text-zinc-805'
              }`}
          >
            Serene (4-7-8)
          </button>
        </div>

        {/* Footer controls & tally */}
        <div className="flex items-center justify-between pt-1 border-t border-zinc-100">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            Completed: <span className="font-bold text-zinc-850">{completedCycles} cycles</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleBreathing}
              className={`p-1 px-3 rounded-md text-[11px] font-mono font-bold cursor-pointer transition flex items-center gap-1 border shadow-sm
                ${isActive 
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200' 
                  : 'bg-zinc-950 hover:bg-black text-white border-zinc-950'
                }`}
            >
              {isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-white" />}
              {isActive ? 'Pause' : 'Calibrate'}
            </button>
            <button
              onClick={resetBreathing}
              className="p-1 px-2.5 bg-white text-zinc-550 hover:text-zinc-805 hover:bg-zinc-50 border border-zinc-200 rounded-md text-[11px] font-mono transition cursor-pointer"
              title="Reset"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
