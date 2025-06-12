export interface Board {
  id: string;
  organizationId: string;
  name: string;
  description?: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Column {
  id: string;
  boardId: string;
  name: string;
  position: number;
  createdAt: Date;
}

export interface Issue {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description?: string | null;
  assignedTo?: string | null;
  priority: string;
  position: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IssueComment {
  id: string;
  issueId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
