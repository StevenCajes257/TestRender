# Deployment Guide for Render (Free Tier)

This project is fully configured for deployment on **Render** using a Render Blueprint (`render.yaml`).

## Prerequisites
1. A free account on [Render](https://render.com).
2. Your project repository pushed to GitHub.

---

## Step-by-Step Deployment

1. **Push to GitHub**:
   Make sure your project repository (including `frontend/`, `backend/`, and `render.yaml`) is pushed to a GitHub repository.

2. **Create a Blueprint on Render**:
   - Log in to your [Render Dashboard](https://dashboard.render.com).
   - Click on **New** $\rightarrow$ **Blueprint**.
   - Connect your GitHub repository.
   - Render will automatically detect the `render.yaml` configuration file.

3. **Deploy**:
   - Review the services to be created:
     - **`auth-db`** (PostgreSQL Database - Free Tier)
     - **`auth-messenger-backend`** (Laravel PHP Web Service - Free Tier)
     - **`auth-messenger-frontend`** (React Static Site - Free Tier)
   - Click **Apply**.

Render will automatically build and deploy both your frontend and backend, run database migrations, and wire up the API URL (`VITE_API_URL`) between frontend and backend.

---

## Accessing Your Online App
Once deployment finishes:
- **Frontend URL**: `https://auth-messenger-frontend.onrender.com`
- **Backend API URL**: `https://auth-messenger-backend.onrender.com/api`
