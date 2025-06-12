# Feature Specifications

## MVP Feature List

**Target Audience:** Early adopters needing combined chat and lightweight project management in a single workspace.

### Core Features
1. **User Registration & Auth**
2. **Organization Management**
3. **Real-Time Chat Channels**
4. **Kanban Boards & Issues**
5. **Attachments**
6. **In-App Notifications**

---

## Detailed Feature Specifications

### 1. User Registration & Auth

**Overview:** Sign-up, login, JWT issuance, refresh tokens.

**Validation:** 
- Email format validation
- Password strength requirements
- Unique email constraint

**Business Rules:** 
- One active refresh token per session
- Revoke tokens on logout
- Session timeout handling

**User Flows:**
1. User submits sign-up form → Domain Service validates & creates User + Organization membership
2. Login → verify credentials → issue access & refresh tokens
3. Token refresh → validate refresh token → issue new access token

**Technical Details:**
- `User` Entity, `IUserRepository`, `UserRepositoryPg`
- Migrations: `users`, `refresh_tokens`
- Zod schemas for DTOs
- Tests: unit for password hashing & token logic; integration for full sign-up/login

### 2. Organization Management

**Overview:** Create and manage workspaces.

**Validation:** 
- Unique organization name
- Valid organization metadata

**Business Rules:** 
- First user becomes Org Admin
- Admins can manage membership
- Isolated workspace per organization

**User Flows:**
1. Admin creates org → persist `Organization` + `UserOrganization`
2. Invite user → create invitation → user accepts → add to organization
3. Remove user → revoke organization access

**Technical Details:**
- `Organization` Entity, Repository interface and Pg implementation
- Migrations: `organizations`, `user_organizations`
- Tests: unit for role assignment; integration for org creation

### 3. Real-Time Chat Channels

**Overview:** Public/private channels, membership, messaging.

**Validation:** 
- Unique channel name per organization
- Message content length limits
- Valid channel types

**Business Rules:** 
- Auto-add all org members to public channels
- Private channels require explicit membership
- Message history preservation

**User Flows:**
1. Create channel → persist `Channel` + auto seed `ChannelMember`
2. Send message → create `Message` record → broadcast to channel members
3. React to message → create `Reaction` record → notify participants

**Technical Details:**
- Entities: `Channel`, `Message`, `Reaction`
- Migrations: `channels`, `channel_members`, `messages`, `message_reactions`
- Tests: unit for auto-membership logic; integration for chat flows

### 4. Kanban Boards & Issues

**Overview:** Boards with Backlog/In Progress/Done, issue tracking.

**Validation:** 
- Fixed column names (Backlog, In Progress, Done)
- Required issue title
- Valid status transitions

**Business Rules:** 
- Issues cannot move to non-existent columns
- Status changes tracked with timestamps
- Comments maintain chronological order

**User Flows:**
1. Create board → seed default columns
2. Create issue → assign to Backlog column
3. Move issue → update `column_id` + timestamp
4. Add comment → create `IssueComment` record

**Technical Details:**
- Entities: `Board`, `Column`, `Issue`, `IssueComment`
- Migrations: `boards`, `columns`, `issues`, `issue_comments`
- Tests: unit for seed logic; integration for issue lifecycle

### 5. Attachments

**Overview:** File upload metadata linking to messages or comments.

**Validation:** 
- File size ≤ 10 MB
- Supported file types
- One parent reference required

**Business Rules:** 
- Maximum 5 attachments per parent
- File metadata stored separately from binary data
- Orphaned attachments cleanup

**User Flows:**
1. Upload file → validate size/type → persist `Attachment` → store file locally
2. Link to message/comment → update parent reference
3. Delete attachment → remove file and metadata

**Technical Details:**
- Entity: `Attachment`
- Migration: `attachments`
- Tests: unit for parent-check logic; integration for file flow

### 6. In-App Notifications

**Overview:** Alerts for mentions, assignments, status changes.

**Validation:** 
- Valid notification type
- Target user exists
- Event source validation

**Business Rules:** 
- Only unread notifications show as active
- Auto-generate from system events
- User can bulk mark as read

**User Flows:**
1. Trigger event (mention, assignment) → create `Notification` record → socket emit
2. User views notifications → mark as read → update status
3. System cleanup → remove old read notifications

**Technical Details:**
- Entity: `Notification`
- Migration: `notifications`
- Tests: unit for type validation; integration for end-to-end alert delivery 