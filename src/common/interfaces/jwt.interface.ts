export interface JwtPayload {
  credentialKey: string;
}
export interface JwtResponse {
  id: string;
  email: string;
  iat: number;
  exp: number;
}