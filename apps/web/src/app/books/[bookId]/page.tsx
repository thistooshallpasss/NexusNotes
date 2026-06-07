'use client';

import { use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { API_URL } from '@/lib/apiClient';
import Link from 'next/link';
import { Book as BookIcon } from 'lucide-react';


export default function BookLandingPage({ params }: { params: Promise<{ bookId: string }> }) {
  const resolvedParams = use(params);
  const queryClient = useQueryClient();

  const { data: book, isLoading } = useQuery({
    queryKey: ['book', resolvedParams.bookId],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/books/${resolvedParams.bookId}`);
      return res.data;
    }
  });

  const updateBookMutation = useMutation({
    mutationFn: async (updatedFields: any) => {
      const res = await axios.put(`${API_URL}/books/${resolvedParams.bookId}`, updatedFields);
      return res.data;
    },
    onMutate: async (updatedFields) => {
      await queryClient.cancelQueries({ queryKey: ['book', resolvedParams.bookId] });
      const previous = queryClient.getQueryData(['book', resolvedParams.bookId]);
      queryClient.setQueryData(['book', resolvedParams.bookId], (old: any) => ({
        ...old,
        ...updatedFields
      }));
      return { previous };
    },
    onError: (err, vars, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(['book', resolvedParams.bookId], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book', resolvedParams.bookId] });
      queryClient.invalidateQueries({ queryKey: ['booksTree'] });
    }
  });

  if (isLoading) return <div className="p-8 text-zinc-500 animate-pulse">Loading book...</div>;
  if (!book) return <div className="p-8 text-zinc-500">Book not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium mb-6">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-zinc-800 dark:text-zinc-200">{book.name}</span>
      </nav>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0">
            <BookIcon size={24} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">{book.name}</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Favorite Toggle */}
          <button
            onClick={() => updateBookMutation.mutate({ isFavorite: !book.isFavorite })}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer ${
              book.isFavorite 
                ? 'bg-yellow-50 border-yellow-200 text-yellow-500 dark:bg-yellow-950/20 dark:border-yellow-900/50' 
                : 'bg-white hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-800'
            }`}
            title={book.isFavorite ? 'Unfavorite' : 'Favorite'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={book.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </button>

          {/* Important Toggle */}
          <button
            onClick={() => updateBookMutation.mutate({ isImportant: !book.isImportant })}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer ${
              book.isImportant 
                ? 'bg-orange-50 border-orange-200 text-orange-500 dark:bg-orange-950/20 dark:border-orange-900/50' 
                : 'bg-white hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-800'
            }`}
            title={book.isImportant ? 'Unmark Important' : 'Mark Important'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={book.isImportant ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
          </button>

          {/* Pin Toggle */}
          <button
            onClick={() => updateBookMutation.mutate({ isPinned: !book.isPinned })}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer ${
              book.isPinned 
                ? 'bg-blue-50 border-blue-200 text-blue-500 dark:bg-blue-950/20 dark:border-blue-900/50' 
                : 'bg-white hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-800'
            }`}
            title={book.isPinned ? 'Unpin' : 'Pin'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={book.isPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="17" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-.44-1.24l-2.78-3.5A2 2 0 0 1 15 9.26V5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4.26a2 2 0 0 1-.78 1.24l-2.78-3.5a2 2 0 0 0-.44 1.24z"/></svg>
          </button>
        </div>
      </div>
      
      <p className="text-zinc-600 dark:text-zinc-400 mb-10">{book.desc || 'No description provided for this book.'}</p>

      <h2 className="text-xl font-semibold mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-2">Chapters</h2>
      
      {(!book.chapters || book.chapters.length === 0) ? (
        <p className="text-zinc-500">No chapters yet. Use the sidebar to create one!</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {book.chapters.map((chapter: any) => (
            <Link key={chapter.id} href={`/books/${book.id}/${chapter.id}`}>
              <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 hover:shadow-sm transition-all bg-white dark:bg-zinc-900">
                <h3 className="font-medium text-lg">{chapter.title}</h3>
                <p className="text-xs text-zinc-500 mt-2">View pages in this chapter &rarr;</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
