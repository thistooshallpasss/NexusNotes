'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Desktop sidebar resizing and collapse states
  const [sidebarWidth, setSidebarWidth] = useState<number>(256); // default 256px
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);

  // Load configuration from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedWidth = localStorage.getItem('sidebar_width');
        if (savedWidth) {
          const parsed = parseInt(savedWidth, 10);
          if (!isNaN(parsed) && parsed >= 180 && parsed <= 450) {
            setSidebarWidth(parsed);
          }
        }
        const savedCollapsed = localStorage.getItem('sidebar_collapsed');
        if (savedCollapsed) {
          setIsCollapsed(savedCollapsed === 'true');
        }
      } catch (e) {
        console.error('Failed to load layout from localStorage:', e);
      }
    }
  }, []);

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem('sidebar_width', sidebarWidth.toString());
  }, [sidebarWidth]);

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', isCollapsed.toString());
  }, [isCollapsed]);

  // Handle resizing mouse events
  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      // Constraint bounds: minimum 180px, maximum 450px
      const newWidth = Math.max(180, Math.min(450, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Close sidebar drawer automatically on navigation changes (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen w-screen overflow-hidden relative">
      {/* Desktop Sidebar Container (hidden on mobile/tablet) */}
      <div 
        className="hidden lg:block shrink-0 relative group h-screen"
        style={{ 
          width: isCollapsed ? 0 : sidebarWidth, 
          display: isCollapsed ? 'none' : 'block' 
        }}
      >
        <Sidebar />
      </div>

      {/* Fold Restore Trigger (sits float on left edge when sidebar is collapsed) */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="fixed left-3 top-4 z-30 p-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-md hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer hidden lg:flex items-center justify-center transition-all border-dashed"
          title="Expand Sidebar"
        >
          <ChevronRight size={14} />
        </button>
      )}

      {/* Interactive Resizing Drag Handle & Collapse Trigger */}
      {!isCollapsed && (
        <div 
          className={`hidden lg:block w-[5px] cursor-col-resize hover:bg-indigo-500/50 transition-colors relative group/handle shrink-0 z-30 ${
            isResizing ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-transparent'
          }`}
          onMouseDown={startResizing}
        >
          {/* Collapse trigger button centered on the drag handle */}
          <button
            onClick={() => setIsCollapsed(true)}
            className="absolute left-1/2 -translate-x-1/2 top-4 opacity-0 group-hover/handle:opacity-100 hover:opacity-100! p-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-md hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-555 hover:text-zinc-855 dark:text-zinc-400 dark:hover:text-zinc-200 transition-opacity cursor-pointer flex items-center justify-center z-30"
            title="Collapse Sidebar"
          >
            <ChevronLeft size={10} />
          </button>
        </div>
      )}

      {/* Mobile/Tablet Drawer Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-zinc-950/45 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile/Tablet Sidebar (slide-over drawer) */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-zinc-50 dark:bg-zinc-950 transform transition-transform duration-300 ease-in-out lg:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="absolute top-4 right-4 z-10 lg:hidden">
          <button 
            onClick={() => setIsOpen(false)}
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
        {/* Mobile/Tablet Top Header */}
        <header className="flex lg:hidden items-center justify-between px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 no-print">
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
        <main className="flex-1 overflow-y-auto bg-white dark:bg-zinc-900 lg:border-l border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto max-w-5xl px-6 md:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

