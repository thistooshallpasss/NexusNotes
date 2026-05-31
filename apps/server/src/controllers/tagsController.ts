import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getTags = async (req: Request, res: Response) => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
};

export const createTag = async (req: Request, res: Response) => {
  try {
    const { name, color, category } = req.body;
    
    // Check if tag already exists
    const existing = await prisma.tag.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Tag already exists', tag: existing });
    }

    const tag = await prisma.tag.create({
      data: { name, color, category }
    });
    res.status(201).json(tag);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create tag' });
  }
};

export const assignTagToPage = async (req: Request, res: Response) => {
  try {
    const { pageId, tagId } = req.body;
    if (!pageId || !tagId) {
      return res.status(400).json({ error: 'pageId and tagId are required' });
    }

    const pageExists = await prisma.page.findUnique({ where: { id: pageId } });
    if (!pageExists) {
      return res.status(404).json({ error: 'Page not found' });
    }

    const tagExists = await prisma.tag.findUnique({ where: { id: tagId } });
    if (!tagExists) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    
    const pageTag = await prisma.pageTag.create({
      data: { pageId, tagId },
      include: { tag: true }
    });
    
    res.status(201).json(pageTag);
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign tag to page. It might already be assigned.' });
  }
};

export const removeTagFromPage = async (req: Request, res: Response) => {
  try {
    const pageId = (req.query.pageId || req.body?.pageId) as string;
    const tagId = (req.query.tagId || req.body?.tagId) as string;
    
    if (!pageId || !tagId) {
      return res.status(400).json({ error: 'pageId and tagId parameters are required' });
    }

    await prisma.pageTag.delete({
      where: {
        pageId_tagId: { pageId, tagId }
      }
    });
    
    res.json({ message: 'Tag removed from page' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove tag from page' });
  }
};

export const updateTag = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, color, category } = req.body;
    const tag = await prisma.tag.update({
      where: { id },
      data: { name, color, category }
    });
    res.json(tag);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update tag' });
  }
};

export const deleteTag = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.tag.delete({ where: { id } });
    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete tag' });
  }
};
