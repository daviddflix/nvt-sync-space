# System Architecture

## Tech Stack & Libraries

* **Database:** PostgreSQL
* **Language:** Node.js with TypeScript
* **Web Framework:** Express.js
* **ORM / Query:** raw SQL via `pg` + `sql-template-strings`
* **Migrations:** `node-pg-migrate`
* **Validation:** `zod`
* **WebSockets:** `socket.io` (real-time messaging)
* **Testing:** `jest` (unit), `supertest` (integration)
* **Docker:** `docker`, `docker-compose`

## Architecture & Design Patterns

### Layered DDD Architecture

* **Presentation Layer:** Controllers, Routes, HTTP handlers, Middleware
* **Application Layer:** Use Cases / Services, DTOs (contracts), orchestrating Domain logic
* **Domain Layer:** Entities, Value Objects, Aggregates, Repositories Interfaces, Domain Services
* **Infrastructure Layer:** Repository Implementations, Database Client, External Service Integrations

### Building Blocks

* **Entities & Value Objects:** Immutable properties, encapsulated invariants
* **Repositories:** Interfaces in Domain, SQL-based implementations in Infrastructure
* **Factories:** For complex aggregate creation
* **Domain Events:** (Stubbed for future) patterns for integration with real-time components

## Infrastructure Design

### Dockerization (Docker Compose)

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

## Project Directory Structure

```
collaborative-platform/
├── src/
│   ├── contexts/                    # Bounded contexts
│   │   ├── auth/                   # Auth & User Context
│   │   │   ├── presentation/
│   │   │   │   ├── controllers/    # AuthController
│   │   │   │   └── routes/         # Auth endpoints
│   │   │   ├── application/
│   │   │   │   ├── usecases/       # RegisterUser, LoginUser
│   │   │   │   └── dtos/           # Use case contracts (Zod schemas)
│   │   │   ├── domain/
│   │   │   │   ├── entities/       # User, RefreshToken
│   │   │   │   ├── repositories/   # IUserRepository
│   │   │   │   └── services/       # AuthService
│   │   │   └── infrastructure/
│   │   │       ├── repositories/   # UserRepositoryPg
│   │   │       └── external/       # External auth services
│   │   ├── organization/           # Organization Context
│   │   │   ├── presentation/
│   │   │   ├── application/
│   │   │   ├── domain/
│   │   │   └── infrastructure/
│   │   ├── chat/                   # Chat Context
│   │   │   ├── presentation/
│   │   │   ├── application/
│   │   │   ├── domain/
│   │   │   └── infrastructure/
│   │   ├── project/                # Project Context
│   │   │   ├── presentation/
│   │   │   ├── application/
│   │   │   ├── domain/
│   │   │   └── infrastructure/
│   │   ├── attachment/             # Attachment Context
│   │   │   ├── presentation/
│   │   │   ├── application/
│   │   │   ├── domain/
│   │   │   └── infrastructure/
│   │   └── notification/           # Notification Context
│   │       ├── presentation/
│   │       ├── application/
│   │       ├── domain/
│   │       └── infrastructure/
│   ├── shared/                     # Shared utilities
│   │   ├── database/
│   │   │   └── connection.ts
│   │   ├── middleware/             # Auth, CORS, validation
│   │   ├── types/                  # Common TypeScript types
│   │   └── utils/                  # Helper functions
│   ├── app.ts                      # Express app setup
│   └── server.ts                   # Server entry point
├── tests/
│   ├── unit/                       # Unit tests by context
│   ├── integration/                # Integration tests
│   └── fixtures/                   # Test data
├── migrations/                     # Database migrations
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── docker-compose.override.yml
├── .env.example
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## Cross-Cutting Concerns

### Authentication
- JWT-based authentication
- Access and refresh token pattern
- Role-based access control

### Validation
- Application layer defines contracts via Zod schemas
- Presentation layer validates HTTP requests against Application DTOs
- Domain layer enforces business invariants within entities
- Infrastructure layer handles database constraints

### Data Access
- Repository pattern with interface segregation
- Raw SQL with prepared statements
- Migration-driven schema evolution 