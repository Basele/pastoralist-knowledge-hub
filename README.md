# 🌍 Pastoralist Indigenous Knowledge Hub

A full-stack platform to document, preserve, and share pastoralist indigenous knowledge — with community-controlled access, multilingual support (English & Swahili), geospatial mapping, and offline capability.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS, Leaflet (maps), i18next |
| Backend | Node.js, Express, Prisma ORM |
| Database | PostgreSQL + PostGIS |
| Search | Elasticsearch |
| Cache | Redis |
| Storage | Digital Ocean Spaces (S3-compatible) |
| Auth | JWT + refresh tokens |
| Infra | Docker, Kubernetes (DOKS), GitHub Actions |
| Region | Digital Ocean AMS3 (Amsterdam — closest to East Africa) |

## Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Git

### 1. Clone the repo
```bash
git clone https://github.com/Basele/pastoralist-knowledge-hub.git
cd pastoralist-knowledge-hub
```

### 2. Set up environment variables
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit both .env files with your values
```

### 3. Start everything with Docker Compose
```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- API Docs: http://localhost:4000/api/docs

### 4. Run database migrations & seeds
```bash
docker-compose exec backend npx prisma migrate dev
docker-compose exec backend npm run seed
```

## Project Structure

```
pastoralist-knowledge-hub/
├── backend/                  # Node.js/Express API
│   ├── src/
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/       # Auth, validation, error handling
│   │   ├── models/           # Prisma models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   └── utils/            # Helpers
│   └── prisma/               # Schema & migrations
├── frontend/                 # React PWA
│   └── src/
│       ├── components/       # UI components
│       ├── pages/            # Route pages
│       ├── store/            # Zustand state
│       └── i18n/             # English & Swahili translations
├── database/                 # SQL migrations & seeds
├── infrastructure/
│   ├── kubernetes/           # K8s manifests
│   ├── docker/               # Dockerfiles
│   └── scripts/              # Deploy scripts
└── .github/workflows/        # CI/CD pipelines
```

## Deployment to Digital Ocean

See [infrastructure/scripts/deploy.sh](infrastructure/scripts/deploy.sh) for the full automated deployment script.

```bash
chmod +x infrastructure/scripts/deploy.sh
./infrastructure/scripts/deploy.sh
```

## Knowledge Access Tiers

| Tier | Who | What |
|------|-----|------|
| Public | Anyone | General knowledge, ecology guides, public maps |
| Community | Verified members | Detailed practices, oral histories |
| Elder/Custodian | Designated custodians | Sensitive practices, ceremonial context |
| Sacred/Restricted | Explicit consent only | Encrypted, community-governed |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT — See [LICENSE](LICENSE)
