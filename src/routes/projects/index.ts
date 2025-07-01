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

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = verifyToken(req);
    const userId = payload.userId as string;
    const { id } = req.params;

    const project = await prisma.project.findFirst({
      where: {
        id,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      include: {
        tasks: true,
        members: {
          include: { user: true }, // ✅ penting untuk dapat email
        },
      },
    });

    if (!project) {
      res.status(404).json({ message: 'Project tidak ditemukan' });
      return;
    }

    res.status(200).json(project);
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Unauthorized' });
  }
});



export default router;
