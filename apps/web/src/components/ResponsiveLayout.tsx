'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar drawer automatically on navigation changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen w-screen overflow-hidden relative">
      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden md:block shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-zinc-950/45 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar (slide-over drawer) */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-zinc-50 dark:bg-zinc-950 transform transition-transform duration-300 ease-in-out md:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="absolute top-4 right-4 z-10 md:hidden">
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-md text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-900 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        <Sidebar />
      </div>

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Top Header */}
        <header className="flex md:hidden items-center justify-between px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 no-print">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsOpen(true)}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
              title="Open Menu"
            >
              <Menu size={18} />
            </button>
            <span className="font-semibold text-sm tracking-tight">NexusNotes</span>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto bg-white dark:bg-zinc-900 md:border-l border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto max-w-5xl px-6 md:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
