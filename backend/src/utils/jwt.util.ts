import jwt from 'jsonwebtoken';

export function generateToken(payload: any): string {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET as string,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
}

export function verifyToken(token: string): any {
  return jwt.verify(token, process.env.JWT_SECRET as string);
}