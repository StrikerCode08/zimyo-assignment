import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: User; // This is the custom property
    }
  }
}
