# Hexagonal Architecture (Ports & Adapters)

## 1. What is it?

The Hexagonal Architecture, also known as **Ports and Adapters**, is a software architecture pattern that aims to create loosely coupled application components that can be independently developed, tested, and evolved.

### Core Intent

The primary goal is to **decouple business logic from infrastructure concerns** (UI, databases, frameworks, external services), ensuring the core domain remains:
- **Stable** — Changes to infrastructure don't affect business rules
- **Testable** — Business logic can be tested in isolation
- **Flexible** — Technology choices can evolve without rewriting core logic

### Why "Hexagonal"?

The hexagon shape is merely a visual metaphor to represent multiple port/adapter combinations. The number of sides doesn't matter — it could be a pentagon or octagon. The key insight is that the application has **no inherent "top" or "bottom"** — all external interactions happen through ports on the edges.

## 2. Core Components

### a) Application Core (Domain)

The **heart of the system** containing:
- **Business logic** — Rules, policies, and workflows
- **Domain entities** — Core business objects with behavior
- **Use cases** — Application-specific operations
- **Domain events** — Significant business occurrences

**Key principle:** The domain should be **technology-agnostic** and have zero knowledge of:
- How it's invoked (HTTP, CLI, message queue)
- How data is persisted (SQL, NoSQL, file system)
- What frameworks are used (NestJS, Express, Spring)

### b) Ports

**Ports are interfaces** that define contracts for communication. They come in two types:

#### Driving Ports (Primary/Inbound)
- Define **how the domain can be used**
- Specify operations the application offers
- Examples: Use case interfaces, command handlers
- **Implementation lives inside** the hexagon (application services)

#### Driven Ports (Secondary/Outbound)
- Define **what the domain needs** from external systems
- Specify required functionality
- Examples: Repository interfaces, notification services
- **Implementation lives outside** the hexagon (adapters)

**Pro tip:** Each port should have at least two adapters — one real implementation and one for testing.

### c) Adapters

**Adapters translate** between the domain and specific technologies:

#### Driving Adapters (Primary)
- **Initiate interaction** with the application
- Convert technology-specific requests to domain calls
- Examples: REST controllers, GraphQL resolvers, CLI commands, test harnesses
- Located on the **left side** (driving side) of the hexagon

#### Driven Adapters (Secondary)
- **Respond to domain requests**
- Convert domain calls to technology-specific operations
- Examples: Database repositories, email services, message queue publishers
- Located on the **right side** (driven side) of the hexagon

### d) Actors

External entities that interact with the system:

- **Driving actors** — Initiate actions (users, tests, scheduled jobs)
- **Driven actors** — Provide services (databases, APIs, file systems)
  - **Recipients** — Only receive information (printers, message queues)
  - **Repositories** — Both provide and receive data (databases, caches)

### e) Dependency Flow

**Critical principle:** Dependencies point **inward** toward the domain.

```
Driving Adapter → Driving Port (interface) ← Application Service
                                                    ↓
Application Service → Driven Port (interface) ← Driven Adapter
```

This follows the **Dependency Inversion Principle**:
- High-level modules (domain) don't depend on low-level modules (infrastructure)
- Both depend on abstractions (ports/interfaces)
- Abstractions don't depend on details; details depend on abstractions

## 3. Key Benefits

### Testability
- Business logic can be tested in **complete isolation**
- Mock adapters easily replace real implementations
- No need for databases, web servers, or external services in unit tests
- Enables true Test-Driven Development (TDD)

### Technology Independence
- **Swap implementations** without touching business logic
- Migrate from SQL to NoSQL, REST to GraphQL, monolith to microservices
- Prevents vendor lock-in
- Facilitates gradual technology evolution

### Maintainability
- **Clear separation of concerns** makes code easier to understand
- Business logic isn't contaminated with technical details
- Changes are localized to specific layers
- Enables pair programming with business stakeholders

### Parallel Development
- Domain team works on core business logic
- Infrastructure team works on adapters
- Teams can work independently with clear contracts (ports)

### Domain-Driven Design Synergy
- Works exceptionally well with DDD principles
- Protects domain model from infrastructure leakage
- Each bounded context can have its own hexagonal architecture
- Enforces ubiquitous language in the core

## 4. Implementation Strategy

### Recommended Development Steps

1. **Test harness + mock driven adapters** — Validate business logic in isolation
2. **Real driving adapter + mock driven adapters** — Test user-facing interface
3. **Test harness + real driven adapters** — Verify infrastructure integration
4. **Real driving adapter + real driven adapters** — Full end-to-end validation

This approach ensures each component is tested independently before integration.

### Design by Purpose, Not Technology

Structure your system around **business capabilities** rather than technical layers:
- ❌ "Database layer", "API layer", "Service layer"
- ✅ "Order processing", "User management", "Payment handling"

This mindset shift leads to more maintainable and business-aligned architectures.

## 5. Common Pitfalls

⚠️ **Anemic domain model** — Entities with no behavior, just getters/setters  
⚠️ **Leaky abstractions** — Ports exposing infrastructure details  
⚠️ **Over-abstraction** — Creating ports for everything, even simple utilities  
⚠️ **Inconsistent boundaries** — Mixing domain and infrastructure code  
⚠️ **Ignoring the driving/driven distinction** — Treating all ports the same way

## 6. Success Factors

✅ **Strong domain understanding** — Know your business logic well  
✅ **Disciplined team** — Maintain architectural boundaries consistently  
✅ **Clear port contracts** — Well-designed interfaces that don't leak implementation  
✅ **Comprehensive testing** — Leverage testability benefits fully  
✅ **Continuous refactoring** — Keep the domain clean as understanding evolves
