export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Membership {
  id: string;
  userId: string;
  organizationId: string;
  role: 'admin' | 'member';
  joinedAt: Date;
}
