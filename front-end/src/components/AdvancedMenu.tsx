import React, { useRef, useEffect } from 'react';
import { Menu, Download, RotateCcw } from 'lucide-react';

interface AdvancedMenuProps {
  showMenu: boolean;
  onToggle: () => void;
  onClose: () => void;
  onExport: () => void;
  onWipe: () => void;
}

export default function AdvancedMenu({
  showMenu,
  onToggle,
  onClose,
  onExport,
  onWipe
}: AdvancedMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu, onClose]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={onToggle}
        className="p-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-600 hover:text-zinc-900 rounded-lg transition cursor-pointer shadow-xs"
        title="Advanced options"
      >
        <Menu className="w-4.5 h-4.5" />
      </button>

      {showMenu && (
        <div className="absolute right-0 top-full mt-2 bg-white border border-zinc-200 rounded-lg shadow-lg z-40 min-w-max">
          <button
            onClick={() => {
              onExport();
              onClose();
            }}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition first:rounded-t-md border-b border-zinc-100 last:border-b-0 font-sans"
          >
            <Download className="w-4 h-4 text-zinc-500" />
            Export Data
          </button>

          <button
            onClick={() => {
              onWipe();
              onClose();
            }}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition last:rounded-b-md font-sans"
          >
            <RotateCcw className="w-4 h-4 text-red-500" />
            Wipe All Data
          </button>
        </div>
      )}
    </div>
  );
}
