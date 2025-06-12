# Domain Design & Business Rules

## Bounded Contexts

Each context lives in its own folder, with independent schema, domain models, services, tests, and migrations.

### 1. Auth & User Context
**Responsibility:** User identity, authentication, and session management
- User registration and login flows
- JWT token lifecycle management
- Password policies and security

### 2. Organization Context  
**Responsibility:** Workspace management and user membership
- Organization creation and configuration
- User-organization relationships and roles
- Administrative capabilities

### 3. Chat Context
**Responsibility:** Real-time messaging and communication
- Channels (public/private)
- Messages and reactions
- Channel membership management

### 4. Project Context
**Responsibility:** Work organization and task management  
- Kanban boards and columns
- Issues and task tracking
- Comments and collaboration

### 5. Attachment Context
**Responsibility:** File management and associations
- File upload and storage
- Linking to messages and comments
- Size and type restrictions

### 6. Notification Context
**Responsibility:** User alerts and activity updates
- In-app notifications
- Event-driven notification creation
- Read/unread state management

## Core Business Rules

### User Management
- Email addresses must be unique across the system
- One active refresh token per user session
- Password must meet minimum security requirements
- Users can belong to multiple organizations

### Organization Management  
- Organization names must be unique
- First user to create organization becomes admin
- Admins can invite and remove members
- Organizations are isolated workspaces

### Chat & Messaging
- Public channels auto-add all organization members
- Private channels require explicit membership
- Message content has maximum length limits
- Reactions are tied to specific messages

### Project Management
- Each board has fixed columns: Backlog, In Progress, Done
- Issues cannot move to non-existent columns
- Issue titles are required
- Comments maintain chronological order

### Attachments
- Maximum file size: 10 MB
- Maximum 5 attachments per parent (message/comment)
- Each attachment must have exactly one parent reference
- File metadata stored separately from binary data

### Notifications
- Only unread notifications are active
- Notifications auto-generate from system events
- Users can mark notifications as read
- Invalid notification types are rejected

## Real-Time Features

WebSocket integration for core functionality:
- Real-time messaging in channels
- Typing indicators
- Live notification delivery 