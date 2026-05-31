import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { createPageSchema, updatePageSchema } from '../lib/schemas';

export const getPagesByChapterId = async (req: Request, res: Response) => {
  try {
    const chapterId = req.params.chapterId as string;
    const pages = await prisma.page.findMany({
      where: { chapterId },
      include: {
        pageTags: {
          include: { tag: true }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    res.json(pages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
};

export const getPageById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const page = await prisma.page.findUnique({
      where: { id },
      include: {
        blocks: {
          orderBy: { order: 'asc' }
        },
        pageTags: {
          include: { tag: true }
        },
        chapter: {
          include: {
            book: true
          }
        }
      }
    });
    if (!page) return res.status(404).json({ error: 'Page not found' });
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch page' });
  }
};

export const createPage = async (req: Request, res: Response) => {
  try {
    const validated = createPageSchema.safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({ error: 'Validation failed', details: validated.error.format() });
    }
    const { title, chapterId, type, difficulty, companies, isFavorite, isPinned } = validated.data;
    const page = await prisma.page.create({
      data: { title, chapterId, type, difficulty, companies, isFavorite, isPinned }
    });
    res.status(201).json(page);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create page' });
  }
};

export const updatePage = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const validated = updatePageSchema.safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({ error: 'Validation failed', details: validated.error.format() });
    }
    
    const { pushRevision, ...fields } = validated.data;
    const updateData: any = { ...fields };
    if (pushRevision) {
      updateData.revisedAt = { push: new Date() };
    }

    const page = await prisma.page.update({
      where: { id },
      data: updateData
    });
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update page' });
  }
};

export const deletePage = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.page.delete({ where: { id } });
    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete page' });
  }
};

export const updatePageBlocks = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { blocks } = req.body;
    
    if (!blocks) {
      return res.status(400).json({ error: 'No blocks provided' });
    }

    await prisma.$transaction(async (tx) => {
      // Fetch existing blocks for this page ordered by their index
      const existingBlocks = await tx.block.findMany({
        where: { pageId: id },
        orderBy: { order: 'asc' }
      });

      const limit = Math.max(blocks.length, existingBlocks.length);
      for (let i = 0; i < limit; i++) {
        if (i < blocks.length) {
          const incoming = blocks[i];
          const data = {
            type: incoming.type || 'text',
            content: incoming.content || {},
            order: i,
            language: incoming.language || null,
            complexity: incoming.complexity || null
          };
          if (i < existingBlocks.length) {
            // Update existing block
            await tx.block.update({
              where: { id: existingBlocks[i].id },
              data
            });
          } else {
            // Create new block
            await tx.block.create({
              data: {
                ...data,
                pageId: id
              }
            });
          }
        } else {
          // Delete extra block
          await tx.block.delete({
            where: { id: existingBlocks[i].id }
          });
        }
      }
    });

    res.json({ message: 'Blocks updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update page blocks' });
  }
};

export const getPages = async (req: Request, res: Response) => {
  try {
    const { difficulty, type, tagId, search } = req.query;

    const whereClause: any = {};

    if (difficulty) {
      whereClause.difficulty = difficulty as string;
    }
    if (type) {
      whereClause.type = type as string;
    }
    if (tagId) {
      whereClause.pageTags = {
        some: {
          tagId: tagId as string
        }
      };
    }
    if (search) {
      whereClause.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { companies: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const pages = await prisma.page.findMany({
      where: whereClause,
      include: {
        chapter: {
          include: {
            book: true
          }
        },
        pageTags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    res.json(pages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
};
