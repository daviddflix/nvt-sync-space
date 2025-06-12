CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size BIGINT NOT NULL,
  file_path VARCHAR(500) NOT NULL,

  -- Parent references (exactly one must be non-null)
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  issue_comment_id UUID REFERENCES issue_comments(id) ON DELETE CASCADE,

  uploaded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT single_parent_check CHECK (
    (message_id IS NOT NULL AND issue_comment_id IS NULL) OR
    (message_id IS NULL AND issue_comment_id IS NOT NULL)
  )
);

CREATE INDEX idx_attachments_message ON attachments(message_id);
CREATE INDEX idx_attachments_comment ON attachments(issue_comment_id);
CREATE INDEX idx_attachments_uploaded_by ON attachments(uploaded_by);
