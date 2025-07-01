import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../../lib/auth';

const router = Router();

const prisma = new PrismaClient();

router.get('/:projectId/tasks', async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = verifyToken(req);
    const userId = payload.userId as string;
    const projectId = req.params.projectId;

    const isMember = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
    });

    if (!isMember) {
      res.status(403).json({ message: 'Tidak punya akses' });
      return;
    }

    const tasks = await prisma.task.findMany({ where: { projectId } });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post('/:projectId/tasks', async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = verifyToken(req);
    const userId = payload.userId as string;
    const projectId = req.params.projectId;
    const { title, description, status, assigneeId } = req.body;

    const isMember = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
    });

    if (!isMember) {
      res.status(403).json({ message: 'Tidak punya akses' });
      return;
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        assigneeId,
        projectId,
      },
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat task' });
  }
});

router.put('/:projectId/tasks/:taskId', async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = verifyToken(req);
    const userId = payload.userId as string;
    const { projectId, taskId } = req.params;
    const { title, description, status, assigneeId } = req.body;

    const isMember = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
    });

    if (!isMember) {
      res.status(403).json({ message: 'Tidak punya akses' });
      return;
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        title,
        description,
        status,
        assigneeId,
      },
    });

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Gagal update task' });
  }
});

router.delete('/:projectId/tasks/:taskId', async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = verifyToken(req);
    const userId = payload.userId as string;
    const { projectId, taskId } = req.params;

    const isMember = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
    });

    if (!isMember) {
      res.status(403).json({ message: 'Tidak punya akses' });
      return
    }

    await prisma.task.delete({ where: { id: taskId } });
    res.status(200).json({ message: 'Task berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal hapus task' });
  }
});

export default router;
