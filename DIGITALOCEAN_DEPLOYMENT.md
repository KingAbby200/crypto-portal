# Deploying to DigitalOcean App Platform

DigitalOcean App Platform is a Platform as a Service (PaaS) that can run your full-stack Node.js application with minimal configuration. It supports automatic deployments from GitHub and provides managed databases.

## Prerequisites
- A DigitalOcean account (sign up at [digitalocean.com](https://digitalocean.com))
- Your project repository on GitHub
- Node.js 18+ (App Platform supports this)

## Step 1: Prepare Your Repository

Ensure your repository is pushed to GitHub with the latest changes. Your app should have:
- `package.json` with build and start scripts
- `vercel.json` or similar config (optional, but we'll configure via UI)

## Step 2: Create a New App

1. Log into your DigitalOcean dashboard
2. Click "Create" → "Apps" → "Get started with App Spec" or "GitHub" (recommended for auto-deploys)
3. If using GitHub:
   - Connect your GitHub account
   - Select your repository
   - Choose the branch (usually `main` or `master`)

## Step 3: Configure the App

### Resource Settings
- **Resource Type**: Web Service
- **Source Directory**: `/` (root of your repo)
- **Environment**: Node.js
- **Instance Count**: 1 (start with 1, scale later if needed)

### Build Settings
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Environment Variables**:
  - `NODE_ENV`: `production`
  - `DATABASE_URL`: Your Neon PostgreSQL connection string
  - `SESSION_SECRET`: Your session secret (generate a secure random string)

### HTTP Port
- Default is 8080, but your app uses `process.env.PORT || 5000`, so App Platform will set `PORT` automatically.

## Step 4: Database (Optional - You Already Have Neon)

Since you're using Neon PostgreSQL, you can skip DigitalOcean's managed database. Your `DATABASE_URL` will point to Neon.

If you want to use DigitalOcean's managed PostgreSQL instead:
1. Create a new PostgreSQL database in DigitalOcean
2. Copy the connection string
3. Update your `DATABASE_URL` environment variable

## Step 5: Deploy

1. Review your app configuration
2. Click "Create Resources"
3. DigitalOcean will build and deploy your app
4. Monitor the build logs for any errors
5. Once deployed, your app will be available at the generated URL (e.g., `https://your-app-name.ondigitalocean.app`)

## Step 6: Environment Variables Setup

In your app's settings (after creation):
- Go to "Settings" → "Environment Variables"
- Add:
  - `DATABASE_URL`
  - `SESSION_SECRET`
  - Any other secrets your app needs

## Step 7: Custom Domain (Optional)

1. In your app settings, go to "Settings" → "Domains"
2. Add your custom domain
3. Configure DNS records as instructed by DigitalOcean

## Step 8: Database Schema

Before deploying, ensure your database schema is set up:

```bash
# Locally, with your Neon DATABASE_URL in .env
npm run db:push
```

Or run migrations as needed.

## Step 9: Troubleshooting

### Build Failures
- Check build logs in the DigitalOcean dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Runtime Errors
- Check app logs for errors
- Verify environment variables are set correctly
- Ensure database connectivity (test with Neon)

### Static Files
- Your app serves static files from `dist/public`
- App Platform should handle this automatically

### Performance
- Monitor resource usage in the dashboard
- Scale instances if needed (paid plans)

## Step 10: Updates and Scaling

- Push changes to GitHub to trigger automatic redeploys
- Scale your app by adjusting instance count in settings
- Monitor costs and usage

## Cost Considerations

- App Platform has a generous free tier (5 apps, 1GB RAM each)
- Additional resources are billed per GB RAM/hour
- Database costs apply if using DigitalOcean's PostgreSQL

This setup should get your Express + React app running smoothly on DigitalOcean App Platform!