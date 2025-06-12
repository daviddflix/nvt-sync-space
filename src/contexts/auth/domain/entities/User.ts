export interface User {
  id: string;
  email: string;
  passwordHash: string;
}

export interface UserPayload {
  userId: string;
  email: string;
}
