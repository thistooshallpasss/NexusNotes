import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Passcode authentication globally disabled as requested by the user
  return next();
};
