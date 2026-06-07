import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const searchAll = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.json({ books: [], chapters: [], pages: [], questions: [], notes: [] });
    }

    // Find page IDs where blocks contain the query text (searches inside editor body)
    let blockPageIds: string[] = [];
    try {
      const blockRows = await prisma.$queryRaw<{ pageId: string }[]>`
        SELECT DISTINCT "pageId" FROM "Block"
        WHERE content::text ILIKE ${'%' + query + '%'}
      `;
      blockPageIds = blockRows.map((r) => r.pageId);
    } catch {
      // Raw query failed — skip block search
    }

    // Find page IDs where tag names match the query
    let tagPageIds: string[] = [];
    try {
      const tagPages = await prisma.pageTag.findMany({
        where: {
          tag: {
            name: { contains: query, mode: 'insensitive' }
          }
        },
        select: { pageId: true }
      });
      tagPageIds = tagPages.map((tp) => tp.pageId);
    } catch {
      // skip tag search on error
    }

    // Find note IDs where note JSON content contains the query text
    let noteContentIds: string[] = [];
    try {
      const noteRows = await prisma.$queryRaw<{ id: string }[]>`
        SELECT DISTINCT id FROM "Note"
        WHERE content::text ILIKE ${'%' + query + '%'}
      `;
      noteContentIds = noteRows.map((r) => r.id);
    } catch {
      // skip note content search on error
    }

    const pages = await prisma.page.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { companies: { contains: query, mode: 'insensitive' } },
          ...(blockPageIds.length > 0 ? [{ id: { in: blockPageIds } }] : []),
          ...(tagPageIds.length > 0 ? [{ id: { in: tagPageIds } }] : [])
        ]
      },
      include: {
        chapter: {
          include: { book: true }
        }
      },
      take: 10
    });

    const questions = await prisma.question.findMany({
      where: {
        OR: [
          { question: { contains: query, mode: 'insensitive' } },
          { answer: { contains: query, mode: 'insensitive' } },
          { companies: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        book: true
      },
      take: 10
    });

    const notes = await prisma.note.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          ...(noteContentIds.length > 0 ? [{ id: { in: noteContentIds } }] : [])
        ]
      },
      take: 10
    });

    const chapters = await prisma.chapter.findMany({
      where: {
        title: { contains: query, mode: 'insensitive' }
      },
      include: {
        book: true
      },
      take: 10
    });

    res.json({ pages, questions, notes, chapters });
  } catch (error) {
    res.status(500).json({ error: 'Failed to perform search' });
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const totalBooks = await prisma.book.count();
    const totalChapters = await prisma.chapter.count();
    const totalPages = await prisma.page.count();
    
    // Pages with difficulty Hard/Medium OR in high/medium priority books
    const highPriorityPages = await prisma.page.count({
      where: {
        OR: [
          { difficulty: { in: ['Hard', 'Medium'] } },
          {
            chapter: {
              book: {
                priority: { in: ['High', 'Medium'] }
              }
            }
          }
        ]
      }
    });

    const recentlyUpdated = await prisma.page.findMany({
      orderBy: {
        updatedAt: 'desc'
      },
      take: 5,
      include: {
        chapter: {
          include: {
            book: true
          }
        }
      }
    });

    const favorites = await prisma.page.findMany({
      where: {
        isFavorite: true
      },
      take: 5,
      include: {
        chapter: {
          include: {
            book: true
          }
        }
      }
    });

    res.json({
      totalBooks,
      totalChapters,
      totalPages,
      highPriorityPages,
      recentlyUpdated,
      favorites
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
