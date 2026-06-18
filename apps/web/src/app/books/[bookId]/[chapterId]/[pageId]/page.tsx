'use client';

import { use, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { API_URL } from '@/lib/apiClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { serializeToMarkdown } from '@/lib/markdownSerializer';
import BlockEditor from '@/components/editor/BlockEditor';
import PageQuestionsSection from '@/components/editor/PageQuestionsSection';
import TagManager, { Tag } from '@/components/tags/TagManager';
import { Button } from '@/components/ui/button';
import ReadingToolbar from '@/components/editor/ReadingToolbar';


export default function PageView({ params }: { params: Promise<{ bookId: string; chapterId: string; pageId: string }> }) {
  const resolvedParams = use(params);
  const queryClient = useQueryClient();
  const router = useRouter();

  // Fetch page details
  const { data: page, isLoading: isLoadingPage, isError, error } = useQuery({
    queryKey: ['page', resolvedParams.pageId],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/pages/${resolvedParams.pageId}`);
      return res.data;
    }
  });

  // Fetch all tags for the tag manager
  const { data: allTags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/tags`);
      return res.data;
    }
  });

  // Local state for inline inputs
  const [titleVal, setTitleVal] = useState('');
  const [companiesVal, setCompaniesVal] = useState('');
  const [mutationError, setMutationError] = useState<string | null>(null);

  // Reading Mode State
  const [readingMode, setReadingMode] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [fontSize, setFontSize] = useState<number>(100);

  // Initialize font size from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedScale = localStorage.getItem('nexus-font-scale');
      if (savedScale) {
        const parsed = parseInt(savedScale, 10);
        if (!isNaN(parsed) && parsed >= 75 && parsed <= 225) {
          setFontSize(parsed);
        }
      }
    }
  }, []);

  // Update localStorage and root styling custom property when fontSize changes
  const handleFontSizeChange = (newScale: number) => {
    setFontSize(newScale);
    localStorage.setItem('nexus-font-scale', newScale.toString());
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--app-font-scale', `${newScale}%`);
    }
  };

  // Check for viewport width on mount to auto-trigger readingMode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768;
      setIsMobileDevice(isMobile);
      if (isMobile) {
        setReadingMode(true);
      }
    }
  }, []);

  // Collapse/expand sidebar programmatically when entering/exiting readingMode
  useEffect(() => {
    if (!isMobileDevice) {
      window.dispatchEvent(
        new CustomEvent('sidebar-set-collapsed', {
          detail: { collapsed: readingMode },
        })
      );
    }
  }, [readingMode, isMobileDevice]);

  // Sync state with query result
  useEffect(() => {
    if (page) {
      setTitleVal(page.title);
      setCompaniesVal(page.companies || '');
    }
  }, [page]);

  // Fetch sibling pages of chapter
  const { data: chapter } = useQuery({
    queryKey: ['chapter', page?.chapterId],
    queryFn: async () => {
      if (!page?.chapterId) return null;
      const res = await axios.get(`${API_URL}/chapters/${page.chapterId}`);
      return res.data;
    },
    enabled: !!page?.chapterId,
  });

  const siblingPages = chapter?.pages || [];
  const currentIndex = siblingPages.findIndex((p: any) => p.id === resolvedParams.pageId);
  const prevPage = currentIndex > 0 ? siblingPages[currentIndex - 1] : null;
  const nextPage = currentIndex < siblingPages.length - 1 ? siblingPages[currentIndex + 1] : null;

  // keyboard navigation (Alt + Left/Right)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        if (e.key === 'ArrowLeft' && prevPage) {
          e.preventDefault();
          router.push(`/books/${resolvedParams.bookId}/${resolvedParams.chapterId}/${prevPage.id}`);
        } else if (e.key === 'ArrowRight' && nextPage) {
          e.preventDefault();
          router.push(`/books/${resolvedParams.bookId}/${resolvedParams.chapterId}/${nextPage.id}`);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevPage, nextPage, router, resolvedParams.bookId, resolvedParams.chapterId]);

  // Mutations
  const createTagMutation = useMutation({
    mutationFn: async ({ name, color }: { name: string; color?: string }) => {
      const res = await axios.post(`${API_URL}/tags`, { name, color });
      await axios.post(`${API_URL}/tags/assign`, { pageId: resolvedParams.pageId, tagId: res.data.id });
      return res.data;
    },
    onError: (err: any) => setMutationError(err.response?.data?.error || err.message || 'Failed to create and assign tag.'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['page', resolvedParams.pageId] });
      setMutationError(null);
    }
  });

  const assignTagMutation = useMutation({
    mutationFn: async (tag: Tag) => {
      await axios.post(`${API_URL}/tags/assign`, { pageId: resolvedParams.pageId, tagId: tag.id });
    },
    onError: (err: any) => setMutationError(err.response?.data?.error || err.message || 'Failed to assign tag.'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page', resolvedParams.pageId] });
      setMutationError(null);
    }
  });

  const removeTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      await axios.delete(`${API_URL}/tags/remove`, { params: { pageId: resolvedParams.pageId, tagId } });
    },
    onError: (err: any) => setMutationError(err.response?.data?.error || err.message || 'Failed to remove tag.'),
    onSuccess: () => {
      // Invalidate the *specific* page query so tag list refreshes correctly
      queryClient.invalidateQueries({ queryKey: ['page', resolvedParams.pageId] });
      setMutationError(null);
    }
  });

  const updatePageMutation = useMutation({
    mutationFn: async (updatedFields: any) => {
      const res = await axios.put(`${API_URL}/pages/${resolvedParams.pageId}`, updatedFields);
      return res.data;
    },
    // Optimistic update for toggles so they react immediately
    onMutate: async (updatedFields) => {
      if (updatedFields.isFavorite === undefined && updatedFields.isPinned === undefined && updatedFields.isImportant === undefined) return;
      await queryClient.cancelQueries({ queryKey: ['page', resolvedParams.pageId] });
      const previous = queryClient.getQueryData(['page', resolvedParams.pageId]);
      queryClient.setQueryData(['page', resolvedParams.pageId], (old: any) => ({
        ...old,
        ...updatedFields
      }));
      return { previous };
    },
    onError: (err: any, vars, context: any) => {
      // Roll back on failure
      if (context?.previous) {
        queryClient.setQueryData(['page', resolvedParams.pageId], context.previous);
      }
      setMutationError(err.response?.data?.error || err.message || 'Failed to update page.');
      if (vars.title !== undefined) {
        setTitleVal(page?.title || '');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page', resolvedParams.pageId] });
      queryClient.invalidateQueries({ queryKey: ['booksTree'] });
      setMutationError(null);
    }
  });

  const saveBlocksMutation = useMutation({
    mutationFn: async (content: any) => {
      await axios.put(`${API_URL}/pages/${resolvedParams.pageId}/blocks`, { 
        blocks: [{ type: 'tiptap', content }] 
      });
    },
    onError: (err: any) => setMutationError(err.response?.data?.error || err.message || 'Failed to save page contents.'),
    onSuccess: () => {
      setMutationError(null);
    }
  });

  if (isLoadingPage) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
        <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
        <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6"></div>
      </div>
    );
  }

  if (isError || !page) {
    return (
      <div className="py-8 text-center text-red-500">
        {isError ? `Error: ${error?.message || 'Failed to load page'}` : 'Page not found'}
      </div>
    );
  }

  // Format the selected tags from the Page API relation
  const selectedTags = page.pageTags ? page.pageTags.map((pt: any) => pt.tag) : [];
  
  const serializeToMarkdownImported = serializeToMarkdown;

  const handleExportMarkdown = () => {
    if (!page || !page.blocks || !page.blocks[0]) return;
    const content = page.blocks[0].content;
    const markdown = serializeToMarkdownImported(content);
    
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${page.title.toLowerCase().replace(/\s+/g, '-')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Get initial content from the blocks if exists
  const initialBlock = page.blocks && page.blocks.length > 0 ? page.blocks[0].content : undefined;

  return (
    <div 
      className={`mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300 ${
        readingMode 
          ? 'max-w-[390px] reading-mode-active' 
          : 'max-w-4xl'
      }`}
    >
      {/* Breadcrumb Navigation & Exports */}
      {page.chapter && page.chapter.book && (
        <div className={`flex items-center justify-between gap-4 mb-4 no-print transition-all duration-300 ${
          readingMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}>
          <nav className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
            <Link href={`/books/${page.chapter.book.id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              {page.chapter.book.name}
            </Link>
            <span>/</span>
            <Link href={`/books/${page.chapter.book.id}/${page.chapter.id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              {page.chapter.title}
            </Link>
            <span>/</span>
            <span className="text-zinc-800 dark:text-zinc-200">{page.title}</span>
          </nav>
          
          <div className="flex items-center gap-2">
            {!isMobileDevice && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setReadingMode(true)}
                className="h-7 text-xs px-2.5 cursor-pointer shadow-sm flex items-center gap-1.5 border-dashed"
              >
                📱 Reading View
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportMarkdown}
              className="h-7 text-xs px-2.5 cursor-pointer shadow-sm"
            >
              Export MD
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.print()}
              className="h-7 text-xs px-2.5 cursor-pointer shadow-sm"
            >
              Export PDF
            </Button>
          </div>
        </div>
      )}

      {mutationError && (
        <div className="mb-4 text-xs font-semibold text-red-600 bg-red-50/50 dark:bg-red-950/15 py-2.5 px-4 rounded-xl border border-red-200/40 dark:border-red-900/40 flex items-center justify-between gap-2 no-print">
          <span>{mutationError}</span>
          <button 
            onClick={() => setMutationError(null)} 
            className="text-red-400 hover:text-red-700 dark:hover:text-red-300 font-bold px-1 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Inline Editable Title */}
      <input
        disabled={readingMode}
        className={`text-4xl font-bold tracking-tight mb-2 bg-transparent border-none outline-none focus:ring-0 w-full px-2 py-1 rounded transition-all duration-300 ${
          readingMode 
            ? 'cursor-default select-none' 
            : 'hover:bg-zinc-100/50 focus:bg-zinc-100/50 dark:hover:bg-zinc-800/30 dark:focus:bg-zinc-800/30 text-zinc-900 dark:text-zinc-50'
        }`}
        value={titleVal}
        onChange={(e) => setTitleVal(e.target.value)}
        onBlur={() => {
          if (titleVal.trim() && titleVal.trim() !== page.title) {
            updatePageMutation.mutate({ title: titleVal.trim() });
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.currentTarget.blur();
          }
        }}
        placeholder="Enter page title..."
      />

      {/* Metadata Panel */}
      <div className={`flex flex-wrap items-center gap-4 py-3 border-b border-zinc-200 dark:border-zinc-800 text-sm text-zinc-600 dark:text-zinc-400 transition-all duration-300 ${
        readingMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}>
        {/* Type Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Type</span>
          <select
            value={page.type || 'theory'}
            onChange={(e) => updatePageMutation.mutate({ type: e.target.value })}
            className="bg-transparent border border-zinc-200 dark:border-zinc-800 rounded px-2.5 py-1 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <option value="theory">Theory</option>
            <option value="dsa">DSA</option>
          </select>
        </div>

        {/* Difficulty/Priority Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Difficulty</span>
          <select
            value={page.difficulty || ''}
            onChange={(e) => updatePageMutation.mutate({ difficulty: e.target.value || null })}
            className="bg-transparent border border-zinc-200 dark:border-zinc-800 rounded px-2.5 py-1 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <option value="">Not set</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Companies Input */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Companies</span>
          <input
            type="text"
            placeholder="e.g. Google, Amazon"
            value={companiesVal}
            onChange={(e) => setCompaniesVal(e.target.value)}
            onBlur={() => {
              // Use ?? to correctly handle null vs '' — null.companies and '' are both falsy
              if (companiesVal !== (page.companies ?? '')) {
                updatePageMutation.mutate({ companies: companiesVal });
              }
            }}
            className="bg-transparent border border-zinc-200 dark:border-zinc-800 rounded px-2.5 py-1 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none w-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
          />
        </div>

        {/* Revision Tracker */}
        <div className="flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-lg px-2.5 py-1 text-xs">
          <span className="text-zinc-500 font-medium">Revised: {page.revisedAt?.length || 0} times</span>
          {page.revisedAt?.length > 0 && (
            <span className="text-zinc-400 dark:text-zinc-500 font-mono">
              (Last: {new Date(page.revisedAt[page.revisedAt.length - 1]).toLocaleDateString()})
            </span>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-5 px-1.5 text-[10px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 cursor-pointer"
            onClick={() => updatePageMutation.mutate({ pushRevision: true })}
          >
            Mark Revised
          </Button>
        </div>

        {/* Favorite Toggle */}
        <button
          onClick={() => updatePageMutation.mutate({ isFavorite: !page.isFavorite })}
          className={`inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer ${
            page.isFavorite 
              ? 'bg-yellow-50 border-yellow-200 text-yellow-500 dark:bg-yellow-950/20 dark:border-yellow-900/50' 
              : 'bg-white hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-800'
          }`}
          title={page.isFavorite ? 'Unfavorite' : 'Favorite'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={page.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </button>

        {/* Important Toggle */}
        <button
          onClick={() => updatePageMutation.mutate({ isImportant: !page.isImportant })}
          className={`inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer ${
            page.isImportant 
              ? 'bg-orange-50 border-orange-200 text-orange-500 dark:bg-orange-950/20 dark:border-orange-900/50' 
              : 'bg-white hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-800'
          }`}
          title={page.isImportant ? 'Unmark Important' : 'Mark Important'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={page.isImportant ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
        </button>

        {/* Pin Toggle */}
        <button
          onClick={() => updatePageMutation.mutate({ isPinned: !page.isPinned })}
          className={`inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer ${
            page.isPinned 
              ? 'bg-blue-50 border-blue-200 text-blue-500 dark:bg-blue-950/20 dark:border-blue-900/50' 
              : 'bg-white hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-800'
          }`}
          title={page.isPinned ? 'Unpin' : 'Pin'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={page.isPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="17" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-.44-1.24l-2.78-3.5A2 2 0 0 1 15 9.26V5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4.26a2 2 0 0 1-.78 1.24l-2.78 3.5a2 2 0 0 0-.44 1.24z"/></svg>
        </button>
      </div>
      
      <div className={`transition-all duration-300 ${
        readingMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}>
        <TagManager 
          availableTags={allTags}
          selectedTags={selectedTags}
          pageId={resolvedParams.pageId}
          onCreateTag={(name, color) => createTagMutation.mutate({ name, color })}
          onAssignTag={(tag) => assignTagMutation.mutate(tag)}
          onRemoveTag={(tagId) => removeTagMutation.mutate(tagId)}
        />
      </div>

      <div className="mt-8">
        <BlockEditor
          key={resolvedParams.pageId}
          initialContent={initialBlock} 
          onSave={(content) => saveBlocksMutation.mutate(content)}
          isSaving={saveBlocksMutation.isPending}
          readingMode={readingMode}
        />
      </div>

      <div className={`transition-all duration-300 ${
        readingMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}>
        <PageQuestionsSection 
          bookId={resolvedParams.bookId} 
          pageId={resolvedParams.pageId} 
        />
      </div>

      {/* Sibling Page Navigation */}
      <div className={`flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-6 mt-12 no-print transition-all duration-300 ${
        readingMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}>
        <div>
          {prevPage ? (
            <Link 
              href={`/books/${resolvedParams.bookId}/${resolvedParams.chapterId}/${prevPage.id}`}
              className="flex flex-col items-start group hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Previous Page</span>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                ← {prevPage.title}
              </span>
            </Link>
          ) : (
            <div className="opacity-0 cursor-default" />
          )}
        </div>

        <div className="text-xs text-zinc-500 font-medium">
          Page {currentIndex + 1} of {siblingPages.length}
        </div>

        <div>
          {nextPage ? (
            <Link 
              href={`/books/${resolvedParams.bookId}/${resolvedParams.chapterId}/${nextPage.id}`}
              className="flex flex-col items-end group hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Next Page</span>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {nextPage.title} →
              </span>
            </Link>
          ) : (
            <div className="opacity-0 cursor-default" />
          )}
        </div>
      </div>

      {readingMode && (
        <ReadingToolbar 
          fontSize={fontSize}
          onFontSizeChange={handleFontSizeChange}
          onExit={() => setReadingMode(false)}
          showExit={!isMobileDevice}
        />
      )}
    </div>
  );
}
