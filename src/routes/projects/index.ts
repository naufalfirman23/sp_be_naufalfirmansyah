import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../../lib/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req: Request, res: Response) => {
  try {
    const payload = verifyToken(req);
    const userId = payload.userId as string;

    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId: userId } } },
        ],
      },
    });

    res.status(200).json(projects);
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const payload = verifyToken(req);
    const userId = payload.userId as string;
    const { name } = req.body;

    const newProject = await prisma.project.create({
      data: {
        name,
        ownerId: userId,
      },
    });

    res.status(201).json(newProject);
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Unauthorized' });
  }
});

export default router;
