'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Book as BookIcon, Home, Settings, Search, Plus, FolderTree, FileText, Brain, Edit3, Trash, ChevronDown, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { API_URL } from '@/lib/apiClient';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';


export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [newBookName, setNewBookName] = useState('');
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newPageTitle, setNewPageTitle] = useState('');
  
  const { theme, setTheme, resolvedTheme } = useTheme();
  const currentTheme = theme === 'system' ? resolvedTheme : theme;
  
  const [collapsedBooks, setCollapsedBooks] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('collapsed_books');
        return saved ? JSON.parse(saved) : {};
      } catch (e) {
        return {};
      }
    }
    return {};
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('collapsed_books', JSON.stringify(collapsedBooks));
  }, [collapsedBooks]);

  const toggleTheme = () => {
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  };
  
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);

  // States for rename and delete operations
  const [renameTarget, setRenameTarget] = useState<{ id: string; type: 'book' | 'chapter' | 'page'; currentName: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'book' | 'chapter' | 'page'; name: string } | null>(null);
  const [renameVal, setRenameVal] = useState('');

  useEffect(() => {
    if (renameTarget) {
      setRenameVal(renameTarget.currentName);
    } else {
      setRenameVal('');
    }
  }, [renameTarget]);

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['booksTree'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/books/tree`);
      return res.data;
    }
  });

  const createBookMutation = useMutation({
    mutationFn: async (name: string) => axios.post(`${API_URL}/books`, { name, desc: '' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booksTree'] });
      setIsBookModalOpen(false);
      setNewBookName('');
    },
    onError: () => {} // error shown via mutation.isError
  });

  const createChapterMutation = useMutation({
    mutationFn: async ({ title, bookId }: { title: string, bookId: string }) => 
      axios.post(`${API_URL}/chapters`, { title, bookId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booksTree'] });
      setIsChapterModalOpen(false);
      setNewChapterTitle('');
    },
    onError: () => {}
  });

  const createPageMutation = useMutation({
    mutationFn: async ({ title, chapterId }: { title: string, chapterId: string }) => 
      axios.post(`${API_URL}/pages`, { title, chapterId, type: 'theory' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booksTree'] });
      setIsPageModalOpen(false);
      setNewPageTitle('');
    },
    onError: () => {}
  });

  const renameMutation = useMutation({
    mutationFn: async ({ id, type, name }: { id: string; type: 'book' | 'chapter' | 'page'; name: string }) => {
      if (type === 'book') {
        return axios.put(`${API_URL}/books/${id}`, { name });
      } else if (type === 'chapter') {
        return axios.put(`${API_URL}/chapters/${id}`, { title: name });
      } else {
        return axios.put(`${API_URL}/pages/${id}`, { title: name });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booksTree'] });
      queryClient.invalidateQueries({ queryKey: ['page'] });
      queryClient.invalidateQueries({ queryKey: ['book'] });
      setRenameTarget(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: 'book' | 'chapter' | 'page' }) => {
      if (type === 'book') {
        return axios.delete(`${API_URL}/books/${id}`);
      } else if (type === 'chapter') {
        return axios.delete(`${API_URL}/chapters/${id}`);
      } else {
        return axios.delete(`${API_URL}/pages/${id}`);
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['booksTree'] });
      setDeleteTarget(null);
      // Only redirect if the current URL path includes the deleted item's ID
      if (pathname.includes(variables.id)) {
        if (variables.type === 'book') {
          router.push('/');
        } else if (variables.type === 'chapter') {
          // Navigate to the book that contained this chapter
          const bookId = pathname.split('/')[2];
          if (bookId) router.push(`/books/${bookId}`);
          else router.push('/');
        } else {
          // Navigate to the chapter that contained this page
          const parts = pathname.split('/');
          const bookId = parts[2];
          const chapterId = parts[3];
          if (bookId && chapterId) router.push(`/books/${bookId}/${chapterId}`);
          else router.push('/');
        }
      }
    }
  });

  return (
    <aside className="w-64 flex flex-col bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 p-4 shrink-0 h-screen select-none">
      {/* Brand */}
      <div className="flex items-center gap-2 px-2 py-4 mb-4">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-500/20">
          <BookIcon size={18} />
        </div>
        <span className="font-semibold text-lg tracking-tight">NexusNotes</span>
      </div>

      {/* Primary Links */}
      <nav className="flex flex-col gap-1 mb-6">
        <Link 
          href="/" 
          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
            ${pathname === '/' ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}
        >
          <Home size={18} /> Home
        </Link>
        <button 
          onClick={() => window.dispatchEvent(new Event('trigger-search'))}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left w-full cursor-pointer"
        >
          <Search size={18} /> Search
        </button>
      </nav>

      {/* Books Tree */}
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="flex items-center justify-between px-2 mb-2 group">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Books</span>
          <button onClick={() => setIsBookModalOpen(true)} className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer">
            <Plus size={16} />
          </button>
        </div>
        
        {isLoading ? (
          <div className="px-2 py-4 text-sm text-zinc-500 animate-pulse">Loading tree...</div>
        ) : books.length === 0 ? (
          <div className="px-2 py-6 text-center">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center mx-auto mb-3">
              <BookIcon size={18} className="text-indigo-500" />
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-2.5">No books yet.</p>
            <button
              onClick={() => setIsBookModalOpen(true)}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              + Create your first book
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {books.map((book: any) => {
              const isExpanded = !collapsedBooks[book.id];
              return (
                <li key={book.id}>
                  <div className={`group flex items-center justify-between px-2 py-1.5 rounded-md text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 ${pathname === `/books/${book.id}` ? 'bg-zinc-100 dark:bg-zinc-900 font-medium' : ''}`}>
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCollapsedBooks(prev => ({ ...prev, [book.id]: !prev[book.id] })); }}
                        className="p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-250 cursor-pointer"
                        title={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        <ChevronDown size={14} className={`transform transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                      </button>
                      <Link href={`/books/${book.id}`} className="flex items-center gap-1.5 flex-1 min-w-0">
                        <FolderTree size={16} className="text-indigo-500 shrink-0" />
                        <span className="truncate">{book.name}</span>
                      </Link>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                      <button 
                        onClick={() => { setActiveBookId(book.id); setIsChapterModalOpen(true); }}
                        className="text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                        title="Add Chapter"
                      >
                        <Plus size={13} />
                      </button>
                      <button 
                        onClick={() => setRenameTarget({ id: book.id, type: 'book', currentName: book.name })}
                        className="text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer"
                        title="Rename Book"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button 
                        onClick={() => setDeleteTarget({ id: book.id, type: 'book', name: book.name })}
                        className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                        title="Delete Book"
                      >
                        <Trash size={13} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Nested chapters and Q&A */}
                  {isExpanded && (
                    <ul className="ml-5 space-y-1.5 mt-1 border-l border-zinc-200 dark:border-zinc-800 pl-2">
                      <li>
                        <Link 
                          href={`/books/${book.id}/qa`}
                          className={`flex items-center gap-1.5 px-2 py-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 truncate rounded ${pathname === `/books/${book.id}/qa` ? 'font-medium bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                        >
                          <Brain size={14} className="shrink-0" />
                          <span>Practice Q&A</span>
                        </Link>
                      </li>
                      
                      {book.chapters?.length > 0 && book.chapters.map((chapter: any) => (
                        <li key={chapter.id}>
                          <div className={`group flex items-center justify-between px-2 py-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 ${pathname === `/books/${book.id}/${chapter.id}` ? 'font-medium text-zinc-900 dark:text-zinc-100' : ''}`}>
                            <Link href={`/books/${book.id}/${chapter.id}`} className="truncate flex-1">
                              {chapter.title}
                            </Link>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                              <button 
                                onClick={() => { setActiveChapterId(chapter.id); setActiveBookId(book.id); setIsPageModalOpen(true); }}
                                className="text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                                title="Add Page"
                              >
                                <Plus size={11} />
                              </button>
                              <button 
                                onClick={() => setRenameTarget({ id: chapter.id, type: 'chapter', currentName: chapter.title })}
                                className="text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer"
                                title="Rename Chapter"
                              >
                                <Edit3 size={11} />
                              </button>
                              <button 
                                onClick={() => setDeleteTarget({ id: chapter.id, type: 'chapter', name: chapter.title })}
                                className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                                title="Delete Chapter"
                              >
                                <Trash size={11} />
                              </button>
                            </div>
                          </div>
                          
                          {/* Nested pages */}
                          {chapter.pages?.length > 0 && (
                            <ul className="ml-3.5 space-y-1 mt-1 border-l border-zinc-200 dark:border-zinc-800 pl-2">
                              {chapter.pages.map((page: any) => (
                                <li key={page.id}>
                                  <div className="group flex items-center justify-between w-full">
                                    <Link 
                                      href={`/books/${book.id}/${chapter.id}/${page.id}`}
                                      className={`flex items-center gap-1.5 px-2 py-1 text-xs hover:text-zinc-900 dark:hover:text-zinc-100 truncate flex-1 rounded ${pathname === `/books/${book.id}/${chapter.id}/${page.id}` ? 'font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'text-zinc-500 dark:text-zinc-400'}`}
                                    >
                                      <FileText size={12} className="shrink-0" />
                                      <span className="truncate">{page.title}</span>
                                    </Link>
                                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity pr-1 shrink-0">
                                      <button 
                                        onClick={() => setRenameTarget({ id: page.id, type: 'page', currentName: page.title })}
                                        className="text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer"
                                        title="Rename Page"
                                      >
                                        <Edit3 size={10} />
                                      </button>
                                      <button 
                                        onClick={() => setDeleteTarget({ id: page.id, type: 'page', name: page.title })}
                                        className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                                        title="Delete Page"
                                      >
                                        <Trash size={10} />
                                      </button>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer / Settings & Theme Toggle */}
      <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left flex-1 cursor-pointer"
        >
          <Settings size={18} /> Settings
        </button>
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
          title="Toggle Theme"
        >
          {currentTheme === 'dark' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          )}
        </button>
      </div>

      {/* Book Modal */}
      <Dialog open={isBookModalOpen} onOpenChange={setIsBookModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Book</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input 
              placeholder="e.g., Data Structures, System Design" 
              value={newBookName}
              onChange={e => setNewBookName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && newBookName && createBookMutation.mutate(newBookName)}
              autoFocus
            />
            {createBookMutation.isError && (
              <p className="text-xs font-semibold text-red-600 mt-2 bg-red-50/50 dark:bg-red-950/15 py-1.5 px-3 rounded-lg border border-red-200/40 dark:border-red-900/40">
                {(createBookMutation.error as any)?.response?.data?.error || 'Failed to create book.'}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => createBookMutation.mutate(newBookName)} 
              disabled={!newBookName || createBookMutation.isPending}
              className="flex items-center gap-2"
            >
              {createBookMutation.isPending && <Loader2 size={16} className="animate-spin" />}
              {createBookMutation.isPending ? 'Creating...' : 'Create Book'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chapter Modal */}
      <Dialog open={isChapterModalOpen} onOpenChange={setIsChapterModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Chapter</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input 
              placeholder="e.g., Arrays, Load Balancers" 
              value={newChapterTitle}
              onChange={e => setNewChapterTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && newChapterTitle && activeBookId && createChapterMutation.mutate({ title: newChapterTitle, bookId: activeBookId })}
              autoFocus
            />
            {createChapterMutation.isError && (
              <p className="text-xs font-semibold text-red-600 dark:text-red-400 mt-2 bg-red-50/50 dark:bg-red-950/15 py-1.5 px-3 rounded-lg border border-red-200/40 dark:border-red-900/40">
                {(createChapterMutation.error as any)?.response?.data?.error || 'Failed to create chapter.'}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChapterModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => activeBookId && createChapterMutation.mutate({ title: newChapterTitle, bookId: activeBookId })} 
              disabled={!newChapterTitle || createChapterMutation.isPending}
              className="flex items-center gap-2"
            >
              {createChapterMutation.isPending && <Loader2 size={16} className="animate-spin" />}
              {createChapterMutation.isPending ? 'Creating...' : 'Create Chapter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Page Modal */}
      <Dialog open={isPageModalOpen} onOpenChange={setIsPageModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Page</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input 
              placeholder="e.g., Two Sum, Consistent Hashing" 
              value={newPageTitle}
              onChange={e => setNewPageTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && newPageTitle && activeChapterId && createPageMutation.mutate({ title: newPageTitle, chapterId: activeChapterId })}
              autoFocus
            />
            {createPageMutation.isError && (
              <p className="text-xs font-semibold text-red-600 dark:text-red-400 mt-2 bg-red-50/50 dark:bg-red-950/15 py-1.5 px-3 rounded-lg border border-red-200/40 dark:border-red-900/40">
                {(createPageMutation.error as any)?.response?.data?.error || 'Failed to create page.'}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPageModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => activeChapterId && createPageMutation.mutate({ title: newPageTitle, chapterId: activeChapterId })} 
              disabled={!newPageTitle || createPageMutation.isPending}
              className="flex items-center gap-2"
            >
              {createPageMutation.isPending && <Loader2 size={16} className="animate-spin" />}
              {createPageMutation.isPending ? 'Creating...' : 'Create Page'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Universal Rename Modal */}
      <Dialog open={renameTarget !== null} onOpenChange={(open) => !open && setRenameTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename {renameTarget?.type === 'book' ? 'Book' : renameTarget?.type === 'chapter' ? 'Chapter' : 'Page'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input 
              placeholder="Enter new name" 
              value={renameVal}
              onChange={e => setRenameVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && renameVal && renameTarget && renameMutation.mutate({ id: renameTarget.id, type: renameTarget.type, name: renameVal })}
              autoFocus
            />
            {renameMutation.isError && (
              <p className="text-xs font-semibold text-red-600 bg-red-50/50 dark:bg-red-950/15 py-1.5 px-3 rounded-lg border border-red-200/40 dark:border-red-900/40 mt-2">
                {(renameMutation.error as any)?.response?.data?.error || 'Failed to rename item.'}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>Cancel</Button>
            <Button 
              onClick={() => renameTarget && renameMutation.mutate({ id: renameTarget.id, type: renameTarget.type, name: renameVal })} 
              disabled={!renameVal || renameMutation.isPending}
              className="flex items-center gap-2"
            >
              {renameMutation.isPending && <Loader2 size={14} className="animate-spin" />}
              {renameMutation.isPending ? 'Save Name' : 'Save Name'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Universal Delete Modal */}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete {deleteTarget?.type === 'book' ? 'Book' : deleteTarget?.type === 'chapter' ? 'Chapter' : 'Page'}</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-zinc-600 dark:text-zinc-400">
            Are you sure you want to delete <strong className="text-zinc-800 dark:text-zinc-200">"{deleteTarget?.name}"</strong>? This will permanently remove it and all of its contents. This action cannot be undone.
            {deleteMutation.isError && (
              <p className="text-xs font-semibold text-red-600 bg-red-50/50 dark:bg-red-950/15 py-1.5 px-3 rounded-lg border border-red-200/40 dark:border-red-900/40 mt-3">
                {(deleteMutation.error as any)?.response?.data?.error || 'Failed to delete item.'}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button 
              variant="destructive"
              onClick={() => deleteTarget && deleteMutation.mutate({ id: deleteTarget.id, type: deleteTarget.type })} 
              disabled={deleteMutation.isPending}
              className="flex items-center gap-2"
            >
              {deleteMutation.isPending && <Loader2 size={14} className="animate-spin" />}
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Security Passcode</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                Your application is unlocked using a secure passcode. To lock it again and require the passcode on next load, click "Lock Application" below.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  localStorage.removeItem('nexus_passcode');
                  window.location.reload();
                }}
                className="w-full text-red-600 hover:text-red-750 dark:text-red-400 border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/20 cursor-pointer font-medium"
              >
                Lock Application
              </Button>
            </div>
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3.5">
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">API Endpoint</h4>
              <p className="text-xs font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-900 p-2 rounded border border-zinc-200/50 dark:border-zinc-800/50">
                {API_URL}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsSettingsOpen(false)} className="cursor-pointer">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
