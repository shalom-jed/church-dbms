import jwt from 'jsonwebtoken';

export function generateToken(payload: any): string {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET as string,
    {
      // The 'as any' tells TypeScript to accept this string without panicking
      expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
    }
  );
}

export function verifyToken(token: string): any {
  return jwt.verify(token, process.env.JWT_SECRET as string);
}