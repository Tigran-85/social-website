export interface JwtPayload {
  userId: number;
}
export interface JwtResponse {
  id: number;
  role: string;
  iat: number;
  exp: number;
}