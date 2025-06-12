# Collaborative Platform MVP

> A Slack/Monday.com hybrid workspace combining real-time chat with lightweight project management for early adopters.

## 📚 Documentation

- [**Architecture**](./docs/ARCHITECTURE.md) - Technical design, patterns, and infrastructure
- [**Domain Model**](./docs/DOMAIN-MODEL.md) - Business rules and bounded contexts  
- [**Features**](./docs/FEATURES.md) - Detailed requirements and user stories
- [**Database Design**](./docs/DATABASE-DESIGN.md) - Schema, migrations, and data relationships
- [**API Design**](./docs/API-DESIGN.md) - REST endpoints and request/response formats
- [**Implementation Plan**](./docs/IMPLEMENTATION-PLAN.md) - Development roadmap and testing strategy

## 🎯 Project Overview

We are building a minimal but functional MVP using Domain-Driven Design (DDD) with a focus on real-time messaging and lightweight project management.

**Target Audience:** Early adopters needing combined chat and lightweight project management in a single workspace.

**MVP Features:**
- User Registration & Auth
- Organization Management  
- Real-Time Chat Channels (WebSocket)
- Kanban Boards & Issues
- File Attachments
- In-App Notifications

## 🏗️ Tech Stack

- **Database:** PostgreSQL (shared across all contexts)
- **Language:** Node.js with TypeScript
- **Web Framework:** Express.js
- **Real-time:** Socket.io WebSocket
- **Validation:** Zod schemas
- **Testing:** Jest + Supertest
- **Deployment:** Docker Compose

## 🚀 Architecture

**Layered DDD Architecture:**
- **Presentation Layer:** Controllers, Routes, HTTP handlers, Middleware
- **Application Layer:** Use Cases, DTOs (contracts), orchestrating Domain logic
- **Domain Layer:** Entities, Value Objects, Repositories, Domain Services
- **Infrastructure Layer:** Repository Implementations, Database Client, External Services

**Bounded Contexts:**
1. **Auth & User** - Authentication and user management
2. **Organization** - Workspace and membership management
3. **Chat** - Real-time messaging with WebSocket
4. **Project** - Kanban boards and issue tracking
5. **Attachment** - File upload and management
6. **Notification** - User alerts and notifications

## 📋 Development Roadmap

### Sprint 1: Foundation & Auth (Weeks 1-2)
- Docker setup + Auth Context
- User registration/login with JWT

### Sprint 2: Organization Management (Weeks 3-4)
- Organization CRUD + membership
- Admin/member roles

### Sprint 3: Real-Time Chat (Weeks 5-6)
- WebSocket integration
- Channels + real-time messaging

### Sprint 4: Project Management (Weeks 7-8)
- Kanban boards with fixed columns
- Issue lifecycle management

### Sprint 5: Attachments & Notifications (Weeks 9-10)
- File upload + basic notifications

### Sprint 6: Testing & Polish (Weeks 11-12)
- Complete test suite + production readiness

## 🧪 Testing Strategy

- **Unit Tests:** Domain logic + business rules (≥90% coverage)
- **Integration Tests:** API endpoints + database integration
- **WebSocket Tests:** Real-time messaging functionality
- **Docker Test DB:** Automated setup with fresh state per test suite

## 🌱 Database Seeding

**Shared Seeding System** - Each context provides default data:
- **Default Admin User:** `admin@platform.com` (password: `admin123`)
- **Default Organization:** "Platform Workspace" with admin membership
- **Default Channels:** #general and #announcements (auto-joined)
- **Sample Project Board:** "Getting Started" with demo issues and workflow
- **Welcome Notification:** Onboarding message for new users

**Benefits:**
- Immediate usable environment after setup
- Consistent dev/test data across team
- Example data showing all features

## 🐳 Docker Setup

```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: app_test
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
  app:
    build: .
    depends_on:
      - db
    environment:
      DATABASE_URL: postgres://user:pass@db:5432/app_test
```

## 🎯 Success Metrics

**Technical:**
- ≥90% test coverage on core logic
- Real-time WebSocket messaging functional
- Docker deployment ready

**Business:**
- All MVP features working end-to-end
- User registration → chat → project management flow complete

---

## Quick Start

### Local Development

```bash
# Clone and setup
git clone <repo>
cd collaborative-platform

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start development server
npm run dev
```

### Docker Compose

```bash
# Build and start containers (includes database seeding)
docker-compose up --build

# Database will be seeded with:
# - Default admin user: admin@platform.com
# - Default organization: "Platform Workspace"
# - Default channels: #general, #announcements
# - Sample project board with demo issues

# Run tests inside the container
docker-compose run app npm test
```

## Current Status

**Planning Phase Complete** - Ready for Sprint 1 implementation with simplified, minimal approach focused on core functionality.
