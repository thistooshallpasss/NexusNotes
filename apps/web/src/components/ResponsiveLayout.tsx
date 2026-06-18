'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Menu, X, Search, Minus, Plus } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Single source of truth for sidebar: isCollapsed
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
  const [fontScale, setFontScale] = useState<number>(100);

  // Load configuration from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCollapsed = localStorage.getItem('sidebar_collapsed');
        if (savedCollapsed) {
          setIsCollapsed(savedCollapsed === 'true');
        } else {
          // Collapse by default on mobile, expand by default on desktop
          setIsCollapsed(window.innerWidth < 1024);
        }

        const savedScale = localStorage.getItem('nexus-font-scale');
        if (savedScale) {
          const parsed = parseInt(savedScale, 10);
          if (!isNaN(parsed) && parsed >= 75 && parsed <= 225) {
            setFontScale(parsed);
          }
        }
      } catch (e) {
        console.error('Failed to load layout from localStorage:', e);
      }
    }
  }, []);

  // Listen for external collapse requests (e.g. from Reading Mode)
  useEffect(() => {
    const handleSetCollapsed = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail.collapsed === 'boolean') {
        setIsCollapsed(customEvent.detail.collapsed);
      }
    };
    window.addEventListener('sidebar-set-collapsed', handleSetCollapsed);
    return () => {
      window.removeEventListener('sidebar-set-collapsed', handleSetCollapsed);
    };
  }, []);

  // Sync isCollapsed changes to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', isCollapsed.toString());
  }, [isCollapsed]);

  // Apply root CSS custom property for font scale dynamically
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--app-font-scale', `${fontScale}%`);
    }
  }, [fontScale]);

  const increaseScale = () => {
    setFontScale(prev => {
      const next = Math.min(225, prev + 25);
      localStorage.setItem('nexus-font-scale', next.toString());
      return next;
    });
  };

  const decreaseScale = () => {
    setFontScale(prev => {
      const next = Math.max(75, prev - 25);
      localStorage.setItem('nexus-font-scale', next.toString());
      return next;
    });
  };

  // Close sidebar automatically on navigation changes on mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsCollapsed(true);
    }
  }, [pathname]);

  return (
    <div className="flex h-screen w-screen overflow-hidden relative bg-white dark:bg-zinc-950">
      {/* Mobile Backdrop when Sidebar is open */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 z-40 bg-zinc-950/45 backdrop-blur-sm lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Unified Sidebar Container */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200/60 dark:border-zinc-800/60 transition-transform duration-300 lg:static lg:translate-x-0 ${
          isCollapsed ? '-translate-x-full lg:hidden' : 'translate-x-0'
        }`}
      >
        {/* Mobile close button inside sidebar */}
        <div className="absolute top-4 right-4 z-10 lg:hidden">
          <button 
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded-md text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-900 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        <div className="h-full w-full">
          <Sidebar />
        </div>
      </div>

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Unified Top Header */}
        <header className="flex items-center justify-between px-5 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 no-print">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsCollapsed(prev => !prev)}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-55 dark:hover:bg-zinc-800 cursor-pointer"
              title="Toggle Sidebar"
            >
              <Menu size={18} />
            </button>
            <Link href="/" className="font-bold text-base tracking-tight hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              NexusNotes
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Global Font Scaling Controls */}
            <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 p-0.5">
              <button
                onClick={decreaseScale}
                disabled={fontScale <= 75}
                className="p-1 rounded text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center"
                title="Decrease Font Size"
              >
                <Minus size={13} />
              </button>
              <span className="text-[10px] font-bold select-none font-mono text-zinc-750 dark:text-zinc-300 px-1.5 min-w-[42px] text-center">
                {fontScale}%
              </span>
              <button
                onClick={increaseScale}
                disabled={fontScale >= 225}
                className="p-1 rounded text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center"
                title="Increase Font Size"
              >
                <Plus size={13} />
              </button>
            </div>

            {/* Global Search Button */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('trigger-search'))}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer flex items-center justify-center gap-1.5 text-xs font-semibold"
              title="Search (Cmd+K)"
            >
              <Search size={15} />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto bg-white dark:bg-zinc-900 lg:border-l border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto max-w-5xl px-6 md:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
