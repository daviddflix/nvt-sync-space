# Database Design

## Schema Overview

**Shared Database Architecture:** Single PostgreSQL database with logical bounded context separation. Each context owns its tables and cannot directly access other contexts' tables through repository interfaces.

**Logical Boundaries:** While physically shared, contexts maintain strict separation:
- Each context has its own repository interfaces
- No cross-context database queries allowed
- Inter-context communication happens via API calls
- Foreign key relationships exist but are not accessed directly across contexts

## Migration Strategy

Using `node-pg-migrate` for simple schema evolution:
- Sequential numbered migrations
- Foreign key constraints enforced at database level

## Database Seeding Strategy

Each context provides default seed data for development and testing:

### Seed Data per Context
- **Auth Context:** Default admin user (admin@platform.com)
- **Organization Context:** Default organization ("Platform Workspace")
- **Chat Context:** Default channels (#general, #announcements)
- **Project Context:** Default board ("Getting Started")
- **Notification Context:** Welcome notification

### Shared Seeding System
- Centralized seeding in `src/shared/database/seeds/`
- Idempotent seed scripts (safe to run multiple times)
- Environment-aware seeding (dev/test/prod)
- Order-dependent execution (users → orgs → channels → boards)

### Seed Files Structure
```
src/shared/database/seeds/
├── 001_seed_users.sql           # Default admin user
├── 002_seed_organizations.sql   # Default organization
├── 003_seed_user_organizations.sql # Admin membership
├── 004_seed_channels.sql        # Default channels
├── 005_seed_boards.sql          # Default board with columns
└── seed.js                      # Node.js seeding orchestrator
```

## Bounded Context Schemas

### 1. Auth & User Context

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);
```

#### Refresh Tokens Table
```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_revoked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);
```

### 2. Organization Context

#### Organizations Table
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_active ON organizations(is_active);
```

#### User Organizations Table
```sql
CREATE TABLE user_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, organization_id)
);

CREATE INDEX idx_user_orgs_user ON user_organizations(user_id);
CREATE INDEX idx_user_orgs_org ON user_organizations(organization_id);
CREATE INDEX idx_user_orgs_role ON user_organizations(role);
```

### 3. Chat Context

#### Channels Table
```sql
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(organization_id, name)
);

CREATE INDEX idx_channels_org ON channels(organization_id);
CREATE INDEX idx_channels_private ON channels(is_private);
CREATE INDEX idx_channels_created_by ON channels(created_by);
```

#### Channel Members Table
```sql
CREATE TABLE channel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(channel_id, user_id)
);

CREATE INDEX idx_channel_members_channel ON channel_members(channel_id);
CREATE INDEX idx_channel_members_user ON channel_members(user_id);
```

#### Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text',
  reply_to_id UUID REFERENCES messages(id),
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_channel ON messages(channel_id);
CREATE INDEX idx_messages_user ON messages(user_id);
CREATE INDEX idx_messages_created ON messages(created_at);
CREATE INDEX idx_messages_reply ON messages(reply_to_id);
```

#### Message Reactions Table
```sql
CREATE TABLE message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(message_id, user_id, emoji)
);

CREATE INDEX idx_reactions_message ON message_reactions(message_id);
CREATE INDEX idx_reactions_user ON message_reactions(user_id);
```

### 4. Project Context

#### Boards Table
```sql
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_boards_org ON boards(organization_id);
CREATE INDEX idx_boards_created_by ON boards(created_by);
```

#### Columns Table
```sql
CREATE TABLE columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(board_id, name),
  UNIQUE(board_id, position)
);

CREATE INDEX idx_columns_board ON columns(board_id);
CREATE INDEX idx_columns_position ON columns(board_id, position);
```

#### Issues Table
```sql
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
```

#### Issue Comments Table
```sql
CREATE TABLE issue_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_issue_comments_issue ON issue_comments(issue_id);
CREATE INDEX idx_issue_comments_user ON issue_comments(user_id);
CREATE INDEX idx_issue_comments_created ON issue_comments(created_at);
```

### 5. Attachment Context

#### Attachments Table
```sql
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
```

### 6. Notification Context

#### Notifications Table
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  -- Reference to source entity
  source_id UUID,
  source_type VARCHAR(50),
  
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_source ON notifications(source_id, source_type);
```

## Data Relationships

### Cross-Context Relationships
- **Users** ↔ **Organizations** (Many-to-Many via `user_organizations`)
- **Organizations** → **Channels**, **Boards** (One-to-Many)
- **Users** → **Messages**, **Issues**, **Attachments** (One-to-Many)
- **Messages/Comments** ← **Attachments** (One-to-Many with constraint)

### Referential Integrity
- All foreign keys enforced at database level
- Cascade deletes for dependent entities
- Unique constraints for business rules
- Check constraints for data validation

## Data Constraints & Business Rules

### User Management
- Email uniqueness enforced by unique constraint
- Active users only via `is_active` flag
- Password hashing handled at application layer

### Organization Isolation
- All data scoped by `organization_id`
- Cross-organization access prevented by design
- Soft delete capability via `is_active` flags

### Message Ordering
- Chronological ordering via `created_at` timestamps
- Position-based ordering for issues within columns
- Efficient pagination via indexed timestamps

### File Size Limits
- Attachment size stored in bytes
- Application-layer validation for 10MB limit
- Orphaned file cleanup via background jobs

## Migration Files Structure

```
migrations/
├── 001_create_users.sql
├── 002_create_refresh_tokens.sql
├── 003_create_organizations.sql
├── 004_create_user_organizations.sql
├── 005_create_channels.sql
├── 006_create_channel_members.sql
├── 007_create_messages.sql
├── 008_create_message_reactions.sql
├── 009_create_boards.sql
├── 010_create_columns.sql
├── 011_create_issues.sql
├── 012_create_issue_comments.sql
├── 013_create_attachments.sql
└── 014_create_notifications.sql
```

## Performance Considerations

### Indexing Strategy
- Primary key indexes (automatic)
- Foreign key indexes for all relationships
- Composite indexes for common query patterns
- Partial indexes for filtered queries

### Query Optimization
- Cursor-based pagination for large datasets
- Efficient joins via proper indexing
- Query limits to prevent unbounded results
- Connection pooling for concurrent access 