CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  column_id UUID NOT NULL REFERENCES columns(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES users(id),
  priority VARCHAR(20) DEFAULT 'medium',
  position INTEGER NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(column_id, position)
);

CREATE INDEX idx_issues_board ON issues(board_id);
CREATE INDEX idx_issues_column ON issues(column_id);
CREATE INDEX idx_issues_assigned ON issues(assigned_to);
CREATE INDEX idx_issues_created_by ON issues(created_by);
CREATE INDEX idx_issues_position ON issues(column_id, position);
