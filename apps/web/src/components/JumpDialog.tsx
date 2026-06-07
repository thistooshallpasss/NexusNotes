'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, FolderTree, Loader2 } from 'lucide-react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import axios, { API_URL } from '@/lib/apiClient';

export default function JumpDialog() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ pages: any[]; chapters: any[] }>({
    pages: [],
    chapters: [],
  });

  // Listen to Cmd+J/Ctrl+J keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'j' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Debounced API fetch for search results (chapters & pages only)
  useEffect(() => {
    if (!query.trim()) {
      setResults({ pages: [], chapters: [] });
      return;
    }

    setLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await axios.get(`${API_URL}/search?q=${encodeURIComponent(query)}`);
        setResults({
          pages: res.data.pages || [],
          chapters: res.data.chapters || [],
        });
      } catch (err) {
        console.error('Jump search error:', err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (url: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(url);
  };

  const getPageUrl = (page: any) => {
    const bookId = page.chapter?.book?.id;
    const chapterId = page.chapterId || page.chapter?.id;
    if (bookId && chapterId) {
      return `/books/${bookId}/${chapterId}/${page.id}`;
    }
    return '/';
  };

  const getChapterUrl = (chapter: any) => {
    const bookId = chapter.book?.id;
    if (bookId) {
      return `/books/${bookId}/${chapter.id}`;
    }
    return '/';
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen} title="Quick Jump" description="Type to jump directly to a page or chapter...">
      <CommandInput 
        placeholder="Search chapters and pages to jump..." 
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[350px]">
        {loading && (
          <div className="flex items-center justify-center py-6 text-zinc-500 text-sm gap-2">
            <Loader2 size={16} className="animate-spin" /> Loading...
          </div>
        )}
        
        {!loading && query.trim() && !results.pages.length && !results.chapters.length && (
          <CommandEmpty>No pages or chapters found matching "{query}".</CommandEmpty>
        )}

        {!query.trim() && (
          <div className="py-6 text-center text-zinc-400 text-xs">
            Jump to chapters or individual pages directly using pages titles.
          </div>
        )}

        {results.chapters.length > 0 && (
          <CommandGroup heading="Chapters">
            {results.chapters.map((chapter) => (
              <CommandItem
                key={chapter.id}
                onSelect={() => handleSelect(getChapterUrl(chapter))}
                className="cursor-pointer gap-2 py-2"
              >
                <FolderTree size={16} className="text-indigo-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{chapter.title}</div>
                  <div className="text-xs text-zinc-400 dark:text-zinc-500 truncate">
                    Book: {chapter.book?.name}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results.pages.length > 0 && (
          <CommandGroup heading="Pages">
            {results.pages.map((page) => (
              <CommandItem
                key={page.id}
                onSelect={() => handleSelect(getPageUrl(page))}
                className="cursor-pointer gap-2 py-2"
              >
                <FileText size={16} className="text-emerald-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{page.title}</div>
                  <div className="text-xs text-zinc-400 dark:text-zinc-500 truncate">
                    {page.chapter?.book?.name} &rsaquo; {page.chapter?.title}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
