# Deployment Guide for Render

This guide will help you deploy the Feature Sizing Assistant to Render.

## Prerequisites

1. A [Render](https://render.com) account
2. Your OpenAI API key
3. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Step-by-Step Deployment

### 1. Prepare Your Repository

Make sure your code is pushed to a Git repository. Render will pull from this repository.

### 2. Create a New Web Service on Render

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your Git repository
4. Select the repository containing this project

### 3. Configure the Service

Use these settings:

- **Name**: `feature-scoper` (or any name you prefer)
- **Environment**: `Node`
- **Region**: Choose the closest region to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: Leave empty (or `mystic-zone` if your repo root is different)
- **Build Command**: `sh -c "NODE_ENV=development npm install && npm run build"`
- **Start Command**: `npm start`

### 4. Set Environment Variables

In the Render dashboard, go to **Environment** section and add:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `10000` | Render sets this automatically, but you can override |
| `OPENAI_API_KEY` | `sk-proj-...` | Your OpenAI API key (mark as **Secret**) |
| `PING_MESSAGE` | `ping pong` | Optional, for health checks |

**Important**: Mark `OPENAI_API_KEY` as **Secret** to hide it in the UI.

### 5. Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Install dependencies
   - Run the build command
   - Start your application
3. Wait for the build to complete (usually 2-5 minutes)

### 6. Verify Deployment

Once deployed, you'll get a URL like: `https://feature-scoper.onrender.com`

Test the deployment:
- Visit the URL to see your app
- Check health: `https://your-app.onrender.com/api/ping`
- Test AI analysis: Try the "Scope it" feature

## Alternative: Using render.yaml

If you prefer configuration as code, you can use the `render.yaml` file included in this project:

1. In Render dashboard, when creating the service, select **"Apply render.yaml"**
2. Render will automatically use the configuration from `render.yaml`
3. You'll still need to set the `OPENAI_API_KEY` manually in the dashboard

## Troubleshooting

### Build Fails

- Check the build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility (Render uses Node 18+ by default)

### Environment Variables Not Working

- Make sure variables are set in the Render dashboard
- Restart the service after adding new variables
- Check that variable names match exactly (case-sensitive)

### Port Issues

- Render automatically sets `PORT` environment variable
- Your server should use `process.env.PORT || 3000`
- The code already handles this correctly

### API Not Working

- Verify `OPENAI_API_KEY` is set correctly
- Check server logs in Render dashboard
- Ensure CORS is configured properly (already done in code)

## Post-Deployment

### Custom Domain (Optional)

1. Go to your service settings
2. Click **"Custom Domains"**
3. Add your domain
4. Follow DNS configuration instructions

### Auto-Deploy

Render automatically deploys when you push to your connected branch. To disable:
1. Go to service settings
2. Toggle **"Auto-Deploy"** off

### Monitoring

- View logs in real-time from the Render dashboard
- Set up alerts for service downtime
- Monitor resource usage

## Cost Considerations

- **Free Tier**: 750 hours/month, spins down after 15 minutes of inactivity
- **Starter Plan**: $7/month for always-on service
- Check [Render Pricing](https://render.com/pricing) for current rates

## Support

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)

