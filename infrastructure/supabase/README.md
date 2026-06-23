# 🐳 Self-Hosted Supabase for GigHub

This directory contains the containerized, self-hosted **Supabase Stack** tailored specifically for the GigHub Backend. It bundles all the necessary services (Database, Authentication, Storage, Realtime, API Gateway, and Studio) into a localized, easy-to-manage Docker Compose configuration.

---

## 🏛️ Directory Layout

* **`/dev`**: Contains overrides and seeding tools for local developers.
  * `docker-compose.dev.yml`: Overrides container settings (disables DB persistence, binds local Inbucket mock mailer, exposes dev ports).
  * `data.sql`: Seed data insert script for profiles, categories, and marketplace tests.
  * `add_rls_profile.sql`: Helper query to inject profile Row Level Security policies.
* **`/utils`**: Operations and maintenance scripts.
  * `generate-keys.sh`: Generates standard legacy Supabase API keys & JWT secrets.
  * `add-new-auth-keys.sh`: Generates modern asymmetric API public/private keys.
  * `db-passwd.sh`: Safe database password rotation wrapper.
  * `upgrade-pg17.sh`: PostgreSQL major-version upgrade script.
  * `rotate-new-api-keys.sh`: API key rotation helper.
* **`docker-compose.yml`**: The main base file containing the core Supabase container stack.
* **`docker-compose.*.yml`**: Compose override files layered dynamically based on deployment environments.
* **`setup.sh`**, **`run.sh`**, and **`reset.sh`**: Main lifecycle management scripts.

---

## 🛠️ Core Lifecycle Scripts

To avoid dealing with verbose Docker Compose arguments, use these three provided scripts:

### 1. The Bootstrap Script: `setup.sh`
This script initializes a fresh project from scratch. It is designed to run idempotently on local developer boxes as well as on Linux VPS instances.

**What it does:**
1. **Dependency Verification**: Inspects the host OS family (Debian/Ubuntu vs. RHEL/CentOS) and installs system utilities if missing: `git`, `openssl`, `jq`, and `ca-certificates`.
2. **Docker Provisioning**: Detects if Docker Engine and the Docker Compose plugin are available. If not, it automates the repository setups and installs them.
3. **Sparse-Clones Supabase**: Grabs clean Docker setup files if bootstrapping a fresh, empty workspace.
4. **URL Configuration**: Prompts the user to set up key endpoints:
   * `SUPABASE_PUBLIC_URL`: Main entry point (Studio + APIs). Default: `http://localhost:8000`.
   * `API_EXTERNAL_URL`: Authentication callback URLs. Default: matches `SUPABASE_PUBLIC_URL`.
   * `SITE_URL`: Root site redirect path. Default: `http://localhost:3000`.
   * `PROXY_DOMAIN`: Used by reverse proxy services (e.g. Caddy, Nginx) to terminate TLS.
5. **Key Generation**: Automatically invokes keys utilities to write custom cryptographically random JWT salts, anon keys, and service keys to `.env`.

**Usage:**
```bash
# Run interactively (asks for URL overrides)
sh setup.sh

# Non-interactive mode (assumes all local defaults immediately)
sh setup.sh -y

# Custom project folder output
sh setup.sh --project-dir my-supabase-config
```

---

### 2. The Lifecycle Manager: `run.sh`
This script acts as a proxy to `docker compose`. It is wrapper-aware, meaning it loads layered configuration files configured inside your `.env` (via the `COMPOSE_FILE` variable).

**Usage:**
```bash
sh run.sh <command> [options]
```

**Common Commands:**
* `sh run.sh start`: Starts all containers in detached mode and waits for healthchecks (`docker compose up -d --wait`).
* `sh run.sh stop`: Shuts down the stack and releases ports (`docker compose down`).
* `sh run.sh status`: Shows container statuses, healthcheck results, and port mapping tables (`docker compose ps`).
* `sh run.sh logs [service]`: Follows container logs (e.g., `sh run.sh logs auth`).
* `sh run.sh secrets`: Prints out your active Database Passwords and API Key secrets directly from `.env`.
* `sh run.sh recreate [service]`: Recreates a specific container without stopping the rest of the stack (e.g., `sh run.sh recreate storage`).
* `sh run.sh config add <name>`: Appends a Compose override file to the active stack.
* `sh run.sh config remove <name>`: Removes an override file.

---

### 3. The Teardown Script: `reset.sh`
A destructive cleanup script designed to purge active containers, wipe databases, and restore defaults.

**What it does:**
1. Stops and removes all containers, networks, and orphans using the active development configuration.
2. Clears the local directories mounted to containers (removes database storage `./volumes/db/data` and file uploads `./volumes/storage`).
3. Renames the active `.env` config file to `.env.old` as a backup.
4. Restores `.env` by copying a clean version from `.env.example`.

**Usage:**
```bash
# Prompted confirmation mode
sh reset.sh

# Force reset immediately (bypass warnings)
sh reset.sh -y
```

---

## 💻 Local Development Override Mode

By default, self-hosted Supabase persists the PostgreSQL database to a local disk volume `./volumes/db/data`. To work with a fast, ephemeral container setup containing mock data, enable development mode:

1. **Activate Dev Config**:
   ```bash
   sh run.sh config add dev
   ```
   This updates the `COMPOSE_FILE` in `.env` to:
   ```ini
   COMPOSE_FILE=docker-compose.yml:./dev/docker-compose.dev.yml
   ```
2. **What this enables:**
   * Wipes database volume persistence (resets db state on every container restart).
   * Runs local SQL seed files from `./dev/data.sql` during start-up.
   * Runs the local mock mailer **Inbucket** on port `9000` (web portal) and `2500` (SMTP catch-all) for auth registration flow intercepts.
3. **Deactivate Dev Config**:
   ```bash
   sh run.sh config remove dev
   ```

---

## 💾 Database Schema Setup

After spinning up the Supabase stack, you need to apply the schemas. Apply these DDL queries directly to the Postgres database:
1. `gigs_jobs.sql`: Installs core business objects (Gigs, Jobs, Proposals, Orders).
2. `category.sql`: Installs the Category tree and enables Row Level Security (RLS) policies.
3. `chat.sql`: Installs Chat rooms, Chat messages, Realtime publication channels, and the trigger function to auto-create rooms when orders are accepted.

You can apply these using the Supabase Studio SQL Editor (`http://localhost:8000` -> SQL Editor) or via `psql`:
```bash
psql -h localhost -p 5432 -U postgres -d postgres -f gigs_jobs.sql
psql -h localhost -p 5432 -U postgres -d postgres -f category.sql
psql -h localhost -p 5432 -U postgres -d postgres -f chat.sql
```

---

## 🌐 Production VPS Deployment

When running this self-hosted stack on a remote virtual private server (VPS), follow these configuration guidelines:

### 1. Network Lockdowns
By default, Docker exposes ports globally. Block access to database port `5432` and other internal endpoints via the host firewall (UFW).
```bash
sudo ufw default deny incoming
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # Reverse Proxy HTTP
sudo ufw allow 443/tcp     # Reverse Proxy HTTPS
sudo ufw enable
```

### 2. Reverse Proxy Layering
For production domain mapping, SSL certificates, and security, layer one of the proxy files:
```bash
# Layer Caddy Server (Automatic HTTPS)
sh run.sh config add caddy

# Layer Nginx Server
sh run.sh config add nginx
```
Make sure `PROXY_DOMAIN` in your `.env` matches your VPS public domain (e.g. `supabase.yourdomain.com`).

### 3. S3 Storage Integration
For storage backups and asset hosting:
* By default, local volumes are used.
* For cloud-scale storage, configure the S3 override (`docker-compose.s3.yml`) and plug in your Cloudflare R2 or AWS S3 credentials into `.env`.

### 4. Updating Supabase Services
To roll out new service updates (Kong, GoTrue, Realtime, Postgres versions):
1. Pull fresh container images: `sh run.sh pull`.
2. Recreate containers gracefully: `sh run.sh recreate`.
