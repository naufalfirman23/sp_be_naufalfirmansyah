import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../../lib/auth';

const router = Router();

const prisma = new PrismaClient();

router.get('/:id/export', async (req: Request, res: Response): Promise<void> => {
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
          include: { user: true },
        },
      },
    });

    if (!project) {
      res.status(404).json({ message: 'Project tidak ditemukan' });
      return;
    }

    res.setHeader('Content-Disposition', `attachment; filename=project-${id}.json`);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(project, null, 2));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal export project' });
  }
});

export default router; // ✅ WAJIB
