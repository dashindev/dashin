# Fullstack Atomo + Dashin Admin Scaffold

Production-grade fullstack application powered by **Atomo Rust Core** (high-performance event sourcing & BaaS) and **Dashin** (zero-code dynamic schema admin framework).

## Architecture

- **Backend**: Atomo (Rust, CQRS/ES, D1/Postgres, GraphQL + REST)
- **Frontend**: Dashin (React 18 + Vite + Tailwind CSS)
- **Features**:
  - Dynamic zero-code schema discovery & CrudTable rendering
  - RelatedPreview stacked cross-entity drawer drill-down
  - Visual drag-and-drop Block Canvas field editor
  - Real-time Observability dashboard for job queue & read-model projectors
  - Declarative Workflow Designer with action pipelines

## Quickstart

### 1. Run via Docker Compose (Recommended)

```bash
docker compose up -d
```

- Dashin Admin UI: [http://localhost:3000](http://localhost:3000)
- Atomo Rust API: [http://localhost:8080](http://localhost:8080)
- Postgres: `localhost:5432`

### 2. Run Frontend Locally

```bash
# Install dependencies
yarn install

# Start Vite dev server
yarn dev
```
