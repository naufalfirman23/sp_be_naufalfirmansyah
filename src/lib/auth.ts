import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'sellerpintar_secret';

export function verifyToken(req: Request): JwtPayload {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new Error('Unauthorized');

  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, JWT_SECRET);

  if (typeof decoded === 'string') {
    throw new Error('Invalid token');
  }

  return decoded;
}
