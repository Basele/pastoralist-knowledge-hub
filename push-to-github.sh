#!/usr/bin/env bash
# ============================================================
#  Push Pastoralist Knowledge Hub to GitHub
#  Usage: ./push-to-github.sh
# ============================================================
set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[NOTE]${NC} $1"; }

GITHUB_USER="Basele"
REPO_NAME="pastoralist-knowledge-hub"
REPO_URL="https://github.com/$GITHUB_USER/$REPO_NAME.git"

info "Initialising git repository..."
git init
git add .
git commit -m "feat: initial commit — Pastoralist Indigenous Knowledge Hub

Full-stack application including:
- Node.js/Express backend with Prisma ORM (PostgreSQL + PostGIS)
- React 18 PWA frontend with Tailwind CSS
- Bilingual support: English & Swahili (i18next)
- Knowledge repository with 4-tier access control (Public/Community/Elder/Sacred)
- Leaflet interactive GIS map for pastoral locations
- Media uploads via Digital Ocean Spaces
- Elasticsearch full-text search
- JWT auth with refresh tokens and Redis blacklisting
- Docker Compose for local development
- Kubernetes manifests for Digital Ocean (DOKS, AMS3)
- GitHub Actions CI/CD pipeline
- Automated deploy script
- Realistic pastoralist seed data (Maasai, Turkana, Borana communities)"

info "Adding remote: $REPO_URL"
git remote add origin "$REPO_URL" 2>/dev/null || git remote set-url origin "$REPO_URL"

echo ""
warn "Next steps:"
echo "  1. Create the repo on GitHub: https://github.com/new"
echo "     Name: $REPO_NAME | Set to Public or Private"
echo ""
echo "  2. Then run:"
echo "     git push -u origin main"
echo ""
echo "  3. Add this GitHub Actions secret:"
echo "     DIGITALOCEAN_ACCESS_TOKEN = (your DO personal access token)"
echo "     Go to: https://github.com/$GITHUB_USER/$REPO_NAME/settings/secrets/actions"
echo ""
echo "  4. Deploy manually (first time):"
echo "     chmod +x infrastructure/scripts/deploy.sh"
echo "     ./infrastructure/scripts/deploy.sh"
echo ""
echo "  5. After that, every push to main auto-deploys via GitHub Actions."
