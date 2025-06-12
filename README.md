## Title

DDD-Based MVP Database Implementation Plan

---

## 1. Overview

We will design and implement the core database layer of our Slack/Monday/Jira–style MVP using a strict Domain-Driven Design (DDD) approach. Each bounded context (module) will encapsulate its own data model, business logic, and persistence, with comprehensive unit and integration testing. The plan covers setup, design, testing, and deployment via Docker Compose.

---

## 2. Tech Stack & Libraries

* **Database:** PostgreSQL
* **Language:** Node.js with TypeScript
* **ORM / Query:** raw SQL via `pg` + `sql-template-strings`
* **Migrations:** `node-pg-migrate`
* **Validation:** `zod`
* **WebSockets:** `socket.io` (for eventual integration)
* **Testing:** `jest` (unit), `supertest` (integration)
* **Docker:** `docker`, `docker-compose`

---

## 3. Architecture & Design Patterns

* **Layered DDD Architecture**:

  * **Domain Layer:** Entities, Value Objects, Aggregates, Repositories Interfaces, Domain Services
  * **Application Layer:** Use Cases / Services, orchestrating Domain logic
  * **Infrastructure Layer:** SQL Migrations, Repository Implementations, DB Client, Docker Compose
* **Building Blocks:**

  * **Entities & Value Objects:** Immutable properties, encapsulated invariants
  * **Repositories:** Interfaces in Domain, SQL-based implementations in Infrastructure
  * **Factories:** For complex aggregate creation
  * **Domain Events:** (Stubbed for future) patterns for integration with real-time components

---

## 4. Bounded Contexts & Clear Boundaries

1. **Auth & User Context**
2. **Organization Context**
3. **Chat Context** (Channels, Messages, Reactions)
4. **Project Context** (Boards, Columns, Issues, Comments)
5. **Attachment Context**
6. **Notification Context**

Each context lives in its own folder, with independent schema, domain models, services, tests, and migrations.

---

## 5. Testing Strategy & Libraries

* **Unit Tests (Jest):** Domain logic, Value Object validations, Repository stubs
* **Integration Tests (Supertest + Test DB):** End-to-end flows against a running Postgres container
* **Test DB Setup:** Dockerized Postgres instance spun up before integration suite; migrations run automatically
* **Coverage Goal:** ≥ 90% on domain and application layers

---

## 6. Dockerization (Docker Compose)

```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: app_test
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - db_data:/var/lib/postgresql/data
    ports:
      - '5432:5432'
  app:
    build: .
    depends_on:
      - db
    environment:
      DATABASE_URL: postgres://user:pass@db:5432/app_test
    volumes:
      - .:/usr/src/app
    command: npm run test:integration
volumes:
  db_data:
```

---

## 7. Feature List & Target Audience

* **Target Audience:** Early adopters needing combined chat and lightweight project management in a single workspace.
* **MVP Features:**

  1. **User Registration & Auth**
  2. **Organization Management**
  3. **Real-Time Chat Channels**
  4. **Kanban Boards & Issues**
  5. **Attachments**
  6. **In-App Notifications**

---

## 8. Feature Details

### 8.1 User Registration & Auth

* **Overview:** Sign-up, login, JWT issuance, refresh tokens.
* **Validation:** Email format, password strength, unique email.
* **Business Rules:** One active refresh token per session; revoke on logout.
* **User Flows:**

  1. User submits sign-up form → Domain Service validates & creates User + Organization membership.
  2. Login → verify credentials → issue access & refresh tokens.
* **Technical Details:**

  * `User` Entity, `IUserRepository`, `UserRepositoryPg`.
  * Migrations: `users`, `refresh_tokens`.
  * Zod schemas for DTOs.
  * Tests: unit for password hashing & token logic; integration for full sign-up/login.

### 8.2 Organization Management

* **Overview:** Create and manage workspaces.
* **Validation:** Unique organization name.
* **Business Rules:** First user becomes Org Admin.
* **User Flows:**

  1. Admin creates org → persist `Organization` + `UserOrganization`.
* **Technical Details:**

  * `Organization` Entity, Repository interface and Pg implementation.
  * Migrations: `organizations`, `user_organizations`.
  * Tests: unit for role assignment; integration for org creation.

### 8.3 Real-Time Chat Channels

* **Overview:** Public/private channels, membership, messaging.
* **Validation:** Unique channel name per org, content length.
* **Business Rules:** Auto-add all org members to public channels.
* **User Flows:**

  1. Create channel → persist `Channel` + auto seed `ChannelMember`.
  2. Send message → create `Message` record.
* **Technical Details:**

  * Entities: `Channel`, `Message`, `Reaction`.
  * Migrations: `channels`, `channel_members`, `messages`, `message_reactions`.
  * Tests: unit for auto-membership logic; integration for chat flows.

### 8.4 Kanban Boards & Issues

* **Overview:** Boards with Backlog/In Progress/Done, issue tracking.
* **Validation:** Column names fixed; title required.
* **Business Rules:** Issues cannot move to non-existent columns.
* **User Flows:**

  1. Create board → seed columns.
  2. Create issue → assign to column.
  3. Move issue → update `column_id` + timestamp.
* **Technical Details:**

  * Entities: `Board`, `Column`, `Issue`, `IssueComment`.
  * Migrations: `boards`, `columns`, `issues`, `issue_comments`.
  * Tests: unit for seed logic; integration for issue lifecycle.

### 8.5 Attachments

* **Overview:** File upload metadata linking to messages or comments.
* **Validation:** Size ≤ 10 MB, one parent reference.
* **Business Rules:** Max 5 attachments per parent enforced in service.
* **User Flows:**

  1. Upload file → persist `Attachment`, store file locally.
* **Technical Details:**

  * Entity: `Attachment`.
  * Migration: `attachments`.
  * Tests: unit for parent-check logic; integration for file flow.

### 8.6 In-App Notifications

* **Overview:** Alerts for mentions, assignments, status changes.
* **Validation:** Valid notification type.
* **Business Rules:** Only unread until marked read.
* **User Flows:**

  1. Trigger event → create `Notification` record + socket emit.
* **Technical Details:**

  * Entity: `Notification`.
  * Migration: `notifications`.
  * Tests: unit for type validation; integration for end-to-end alert delivery.

---

## 9. Timeline & Sprints

* **Sprint 1:** Setup, Auth & Org Context
* **Sprint 2:** Chat Context
* **Sprint 3:** Project Context
* **Sprint 4:** Attachments & Notifications
* **Sprint 5:** Testing, Docker Compose polish, Documentation

*End of Plan.*
