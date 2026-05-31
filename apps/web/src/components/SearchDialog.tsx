'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Brain, StickyNote, Loader2 } from 'lucide-react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import axios, { API_URL } from '@/lib/apiClient';

export default function SearchDialog() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ pages: any[]; questions: any[]; notes: any[] }>({
    pages: [],
    questions: [],
    notes: [],
  });

  // Listen to Cmd+K/Ctrl+K and custom search trigger events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };

    const handleTriggerSearch = () => {
      setIsOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('trigger-search', handleTriggerSearch);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('trigger-search', handleTriggerSearch);
    };
  }, []);

  // Debounced API search fetch
  useEffect(() => {
    if (!query.trim()) {
      setResults({ pages: [], questions: [], notes: [] });
      return;
    }

    setLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await axios.get(`${API_URL}/search?q=${encodeURIComponent(query)}`);
        setResults(res.data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 450);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (url: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(url);
  };

  // Build a correct deep-link URL for a page result
  const getPageUrl = (page: any) => {
    const bookId = page.chapter?.book?.id;
    const chapterId = page.chapterId || page.chapter?.id;
    if (bookId && chapterId) {
      return `/books/${bookId}/${chapterId}/${page.id}`;
    }
    return '/';
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen} title="Global Search" description="Type search query to search pages, questions, notes...">
      <CommandInput 
        placeholder="Type to search..." 
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[350px]">
        {loading && (
          <div className="flex items-center justify-center py-6 text-zinc-500 text-sm gap-2">
            <Loader2 size={16} className="animate-spin" /> Searching...
          </div>
        )}
        
        {!loading && query.trim() && !results.pages.length && !results.questions.length && !results.notes.length && (
          <CommandEmpty>No results found for "{query}".</CommandEmpty>
        )}

        {!query.trim() && (
          <div className="py-6 text-center text-zinc-400 text-xs">
            Search for books, topics, flashcards, or interview companies.
          </div>
        )}

        {results.pages.length > 0 && (
          <CommandGroup heading="Pages">
            {results.pages.map((page) => (
              <CommandItem
                key={page.id}
                onSelect={() => handleSelect(getPageUrl(page))}
                className="cursor-pointer gap-2 py-2"
              >
                <FileText size={16} className="text-indigo-500 shrink-0" />
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

        {results.questions.length > 0 && (
          <CommandGroup heading="Q&A Flashcards">
            {results.questions.map((q) => (
              <CommandItem
                key={q.id}
                onSelect={() => handleSelect(`/books/${q.bookId}/qa`)}
                className="cursor-pointer gap-2 py-2"
              >
                <Brain size={16} className="text-emerald-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{q.question}</div>
                  <div className="text-xs text-zinc-400 dark:text-zinc-500 truncate">
                    {q.book?.name} {q.difficulty ? `(${q.difficulty})` : ''}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results.notes.length > 0 && (
          <CommandGroup heading="Quick Notes">
            {results.notes.map((note) => (
              <CommandItem
                key={note.id}
                onSelect={() => handleSelect(`/?noteId=${note.id}`)}
                className="cursor-pointer gap-2 py-2"
              >
                <StickyNote size={16} className="text-amber-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{note.title}</div>
                  <div className="text-xs text-zinc-400 dark:text-zinc-500 truncate">
                    Type: {note.type}
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
