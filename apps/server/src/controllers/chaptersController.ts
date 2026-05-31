import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { createChapterSchema, updateChapterSchema } from '../lib/schemas';


export const getChaptersByBookId = async (req: Request, res: Response) => {
  try {
    const bookId = req.params.bookId as string;
    const chapters = await prisma.chapter.findMany({
      where: { bookId },
      orderBy: { order: 'asc' }
    });
    res.json(chapters);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chapters' });
  }
};

export const getChapterById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const chapter = await prisma.chapter.findUnique({
      where: { id },
      include: { 
        pages: {
          select: {
            id: true,
            title: true,
            type: true,
            difficulty: true,
            isFavorite: true,
            isPinned: true,
            isImportant: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });
    if (!chapter) return res.status(404).json({ error: 'Chapter not found' });
    res.json(chapter);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chapter' });
  }
};

export const createChapter = async (req: Request, res: Response) => {
  try {
    const validated = createChapterSchema.safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({ error: 'Validation failed', details: validated.error.format() });
    }
    const { title, bookId, priority, isFavorite } = validated.data;
    
    // Compute order dynamically based on the current count of chapters in this book
    const count = await prisma.chapter.count({
      where: { bookId }
    });

    const chapter = await prisma.chapter.create({
      data: { title, bookId, order: count, priority, isFavorite }
    });
    res.status(201).json(chapter);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create chapter' });
  }
};

export const updateChapter = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const validated = updateChapterSchema.safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({ error: 'Validation failed', details: validated.error.format() });
    }
    const chapter = await prisma.chapter.update({
      where: { id },
      data: validated.data
    });
    res.json(chapter);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update chapter' });
  }
};

export const deleteChapter = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.chapter.delete({ where: { id } });
    res.json({ message: 'Chapter deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete chapter' });
  }
};
