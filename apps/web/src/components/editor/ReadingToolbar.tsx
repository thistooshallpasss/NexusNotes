'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Minus, Plus, X } from 'lucide-react';

interface ReadingToolbarProps {
  fontSize: number;
  onFontSizeChange: (newSize: number) => void;
  onExit: () => void;
  showExit: boolean;
}

export default function ReadingToolbar({
  fontSize,
  onFontSizeChange,
  onExit,
  showExit,
}: ReadingToolbarProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const currentTheme = theme === 'system' ? resolvedTheme : theme;

  const toggleTheme = () => {
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  };

  const handleDecrease = () => {
    if (fontSize > 75) {
      onFontSizeChange(fontSize - 25);
    }
  };

  const handleIncrease = () => {
    if (fontSize < 225) {
      onFontSizeChange(fontSize + 25);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-full border border-zinc-200/80 dark:border-zinc-800/80 bg-white/75 dark:bg-zinc-950/75 backdrop-blur-lg shadow-xl no-print">
      {/* Font Size controls */}
      <div className="flex items-center gap-2 pr-2 border-r border-zinc-200 dark:border-zinc-800">
        <button
          onClick={handleDecrease}
          disabled={fontSize <= 75}
          className="p-1.5 rounded-full text-zinc-550 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center"
          title="Decrease Font Size (A-)"
        >
          <Minus size={15} />
        </button>
        <span className="text-xs font-semibold select-none font-mono text-zinc-700 dark:text-zinc-300 min-w-[36px] text-center">
          {fontSize}%
        </span>
        <button
          onClick={handleIncrease}
          disabled={fontSize >= 225}
          className="p-1.5 rounded-full text-zinc-550 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center"
          title="Increase Font Size (A+)"
        >
          <Plus size={15} />
        </button>
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="p-1.5 rounded-full text-zinc-550 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 transition-all cursor-pointer flex items-center justify-center"
        title="Toggle Theme"
      >
        {currentTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* Exit Button */}
      {showExit && (
        <>
          <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 my-auto" />
          <button
            onClick={onExit}
            className="p-1.5 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer flex items-center justify-center"
            title="Exit Reading View"
          >
            <X size={16} />
          </button>
        </>
      )}
    </div>
  );
}
