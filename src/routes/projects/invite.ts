import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../../lib/auth';

const router = Router();
const prisma = new PrismaClient();

router.post('/:id/invite', async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = verifyToken(req);
    const userId = payload.userId as string;
    const projectId = req.params.id;
    const { email } = req.body;

    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
    });

    if (!project) {
      res.status(403).json({ message: 'Kamu bukan pemilik project ini.' });
      return;
    }

    const targetUser = await prisma.user.findUnique({ where: { email } });
    if (!targetUser) {
      res.status(404).json({ message: 'User tidak ditemukan.' });
      return;
    }

    const alreadyMember = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: targetUser.id,
      },
    });

    if (alreadyMember) {
      res.status(409).json({ message: 'User sudah jadi member.' });
      return;
    }

    const newMember = await prisma.projectMember.create({
      data: {
        projectId,
        userId: targetUser.id,
      },
    });

    res.status(201).json({ message: 'Berhasil mengundang member.', newMember });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Unauthorized / Error pada server' });
  }
});

export default router;
