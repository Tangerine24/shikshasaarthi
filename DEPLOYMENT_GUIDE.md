# ShikshaSaarthi (शिक्षासारथी) — Cloud Deployment Guide

This repository is fully configured for automated cloud deployment with zero manual patching required. All build scripts, routing rewrites, environment templates, and blueprints are ready.

---

## 🚀 Option 1: 1-Click Deploy on Render (Recommended — Simplest Fullstack Free Tier)

With the included `render.yaml` and unified Express static fallback, you can deploy the **entire application (React Frontend + Express API + SQLite)** on a single free Render Web Service under **one single URL** (no CORS issues, no separate hosting needed).

### Steps:
1. **Push to GitHub**:
   Create a new GitHub repository (e.g. `shikshasaarthi`) and push this project:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/shikshasaarthi.git
   git branch -M main
   git push -u origin main
   ```

2. **Connect to Render**:
   - Go to [dashboard.render.com](https://dashboard.render.com).
   - Click **New +** → **Blueprint**.
   - Select your `shikshasaarthi` GitHub repository.
   - Render will automatically read [`render.yaml`](./render.yaml).

3. **Deploy**:
   - Click **Apply**. Render will automatically run:
     - `npm run install:all`
     - `npm run build`
     - `npx prisma generate`
   - Once deployed, your site will be live at `https://shikshasaarthi.onrender.com`.

---

## ⚡ Option 2: Vercel (Frontend) + Render (Backend)

If you prefer deploying the frontend on Vercel's global CDN and the backend on Render:

### Step 1: Deploy Backend to Render
1. In Render, click **New +** → **Web Service**.
2. Select your repository.
3. Configure settings:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `node dist/server.js`
4. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: (Click generate)
   - `JWT_REFRESH_SECRET`: (Click generate)
   - `CORS_ORIGIN`: `*`
   - `DATABASE_URL`: `file:./dev.db`
5. Note your backend URL: e.g. `https://shikshasaarthi-backend.onrender.com`.

### Step 2: Deploy Frontend to Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New Project**.
2. Import your GitHub repository.
3. In Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_URL`: `https://shikshasaarthi-backend.onrender.com/api`
5. Click **Deploy**. Vercel will build and launch your site on a high-speed global CDN (e.g. `https://shikshasaarthi.vercel.app`).

---

## 🐳 Option 3: Docker Deployment (Railway / Fly.io / VPS)

The project includes a multi-stage production [`Dockerfile`](./Dockerfile) and [`docker-compose.yml`](./docker-compose.yml).

### Railway:
1. Go to [railway.app](https://railway.app) → **New Project**.
2. Choose **Deploy from GitHub repo**.
3. Railway automatically detects the `Dockerfile` and deploys both frontend and backend within minutes.

### Any Linux VPS (Ubuntu / Debian / EC2):
```bash
git clone https://github.com/YOUR_USERNAME/shikshasaarthi.git
cd shikshasaarthi
docker compose up -d --build
```
Your full application will be live on port 5000 with persistent database storage.

---

## 🔑 Default Seed Credentials for Testing / Demo
- **Student**: `student@demo.shikshasaarthi.in` / `Demo@1234`
- **Provider**: `provider@demo.shikshasaarthi.in` / `Demo@1234`
- **Admin**: `admin@demo.shikshasaarthi.in` / `Demo@1234`
