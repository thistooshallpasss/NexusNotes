import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { createQuestionSchema } from '../lib/schemas';

export const getQuestionsByBookId = async (req: Request, res: Response) => {
  try {
    const bookId = req.params.bookId as string;
    const questions = await prisma.question.findMany({
      where: { bookId }
    });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

export const createQuestion = async (req: Request, res: Response) => {
  try {
    const validated = createQuestionSchema.safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({ error: 'Validation failed', details: validated.error.format() });
    }
    const { bookId, question, answer, difficulty, companies, tags, isFavorite } = validated.data;
    const newQuestion = await prisma.question.create({
      data: { bookId, question, answer, difficulty, companies, tags, isFavorite }
    });
    res.status(201).json(newQuestion);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create question' });
  }
};

export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    // We make fields in schema partial for update validation
    const validated = createQuestionSchema.partial().safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({ error: 'Validation failed', details: validated.error.format() });
    }
    const { question, answer, difficulty, companies, tags, isFavorite } = validated.data;
    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: { question, answer, difficulty, companies, tags, isFavorite }
    });
    res.json(updatedQuestion);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update question' });
  }
};

export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.question.delete({ where: { id } });
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete question' });
  }
};
