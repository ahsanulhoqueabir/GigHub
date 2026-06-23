# 🚀 GigHub Backend API

[![NestJS Version](https://img.shields.io/badge/NestJS-v11.0.0-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Supabase Self-Hosted](https://img.shields.io/badge/Supabase-Self--Hosted-green?logo=supabase&logoColor=white)](https://supabase.com)
[![Docker Support](https://img.shields.io/badge/Docker-Enabled-blue?logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-UNLICENSED-grey.svg)]()

Welcome to the backend engine of **GigHub**, a robust freelance marketplace platform. This repository houses a production-grade, highly scalable **NestJS API** backed by a self-hosted **Supabase Stack** (PostgreSQL, Auth, Storage, Realtime) and a **Redis queueing system** (via BullMQ) for asynchronous tasks.

---

## 🗺️ System Architecture

GigHub uses a containerized, event-driven, real-time architecture to handle high-throughput marketplace operations:

```mermaid
graph TD
    %% Clients
    Client[Client App: Flutter / Next.js] -->|REST APIs / WS| Kong[Kong API Gateway :8000]
    
    %% API Gateway Routing
    subgraph Supabase Stack [Self-Hosted Supabase Infrastructure]
        Kong -->|Routing| GoTrue[Supabase Auth / GoTrue]
        Kong -->|Database API| PostgREST[PostgREST]
        Kong -->|Websockets| SupaRealtime[Supabase Realtime]
        Kong -->|Storage API| SupaStorage[Supabase Storage]
        PostgREST -->|Direct Query| Postgres[(PostgreSQL DB)]
    end
    
    %% NestJS Backend Stack
    Client -->|API Requests :3001| NestAPI[NestJS Backend API]
    NestAPI -->|Authentication / JWT| GoTrue
    NestAPI -->|Transactional Queries| Postgres
    NestAPI -->|Queue Jobs| Redis[(Redis DB :6379)]
    
    %% Background Workers & External Services
    subgraph Background Workers
        NestAPI -->|BullMQ Tasks| BullMQ[BullMQ Worker]
        BullMQ -->|Process Queue| Redis
    end

    subgraph External Cloud Services
        NestAPI -->|File Uploads / CDN| CloudflareR2[Cloudflare R2 Storage]
        NestAPI -->|Push Notifications| FCM[Firebase Cloud Messaging]
    end
```

### Key Technology Stack
* **Framework**: NestJS 11+ (TypeScript)
* **API Security**: Helmet, CORS validation, class-validator pipes, and global error exception filters.
* **Database & Auth**: PostgreSQL (with RLS policies and triggers) + Supabase Auth.
* **Real-time Engine**: Supabase Realtime (websocket publication/subscription).
* **Distributed Task Queue**: Redis (via BullMQ) for processing notifications, mailers, and async triggers.
* **Storage**: Cloudflare R2 S3-compatible object storage with presigned URLs.
* **Push Notifications**: Firebase Cloud Messaging (FCM).

---

## 📂 Repository Directory Structure

```
├── bruno/                  # Bruno API Testing Collections (organized by domain)
├── src/                    # NestJS Application Source
│   ├── main.ts             # Application bootstrapping (Cors, Helmet, Validation)
│   ├── app.module.ts       # Central Application module imports
│   ├── auth/               # User Authentication & Verification services
│   ├── category/           # Role-based marketplace category hierarchy
│   ├── chat/               # 1-to-1 Realtime chat & media share system
│   ├── common/             # Global filters, decorators, and interceptors
│   ├── config/             # Environment configuration and validation schemas
│   ├── database/           # Supabase DB provider services
│   ├── firebase/           # FCM Admin SDK wrapper and push messaging
│   ├── gig/                # Freelancer services/gig management
│   ├── job/                # Job board posting logic
│   ├── job-proposal/       # Client/Freelancer bid proposals
│   ├── order/              # Escrow-based ordering system & triggers
│   ├── profile/            # User profile management & RBAC roles
│   ├── storage/            # Cloudflare R2 presigned URL helpers
│   └── types/              # Centralized TypeScript definitions
├── infrastructure/
│   └── supabase/           # Self-hosted Supabase Docker infrastructure
│       ├── dev/            # Local developer configs (data seeds, mock SMTP)
│       ├── utils/          # Key generators, password changers, DB tools
│       ├── setup.sh        # System setup bootstrap script
│       ├── run.sh          # Lifecycle CLI manager for Supabase containers
│       └── reset.sh        # Data wiping & environment reset utility
├── Dockerfile              # Multi-stage production NestJS API image definition
├── docker-compose.yml      # Roots API and Redis docker configuration
└── .env.example            # Backend environmental template
```

---

## 💻 Local Development Setup

To spin up the entire system locally, follow this sequence:

### Prerequisites
Make sure your development machine has the following tools installed:
* **Node.js**: v22.x or later
* **Docker Engine**: v24.x or later
* **Docker Compose**: v2.x or later
* **Git** & **OpenSSL**

---

### Step 1: Clone the Project and Install Dependencies
```bash
git clone <repository-url> backend
cd backend
npm install
```

---

### Step 2: Set Up Self-Hosted Supabase Locally
We run a dedicated self-hosted Supabase stack within the `infrastructure/supabase` folder.

1. Navigate to the Supabase directory:
   ```bash
   cd infrastructure/supabase
   ```
2. Initialize environment config and cryptographic keys (JWT tokens, API roles):
   ```bash
   # Run interactive setup (or add '-y' to accept defaults)
   sh setup.sh
   ```
3. Enable **development overrides** (disables DB volume persistence and mounts mock seed files):
   ```bash
   sh run.sh config add dev
   ```
4. Start the Supabase stack:
   ```bash
   sh run.sh start
   ```

*Note: For local testing, Supabase Studio is accessible at `http://localhost:8000` (or `http://localhost:8082` depending on your configurations). Safe emails are intercepted locally and can be viewed using **Inbucket** at `http://localhost:9000`.*

---

### Step 3: Run Database Migrations & Seeds
Once Supabase Postgres is running (accessible locally at `postgresql://postgres:postgres@localhost:5432/postgres`), initialize the marketplace database schema:

```bash
# Execute schemas in order using your SQL tool of choice or pg_dump
psql -h localhost -U postgres -d postgres -f gigs_jobs.sql
psql -h localhost -U postgres -d postgres -f category.sql
psql -h localhost -U postgres -d postgres -f chat.sql
psql -h localhost -U postgres -d postgres -f dev/data.sql
```

---

### Step 4: Configure Backend Environment Variables
1. Go back to the root backend directory:
   ```bash
   cd ../..
   ```
2. Copy the example configuration:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and fill in the secrets generated by Supabase (obtainable via `sh run.sh secrets` inside `infrastructure/supabase`) along with your cloud credentials:

```ini
NODE_ENV=development
PORT=3001

# Secret generated during Supabase setup (JWT_SECRET)
JWT_SECRET=your-supabase-jwt-secret
JWT_EXPIRES_IN=30d

# Direct connection to the Postgres Database container
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres

# Redis broker configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Cloudflare R2 Bucket credentials
R2_ACCOUNT_ID=your-r2-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET=gighub-media
R2_PUBLIC_URL=https://cdn.gighub.example.com

# Firebase Admin SDK Configuration for FCM push notifications
FCM_PROJECT_ID=gighub-fcm
FCM_CLIENT_EMAIL=firebase-adminsdk@...gserviceaccount.com
FCM_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC..."
```

---

### Step 5: Start Redis & the NestJS Server
You can run Redis locally via Docker and start the NestJS dev server side-by-side:

```bash
# Start local Redis container
docker compose up -d redis

# Run NestJS API in development/watch mode
npm run start:dev
```
The API is now running and live at: **`http://localhost:3001`**.

---

## 🐳 VPS Deployment Plan (Staging & Production)

Deploying a self-hosted backend infrastructure requires separate containerized instances for database integrity, API caching, and scale.

### 🌐 Deployment Architecture
On a Virtual Private Server (VPS) (e.g., DigitalOcean, Hetzner, AWS EC2 running Ubuntu 24.04 LTS), we deploy:
1. **Supabase Stack**: Running in its own docker-compose network (Kong gateway, Auth, Database, Storage).
2. **NestJS API + Redis**: Running in a separate docker-compose network.
3. **Reverse Proxy (Caddy or Nginx)**: Handles TLS (SSL) handshakes, maps domain routing to the Kong Gateway and NestJS API, and protects internal ports.

---

### 🛠️ Step-by-Step VPS Deployment Guide

#### 1. System Preparation
Login to your VPS and install Docker & Docker Compose:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git openssl jq ca-certificates

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

#### 2. Configure Firewall (UFW)
Only expose ports that must be public. Lock down database and internal ports:
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP (Reverse proxy)
sudo ufw allow 443/tcp     # HTTPS (Reverse proxy)
sudo ufw enable
```

#### 3. Deploy Production Supabase
Clone the project on your VPS and navigate to the Supabase directory:
```bash
cd backend/infrastructure/supabase
```
Initialize the production environment config. Ensure you use the VPS public DNS or IP address:
```bash
# Start setup
# When prompted, provide your staging/production domains:
# e.g., SUPABASE_PUBLIC_URL = https://supabase.yourdomain.com
# PROXY_DOMAIN = supabase.yourdomain.com
sh setup.sh
```
Secure the production `.env` configuration file:
* Update `POSTGRES_PASSWORD` to a highly secure string.
* Update `DASHBOARD_PASSWORD` (access to Supabase Studio).
* Ensure RLS policies are enabled by default for all schemas (`category.sql`, `chat.sql`, `gigs_jobs.sql`).

Start the production services:
```bash
# Pull and start services
sh run.sh start
```

#### 4. Setup Domain Proxying and SSL (Caddy Example)
Caddy automatically provisions SSL certificates. Create a `/etc/caddy/Caddyfile` on the VPS host:

```caddy
# Route requests for NestJS Backend
api.yourdomain.com {
    reverse_proxy localhost:3001
}

# Route requests for Supabase Kong Gateway
supabase.yourdomain.com {
    reverse_proxy localhost:8000
}
```
Start and enable Caddy:
```bash
sudo systemctl enable --now caddy
```

#### 5. Deploy NestJS API and Redis (Dockerized)
Configure the production environment variables in the root directory `.env` file. Ensure that:
* `NODE_ENV=production`
* `DATABASE_URL` uses the production PostgreSQL password and points to `localhost` (if port `5432` is exposed to host network) or the internal docker network.
* `REDIS_HOST=redis` (resolves internally in the root compose network).

Start the dockerized NestJS API and Redis queue:
```bash
# Spin up production containers
docker compose -f docker-compose.yml up -d --build
```
This builds the multi-stage Alpine Node image, installs dependencies, runs the NestJS build target, and launches the runtime server under PM2/Node CLI on container port `3001`.

---

## 🔒 Production Security Checklist
* [ ] **Cryptographic Keys**: Never reuse keys generated during local setup. Run `sh setup.sh` on the target host to generate site-specific salts and keypairs.
* [ ] **Disable direct DB access**: Make sure Postgres port `5432` is blocked by UFW from external interfaces.
* [ ] **CORS Configurations**: Update the CORS config in `src/main.ts` to allow only client origins (e.g. `https://gighub.com`, `https://admin.gighub.com`).
* [ ] **Rate Limiting**: Implement NestJS `ThrottlerGuard` to prevent DDoS or credential stuffing attacks.
* [ ] **Data Volume Backup**: Set up a daily cron job on the VPS to dump the Postgres database and back it up securely in Cloudflare R2:
  ```bash
  docker exec -t supabase-db pg_dumpall -U postgres | gzip > /backups/db_$(date +%F).sql.gz
  ```

---

## 🔌 API Testing (Bruno)

API routes are documented and mockable using **Bruno**, an open-source IDE for API testing.
1. Download [Bruno Desktop](https://www.usebruno.com/).
2. Open Bruno and select **"Open Collection"**.
3. Import the `bruno/` directory at the root of this project.
4. Set up your environments in Bruno (e.g. `Local` pointing to `http://localhost:3001` or `Production` pointing to `https://api.yourdomain.com`).
5. Use `Auth/Register` or `Auth/Login` to obtain JWT Bearer tokens. Bruno will automatically store and reuse tokens across subsequent requests.

---

## 🧪 Running Tests

```bash
# Unit tests
npm run test

# End-to-End integration tests
npm run test:e2e

# Test coverage reports
npm run test:cov
```

---

## 📄 License
Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE). GigHub backend code is UNLICENSED and proprietary.
