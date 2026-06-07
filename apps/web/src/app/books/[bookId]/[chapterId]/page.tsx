'use client';

import { use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { API_URL } from '@/lib/apiClient';
import Link from 'next/link';
import { FolderTree, FileText } from 'lucide-react';


export default function ChapterLandingPage({ params }: { params: Promise<{ bookId: string, chapterId: string }> }) {
  const resolvedParams = use(params);
  const queryClient = useQueryClient();

  const { data: chapter, isLoading } = useQuery({
    queryKey: ['chapter', resolvedParams.chapterId],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/chapters/${resolvedParams.chapterId}`);
      return res.data;
    }
  });

  const { data: book } = useQuery({
    queryKey: ['book', resolvedParams.bookId],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/books/${resolvedParams.bookId}`);
      return res.data;
    }
  });

  const updateChapterMutation = useMutation({
    mutationFn: async (updatedFields: any) => {
      const res = await axios.put(`${API_URL}/chapters/${resolvedParams.chapterId}`, updatedFields);
      return res.data;
    },
    onMutate: async (updatedFields) => {
      await queryClient.cancelQueries({ queryKey: ['chapter', resolvedParams.chapterId] });
      const previous = queryClient.getQueryData(['chapter', resolvedParams.chapterId]);
      queryClient.setQueryData(['chapter', resolvedParams.chapterId], (old: any) => ({
        ...old,
        ...updatedFields
      }));
      return { previous };
    },
    onError: (err, vars, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(['chapter', resolvedParams.chapterId], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapter', resolvedParams.chapterId] });
      queryClient.invalidateQueries({ queryKey: ['booksTree'] });
    }
  });

  if (isLoading) return <div className="p-8 text-zinc-500 animate-pulse">Loading chapter...</div>;
  if (!chapter) return <div className="p-8 text-zinc-500">Chapter not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium mb-6">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Home</Link>
        <span>/</span>
        {book && (
          <>
            <Link href={`/books/${resolvedParams.bookId}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{book.name}</Link>
            <span>/</span>
          </>
        )}
        <span className="text-zinc-800 dark:text-zinc-200">{chapter.title}</span>
      </nav>
      <div className="flex items-center justify-between gap-3 mb-10">
        <div className="flex items-center gap-3">
          <FolderTree size={32} className="text-indigo-500" />
          <h1 className="text-4xl font-bold tracking-tight">{chapter.title}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Favorite Toggle */}
          <button
            onClick={() => updateChapterMutation.mutate({ isFavorite: !chapter.isFavorite })}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer ${
              chapter.isFavorite 
                ? 'bg-yellow-50 border-yellow-200 text-yellow-500 dark:bg-yellow-950/20 dark:border-yellow-900/50' 
                : 'bg-white hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-800'
            }`}
            title={chapter.isFavorite ? 'Unfavorite' : 'Favorite'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={chapter.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </button>

          {/* Important Toggle */}
          <button
            onClick={() => updateChapterMutation.mutate({ isImportant: !chapter.isImportant })}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer ${
              chapter.isImportant 
                ? 'bg-orange-50 border-orange-200 text-orange-500 dark:bg-orange-950/20 dark:border-orange-900/50' 
                : 'bg-white hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-800'
            }`}
            title={chapter.isImportant ? 'Unmark Important' : 'Mark Important'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={chapter.isImportant ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
          </button>

          {/* Pin Toggle */}
          <button
            onClick={() => updateChapterMutation.mutate({ isPinned: !chapter.isPinned })}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer ${
              chapter.isPinned 
                ? 'bg-blue-50 border-blue-200 text-blue-500 dark:bg-blue-950/20 dark:border-blue-900/50' 
                : 'bg-white hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-800'
            }`}
            title={chapter.isPinned ? 'Unpin' : 'Pin'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={chapter.isPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="17" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-.44-1.24l-2.78-3.5A2 2 0 0 1 15 9.26V5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4.26a2 2 0 0 1-.78 1.24l-2.78 3.5a2 2 0 0 0-.44 1.24z"/></svg>
          </button>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-2">Pages</h2>
      
      {(!chapter.pages || chapter.pages.length === 0) ? (
        <p className="text-zinc-500">No pages yet. Use the sidebar to create your first note!</p>
      ) : (
        <div className="space-y-3">
          {chapter.pages.map((page: any) => (
            <Link key={page.id} href={`/books/${resolvedParams.bookId}/${chapter.id}/${page.id}`}>
              <div className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors bg-white dark:bg-zinc-900 shadow-sm group">
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-zinc-400 group-hover:text-indigo-500" />
                  <div>
                    <h3 className="font-medium text-lg group-hover:text-indigo-700 dark:group-hover:text-indigo-300">{page.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-1.5 items-center">
                      {page.isFavorite && <span className="text-xs font-medium bg-yellow-50 text-yellow-600 dark:bg-yellow-950/20 dark:text-yellow-400 border border-yellow-200/30 dark:border-yellow-900/30 px-2 py-0.5 rounded">Favorite</span>}
                      {page.type && <span className="text-xs font-semibold bg-zinc-150 text-zinc-650 dark:bg-zinc-800 dark:text-zinc-350 px-2 py-0.5 rounded uppercase tracking-wider">{page.type}</span>}
                      {page.difficulty && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          page.difficulty.toLowerCase() === 'easy' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-250/30' :
                          page.difficulty.toLowerCase() === 'medium' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-250/30' :
                          'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-250/30'
                        }`}>
                          {page.difficulty}
                        </span>
                      )}
                      {page.pageTags && page.pageTags.map((pt: any) => (
                        <span 
                          key={pt.tag.id} 
                          className="text-xs font-semibold px-2 py-0.5 rounded border border-indigo-200/30 dark:border-indigo-900/30 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400"
                        >
                          {pt.tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-zinc-400 group-hover:text-indigo-500 transition-colors">
                  &rarr;
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
