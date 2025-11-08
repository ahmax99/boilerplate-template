# Hexagonal Architecture (Ports & Adapters)

## 1. What is it?  
- The Hexagonal Architecture is a software-architecture pattern introduced by Alistair Cockburn in ~2005. :contentReference[oaicite:2]{index=2}  
- Also called “Ports and Adapters” architecture. :contentReference[oaicite:3]{index=3}  
- Its goal: to **decouple** the core business logic (domain) from external concerns (UI, databases, frameworks, external services) so that the core remains stable, testable, flexible. :contentReference[oaicite:4]{index=4}  
- The “hexagon” metaphor: the application core sits in the middle, many ports (interfaces) on the sides, which connect to adapters. The sides aren’t necessarily six, but the diagram uses a hexagon. :contentReference[oaicite:5]{index=5}  

## 2. Core components / structure  
### a) Application Core (Domain)  
- Contains business logic, entities, use cases. This part should not know anything about how it’s invoked (HTTP, CLI, etc) or how it persists data. :contentReference[oaicite:6]{index=6}  
- Ideally framework-agnostic.

### b) Ports  
- These are interfaces (contracts) exposed by the core to the outside world (Inbound/Input Ports) or required by the core to interact with external systems (Outbound/Output Ports). :contentReference[oaicite:7]{index=7}  
- For example: a repository interface for saving an entity, or a service interface for sending emails.

### c) Adapters  
- Concrete implementations of the ports. They sit on the outer layer, e.g., HTTP controllers, database repositories, external API clients. :contentReference[oaicite:8]{index=8}  
- Because the core depends only on interfaces (ports), you can swap adapters without touching core logic.

### d) Composition / Wiring  
- At application startup, you wire concrete adapters to the ports and bootstrap the system.  
- Dependencies go **outside-in**: outer layers depend on inner layers (interfaces inwards), not the other way around. :contentReference[oaicite:9]{index=9}  

## 3. Why use it? (Benefits)  
- **Testability**: Since the core is isolated, you can write pure unit tests against it without infrastructure concerns. :contentReference[oaicite:10]{index=10}  
- **Flexibility / Adaptability**: Change DB, framework, messaging system, UI technology without touching core business logic. :contentReference[oaicite:11]{index=11}  
- **Maintainability**: Clear separation of concerns → easier to reason about, evolve features. :contentReference[oaicite:12]{index=12}  
- **Team-scale / parallel development**: Domain team can work on core; infrastructure team works on adapters.  
- When using NestJS, leverages its DI (dependency-injection) and modular architecture to help structure in this style. :contentReference[oaicite:13]{index=13}  

## 4. Challenges / When to use with caution  
- **Over-engineering**: For small/simple applications the extra layers and abstractions might add unnecessary complexity. :contentReference[oaicite:14]{index=14}  
- **Learning curve**: Teams unfamiliar with ports/adapters need time to get comfortable with abstractions. :contentReference[oaicite:15]{index=15}  
- **Port/interface design matters**: Poorly designed ports become rigid or leaky abstractions. :contentReference[oaicite:16]{index=16}  
- **Not a silver bullet**: It’s a tool. For trivial CRUD apps with low change risk maybe simpler patterns suffice.


