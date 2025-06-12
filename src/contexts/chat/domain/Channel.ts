export interface Channel {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  isPrivate: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
