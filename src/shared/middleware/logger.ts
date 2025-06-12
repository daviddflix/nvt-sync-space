import { Request, Response, NextFunction } from 'express';

export function logger(req: Request, res: Response, next: NextFunction): void {
  console.info(`${req.method} ${req.url}`);
  next();
}
