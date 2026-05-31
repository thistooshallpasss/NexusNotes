import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { createBookSchema, updateBookSchema } from '../lib/schemas';


export const getBooks = async (req: Request, res: Response) => {
  try {
    const books = await prisma.book.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch books' });
  }
};

export const getBooksTree = async (req: Request, res: Response) => {
  try {
    const tree = await prisma.book.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        chapters: {
          orderBy: [
            { order: 'asc' },
            { createdAt: 'asc' }
          ],
          include: {
            pages: {
              orderBy: { title: 'asc' },
              select: { id: true, title: true, type: true, isFavorite: true, isPinned: true }
            }
          }
        }
      }
    });
    res.json(tree);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tree' });
  }
};


export const getBookById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const book = await prisma.book.findUnique({
      where: { id },
      include: { 
        chapters: {
          orderBy: { order: 'asc' }
        } 
      }
    });
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch book' });
  }
};

export const createBook = async (req: Request, res: Response) => {
  try {
    const validated = createBookSchema.safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({ error: 'Validation failed', details: validated.error.format() });
    }
    const { name, desc, priority, cover } = validated.data;
    const book = await prisma.book.create({
      data: { name, desc, priority, cover }
    });
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create book' });
  }
};

export const updateBook = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const validated = updateBookSchema.safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({ error: 'Validation failed', details: validated.error.format() });
    }
    const book = await prisma.book.update({
      where: { id },
      data: validated.data
    });
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update book' });
  }
};

export const deleteBook = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.book.delete({ where: { id } });
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete book' });
  }
};
