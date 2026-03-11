# Deploying the Frontend on Netlify (Backend Hosted Elsewhere)

Netlify is designed primarily for static sites and serverless functions. Your project combines a React frontend with an Express/Node backend, so the easiest path when using Netlify is to host **only the frontend** there and keep the backend on a platform that supports long‑running Node servers (e.g. Render, Vercel, Heroku, etc.).

This document walks through deploying the frontend to Netlify while pointing it at a separately hosted API.

---

## 1. Prepare Your Repository

1. Ensure the `client/` folder is the root of your React application and that the root-level `package.json` contains the build script you already use (`npm run build`).
2. Add a `netlify.toml` file at the repository root with the following:

   ```toml
   [build]
     command = "npm run build"
     publish = "dist/public"
     functions = "netlify/functions"

   [[redirects]]
     from = "/api/*"
     to = "https://<YOUR_BACKEND_URL>/:splat"
     status = 200
   ```

   - `publish` should match the directory where Vite outputs the compiled client (`dist/public`).
   - The redirect rule proxies any `/api` requests to your backend service.

3. (Optional) If you later want to move some endpoints into Netlify Functions, you'll compile or copy the relevant server code into `netlify/functions` and export a handler. That is beyond this guide.

## 2. Hosting Your Backend

Deploy the Express server somewhere that supports Node. You can reuse your Render setup from the previous guide, or keep using Vercel. Obtain the public URL (e.g. `https://crypto-linker.onrender.com`).

Make sure that server is fully built (`npm run build`), that its `start` script works, and that the environment variables (`DATABASE_URL`, `SESSION_SECRET`, etc.) are configured on that host.

## 3. Configure Netlify Site

1. Log in to [Netlify](https://app.netlify.com/) and click **New site from Git**.
2. Choose GitHub and authorize access if necessary, then select your repository.
3. In the "Build settings":
   - **Branch to deploy**: usually `main` or `master`.
   - **Build command**: `npm run build` (this runs both frontend and server build; the server build is harmless since Netlify only serves the static output).
   - **Publish directory**: `dist/public`.

4. Add environment variables in the **Site settings > Build & deploy > Environment** section:
   - `NODE_ENV=production` (Netlify usually sets this automatically)
   - `FRONTEND_URL` (if your app uses it for CORS)
   - Any other variables the client needs (none in your current code, since backend credentials live on the server).

5. Click **Deploy site**. Netlify will build and deploy your frontend. The generated URL will look like `https://<random-name>.netlify.app`.

6. In your client code (hooks that call `/api/...`), no changes are necessary because the site is served from the same domain and netlify redirect will forward them. If you access the backend directly (e.g. from a mobile app), use the backend host URL.

## 4. Custom Domain (Optional)

1. In Netlify dashboard, go to **Domain management** and add your custom domain.
2. Configure DNS records according to Netlify’s instructions.
3. Update `FRONTEND_URL` on your backend provider if you use it for CORS.

## 5. Netlify Functions (Advanced)

If you eventually want to deploy the Express API as Netlify Functions instead of a separate service, you’ll need to:

- Convert each route into a function following Netlify’s [Function docs](https://docs.netlify.com/functions/overview/).
- Add `