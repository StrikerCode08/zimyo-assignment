import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/prisma';
import { authenticateJWT } from '../middlewares/auth';
import { loginLimiter, registrationLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.post('/register',registrationLimiter, async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { username, password: hashedPassword },
    });

    res.status(201).json({ message: "User registered successfully", newUser });
  } catch (error) {
    res.status(500).json({ error: "Error registering user" });
  }
});

router.post('/login',loginLimiter, async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: '1h',
    });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Error logging in user" });
  }
});

router.get('/user/purchases', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const purchases = await prisma.purchase.findMany({
      where: { userId: req.user.id },
    });

    res.status(200).json(purchases);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving purchases" });
  }
});

export default router;
