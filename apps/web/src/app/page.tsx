'use client';

import { useState, useEffect, Suspense } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { API_URL } from '@/lib/apiClient';
import { Book, FileText, Pin, Trash2, Calendar, Plus, Filter, LayoutGrid, Star, Clock, Loader2, GripVertical } from 'lucide-react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearchParams, useRouter } from 'next/navigation';
import BlockEditor from '@/components/editor/BlockEditor';
import { serializeToMarkdown } from '@/lib/markdownSerializer';

const NOTE_TYPES = ['Daily', 'Quick', 'Todo', 'Ideas', 'Interview', 'Internship'];

const NOTE_TYPE_STYLES: Record<string, string> = {
  Todo: 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400',
  Daily: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400',
  Interview: 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400',
  Quick: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400',
  Ideas: 'bg-violet-50 text-violet-700 dark:bg-violet-950/20 dark:text-violet-400',
  Internship: 'bg-pink-50 text-pink-700 dark:bg-pink-950/20 dark:text-pink-400'
};

function DashboardContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeNote, setActiveNote] = useState<any>(null);
  const [deleteConfirmNote, setDeleteConfirmNote] = useState<any>(null);

  // Form Fields
  const [noteTitle, setNoteTitle] = useState('');
  const [noteType, setNoteType] = useState('Quick');

  // Filter state
  const [filterType, setFilterType] = useState('All');

  // Fetch Notes
  const { data: notes, isLoading: isLoadingNotes } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/notes`);
      return res.data;
    }
  });

  // Fetch Stats
  const { data: stats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/dashboard/stats`);
      return res.data;
    },
    retry: 3
  });

  const [localNotes, setLocalNotes] = useState<any[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Sync localNotes when query data loads
  useEffect(() => {
    if (notes) {
      setLocalNotes(notes);
    }
  }, [notes]);

  // Pages Explorer States
  const [explorerSearch, setExplorerSearch] = useState('');
  const [explorerDifficulty, setExplorerDifficulty] = useState('All');
  const [explorerType, setExplorerType] = useState('All');
  const [explorerTagId, setExplorerTagId] = useState('All');

  // Fetch Tags
  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/tags`);
      return res.data;
    }
  });

  // Fetch Filtered Pages
  const { data: explorerPages = [], isLoading: isLoadingExplorer } = useQuery({
    queryKey: ['explorerPages', explorerSearch, explorerDifficulty, explorerType, explorerTagId],
    queryFn: async () => {
      const params: any = {};
      if (explorerSearch.trim()) params.search = explorerSearch;
      if (explorerDifficulty !== 'All') params.difficulty = explorerDifficulty;
      if (explorerType !== 'All') params.type = explorerType.toLowerCase();
      if (explorerTagId !== 'All') params.tagId = explorerTagId;

      const res = await axios.get(`${API_URL}/pages`, { params });
      return res.data;
    }
  });

  // Auto-open note if noteId is in search params
  const noteIdParam = searchParams.get('noteId');
  useEffect(() => {
    if (noteIdParam && notes && notes.length > 0 && !activeNote) {
      const found = notes.find((n: any) => n.id === noteIdParam);
      if (found) {
        setActiveNote(JSON.parse(JSON.stringify(found)));
      }
    }
  }, [noteIdParam, notes, activeNote]);

  const handleCloseNote = () => {
    setActiveNote(null);
    router.replace('/');
  };

  // Mutations
  const createNoteMutation = useMutation({
    mutationFn: async (data: any) => axios.post(`${API_URL}/notes`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      setIsAddModalOpen(false);
      setNoteTitle('');
      setNoteType('Quick');
    }
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await axios.put(`${API_URL}/notes/${id}`, data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      // Keep activeNote synced with the server response
      setActiveNote((prev: any) => (prev && prev.id === data.id ? { ...prev, ...data } : prev));
    }
  });

  const togglePinMutation = useMutation({
    mutationFn: async (id: string) => axios.patch(`${API_URL}/notes/${id}/pin`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    }
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => axios.delete(`${API_URL}/notes/${id}`),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      if (activeNote?.id === id) handleCloseNote();
      setDeleteConfirmNote(null);
    }
  });

  const reorderNotesMutation = useMutation({
    mutationFn: async (ids: string[]) => axios.put(`${API_URL}/notes/reorder`, { ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    }
  });

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;
    createNoteMutation.mutate({
      title: noteTitle,
      type: noteType,
      content: {}
    });
  };

  const filteredNotes = localNotes.filter((n: any) => {
    if (filterType !== 'All' && n.type !== filterType) return false;
    return true;
  });

  return (
    <div className="space-y-10 pb-20">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Book size={22} />
          </div>
          <div>
            <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Total Books</span>
            <span className="text-2xl font-bold">{stats?.totalBooks ?? '-'}</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <FileText size={22} />
          </div>
          <div>
            <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Total Pages</span>
            <span className="text-2xl font-bold">{stats?.totalPages ?? '-'}</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Pin size={22} />
          </div>
          <div>
            <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Quick Notes</span>
            <span className="text-2xl font-bold">{(notes || []).length}</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <Calendar size={22} />
          </div>
          <div>
            <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">High Priority</span>
            <span className="text-2xl font-bold">{stats?.highPriorityPages ?? '-'}</span>
          </div>
        </div>
      </div>

      {/* Favorites & Recently Updated Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Favorites Widget */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-100 dark:border-zinc-900 pb-3">
            <div className="flex items-center gap-2">
              <Star className="text-amber-500 fill-amber-500" size={18} />
              <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-100">Favorite Pages</h2>
            </div>
            <span className="text-xs bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 px-2.5 py-0.5 rounded-full font-medium">
              {stats?.favorites?.length ?? 0} Saved
            </span>
          </div>
          {stats?.favorites && stats.favorites.length > 0 ? (
            <div className="space-y-3 flex-1">
              {stats.favorites.map((page: any) => (
                <Link
                  key={page.id}
                  href={`/books/${page.chapter?.book?.id}/${page.chapterId}/${page.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center shrink-0 border border-zinc-100 dark:border-zinc-800">
                      <FileText size={14} className="text-zinc-500 group-hover:text-amber-500 transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 block truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {page.title}
                      </span>
                      <span className="text-[11px] text-zinc-400 dark:text-zinc-500 block truncate">
                        {page.chapter?.book?.name} • {page.chapter?.title}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                      page.difficulty === 'Hard' ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400' :
                      page.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400' :
                      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                    }`}>
                      {page.difficulty || 'Easy'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center text-zinc-500 dark:text-zinc-600">
              <Star size={24} className="mb-2 text-zinc-300 dark:text-zinc-800" />
              <p className="text-xs">No favorite pages saved yet.</p>
            </div>
          )}
        </div>

        {/* Recently Updated Widget */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-100 dark:border-zinc-900 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="text-blue-500" size={18} />
              <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-100">Recently Updated</h2>
            </div>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
              Last modified
            </span>
          </div>
          {stats?.recentlyUpdated && stats.recentlyUpdated.length > 0 ? (
            <div className="space-y-3 flex-1">
              {stats.recentlyUpdated.map((page: any) => (
                <Link
                  key={page.id}
                  href={`/books/${page.chapter?.book?.id}/${page.chapterId}/${page.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center shrink-0 border border-zinc-100 dark:border-zinc-800">
                      <Clock size={14} className="text-zinc-500 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 block truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {page.title}
                      </span>
                      <span className="text-[11px] text-zinc-400 dark:text-zinc-500 block truncate">
                        {page.chapter?.book?.name} • {page.chapter?.title}
                      </span>
                    </div>
                  </div>
                  <div className="text-[10px] text-zinc-400 dark:text-zinc-500 shrink-0 ml-2 font-medium">
                    {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric'
                    }) : '-'}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center text-zinc-500 dark:text-zinc-600">
              <Clock size={24} className="mb-2 text-zinc-300 dark:text-zinc-800" />
              <p className="text-xs">No pages updated recently.</p>
            </div>
          )}
        </div>
      </div>

      {/* Pages Explorer (Global Filters) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Pages Explorer</h2>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
            Search and filter all notebook pages globally by tag, difficulty, and type.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Search Title / Company</span>
            <Input 
              placeholder="e.g. Two Sum, Google..." 
              value={explorerSearch}
              onChange={e => setExplorerSearch(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Difficulty</span>
            <select
              value={explorerDifficulty}
              onChange={e => setExplorerDifficulty(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-2.5 text-sm focus:outline-none cursor-pointer"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Page Type</span>
            <select
              value={explorerType}
              onChange={e => setExplorerType(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-2.5 text-sm focus:outline-none cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Theory">Theory</option>
              <option value="DSA">DSA</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Tag Filter</span>
            <select
              value={explorerTagId}
              onChange={e => setExplorerTagId(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-2.5 text-sm focus:outline-none cursor-pointer"
            >
              <option value="All">All Tags</option>
              {tags.map((tag: any) => (
                <option key={tag.id} value={tag.id}>{tag.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results List */}
        {isLoadingExplorer ? (
          <div className="space-y-3 py-6 animate-pulse">
            <div className="h-14 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200/40 dark:border-zinc-800/40"></div>
            <div className="h-14 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200/40 dark:border-zinc-800/40"></div>
          </div>
        ) : explorerPages.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/10">
            <p className="text-sm text-zinc-400 dark:text-zinc-500">No pages match the selected filter criteria.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {explorerPages.map((page: any) => (
              <Link 
                key={page.id} 
                href={`/books/${page.chapter?.book?.id}/${page.chapterId}/${page.id}`}
                className="flex flex-wrap items-center justify-between p-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-900 hover:border-zinc-200 dark:hover:border-zinc-800 bg-white dark:bg-zinc-950 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center shrink-0 border border-zinc-100 dark:border-zinc-800">
                    <FileText size={16} className="text-zinc-500 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 block truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {page.title}
                    </span>
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500 block truncate mt-0.5">
                      {page.chapter?.book?.name} &rsaquo; {page.chapter?.title}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  {page.pageTags?.map((pt: any) => (
                    <span 
                      key={pt.tag.id}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
                      style={{ 
                        backgroundColor: (pt.tag.color || '#71717a') + '15',
                        color: pt.tag.color || '#71717a',
                        border: `1px solid ${pt.tag.color || '#71717a'}25`
                      }}
                    >
                      {pt.tag.name}
                    </span>
                  ))}

                  <span className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded shrink-0 ${
                    page.difficulty === 'Hard' ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400' :
                    page.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400' :
                    'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                  }`}>
                    {page.difficulty || 'Easy'}
                  </span>

                  <span className="text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded uppercase tracking-wider text-zinc-500 shrink-0">
                    {page.type}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Control row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 text-sm">
            <button
              onClick={() => setFilterType('All')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filterType === 'All' 
                  ? 'bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              All Notes
            </button>
            {NOTE_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterType === type 
                    ? 'bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 cursor-pointer shadow-sm">
          <Plus size={16} /> New Note
        </Button>
      </div>

      {/* Notes Grid */}
      {isLoadingNotes ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          <div className="h-44 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800"></div>
          <div className="h-44 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800"></div>
          <div className="h-44 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800"></div>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="bg-zinc-50 dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-16 text-center">
          <p className="text-zinc-500 text-sm">No notes found. Create your first note to capture ideas!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredNotes.map((note: any) => (
            <div 
              key={note.id} 
              draggable={filterType === 'All'}
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', note.id);
                e.dataTransfer.effectAllowed = 'move';
                setDraggedId(note.id);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (draggedId && draggedId !== note.id) {
                  const fromIndex = localNotes.findIndex(n => n.id === draggedId);
                  const toIndex = localNotes.findIndex(n => n.id === note.id);
                  if (fromIndex !== -1 && toIndex !== -1) {
                    const updated = [...localNotes];
                    const [item] = updated.splice(fromIndex, 1);
                    updated.splice(toIndex, 0, item);
                    setLocalNotes(updated);
                  }
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                const orderedIds = localNotes.map(n => n.id);
                reorderNotesMutation.mutate(orderedIds);
                setDraggedId(null);
              }}
              onDragEnd={() => setDraggedId(null)}
              onClick={() => {
                const latest = (notes || []).find((n: any) => n.id === note.id) || note;
                setActiveNote(JSON.parse(JSON.stringify(latest)));
              }}
              className={`group relative flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-800/70 hover:border-indigo-300 dark:hover:border-indigo-800 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                draggedId === note.id ? 'opacity-40 border-dashed border-indigo-400' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded ${
                    NOTE_TYPE_STYLES[note.type] || 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}>
                    {note.type}
                  </span>
                  
                  {/* Pin, Drag and Delete Controls */}
                  <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                    {filterType === 'All' && (
                      <div 
                        className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-grab active:cursor-grabbing hover:bg-zinc-100 dark:hover:bg-zinc-900"
                        title="Drag to reorder"
                      >
                        <GripVertical size={13} />
                      </div>
                    )}
                    <button 
                      onClick={() => togglePinMutation.mutate(note.id)}
                      className={`p-1 rounded-md transition-colors cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 ${
                        note.isPinned ? 'text-indigo-500' : 'text-zinc-400 hover:text-zinc-700'
                      }`}
                      title={note.isPinned ? 'Unpin note' : 'Pin note'}
                    >
                      <Pin size={13} className={note.isPinned ? 'fill-indigo-500' : ''} />
                    </button>
                    <button 
                      onClick={() => setDeleteConfirmNote(note)}
                      className="p-1 rounded-md text-zinc-400 hover:text-red-600 transition-colors cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      title="Delete note"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {note.title}
                </h3>
              </div>

              <div className="mt-8 text-[11px] text-zinc-400 dark:text-zinc-500">
                {note.updatedAt ? new Date(note.updatedAt).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : '-'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Note</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateNote} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Title</label>
              <Input 
                placeholder="e.g. Daily Reflection, Project Ideas" 
                value={noteTitle}
                onChange={e => setNoteTitle(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Type</label>
              <select
                value={noteType}
                onChange={e => setNoteType(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-2.5 focus:outline-none cursor-pointer"
              >
                {NOTE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createNoteMutation.isPending} className="flex items-center gap-2">
                {createNoteMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                {createNoteMutation.isPending ? 'Creating...' : 'Create Note'}
              </Button>
            </DialogFooter>
            {createNoteMutation.isError && (
              <p className="text-xs font-semibold text-red-600 bg-red-50/50 dark:bg-red-950/15 py-1.5 px-3 rounded-lg border border-red-200/40 dark:border-red-900/40 mt-3">
                {(createNoteMutation.error as any)?.response?.data?.error || 'Failed to create note.'}
              </p>
            )}
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Editor Dialog */}
      <Dialog open={activeNote !== null} onOpenChange={(open) => !open && handleCloseNote()}>
        <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-6 overflow-hidden">
          <DialogHeader className="shrink-0 border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <select
                value={activeNote?.type || 'Quick'}
                onChange={(e) => {
                  updateNoteMutation.mutate({ id: activeNote.id, type: e.target.value });
                }}
                className="bg-zinc-100 dark:bg-zinc-800 border-none outline-none font-semibold text-xs uppercase px-2.5 py-1 rounded cursor-pointer"
              >
                {NOTE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              
              <input
                className="flex-1 text-xl font-bold bg-transparent border-none outline-none focus:ring-0 focus:bg-zinc-100/50 dark:focus:bg-zinc-800/30 px-2 py-0.5 rounded transition-colors"
                value={activeNote?.title || ''}
                onChange={(e) => {
                  const updated = { ...activeNote, title: e.target.value };
                  setActiveNote(updated);
                }}
                onBlur={() => {
                  if (activeNote?.title.trim()) {
                    updateNoteMutation.mutate({ id: activeNote.id, title: activeNote.title.trim() });
                  }
                }}
                placeholder="Note title..."
              />

              {/* Note Export buttons */}
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (activeNote?.content) {
                      const markdown = serializeToMarkdown(activeNote.content);
                      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute('download', `${activeNote.title.toLowerCase().replace(/\s+/g, '-')}.md`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                    }
                  }}
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
            {updateNoteMutation.isError && (
              <p className="text-xs font-semibold text-red-600 bg-red-50/50 dark:bg-red-950/15 py-1.5 px-3 rounded-lg border border-red-200/40 dark:border-red-900/40 mt-2">
                {(updateNoteMutation.error as any)?.response?.data?.error || 'Failed to save changes.'}
              </p>
            )}
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pt-4">
            {activeNote && (
              <BlockEditor
                key={activeNote.id}
                initialContent={activeNote.content && Object.keys(activeNote.content).length > 0 ? activeNote.content : undefined}
                onSave={(content) => {
                  updateNoteMutation.mutate({ id: activeNote.id, content });
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmNote !== null} onOpenChange={(open) => !open && setDeleteConfirmNote(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Note</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-zinc-600 dark:text-zinc-400">
            Are you sure you want to delete <strong className="text-zinc-800 dark:text-zinc-200">"{deleteConfirmNote?.title}"</strong>? This action cannot be undone.
          </div>
          {deleteNoteMutation.isError && (
            <p className="text-xs font-semibold text-red-600 bg-red-50/50 dark:bg-red-950/15 py-1.5 px-3 rounded-lg border border-red-200/40 dark:border-red-900/40 mb-4">
              {(deleteNoteMutation.error as any)?.response?.data?.error || 'Failed to delete note.'}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmNote(null)}>Cancel</Button>
            <Button 
              variant="destructive"
              onClick={() => {
                if (deleteConfirmNote) {
                  deleteNoteMutation.mutate(deleteConfirmNote.id);
                }
              }}
              disabled={deleteNoteMutation.isPending}
              className="flex items-center gap-2"
            >
              {deleteNoteMutation.isPending && <Loader2 size={16} className="animate-spin" />}
              {deleteNoteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function NotesDashboard() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500 animate-pulse">Loading dashboard content...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
