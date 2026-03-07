# Deployment Guide: Crypto Admin Portal & Client Portal

This guide provides complete instructions for deploying this application to production without Replit, covering everything from database setup to hosting.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Environment Variables](#environment-variables)
4. [Backend Setup](#backend-setup)
5. [Frontend Build](#frontend-build)
6. [Server Configuration](#server-configuration)
7. [Hosting Options](#hosting-options)
8. [Domain & SSL](#domain--ssl)
9. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ (get from [nodejs.org](https://nodejs.org))
- **PostgreSQL** 14+ (get from [postgresql.org](https://www.postgresql.org/download))
- **npm** (comes with Node.js)
- A **domain name** (optional but recommended for production)
- A **hosting provider** (AWS, DigitalOcean, Heroku, etc.)
- **Git** for cloning the repository

---

## Database Setup

### 1. Create PostgreSQL Database

On your server or local machine, open a PostgreSQL client and run:

```sql
-- Create database
CREATE DATABASE crypto_portal;

-- Create a dedicated user with password
CREATE USER crypto_user WITH PASSWORD 'your_secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE crypto_portal TO crypto_user;

-- Connect to the database
\c crypto_portal

-- Grant schema privileges
GRANT ALL PRIVILEGES ON SCHEMA public TO crypto_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO crypto_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO crypto_user;
```

### 2. Note Your Connection String

You'll need this format for the `DATABASE_URL` environment variable:

```
postgresql://crypto_user:your_secure_password_here@localhost:5432/crypto_portal
```

**In production, replace:**
- `localhost` → your database host (AWS RDS endpoint, managed PostgreSQL service, etc.)
- `5432` → your database port (usually 5432)
- `crypto_user` → your database username
- `your_secure_password_here` → your secure database password
- `crypto_portal` → your database name

---

## Environment Variables

Create a `.env` file in the project root directory:

```bash
# Database
DATABASE_URL="postgresql://crypto_user:your_secure_password_here@your-db-host:5432/crypto_portal"

# Session Secret (generate a random 32+ character string)
SESSION_SECRET="your_random_session_secret_here_at_least_32_chars"

# Node Environment
NODE_ENV="production"

# Server Port
PORT="5000"

# Frontend URL (used for CORS if frontend is on different domain)
FRONTEND_URL="https://yourdomain.com"
```

### Generating a Secure Session Secret

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object {[byte](Get-Random -Maximum 256)}))
```

---

## Backend Setup

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url> crypto-portal
cd crypto-portal

# Install dependencies
npm install
```

### 2. Initialize Database Schema

The application uses Drizzle ORM for database migrations. Run:

```bash
# Push the schema to your database
npm run db:push
```

This will create all required tables:
- `admins` - Admin accounts
- `clients` - Client profiles with eligible amounts
- `transactions` - Payment transaction history

### 3. Seed Initial Data (Optional)

The application auto-seeds a demo admin account on first run:

```
Username: admin
Password: password123
```

**Change this password immediately in production:**

```bash
# Connect to your database
psql -U crypto_user -d crypto_portal

# Update the admin password
UPDATE admins SET password = 'your_new_secure_password' WHERE username = 'admin';
```

---

## Frontend Build

### 1. Build for Production

```bash
# Build the frontend
npm run build:frontend
```

This creates an optimized production build in the `client/dist` directory.

### 2. Verify Build

```bash
# The Express server automatically serves the built frontend
# No additional configuration needed - the backend serves both API and static files
```

---

## Server Configuration

### 1. Install PM2 (Process Manager)

For production, use PM2 to keep the application running:

```bash
npm install -g pm2

# Create ecosystem configuration file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'crypto-portal',
    script: './server/index.ts',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
EOF
```

### 2. Start with PM2

```bash
# Load environment variables
source .env  # On Windows: use SET or create .env.local

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration to restart on server reboot
pm2 startup
pm2 save

# View logs
pm2 logs crypto-portal

# View monitoring dashboard
pm2 monit
```

### 3. Manual Server Start (Simple Option)

For small deployments or testing:

```bash
# Load environment and start
NODE_ENV=production npm run dev
```

---

## Hosting Options

### Option A: DigitalOcean (Recommended)

1. **Create Droplet:**
   - Choose Ubuntu 22.04 LTS
   - Select appropriate size (minimum 2GB RAM recommended)
   - Create SSH key for security

2. **SSH into Server:**
   ```bash
   ssh root@your_droplet_ip
   ```

3. **Install Prerequisites:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs postgresql postgresql-contrib
   ```

4. **Clone Repository & Setup:**
   ```bash
   git clone <your-repo-url> /opt/crypto-portal
   cd /opt/crypto-portal
   npm install
   ```

5. **Configure PostgreSQL** (see Database Setup section)

6. **Setup Reverse Proxy (Nginx):**
   ```nginx
   # /etc/nginx/sites-available/crypto-portal
   server {
       listen 80;
       server_name yourdomain.com;
   
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```

7. **Enable Nginx:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/crypto-portal /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### Option B: AWS EC2

1. **Launch EC2 Instance:**
   - AMI: Ubuntu 22.04 LTS
   - Instance Type: t3.small or larger
   - Security Groups: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS)

2. **Connect & Setup:** Follow DigitalOcean steps above

3. **RDS for PostgreSQL:**
   - Create RDS instance in same VPC
   - Update `DATABASE_URL` with RDS endpoint
   - Security group must allow EC2 → RDS communication

### Option C: Heroku

1. **Prepare App:**
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Create Heroku App:**
   ```bash
   heroku create crypto-portal
   ```

3. **Add PostgreSQL:**
   ```bash
   heroku addons:create heroku-postgresql:standard-0
   ```

4. **Set Environment Variables:**
   ```bash
   heroku config:set SESSION_SECRET="your_secure_secret"
   heroku config:set NODE_ENV="production"
   ```

5. **Deploy:**
   ```bash
   git push heroku main
   ```

---

## Domain & SSL

### Option A: Cloudflare (Free & Easy)

1. **Sign Up:** Go to [cloudflare.com](https://cloudflare.com) and create account

2. **Point Domain to Cloudflare:**
   - Update domain's nameservers to Cloudflare's
   - Add DNS A record pointing to your server IP

3. **Enable SSL:**
   - In Cloudflare, set SSL/TLS to "Flexible" or "Full"
   - Traffic is encrypted between user and Cloudflare (recommended: Full)

### Option B: Let's Encrypt (Free, Self-Managed)

1. **Install Certbot:**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   ```

2. **Generate Certificate:**
   ```bash
   sudo certbot certonly --nginx -d yourdomain.com
   ```

3. **Update Nginx Config:**
   ```nginx
   server {
       listen 443 ssl http2;
       server_name yourdomain.com;
   
       ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
   
       # ... rest of config
   }
   
   # Redirect HTTP to HTTPS
   server {
       listen 80;
       server_name yourdomain.com;
       return 301 https://$server_name$request_uri;
   }
   ```

4. **Auto-Renew:**
   ```bash
   sudo systemctl enable certbot.timer
   sudo systemctl start certbot.timer
   ```

---

## Monitoring & Maintenance

### 1. View Application Logs

```bash
# With PM2
pm2 logs crypto-portal

# Last 100 lines
pm2 logs crypto-portal --lines 100

# Clear logs
pm2 flush
```

### 2. Database Backups

```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

pg_dump -U crypto_user -d crypto_portal > \
  $BACKUP_DIR/crypto_portal_backup_${DATE}.sql

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
```

### 3. Monitor System Health

```bash
# CPU/Memory usage
pm2 monit

# Disk usage
df -h

# Database size
psql -U crypto_user -d crypto_portal -c "SELECT pg_size_pretty(pg_database_size('crypto_portal'));"
```

### 4. Updates & Security

```bash
# Update system packages
sudo apt-get update && sudo apt-get upgrade -y

# Update Node dependencies (test before production)
npm update
npm audit fix
```

---

## Troubleshooting

### Application Won't Start

```bash
# Check environment variables are set
env | grep DATABASE_URL

# Test database connection
psql $DATABASE_URL -c "SELECT 1"

# Check Node version
node --version  # Should be 18+

# Check npm dependencies
npm list
```

### Database Connection Issues

```bash
# Verify PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U crypto_user -h localhost -d crypto_portal -c "SELECT version();"

# Check logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### High Memory Usage

```bash
# Restart application
pm2 restart crypto-portal

# Check for memory leaks
pm2 monit
```

---

## Security Checklist

- [ ] Change default admin password
- [ ] Set strong `SESSION_SECRET` (32+ random characters)
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS/SSL
- [ ] Use strong database password
- [ ] Restrict database access (firewall rules)
- [ ] Set up automated backups
- [ ] Monitor logs for suspicious activity
- [ ] Keep Node.js and dependencies updated
- [ ] Disable SSH root login
- [ ] Use SSH keys instead of passwords
- [ ] Set up fail2ban for brute-force protection

---

## Support & Additional Resources

- **Drizzle ORM Docs:** https://orm.drizzle.team
- **Express.js Docs:** https://expressjs.com
- **PostgreSQL Docs:** https://www.postgresql.org/docs
- **PM2 Docs:** https://pm2.keymetrics.io
- **Nginx Docs:** https://nginx.org/en/docs
- **Let's Encrypt:** https://letsencrypt.org

---

**Last Updated:** March 2026  
**Version:** 1.0.0
