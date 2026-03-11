# Quick Deployment Checklist

Use this checklist to deploy to Vercel successfully.

## Pre-Deployment (Local Testing)

- [ ] Run `npm run build` - completes without errors
- [ ] Run `npm run start` - server starts on port 5000
- [ ] Visit `http://localhost:5000` - homepage loads
- [ ] Login with `admin` / `password123` - works
- [ ] Test a few API endpoints - work correctly
- [ ] All changes committed: `git push origin main`

## Vercel Setup

- [ ] Vercel account created at https://vercel.com
- [ ] Project imported from GitHub/GitLab OR
- [ ] Vercel CLI installed: `npm install -g vercel`

## Environment Variables in Vercel

Go to your project on Vercel → Settings → Environment Variables

Add these three variables:

```
DATABASE_URL = postgresql://user:password@host/dbname?sslmode=require
SESSION_SECRET = [any 32+ character random string]
NODE_ENV = production
```

**Database URL Examples:**

| Provider | URL Format |
|----------|-----------|
| Neon | `postgresql://user:password@hostname.neon.tech/dbname?sslmode=require` |
| AWS RDS | `postgresql://user:password@hostname:5432/dbname` |
| Railway | `postgresql://user:password@hostname/dbname` |
| Render | `postgresql://user:password@hostname/dbname` |

## Deployment

### Option 1: CLI
```bash
vercel --prod
```

### Option 2: Git Push
```bash
git push origin main
# Vercel auto-deploys
```

### Option 3: Dashboard
1. Go to vercel.com
2. Import Git repository
3. Add environment variables
4. Click "Deploy"

## Testing After Deployment

After deployment completes, verify:

1. **Frontend loads:**
   ```
   https://your-project.vercel.app/
   ```
   Should see login page

2. **Login works:**
   - Username: `admin`
   - Password: `password123`
   - Should redirect to admin dashboard

3. **API responds:**
   ```bash
   curl https://your-project.vercel.app/api/auth/me
   # Should return 401 (not authenticated) or user data
   ```

## If Deployment Fails

### 500 Error
```bash
# Check logs
vercel logs https://your-project.vercel.app --follow

# Verify environment variables
# Dashboard → Settings → Environment Variables
# Must have: DATABASE_URL, SESSION_SECRET, NODE_ENV
```

### Build Error
```bash
# Test build locally
npm run build

# Check that these exist:
# - dist/index.cjs (server)
# - dist/public/ (frontend files)
```

### Download Prompt Instead of Page
- This is fixed with the new vercel.json
- Make sure you pushed the updated vercel.json
- Clear browser cache and hard refresh (Ctrl+Shift+R)

### Database Connection Error
```bash
# Test connection locally
DATABASE_URL="your_url" npm run db:push

# Common issues:
# 1. Wrong URL format
# 2. Database firewall blocking Vercel
# 3. Connection string missing SSL settings (?sslmode=require)
```

## URLs After Deployment

| Page | URL |
|------|-----|
| Homepage | `https://your-project.vercel.app/` |
| Admin Dashboard | `https://your-project.vercel.app/admin` |
| Client Portal | `https://your-project.vercel.app/portal` |
| API Auth | `https://your-project.vercel.app/api/auth/login` |

## Important: Change Default Password!

The admin account has default credentials:
- Username: `admin`
- Password: `password123`

**CHANGE THIS IMMEDIATELY in production!**

Option 1: Via Database
```sql
UPDATE admins SET password = 'your_new_secure_password' WHERE username = 'admin';
```

Option 2: Create New Admin
```sql
INSERT INTO admins (username, password) VALUES ('new_admin', 'secure_password');
DELETE FROM admins WHERE username = 'admin';
```

## Custom Domain

1. Go to Vercel dashboard → Your project
2. Go to Settings → Domains
3. Add your domain
4. Add DNS records to your domain provider
5. Wait for verification (up to 48 hours)

## Need More Help?

See the detailed guides:
- **deploymentGuide.md** - Complete deployment walkthrough
- **DEPLOYMENT_ISSUES_FIXED.md** - What was wrong and what was fixed
- **DEPLOYMENT.md** - General deployment concepts (local servers, etc)

## Common Environment Variable Mistakes

❌ Wrong:
```
DATABASE_URL="your_string"  # Extra quotes
DATABASE_URL=your string    # Space not escaped
SESSION_SECRET=""           # Empty
```

✓ Right:
```
DATABASE_URL=postgresql://...
SESSION_SECRET=abc123...
NODE_ENV=production
```

## Vercel CLI Useful Commands

```bash
# Login
vercel login

# Deploy (staging)
vercel

# Deploy (production)
vercel --prod

# View logs
vercel logs [url] --follow

# List deployments
vercel ls

# Remove a deployment
vercel remove [url]

# Pull environment variables
vercel env pull
```

## Success Indicators ✓

After successful deployment, you should see:
- ✓ No 500 errors in Vercel logs
- ✓ Frontend loads (no download prompt)
- ✓ Can log in with admin credentials
- ✓ Admin dashboard shows client list
- ✓ API endpoints respond correctly
- ✓ HTTPS/SSL works automatically
