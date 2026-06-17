# Metadata-Driven Application Platform Design

This document outlines the architecture and design for a metadata-driven platform (similar to Airtable, Notion, Retool) where users can create business applications dynamically without writing code.

## 1. Database Schema
Given the requirement for dynamic, customizable structures and the existing multi-tenant architecture, a document database (MongoDB) or a relational database with strong JSON support (PostgreSQL with `JSONB`) is ideal.

**Core Collections / Tables:**

*   **Organizations (Tenants):**
    *   `id`, `name`, `createdAt`, `updatedAt`
*   **Users & Roles:**
    *   `users`: `id`, `orgId`, `email`, `roleId`
    *   `roles`: `id`, `orgId`, `name`, `permissions` (JSON defining access rules)
*   **Entity Types (Custom Business Objects):**
    *   `id`, `orgId`, `name`, `description`
    *   `fields`: Array of objects defining the schema. Each contains:
        *   `id`, `name`, `type` (Text, Number, Date, Select, Relation, etc.)
        *   `required`, `options` (for selects), `targetEntityId` (for relations)
*   **Records (The actual data instances):**
    *   `id`, `orgId`, `entityTypeId`
    *   `data`: JSON object storing dynamic values where keys are field IDs.
*   **Views (UI Projections):**
    *   `id`, `orgId`, `entityTypeId`, `name`, `type` (Table, Kanban, Calendar)
    *   `config`: JSON storing filters, sorting rules, and visible fields.
*   **Workflows (Automations):**
    *   `id`, `orgId`, `entityTypeId`, `trigger` (JSON), `conditions` (JSON), `actions` (JSON array)

## 2. Domain Model
*   **Tenant:** The boundary of isolation. All metadata and records belong to a specific tenant.
*   **EntityType:** The blueprint or metadata definition. Represents the concept of a "Customer" or "Invoice" without hardcoding it into the backend.
*   **Field:** A property definition inside an EntityType, handling data types and constraints.
*   **Record:** A single instance of an EntityType holding unstructured JSON data that conforms to the EntityType's fields.
*   **Relation:** A specialized link referencing a Record in another EntityType.
*   **View:** A personalized configuration to display a subset of Records.

## 3. API Architecture
A RESTful API designed to manipulate metadata and dynamic records.

*   **Metadata Endpoints:**
    *   `GET /api/v1/entities`
    *   `POST /api/v1/entities`
    *   `PUT /api/v1/entities/{entityId}`
*   **Data Endpoints:**
    *   `GET /api/v1/entities/{entityId}/records` (Supports dynamic query params for filtering/sorting)
    *   `POST /api/v1/entities/{entityId}/records`
    *   `PUT /api/v1/entities/{entityId}/records/{recordId}`
*   **View & Workflow Endpoints:**
    *   `GET /api/v1/views/{viewId}/records` (Applies saved view config automatically)
    *   `CRUD /api/v1/workflows`

## 4. Metadata Engine
*   **Gatekeeper:** Intercepts incoming `Record` payloads and validates the `data` JSON against the `fields` defined in the `EntityType`.
*   **Validation:** Enforces type safety (e.g., ensuring a `Number` field only receives numerics) and referential integrity for `Relation` fields.
*   **Caching:** Since EntityType structures change rarely but are read constantly during validation, they should be aggressively cached in Redis.

## 5. Dynamic UI Rendering
Using the preferred stack (Next.js + TypeScript):
*   **Schema-Driven Components:** Instead of hardcoded pages, a core `DynamicForm` component accepts an `EntityType` definition. It loops through `fields` and renders matching inputs (e.g., `<TextInput>`, `<DatePicker>`, `<SelectDropdown>`).
*   **Dynamic Tables:** A `<DataGrid>` component builds its columns dynamically based on the EntityType fields and maps rows to the parsed `Record.data`.
*   **State & Data Fetching:** Utilize TanStack Query to manage the dynamic API payloads and cache UI state.

## 6. Workflow Engine
*   **Event-Driven Execution:** When a Record is created or updated, the backend publishes an internal event (e.g., `RecordUpdatedEvent`).
*   **Evaluation:** A Workflow Listener consumes these events, retrieves active Workflows for the `entityTypeId`, and evaluates their `conditions`.
*   **Asynchronous Processing:** If conditions pass, the engine executes the `actions` (sending emails, updating other records, firing webhooks) via a background job queue (e.g., using RabbitMQ, Kafka, or Spring Boot Async) to keep the core API responsive.

## 7. Scaling Strategy
*   **Multi-tenancy:** Leverage the existing ThreadLocal `TenantContext` to route traffic. As the platform scales, organizations with high data volumes can be sharded to dedicated databases.
*   **Indexing for Dynamic Data:**
    *   If using PostgreSQL, use `GIN` indexes on the `data` JSONB column.
    *   If using MongoDB, utilize wildcard indexes (`{ "data.$**": 1 }`) to ensure fast filtering across arbitrary dynamic fields.
*   **Read/Write Separation:** Route read-heavy traffic (like fetching Records for Views) to read-replicas.
*   **Microservices:** Extract the Workflow Engine and Webhook dispatchers into separate services to prevent heavy automation tasks from impacting API latency.
