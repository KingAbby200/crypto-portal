# Vercel Deployment Guide

This guide provides step-by-step instructions for deploying the Crypto-Linker application to Vercel.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Critical Issues to Fix](#critical-issues-to-fix)
3. [Database Setup](#database-setup)
4. [Vercel Configuration](#vercel-configuration)
5. [Deployment Steps](#deployment-steps)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- **Git** installed and your project committed
- **Vercel CLI** installed: `npm install -g vercel`
- **Vercel account** (free at https://vercel.com)
- **PostgreSQL database** provisioned (see Database Setup section)
- **Node.js** 18+ locally for testing

---

## Critical Issues to Fix

### Issue 1: Vercel Configuration Problems

The current `vercel.json` has an incorrect `outputDirectory`. Vercel's Node runtime doesn't use this field for server builds.

**What's Wrong:**
- The `outputDirectory: "public"` is ignored by Vercel's Node runtime
- The file serving path is incorrect
- Vercel doesn't execute the build command by default with this config

**Solution:** See the corrected configuration in [Vercel Configuration](#vercel-configuration) section below.

### Issue 2: File Download Instead of Display

This happens when:
- Static files are not properly served from the built client
- The fallback to `index.html` is not working
- Express routing is catching requests before static file serving

**Root Cause:** The `serveStatic()` function is looking for files in the wrong location in production.

**Solution:** This has been fixed in your codebase. The path now correctly points to `dist/public`.

### Issue 3: 500 Internal Server Error

Common causes:
- `DATABASE_URL` environment variable not set in Vercel
- Database connection string is incorrect or the database is unreachable
- Missing required environment variables (`SESSION_SECRET`)
- The `dist/index.cjs` file is not being built properly

**Solution:** Ensure all environment variables are set in Vercel project settings.

---

## Database Setup

### Using Neon (Recommended for Vercel)

Neon is a serverless PostgreSQL database that works perfectly with Vercel.

1. **Create Neon Account**
   - Go to https://neon.tech
   - Sign up with your email or GitHub account
   - Create a new project

2. **Get Connection String**
   - In your Neon dashboard, find "Connection string" (postgres protocol)
   - Copy the full connection string
   - It should look like: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`

3. **Save for Later**
   - You'll need this when setting up Vercel environment variables

### Alternative: AWS RDS

1. Create an RDS PostgreSQL instance
2. Wait for it to be available
3. Get the endpoint and connection details
4. Format as: `postgresql://username:password@hostname:5432/dbname`

### Alternative: Managed Services

Other options:
- **Railway**: https://railway.app (simple, good for Vercel)
- **Render**: https://render.com (free tier available)
- **Supabase**: https://supabase.com (PostgreSQL + auth)

---

## Vercel Configuration

### Update vercel.json

Replace the contents of `vercel.json` with:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": [
    "DATABASE_URL",
    "SESSION_SECRET",
    "NODE_ENV"
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/index.cjs"
    },
    {
      "source": "/:path*",
      "destination": "/index.cjs"
    }
  ]
}
```

**What This Does:**
- `buildCommand`: Explicitly tells Vercel to run `npm run build`
- `outputDirectory`: Points to the `dist` folder where both server and client are built
- `env`: Lists required environment variables
- `rewrites`: Routes all requests (API and static) to the Express server, which handles serving static files

---

## Deployment Steps

### Step 1: Prepare Your Code

```bash
# Make sure all changes are committed
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Create Vercel Project

#### Option A: Via CLI (Recommended)

```bash
# Install Vercel CLI globally (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# When prompted, answer:
# - "Set up and deploy ~/path/to/project?" → yes
# - "Which scope do you want to deploy to?" → select your account
# - "Link to existing project?" → no (first deployment)
# - "What's your project's name?" → crypto-linker
# - "In which directory is your code?" → ./ (current directory)
# - "Want to modify these settings before deploying?" → yes
```

#### Option B: Via GitHub/GitLab Integration

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Connect your GitHub/GitLab account
4. Select your `Crypto-Linker` repository
5. Click "Import"

### Step 3: Configure Environment Variables

In the Vercel dashboard:

1. Go to your project → **Settings** → **Environment Variables**
2. Add the following variables:

   ```
   DATABASE_URL=postgresql://username:password@host/dbname
   SESSION_SECRET=<random 32+ character string>
   NODE_ENV=production
   ```

   ⚠️ **Important:** Your `DATABASE_URL` is sensitive! Keep it secure.

3. Make sure these are set for:
   - **Production** environment
   - **Preview** environment (optional, for testing)

### Step 4: Deploy

#### Using CLI:
```bash
vercel --prod
```

#### Using Dashboard:
1. Push to your main branch on GitHub/GitLab
2. Vercel will automatically deploy the new changes

### Step 5: Verify Deployment

Once deployed:

1. Visit your Vercel domain (e.g., `https://crypto-linker.vercel.app`)
2. You should see the frontend application
3. Try logging in with credentials:
   - **Username:** `admin`
   - **Password:** `password123`

---

## Verification

### Check Deployment Status

```bash
# View latest deployment
vercel ls

# View logs
vercel logs [deployment-url]
```

### Test API Endpoints

```bash
# Login
curl -X POST https://your-project.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'

# Get current user
curl -X GET https://your-project.vercel.app/api/auth/me
```

### Test Frontend

Visit these routes in your browser:
- `https://your-project.vercel.app/` → Homepage
- `https://your-project.vercel.app/admin` → Admin dashboard (login required)
- `https://your-project.vercel.app/portal` → Client portal

---

## Troubleshooting

### Problem: 500 Internal Server Error

**Solution:**

1. Check Vercel logs:
   ```bash
   vercel logs [your-deployment-url] --follow
   ```

2. Verify environment variables are set:
   - Go to **Project Settings** → **Environment Variables**
   - Confirm `DATABASE_URL` and `SESSION_SECRET` are present

3. Test database connection:
   - Ensure your database is accessible from Vercel's IP
   - For Neon, IP restrictions are usually not needed
   - For AWS RDS, whitelist `0.0.0.0/0` or Vercel's IP range

### Problem: File Download Prompt Instead of Display

**Causes & Solutions:**

1. **Static files not built properly**
   ```bash
   # Rebuild locally
   npm run build
   
   # Check if dist/public exists with files
   ls -la dist/public
   ```

2. **Wrong content-type headers**
   - This is usually fixed by proper Express static serving
   - Check that `serveStatic()` is being called in production mode

3. **Express not serving static files**
   - Verify `NODE_ENV=production` is set in Vercel
   - Check server logs for errors

### Problem: 404 on API Routes

**Solution:**

1. Verify routes are registered correctly:
   ```bash
   curl https://your-project.vercel.app/api/auth/me
   ```

2. Check that `vercel.json` rewrites are correct

3. Ensure the build produces `dist/index.cjs`:
   ```bash
   npm run build
   ls -la dist/index.cjs
   ```

### Problem: Database Connection Timeout

**Solution:**

1. Test connection string locally:
   ```bash
   DATABASE_URL="your_url" npm run db:push
   ```

2. For Neon, ensure SSL is enabled (add `?sslmode=require`)

3. For AWS RDS, check security groups allow outbound connections

### Problem: Session/Authentication Not Working

**Solution:**

1. Ensure `SESSION_SECRET` is set and consistent across deployments:
   ```bash
   # Generate new secret if needed
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

2. Use `connect-pg-simple` for session store (already configured)

3. Check browser cookies are being set:
   - Open DevTools → Application → Cookies
   - Verify session cookie is present

---

## Post-Deployment

### Change Default Admin Credentials

⚠️ **IMPORTANT:** The default credentials (`admin`/`password123`) are hardcoded. Change them immediately:

1. Log in with default credentials
2. Update the password in your database:
   ```sql
   UPDATE admins SET password = 'your_secure_password' WHERE username = 'admin';
   ```

### Set Up Custom Domain

1. Go to **Project Settings** → **Domains**
2. Click "Add Domain"
3. Enter your custom domain (e.g., `crypto-admin.example.com`)
4. Add the DNS records shown by Vercel to your domain provider
5. Wait for DNS propagation (can take a few minutes to 48 hours)

### Enable HTTPS

HTTPS is automatically enabled by Vercel on all deployments. No extra configuration needed!

### Monitor and Logs

Regular monitoring:

```bash
# View live logs
vercel logs [project-url] --follow

# View analytics
# Go to Vercel dashboard → Analytics tab
```

---

## Summary Checklist

Before deployment:
- [ ] `.env` file with all variables set locally
- [ ] `npm run build` succeeds locally
- [ ] `npm run start` runs without errors
- [ ] Database is provisioned and connection string is ready
- [ ] Git repository is clean and pushed

During deployment:
- [ ] Environment variables are set in Vercel
- [ ] Deployment completes without errors
- [ ] All Vercel logs show success

After deployment:
- [ ] Frontend loads correctly
- [ ] Login works with admin credentials
- [ ] API endpoints respond (check browser console)
- [ ] Change default admin password
- [ ] Set up custom domain if needed

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Express Docs**: https://expressjs.com
- **Neon Docs**: https://neon.tech/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs

If you encounter issues not covered here, check the Vercel logs and error messages carefully!
