import { Request, Response, NextFunction } from 'express';
import { verifySessionToken } from '../lib/token';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Internal Server Error: API_KEY is missing from environment.' });
  }
  
  // Health check
  if (req.path === '/api/health' || req.path === '/health') {
    return next();
  }

  const authHeader = req.headers['authorization'] || req.headers['x-api-key'];
  let token = '';

  if (typeof authHeader === 'string') {
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      token = authHeader;
    }
  }

  if (token === apiKey || verifySessionToken(token)) {
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized: Invalid or missing API key.' });
};
