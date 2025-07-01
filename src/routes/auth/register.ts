import { Router, Request, Response } from 'express';

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const router = Router();
const prisma = new PrismaClient();

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Email dan password wajib diisi.' });
    return;
  }

  const userExist = await prisma.user.findUnique({ where: { email } });
  if (userExist) {
    res.status(409).json({ message: 'Email sudah digunakan.' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword }
  });

  res.status(201).json({ message: 'User berhasil dibuat', user: { id: user.id, email: user.email } });
});

export default router;
