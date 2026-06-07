'use client';

import { use, useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { API_URL } from '@/lib/apiClient';
import { Brain, Star, ChevronDown, ChevronUp, Plus, Edit3, Trash2, Filter, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';


export default function QAPage({ params }: { params: Promise<{ bookId: string }> }) {
  const resolvedParams = use(params);
  const queryClient = useQueryClient();
  
  // State for Add Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);

  // Form Fields
  const [questionText, setQuestionText] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [companies, setCompanies] = useState('');
  const [tags, setTags] = useState('');

  // Filters State
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterFavoriteOnly, setFilterFavoriteOnly] = useState(false);

  // Delete Confirmation State
  const [deleteConfirmQuestion, setDeleteConfirmQuestion] = useState<any>(null);
  const [revealAll, setRevealAll] = useState(false);

  // Synchronize edit fields when editingQuestion changes
  useEffect(() => {
    if (editingQuestion) {
      setQuestionText(editingQuestion.question);
      setAnswerText(editingQuestion.answer || '');
      setDifficulty(editingQuestion.difficulty || 'Easy');
      setCompanies(editingQuestion.companies || '');
      setTags(editingQuestion.tags || '');
    } else {
      setQuestionText('');
      setAnswerText('');
      setDifficulty('Easy');
      setCompanies('');
      setTags('');
    }
  }, [editingQuestion]);

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['questions', resolvedParams.bookId],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/questions/book/${resolvedParams.bookId}`);
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

  // Mutations
  const createQuestionMutation = useMutation({
    mutationFn: async (data: any) => 
      axios.post(`${API_URL}/questions`, { ...data, bookId: resolvedParams.bookId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', resolvedParams.bookId] });
      setIsAddModalOpen(false);
      setQuestionText('');
      setAnswerText('');
      setDifficulty('Easy');
      setCompanies('');
      setTags('');
    }
  });

  const updateQuestionMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => 
      axios.put(`${API_URL}/questions/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', resolvedParams.bookId] });
      setEditingQuestion(null);
      setTags('');
    }
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: string) => 
      axios.delete(`${API_URL}/questions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', resolvedParams.bookId] });
      setDeleteConfirmQuestion(null);
    }
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => 
      axios.put(`${API_URL}/questions/${id}`, { isFavorite }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', resolvedParams.bookId] });
    }
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    createQuestionMutation.mutate({
      question: questionText,
      answer: answerText,
      difficulty,
      companies,
      tags
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion || !questionText.trim()) return;
    updateQuestionMutation.mutate({
      id: editingQuestion.id,
      question: questionText,
      answer: answerText,
      difficulty,
      companies,
      tags
    });
  };

  // Filter logic — memoized so it only re-filters when questions or filter values change
  const filteredQuestions = useMemo(() => questions.filter((q: any) => {
    if (filterDifficulty !== 'all' && q.difficulty !== filterDifficulty) return false;
    if (filterFavoriteOnly && !q.isFavorite) return false;
    if (filterCompany.trim()) {
      const term = filterCompany.toLowerCase().trim();
      const qCompanies = q.companies ? q.companies.toLowerCase().split(',').map((c: string) => c.trim()) : [];
      if (!qCompanies.some((c: string) => c.includes(term))) {
        return false;
      }
    }
    return true;
  }), [questions, filterDifficulty, filterFavoriteOnly, filterCompany]);

  if (isLoading) return <div className="p-8 text-zinc-500 animate-pulse">Loading Q&A...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Brain size={24} />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Interactive Q&A</h1>
            {book && <p className="text-zinc-500 mt-1">Practice questions for {book.name}</p>}
          </div>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 cursor-pointer shadow-sm">
          <Plus size={16} /> Add Question
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 mb-8 text-sm">
        <div className="flex items-center gap-2 text-zinc-500">
          <Filter size={16} />
          <span className="font-medium">Filter by</span>
        </div>
        
        {/* Difficulty Filter */}
        <select
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value)}
          className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
        >
          <option value="all">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        {/* Company Filter */}
        <Input
          placeholder="Filter by company..."
          value={filterCompany}
          onChange={(e) => setFilterCompany(e.target.value)}
          className="max-w-[200px] h-9 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none"
        />

        {/* Favorites Switch */}
        <button
          onClick={() => setFilterFavoriteOnly(!filterFavoriteOnly)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer text-xs font-medium ${
            filterFavoriteOnly 
              ? 'bg-yellow-50 border-yellow-250 text-yellow-600 dark:bg-yellow-950/20 dark:border-yellow-900/50 dark:text-yellow-400' 
              : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900'
          }`}
        >
          <Star size={14} className={filterFavoriteOnly ? 'fill-yellow-400 text-yellow-500' : ''} />
          Favorites Only
        </button>

        {/* Reveal/Hide All Button */}
        <button
          onClick={() => setRevealAll(!revealAll)}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 transition-colors cursor-pointer text-xs font-medium"
        >
          {revealAll ? 'Hide All Answers' : 'Reveal All Answers'}
        </button>
      </div>

      {/* Questions list */}
      {filteredQuestions.length === 0 ? (
        <div className="bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center">
          <p className="text-zinc-500">No questions match your current filters. Add some or clear filters!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredQuestions.map((q: any) => (
            <Flashcard 
              key={q.id} 
              question={q} 
              onEdit={() => setEditingQuestion(q)}
              onDelete={() => setDeleteConfirmQuestion(q)}
              onToggleFavorite={() => toggleFavoriteMutation.mutate({ id: q.id, isFavorite: !q.isFavorite })}
              forceOpen={revealAll}
            />
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Question</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Question</label>
              <Input 
                placeholder="e.g. What is the difference between processes and threads?" 
                value={questionText}
                onChange={e => setQuestionText(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Answer</label>
              <Textarea 
                placeholder="Explain the answer in detail..." 
                value={answerText}
                onChange={e => setAnswerText(e.target.value)}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-2 focus:outline-none cursor-pointer"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Companies</label>
                <Input 
                  placeholder="e.g. HSBC, Google" 
                  value={companies}
                  onChange={e => setCompanies(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Tags (comma-separated)</label>
              <Input 
                placeholder="e.g. dynamic programming, graphs, trees" 
                value={tags}
                onChange={e => setTags(e.target.value)}
              />
            </div>
            {createQuestionMutation.isError && (
              <p className="text-xs font-semibold text-red-600 bg-red-50/50 dark:bg-red-950/15 py-1.5 px-3 rounded-lg border border-red-200/40 dark:border-red-900/40">
                {(createQuestionMutation.error as any)?.response?.data?.error || 'Failed to create question.'}
              </p>
            )}
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createQuestionMutation.isPending} className="flex items-center gap-2">
                {createQuestionMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                {createQuestionMutation.isPending ? 'Adding...' : 'Add Question'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editingQuestion !== null} onOpenChange={(open) => !open && setEditingQuestion(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Question</label>
              <Input 
                placeholder="e.g. What is the difference between processes and threads?" 
                value={questionText}
                onChange={e => setQuestionText(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Answer</label>
              <Textarea 
                placeholder="Explain the answer in detail..." 
                value={answerText}
                onChange={e => setAnswerText(e.target.value)}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-2 focus:outline-none cursor-pointer"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Companies</label>
                <Input 
                  placeholder="e.g. HSBC, Google" 
                  value={companies}
                  onChange={e => setCompanies(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Tags (comma-separated)</label>
              <Input 
                placeholder="e.g. dynamic programming, graphs, trees" 
                value={tags}
                onChange={e => setTags(e.target.value)}
              />
            </div>
            {updateQuestionMutation.isError && (
              <p className="text-xs font-semibold text-red-600 bg-red-50/50 dark:bg-red-950/15 py-1.5 px-3 rounded-lg border border-red-200/40 dark:border-red-900/40">
                {(updateQuestionMutation.error as any)?.response?.data?.error || 'Failed to update question.'}
              </p>
            )}
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setEditingQuestion(null)}>Cancel</Button>
              <Button type="submit" disabled={updateQuestionMutation.isPending} className="flex items-center gap-2">
                {updateQuestionMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                {updateQuestionMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmQuestion !== null} onOpenChange={(open) => !open && setDeleteConfirmQuestion(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Question</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-zinc-600 dark:text-zinc-400">
            Are you sure you want to delete this question? This action cannot be undone.
          </div>
          {deleteQuestionMutation.isError && (
            <p className="text-xs font-semibold text-red-600 bg-red-50/50 dark:bg-red-950/15 py-1.5 px-3 rounded-lg border border-red-200/40 dark:border-red-900/40 mb-4">
              {(deleteQuestionMutation.error as any)?.response?.data?.error || 'Failed to delete question.'}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmQuestion(null)}>Cancel</Button>
            <Button 
              variant="destructive"
              onClick={() => {
                if (deleteConfirmQuestion) {
                  deleteQuestionMutation.mutate(deleteConfirmQuestion.id);
                }
              }}
              disabled={deleteQuestionMutation.isPending}
              className="flex items-center gap-2"
            >
              {deleteQuestionMutation.isPending && <Loader2 size={16} className="animate-spin" />}
              {deleteQuestionMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface FlashcardProps {
  question: any;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  forceOpen?: boolean;
}

function Flashcard({ question, onEdit, onDelete, onToggleFavorite, forceOpen }: FlashcardProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (forceOpen !== undefined) {
      setIsOpen(forceOpen);
    }
  }, [forceOpen]);

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 shadow-sm transition-all hover:border-indigo-300 dark:hover:border-indigo-700/50">
      {/* Front of card (Question) */}
      <div 
        className="p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {question.difficulty && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                question.difficulty.toLowerCase() === 'easy' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                question.difficulty.toLowerCase() === 'medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {question.difficulty}
              </span>
            )}
            {question.companies && question.companies.split(',').map((company: string) => {
              const trimmed = company.trim();
              if (!trimmed) return null;
              return (
                <span key={trimmed} className="text-xs font-medium bg-zinc-100 text-zinc-650 dark:bg-zinc-800 dark:text-zinc-400 px-2 py-0.5 rounded">
                  {trimmed}
                </span>
              );
            })}
            {question.tags && question.tags.split(',').map((tag: string) => {
              const trimmed = tag.trim();
              if (!trimmed) return null;
              return (
                <span key={trimmed} className="text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 px-2 py-0.5 rounded border border-indigo-200/30 dark:border-indigo-900/30">
                  {trimmed}
                </span>
              );
            })}
          </div>
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">{question.question}</h3>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0" onClick={e => e.stopPropagation()}>
          <button 
            onClick={onToggleFavorite} 
            className="p-1.5 rounded-lg text-zinc-400 hover:text-yellow-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            title={question.isFavorite ? 'Unfavorite' : 'Favorite'}
          >
            <Star size={16} className={question.isFavorite ? 'text-yellow-400 fill-yellow-400' : ''} />
          </button>
          
          <button 
            onClick={onEdit} 
            className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            title="Edit Question"
          >
            <Edit3 size={16} />
          </button>

          <button 
            onClick={onDelete} 
            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            title="Delete Question"
          >
            <Trash2 size={16} />
          </button>

          <div 
            onClick={() => setIsOpen(!isOpen)}
            className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </div>

      {/* Back of card (Answer) */}
      {isOpen && (
        <div className="px-6 py-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <h4 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-2 uppercase tracking-wider">Answer</h4>
          <div className="text-zinc-700 dark:text-zinc-300 prose prose-zinc dark:prose-invert max-w-none">
            {question.answer ? (
              <p className="whitespace-pre-wrap">{question.answer}</p>
            ) : (
              <p className="italic text-zinc-500">No answer provided.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
