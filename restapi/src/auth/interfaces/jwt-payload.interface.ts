export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  type: 'user' | 'admin';
  adminLevel?: string;
  iat?: number;
  exp?: number;
}