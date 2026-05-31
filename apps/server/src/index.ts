import 'dotenv/config';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { authMiddleware } from './middleware/auth';
import { prisma } from './lib/prisma';

if (!process.env.API_KEY) {
  console.error('FATAL ERROR: API_KEY environment variable is not defined.');
  process.exit(1);
}

const app: Express = express();
const port = process.env.PORT || 5001;

const allowedOrigins = process.env.ALLOWED_ORIGIN
  ? process.env.ALLOWED_ORIGIN.split(',').map((o) => o.trim())
  : [];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, postman, or curl)
    if (!origin) {
      return callback(null, true);
    }

    const isAllowed =
      allowedOrigins.includes(origin) ||
      origin === 'http://localhost:3000' ||
      origin.endsWith('.onrender.com');

    if (isAllowed) {
      return callback(null, true);
    } else {
      return callback(null, new Error('Not allowed by CORS') as any);
    }
  }
}));
app.use(express.json({ limit: '10mb' }));
app.use(authMiddleware);


// Basic health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'NexusNotes API is running' });
});

import { generateSessionToken } from './lib/token';

// Auth validation endpoint (passes only if authorization header is correct)
app.post('/api/auth/verify', (req: Request, res: Response) => {
  const token = generateSessionToken();
  res.json({ success: true, message: 'Passcode is valid', token });
});

import booksRouter from './routes/books';
import chaptersRouter from './routes/chapters';
import pagesRouter from './routes/pages';
import tagsRouter from './routes/tags';
import imagesRouter from './routes/images';
import questionsRouter from './routes/questions';
import notesRouter from './routes/notes';
import searchRouter from './routes/search';
import dashboardRouter from './routes/dashboard';

app.use('/api/books', booksRouter);
app.use('/api/chapters', chaptersRouter);
app.use('/api/pages', pagesRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/images', imagesRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/notes', notesRouter);
app.use('/api/search', searchRouter);
app.use('/api/dashboard', dashboardRouter);

const server = app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

const gracefulShutdown = async (signal: string) => {
  console.log(`\n[server]: ${signal} received. Cleaning up resources...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log('[server]: Prisma client disconnected.');
      process.exit(0);
    } catch (err) {
      console.error('[server]: Error during Prisma disconnect:', err);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
