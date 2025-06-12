export interface UserProps {
  id: string;
  email: string;
  passwordHash: string;
  refreshToken?: string;
}

export class User implements UserProps {
  id: string;
  email: string;
  passwordHash: string;
  refreshToken?: string;

  constructor(props: UserProps) {
    Object.assign(this, props);
  }
}
