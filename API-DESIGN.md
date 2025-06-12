# API Design

## API Design Principles

### RESTful Design
- Resource-based URLs with clear hierarchy
- HTTP methods for semantic operations (GET, POST, PUT, DELETE)
- Consistent response formats and status codes
- Stateless requests with JWT authentication

### Response Standards
- JSON format for all responses
- Consistent error handling and messaging
- Cursor-based pagination for list endpoints
- ISO 8601 timestamps with timezone information

### Authentication
- JWT Bearer tokens in Authorization header
- Refresh token mechanism for session management
- Role-based access control per organization

## Base URL Structure

```
https://api.platform.com/v1
```

### Organization Scoping
Most endpoints are scoped within organizations:
```
/v1/orgs/{orgId}/...
```

## Authentication Endpoints

### POST /v1/auth/register
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "tokens": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token",
    "expiresIn": 3600
  }
}
```

### POST /v1/auth/login
Authenticate user and receive tokens.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "tokens": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token",
    "expiresIn": 3600
  }
}
```

### POST /v1/auth/refresh
Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

**Response (200):**
```json
{
  "accessToken": "new-jwt-access-token",
  "expiresIn": 3600
}
```

### POST /v1/auth/logout
Revoke refresh token and logout.

**Headers:** `Authorization: Bearer {accessToken}`

**Response (204):** No content

## Organization Endpoints

### POST /v1/orgs
Create new organization.

**Headers:** `Authorization: Bearer {accessToken}`

**Request:**
```json
{
  "name": "My Organization",
  "description": "Organization description"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "My Organization",
  "slug": "my-organization",
  "description": "Organization description",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### GET /v1/orgs
List user's organizations.

**Headers:** `Authorization: Bearer {accessToken}`

**Response (200):**
```json
{
  "organizations": [
    {
      "id": "uuid",
      "name": "My Organization",
      "slug": "my-organization",
      "role": "admin",
      "joinedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### GET /v1/orgs/{orgId}
Get organization details.

**Headers:** `Authorization: Bearer {accessToken}`

**Response (200):**
```json
{
  "id": "uuid",
  "name": "My Organization",
  "slug": "my-organization",
  "description": "Organization description",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

## Channel Endpoints

### POST /v1/orgs/{orgId}/channels
Create new channel.

**Headers:** `Authorization: Bearer {accessToken}`

**Request:**
```json
{
  "name": "general",
  "description": "General discussion channel",
  "isPrivate": false
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "general",
  "description": "General discussion channel",
  "isPrivate": false,
  "createdBy": "uuid",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### GET /v1/orgs/{orgId}/channels
List organization channels.

**Headers:** `Authorization: Bearer {accessToken}`

**Query Parameters:**
- `limit` (optional): Number of channels to return (default: 20)
- `cursor` (optional): Pagination cursor

**Response (200):**
```json
{
  "channels": [
    {
      "id": "uuid",
      "name": "general",
      "description": "General discussion",
      "isPrivate": false,
      "memberCount": 15,
      "lastActivity": "2024-01-01T12:00:00Z"
    }
  ],
  "pagination": {
    "hasNext": true,
    "nextCursor": "cursor-string"
  }
}
```

### POST /v1/orgs/{orgId}/channels/{channelId}/join
Join a channel.

**Headers:** `Authorization: Bearer {accessToken}`

**Response (201):**
```json
{
  "channelId": "uuid",
  "userId": "uuid",
  "joinedAt": "2024-01-01T00:00:00Z"
}
```

## Message Endpoints

### POST /v1/orgs/{orgId}/channels/{channelId}/messages
Send message to channel.

**Headers:** `Authorization: Bearer {accessToken}`

**Request:**
```json
{
  "content": "Hello, everyone!",
  "messageType": "text",
  "replyToId": "uuid" // optional
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "content": "Hello, everyone!",
  "messageType": "text",
  "replyToId": null,
  "user": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe"
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "isEdited": false
}
```

### GET /v1/orgs/{orgId}/channels/{channelId}/messages
Get channel messages.

**Headers:** `Authorization: Bearer {accessToken}`

**Query Parameters:**
- `limit` (optional): Number of messages (default: 50)
- `cursor` (optional): Pagination cursor
- `before` (optional): Get messages before timestamp

**Response (200):**
```json
{
  "messages": [
    {
      "id": "uuid",
      "content": "Hello, everyone!",
      "messageType": "text",
      "user": {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Doe"
      },
      "reactions": [
        {
          "emoji": "👍",
          "count": 3,
          "userReacted": false
        }
      ],
      "attachments": [],
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "hasNext": true,
    "nextCursor": "cursor-string"
  }
}
```

### POST /v1/orgs/{orgId}/messages/{messageId}/reactions
Add reaction to message.

**Headers:** `Authorization: Bearer {accessToken}`

**Request:**
```json
{
  "emoji": "👍"
}
```

**Response (201):**
```json
{
  "messageId": "uuid",
  "emoji": "👍",
  "userId": "uuid",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

## Board Endpoints

### POST /v1/orgs/{orgId}/boards
Create new board.

**Headers:** `Authorization: Bearer {accessToken}`

**Request:**
```json
{
  "name": "Project Alpha",
  "description": "Main project board"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "Project Alpha",
  "description": "Main project board",
  "columns": [
    {
      "id": "uuid",
      "name": "Backlog",
      "position": 0
    },
    {
      "id": "uuid",
      "name": "In Progress",
      "position": 1
    },
    {
      "id": "uuid",
      "name": "Done",
      "position": 2
    }
  ],
  "createdBy": "uuid",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### GET /v1/orgs/{orgId}/boards
List organization boards.

**Headers:** `Authorization: Bearer {accessToken}`

**Response (200):**
```json
{
  "boards": [
    {
      "id": "uuid",
      "name": "Project Alpha",
      "description": "Main project board",
      "issueCount": 25,
      "createdBy": {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Doe"
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### GET /v1/orgs/{orgId}/boards/{boardId}
Get board with issues.

**Headers:** `Authorization: Bearer {accessToken}`

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Project Alpha",
  "description": "Main project board",
  "columns": [
    {
      "id": "uuid",
      "name": "Backlog",
      "position": 0,
      "issues": [
        {
          "id": "uuid",
          "title": "Implement user authentication",
          "description": "Add JWT-based auth system",
          "priority": "high",
          "assignedTo": {
            "id": "uuid",
            "firstName": "Jane",
            "lastName": "Smith"
          },
          "position": 0,
          "createdAt": "2024-01-01T00:00:00Z"
        }
      ]
    }
  ]
}
```

## Issue Endpoints

### POST /v1/orgs/{orgId}/boards/{boardId}/issues
Create new issue.

**Headers:** `Authorization: Bearer {accessToken}`

**Request:**
```json
{
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication system",
  "columnId": "uuid",
  "assignedTo": "uuid", // optional
  "priority": "high"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication system",
  "priority": "high",
  "position": 0,
  "assignedTo": {
    "id": "uuid",
    "firstName": "Jane",
    "lastName": "Smith"
  },
  "createdBy": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe"
  },
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### PUT /v1/orgs/{orgId}/issues/{issueId}/move
Move issue to different column.

**Headers:** `Authorization: Bearer {accessToken}`

**Request:**
```json
{
  "columnId": "uuid",
  "position": 1
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "columnId": "uuid",
  "position": 1,
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### POST /v1/orgs/{orgId}/issues/{issueId}/comments
Add comment to issue.

**Headers:** `Authorization: Bearer {accessToken}`

**Request:**
```json
{
  "content": "This looks good to me!"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "content": "This looks good to me!",
  "user": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe"
  },
  "createdAt": "2024-01-01T00:00:00Z"
}
```

## Attachment Endpoints

### POST /v1/attachments
Upload file attachment.

**Headers:** 
- `Authorization: Bearer {accessToken}`
- `Content-Type: multipart/form-data`

**Request:**
```
file: (binary file data)
parentType: "message" | "issue_comment"
parentId: "uuid"
```

**Response (201):**
```json
{
  "id": "uuid",
  "filename": "generated-filename.jpg",
  "originalName": "photo.jpg",
  "mimeType": "image/jpeg",
  "fileSize": 1024000,
  "uploadedBy": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe"
  },
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### GET /v1/attachments/{attachmentId}
Download attachment file.

**Headers:** `Authorization: Bearer {accessToken}`

**Response (200):** Binary file data with appropriate Content-Type header

## Notification Endpoints

### GET /v1/notifications
Get user notifications.

**Headers:** `Authorization: Bearer {accessToken}`

**Query Parameters:**
- `limit` (optional): Number of notifications (default: 20)
- `cursor` (optional): Pagination cursor
- `unreadOnly` (optional): Filter to unread notifications

**Response (200):**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "mention",
      "title": "You were mentioned",
      "message": "John mentioned you in #general",
      "sourceId": "uuid",
      "sourceType": "message",
      "isRead": false,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "hasNext": false,
    "nextCursor": null
  }
}
```

### PUT /v1/notifications/{notificationId}/read
Mark notification as read.

**Headers:** `Authorization: Bearer {accessToken}`

**Response (200):**
```json
{
  "id": "uuid",
  "isRead": true,
  "readAt": "2024-01-01T00:00:00Z"
}
```

### PUT /v1/notifications/read-all
Mark all notifications as read.

**Headers:** `Authorization: Bearer {accessToken}`

**Response (200):**
```json
{
  "updatedCount": 15
}
```

## Error Responses

### Standard Error Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `422` - Unprocessable Entity (business rule violation)
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error

## Rate Limiting

### Rate Limit Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

### Rate Limits by Endpoint Type
- **Authentication:** 10 requests/minute
- **File Upload:** 50 requests/hour
- **General API:** 1000 requests/hour
- **Real-time (WebSocket):** 100 messages/minute

## WebSocket Events

### Connection
```javascript
// Connect to organization-specific socket
const socket = io(`/orgs/${orgId}`, {
  auth: {
    token: accessToken
  }
});
```

### Event Types
```javascript
// New message in channel
socket.on('message:new', (data) => {
  // Handle new message
});

// User typing indicator
socket.emit('typing:start', { channelId });
socket.on('typing:user', (data) => {
  // Show typing indicator
});

// Real-time notifications
socket.on('notification:new', (data) => {
  // Show notification
});
``` 