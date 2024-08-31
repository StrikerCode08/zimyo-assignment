import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    try {
      const decoded: any = jwt.verify(token, `${process.env.JWT_SECRET}`);
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

      if (user) {
        req.user = user; // Attach user object to request
        next();
      } else {
        res.sendStatus(403);
      }
    } catch (err) {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(401);
  }
};

