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
    
    if (!blocks || !Array.isArray(blocks)) {
      return res.status(400).json({ error: 'No blocks provided' });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Gather all incoming block IDs
      const incomingIds = blocks
        .map((b: any) => b.id)
        .filter((bid: any) => typeof bid === 'string' && bid.trim().length > 0);

      // 2. Delete existing blocks that are not in the incoming list
      await tx.block.deleteMany({
        where: {
          pageId: id,
          NOT: {
            id: { in: incomingIds }
          }
        }
      });

      // 3. Upsert incoming blocks
      for (let i = 0; i < blocks.length; i++) {
        const incoming = blocks[i];
        const data = {
          type: incoming.type || 'text',
          content: incoming.content || {},
          order: i,
          language: incoming.language || null,
          complexity: incoming.complexity || null
        };

        if (incoming.id) {
          const existing = await tx.block.findUnique({
            where: { id: incoming.id }
          });
          if (existing) {
            await tx.block.update({
              where: { id: incoming.id },
              data
            });
            continue;
          }
        }

        // Create new block
        await tx.block.create({
          data: {
            ...data,
            id: incoming.id || undefined,
            pageId: id
          }
        });
      }
    });

    res.json({ message: 'Blocks updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update page blocks' });
  }
};

export const createPagesBulk = async (req: Request, res: Response) => {
  try {
    const { pages, chapterId } = req.body;
    if (!chapterId || !Array.isArray(pages)) {
      return res.status(400).json({ error: 'chapterId and pages array are required' });
    }

    const createdPages = await prisma.$transaction(
      pages.map((p: any) => prisma.page.create({
        data: {
          title: p.title,
          chapterId,
          type: p.type || 'theory',
          difficulty: p.difficulty || null,
          companies: p.companies || null
        }
      }))
    );

    res.status(201).json(createdPages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create pages in bulk' });
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
