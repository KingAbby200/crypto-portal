# Deploying to Render

## Prerequisites
- A Render account (sign up at [render.com](https://render.com))
- Your project repository on GitHub (Render deploys from Git)

## Step 1: Set Up PostgreSQL Database on Render

1. Log into your Render dashboard
2. Click "New" → "PostgreSQL"
3. Choose a name for your database (e.g., "crypto-linker-db")
4. Select the free tier or paid plan as needed
5. Click "Create Database"
6. Wait for the database to be provisioned
7. Copy the "External Database URL" - you'll need this for environment variables

## Step 2: Create a New Web Service

1. In your Render dashboard, click "New" → "Web Service"
2. Connect your GitHub repository:
   - Click "Connect" next to your repository
   - If prompted, authorize Render to access your GitHub account
3. Configure the service:
   - **Name**: Choose a name (e.g., "crypto-linker")
   - **Environment**: Node
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`

## Step 3: Configure Environment Variables

In your Render web service settings, add these environment variables:

### Required Variables
- `DATABASE_URL`: Your Render PostgreSQL external database URL
- `SESSION_SECRET`: A random string for session encryption (generate a secure one)
- `NODE_ENV`: `production`

### Optional Variables (if used in your app)
- `PORT`: Render will set this automatically, but your app defaults to 5000

## Step 4: Database Setup

Before deploying, you need to run your database migrations/schema setup:

1. In your local environment, update your `.env` file with the Render DATABASE_URL
2. Run your database setup commands locally:
   ```bash
   npm run db:generate  # if you have this script
   npm run db:push      # or however you set up your schema
   ```

## Step 5: Deploy

1. In your Render dashboard, click "Create Web Service"
2. Render will start building and deploying your app
3. Monitor the build logs for any errors
4. Once deployed, your app will be available at the provided URL (e.g., `https://crypto-linker.onrender.com`)

## Step 6: Troubleshooting

### Common Issues:

**Build Failures:**
- Check that all dependencies are listed in `package.json`
- Ensure your build scripts work locally

**Runtime Errors:**
- Verify all environment variables are set correctly
- Check database connectivity
- Review application logs in Render dashboard

**Static File Issues:**
- Your app serves static files from `dist/public` in production
- Render should handle this automatically

### Accessing Logs:
- Go to your web service in Render dashboard
- Click on "Logs" tab to view build and runtime logs

## Step 7: Updates and Maintenance

- Push changes to your GitHub repository
- Render will automatically redeploy on new commits to the main branch
- You can also manually trigger deploys from the Render dashboard

## Cost Considerations

- Render's free tier includes 750 hours/month of web service runtime
- PostgreSQL free tier has limitations (256MB storage, shared CPU)
- Monitor usage in your Render dashboard

## Alternative: Keep Using Neon Database

If you prefer to keep using Neon instead of Render's PostgreSQL:

1. Skip Step 1 above
2. Use your existing Neon DATABASE_URL in the environment variables
3. Ensure Neon's connection settings allow connections from Render's IP ranges (or use connection pooling)

This setup should get your application running on Render successfully!