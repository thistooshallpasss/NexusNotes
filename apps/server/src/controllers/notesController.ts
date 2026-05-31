import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { createNoteSchema, updateNoteSchema } from '../lib/schemas';

export const getNotes = async (req: Request, res: Response) => {
  try {
    const notes = await prisma.note.findMany({
      orderBy: [
        { isPinned: 'desc' },
        { order: 'asc' },
        { updatedAt: 'desc' }
      ]
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
};

export const getNoteById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const note = await prisma.note.findUnique({
      where: { id }
    });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch note' });
  }
};

export const createNote = async (req: Request, res: Response) => {
  try {
    const validated = createNoteSchema.safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({ error: 'Validation failed', details: validated.error.format() });
    }
    const { title, type, content, isPinned } = validated.data;
    
    // Assign order at the end of the list
    const count = await prisma.note.count();

    const note = await prisma.note.create({
      data: { 
        title, 
        type, 
        content: content || {}, 
        isPinned: isPinned || false,
        order: count
      }
    });
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create note' });
  }
};

export const updateNote = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const validated = updateNoteSchema.safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({ error: 'Validation failed', details: validated.error.format() });
    }
    const note = await prisma.note.update({
      where: { id },
      data: validated.data
    });
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update note' });
  }
};

export const togglePinNote = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.note.findUnique({
      where: { id }
    });
    if (!existing) return res.status(404).json({ error: 'Note not found' });

    const note = await prisma.note.update({
      where: { id },
      data: { isPinned: !existing.isPinned }
    });
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to pin/unpin note' });
  }
};

export const deleteNote = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.note.delete({
      where: { id }
    });
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
};

export const reorderNotes = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids must be a non-empty array of note IDs' });
    }

    // Sanitize and validate inputs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    for (const id of ids) {
      if (typeof id !== 'string' || !uuidRegex.test(id)) {
        return res.status(400).json({ error: 'Invalid UUID format in ids' });
      }
    }

    // Execute bulk raw update in a single DB query
    const cases = ids.map((id, index) => `WHEN '${id}' THEN ${index}`).join(' ');
    const idList = ids.map(id => `'${id}'`).join(', ');
    await prisma.$executeRawUnsafe(`
      UPDATE "Note"
      SET "order" = CASE id ${cases} END
      WHERE id IN (${idList})
    `);

    res.json({ message: 'Notes reordered successfully' });
  } catch (error) {
    console.error('Reorder notes error:', error);
    res.status(500).json({ error: 'Failed to reorder notes' });
  }
};
