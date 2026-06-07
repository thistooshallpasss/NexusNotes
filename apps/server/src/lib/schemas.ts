import { z } from 'zod';

export const createBookSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  desc: z.string().optional().nullable(),
  priority: z.enum(['Low', 'Medium', 'High']).optional().nullable()
});

export const createChapterSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  bookId: z.string().uuid('Invalid Book ID'),
  priority: z.enum(['Low', 'Medium', 'High']).optional().nullable(),
  isFavorite: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  isImportant: z.boolean().optional()
});

export const createPageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  chapterId: z.string().uuid('Invalid Chapter ID'),
  type: z.enum(['theory', 'dsa']).default('theory'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional().nullable(),
  companies: z.string().optional().nullable(),
  isFavorite: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  isImportant: z.boolean().optional()
});

export const createQuestionSchema = z.object({
  bookId: z.string().uuid('Invalid Book ID'),
  pageId: z.string().uuid('Invalid Page ID').optional().nullable(),
  question: z.string().min(1, 'Question text is required'),
  answer: z.string().optional().nullable(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional().nullable(),
  companies: z.string().optional().nullable(),
  tags: z.union([z.array(z.string()), z.string()])
    .transform(val => typeof val === 'string' ? val.split(',').map(t => t.trim()).filter(Boolean) : val)
    .default([]),
  isFavorite: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  isImportant: z.boolean().optional()
});

export const createNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  type: z.string().min(1, 'Type is required'),
  content: z.any().optional(),
  isFavorite: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  isImportant: z.boolean().optional(),
  order: z.number().int().optional()
});

// Update Schemas
export const updateBookSchema = createBookSchema.partial().extend({
  isFavorite: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  isImportant: z.boolean().optional()
});

export const updateChapterSchema = createChapterSchema.partial().extend({
  order: z.number().int().optional()
});

export const updatePageSchema = createPageSchema.partial().extend({
  pushRevision: z.boolean().optional(),
  order: z.number().int().optional()
});

export const updateQuestionSchema = createQuestionSchema.partial();

export const updateNoteSchema = createNoteSchema.partial();

