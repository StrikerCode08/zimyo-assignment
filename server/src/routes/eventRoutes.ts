import { Router, Request, Response } from 'express';
import prisma from '../prisma/prisma';
import multer from 'multer';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post('/reserve', authenticateJWT, async (req: Request, res: Response) => {
  const { eventId, userId } = req.body;

  try {
    const event = await prisma.event.findUnique({
      where: { id: Number(eventId) },
      include: { reservations: true }
    });

    if (!event || event.capacity <= event.reservations.length) {
      return res.status(400).json({ message: "Event is fully booked" });
    }

    const reservation = await prisma.reservation.create({
      data: {
        eventId: Number(eventId),
        userId: Number(userId),
      },
    });

    res.status(200).json({ message: "Ticket reserved successfully", reservation });
  } catch (error) {
    res.status(500).json({ error: "Error reserving ticket" });
  }
});

router.get('/events', async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;

  try {
    const events = await prisma.event.findMany({
      where: {
        date: {
          gte: startDate ? new Date(startDate as string) : undefined,
          lte: endDate ? new Date(endDate as string) : undefined,
        },
      },
    });

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving events" });
  }
});

router.post('/events/:id/upload', authenticateJWT, upload.single('image'), async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const event = await prisma.event.update({
      where: { id: Number(id) },
      data: { image: req.file?.path },
    });

    res.status(200).json({ message: "Image uploaded successfully", event });
  } catch (error) {
    res.status(500).json({ error: "Error uploading image" });
  }
});

router.get('/events/search', async (req: Request, res: Response) => {
  const { query } = req.query;

  try {
    const events = await prisma.event.findMany({
      where: {
        OR: [
          { name: { contains: query as string, mode: 'insensitive' } },
          { description: { contains: query as string, mode: 'insensitive' } },
        ],
      },
    });

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: "Error searching events" });
  }
});

export default router;
