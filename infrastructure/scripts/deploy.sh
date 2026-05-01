#!/usr/bin/env bash
# ============================================================
#  Pastoralist Indigenous Knowledge Hub — Deploy Script
#  Target: Digital Ocean (AMS3 region)
#  Usage: ./infrastructure/scripts/deploy.sh
# ============================================================
set -euo pipefail

# ── Colors ──────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()    { echo -e "${GREEN}[INFO]${NC}  $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $1"; }
error()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }
section() { echo -e "\n${GREEN}━━━ $1 ━━━${NC}"; }

# ── Config ──────────────────────────────────────────────────
CLUSTER_NAME="pikh-cluster"
REGION="ams3"
NODE_SIZE="s-2vcpu-4gb"
NODE_COUNT=3
REGISTRY_NAME="pikh-registry"
DB_CLUSTER_NAME="pikh-postgres"
DB_SIZE="db-s-1vcpu-1gb"
APP_DOMAIN="pastoralistknowledge.org"

# ── Prerequisites check ──────────────────────────────────────
section "Checking prerequisites"
command -v doctl  >/dev/null 2>&1 || error "doctl not installed. Install: https://docs.digitalocean.com/reference/doctl/how-to/install/"
command -v kubectl>/dev/null 2>&1 || error "kubectl not installed."
command -v docker >/dev/null 2>&1 || error "Docker not installed."
info "All prerequisites found"

# ── Authenticate ─────────────────────────────────────────────
section "Authenticating with Digital Ocean"
if ! doctl account get &>/dev/null; then
  error "Not authenticated. Run: doctl auth init"
fi
info "Authenticated as: $(doctl account get --format Email --no-header)"

# ── Container Registry ────────────────────────────────────────
section "Setting up Container Registry"
if ! doctl registry get "$REGISTRY_NAME" &>/dev/null; then
  info "Creating container registry: $REGISTRY_NAME"
  doctl registry create "$REGISTRY_NAME" --region "$REGION"
else
  info "Registry already exists: $REGISTRY_NAME"
fi
doctl registry login

# ── Build & Push Images ───────────────────────────────────────
section "Building and pushing Docker images"
REGISTRY="registry.digitalocean.com/$REGISTRY_NAME"
TAG=$(git rev-parse --short HEAD 2>/dev/null || echo "latest")

info "Building backend image..."
docker build -f infrastructure/docker/backend.Dockerfile \
  -t "$REGISTRY/pikh-backend:$TAG" \
  -t "$REGISTRY/pikh-backend:latest" \
  ./backend

info "Building frontend image..."
docker build -f infrastructure/docker/frontend.Dockerfile \
  --build-arg VITE_API_URL="https://api.$APP_DOMAIN/api/v1" \
  -t "$REGISTRY/pikh-frontend:$TAG" \
  -t "$REGISTRY/pikh-frontend:latest" \
  ./frontend

info "Pushing images..."
docker push "$REGISTRY/pikh-backend:$TAG"
docker push "$REGISTRY/pikh-backend:latest"
docker push "$REGISTRY/pikh-frontend:$TAG"
docker push "$REGISTRY/pikh-frontend:latest"

# ── Managed PostgreSQL ─────────────────────────────────────────
section "Setting up Managed PostgreSQL"
if ! doctl databases get "$DB_CLUSTER_NAME" &>/dev/null; then
  info "Creating PostgreSQL cluster (this takes ~5 minutes)..."
  doctl databases create "$DB_CLUSTER_NAME" \
    --engine pg \
    --version 15 \
    --region "$REGION" \
    --size "$DB_SIZE" \
    --num-nodes 1
  info "Waiting for database to be ready..."
  while [[ "$(doctl databases get "$DB_CLUSTER_NAME" --format Status --no-header)" != "online" ]]; do
    sleep 15; echo -n "."
  done
  echo ""
else
  info "PostgreSQL cluster already exists"
fi

DB_URL=$(doctl databases connection "$DB_CLUSTER_NAME" --format URI --no-header)
info "Database ready: $(doctl databases get "$DB_CLUSTER_NAME" --format Host --no-header)"

# ── Kubernetes Cluster ────────────────────────────────────────
section "Setting up Kubernetes Cluster"
if ! doctl kubernetes cluster get "$CLUSTER_NAME" &>/dev/null; then
  info "Creating Kubernetes cluster (this takes ~5 minutes)..."
  doctl kubernetes cluster create "$CLUSTER_NAME" \
    --region "$REGION" \
    --size "$NODE_SIZE" \
    --count "$NODE_COUNT" \
    --auto-upgrade \
    --maintenance-window "saturday=02:00"
  info "Waiting for cluster to be ready..."
  doctl kubernetes cluster kubeconfig save "$CLUSTER_NAME"
  kubectl wait --for=condition=Ready nodes --all --timeout=300s
else
  info "Cluster already exists, saving kubeconfig..."
  doctl kubernetes cluster kubeconfig save "$CLUSTER_NAME"
fi

# ── Attach Registry to Cluster ────────────────────────────────
section "Attaching registry to cluster"
doctl kubernetes cluster registry add "$CLUSTER_NAME" || true

# ── Install nginx-ingress ─────────────────────────────────────
section "Installing nginx-ingress controller"
if ! kubectl get ns ingress-nginx &>/dev/null; then
  kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/do/deploy.yaml
  kubectl wait --namespace ingress-nginx \
    --for=condition=ready pod \
    --selector=app.kubernetes.io/component=controller \
    --timeout=120s
fi

# ── Install cert-manager ──────────────────────────────────────
section "Installing cert-manager for TLS"
if ! kubectl get ns cert-manager &>/dev/null; then
  kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.3/cert-manager.yaml
  kubectl wait --namespace cert-manager \
    --for=condition=ready pod \
    --selector=app.kubernetes.io/component=controller \
    --timeout=120s

  kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@$APP_DOMAIN
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - http01:
          ingress:
            class: nginx
EOF
fi

# ── Secrets ───────────────────────────────────────────────────
section "Creating Kubernetes secrets"
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)

# Prompt for Spaces credentials
echo ""
warn "You need to provide Digital Ocean Spaces credentials."
read -rp "DO_SPACES_KEY: " DO_SPACES_KEY
read -rp "DO_SPACES_SECRET: " DO_SPACES_SECRET

kubectl create namespace pikh --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic pikh-secrets \
  --namespace pikh \
  --from-literal=DATABASE_URL="$DB_URL" \
  --from-literal=JWT_SECRET="$JWT_SECRET" \
  --from-literal=JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET" \
  --from-literal=DO_SPACES_KEY="$DO_SPACES_KEY" \
  --from-literal=DO_SPACES_SECRET="$DO_SPACES_SECRET" \
  --from-literal=DO_SPACES_ENDPOINT="ams3.digitaloceanspaces.com" \
  --from-literal=DO_SPACES_BUCKET="pikh-media" \
  --from-literal=DO_SPACES_CDN_ENDPOINT="https://pikh-media.ams3.cdn.digitaloceanspaces.com" \
  --dry-run=client -o yaml | kubectl apply -f -

# ── Deploy Application ────────────────────────────────────────
section "Deploying application to Kubernetes"

# Update image tags
sed "s|pikh-backend:latest|pikh-backend:$TAG|g" infrastructure/kubernetes/01-backend.yaml | kubectl apply -f -
sed "s|pikh-frontend:latest|pikh-frontend:$TAG|g" infrastructure/kubernetes/02-frontend.yaml | kubectl apply -f -
kubectl apply -f infrastructure/kubernetes/00-namespace.yaml
kubectl apply -f infrastructure/kubernetes/03-services.yaml
kubectl apply -f infrastructure/kubernetes/04-ingress.yaml

# ── Run migrations ────────────────────────────────────────────
section "Running database migrations"
kubectl rollout status deployment/pikh-backend -n pikh --timeout=120s
kubectl exec -n pikh deploy/pikh-backend -- npx prisma migrate deploy
info "Migrations complete"

# ── Create DO Spaces bucket ───────────────────────────────────
section "Creating DO Spaces media bucket"
doctl compute cdn create --origin pikh-media.ams3.digitaloceanspaces.com || true

# ── Get Load Balancer IP ──────────────────────────────────────
section "Retrieving Load Balancer IP"
echo "Waiting for load balancer IP..."
LB_IP=""
while [ -z "$LB_IP" ]; do
  LB_IP=$(kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || true)
  [ -z "$LB_IP" ] && sleep 10 && echo -n "."
done
echo ""

# ── Summary ───────────────────────────────────────────────────
section "🎉 Deployment Complete!"
echo ""
info "Load Balancer IP: $LB_IP"
echo ""
echo -e "${YELLOW}DNS Configuration Required:${NC}"
echo "  Point these DNS records to: $LB_IP"
echo "    A  pastoralistknowledge.org     → $LB_IP"
echo "    A  www.pastoralistknowledge.org → $LB_IP"
echo "    A  api.pastoralistknowledge.org → $LB_IP"
echo ""
echo -e "${YELLOW}GitHub Actions Secrets to set:${NC}"
echo "  DIGITALOCEAN_ACCESS_TOKEN = (your DO personal access token)"
echo ""
echo -e "${GREEN}Once DNS propagates, your app will be live at:${NC}"
echo "  https://pastoralistknowledge.org"
echo "  https://api.pastoralistknowledge.org/api/docs"
echo ""
info "To seed the database with sample data:"
echo "  kubectl exec -n pikh deploy/pikh-backend -- npm run seed"
