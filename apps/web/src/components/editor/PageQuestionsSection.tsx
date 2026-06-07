'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { API_URL } from '@/lib/apiClient';
import { Brain, Star, ChevronDown, ChevronUp, Plus, Edit3, Trash2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface PageQuestionsSectionProps {
  bookId: string;
  pageId: string;
}

export default function PageQuestionsSection({ bookId, pageId }: PageQuestionsSectionProps) {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [deleteConfirmQuestion, setDeleteConfirmQuestion] = useState<any>(null);
  const [revealAll, setRevealAll] = useState(false);

  // Form Fields
  const [questionText, setQuestionText] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [companies, setCompanies] = useState('');
  const [tags, setTags] = useState('');

  // Sync state with editing form
  useEffect(() => {
    if (editingQuestion) {
      setQuestionText(editingQuestion.question);
      setAnswerText(editingQuestion.answer || '');
      setDifficulty(editingQuestion.difficulty || 'Easy');
      setCompanies(editingQuestion.companies || '');
      setTags(editingQuestion.tags ? editingQuestion.tags.join(', ') : '');
    } else {
      setQuestionText('');
      setAnswerText('');
      setDifficulty('Easy');
      setCompanies('');
      setTags('');
    }
  }, [editingQuestion]);

  // Query questions for this specific page
  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['pageQuestions', pageId],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/questions/page/${pageId}`);
      return res.data;
    }
  });

  // Mutations
  const createQuestionMutation = useMutation({
    mutationFn: async (data: any) => 
      axios.post(`${API_URL}/questions`, { ...data, bookId, pageId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pageQuestions', pageId] });
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
      queryClient.invalidateQueries({ queryKey: ['pageQuestions', pageId] });
      setEditingQuestion(null);
    }
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: string) => 
      axios.delete(`${API_URL}/questions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pageQuestions', pageId] });
      setDeleteConfirmQuestion(null);
    }
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => 
      axios.put(`${API_URL}/questions/${id}`, { isFavorite }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pageQuestions', pageId] });
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

  return (
    <div className="mt-8 no-print space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Brain className="text-indigo-500" size={20} />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Questions & Answers</h2>
          <span className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded font-medium ml-1">
            {questions.length} cards
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {questions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRevealAll(!revealAll)}
              className="h-8 text-xs cursor-pointer"
            >
              {revealAll ? 'Hide All Answers' : 'Reveal All Answers'}
            </Button>
          )}
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            size="sm"
            className="h-8 text-xs cursor-pointer gap-1"
          >
            <Plus size={14} /> Add Card
          </Button>
        </div>
      </div>

      {/* Cards List */}
      {isLoading ? (
        <div className="text-zinc-500 animate-pulse text-sm py-4">Loading questions...</div>
      ) : questions.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/30 dark:bg-zinc-900/10">
          <p className="text-sm text-zinc-400 dark:text-zinc-500">No interview preparation questions added to this page yet.</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mt-2 cursor-pointer"
          >
            + Create a Q&A card
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q: any) => (
            <FlashcardItem 
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
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-2 focus:outline-none cursor-pointer text-sm"
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
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-2 focus:outline-none cursor-pointer text-sm"
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

interface FlashcardItemProps {
  question: any;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  forceOpen?: boolean;
}

function FlashcardItem({ question, onEdit, onDelete, onToggleFavorite, forceOpen }: FlashcardItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (forceOpen !== undefined) {
      setIsOpen(forceOpen);
    }
  }, [forceOpen]);

  const qTags = useMemo(() => {
    if (Array.isArray(question.tags)) return question.tags;
    if (typeof question.tags === 'string' && question.tags.trim()) {
      return question.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    }
    return [];
  }, [question.tags]);

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 shadow-sm transition-all hover:border-indigo-300 dark:hover:border-indigo-700/50">
      <div 
        className="p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
            {question.difficulty && (
              <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded ${
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
                <span key={trimmed} className="text-[10px] font-medium bg-zinc-100 text-zinc-650 dark:bg-zinc-850 dark:text-zinc-400 px-2 py-0.5 rounded">
                  {trimmed}
                </span>
              );
            })}
            {qTags.map((tag: string) => {
              const trimmed = tag.trim();
              if (!trimmed) return null;
              return (
                <span key={trimmed} className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 px-2 py-0.5 rounded border border-indigo-200/30 dark:border-indigo-900/30">
                  {trimmed}
                </span>
              );
            })}
          </div>
          <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100">{question.question}</h3>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0" onClick={e => e.stopPropagation()}>
          <button 
            onClick={onToggleFavorite} 
            className="p-1 rounded-lg text-zinc-400 hover:text-yellow-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            title={question.isFavorite ? 'Unfavorite' : 'Favorite'}
          >
            <Star size={14} className={question.isFavorite ? 'text-yellow-400 fill-yellow-400' : ''} />
          </button>
          
          <button 
            onClick={onEdit} 
            className="p-1 rounded-lg text-zinc-400 hover:text-amber-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            title="Edit"
          >
            <Edit3 size={14} />
          </button>

          <button 
            onClick={onDelete} 
            className="p-1 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>

          <div 
            onClick={() => setIsOpen(!isOpen)}
            className="w-7 h-7 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer ml-1"
          >
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </div>

      {/* Answer Back */}
      {isOpen && (
        <div className="px-5 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10">
          <h4 className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mb-1.5 uppercase tracking-wider">Answer</h4>
          <div className="text-sm text-zinc-700 dark:text-zinc-300 prose prose-zinc dark:prose-invert max-w-none">
            {question.answer ? (
              <p className="whitespace-pre-wrap">{question.answer}</p>
            ) : (
              <p className="italic text-zinc-500 text-xs">No answer provided.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
