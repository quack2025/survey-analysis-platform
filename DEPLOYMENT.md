# Deployment Guide

## Deploy to Vercel (Recommended)

Vercel is the easiest way to deploy this Next.js application.

### Option 1: Deploy via Vercel Dashboard

1. **Push to Git repository**
   ```bash
   cd survey-analysis-platform
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your Git repository
   - Vercel will auto-detect Next.js settings

3. **Configure Environment Variables**
   - In Vercel project settings, go to "Environment Variables"
   - Add: `OPENAI_API_KEY` = `your_openai_api_key_here`
   - Click "Save"

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be live at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd survey-analysis-platform
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add OPENAI_API_KEY
   ```
   Paste your OpenAI API key when prompted.

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Deploy to Other Platforms

### Railway

1. Create account at [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add environment variable: `OPENAI_API_KEY`
5. Railway will auto-deploy

### Netlify

1. Create account at [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import from Git"
3. Select your repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Add environment variable: `OPENAI_API_KEY`
6. Deploy

### Self-Hosted (VPS/Cloud)

#### Prerequisites
- Node.js 18+ installed
- PM2 or similar process manager
- Nginx (optional, for reverse proxy)

#### Steps

1. **Clone repository**
   ```bash
   git clone YOUR_REPO_URL
   cd survey-analysis-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env.local`**
   ```bash
   echo "OPENAI_API_KEY=your_key_here" > .env.local
   ```

4. **Build application**
   ```bash
   npm run build
   ```

5. **Start with PM2**
   ```bash
   npm install -g pm2
   pm2 start npm --name "survey-analysis" -- start
   pm2 save
   pm2 startup
   ```

6. **Configure Nginx (optional)**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Environment Variables

Required for all deployments:

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | `sk-...` |

## Post-Deployment Checklist

- [ ] Test the setup page
- [ ] Upload sample CSV and verify parsing
- [ ] Run a complete analysis end-to-end
- [ ] Test CSV export functionality
- [ ] Verify all API routes work correctly
- [ ] Check browser console for errors
- [ ] Test on mobile devices
- [ ] Monitor API costs in OpenAI dashboard

## Monitoring & Logs

### Vercel
- View logs: Vercel Dashboard → Your Project → Logs
- Real-time logs: `vercel logs`

### Self-Hosted
- PM2 logs: `pm2 logs survey-analysis`
- Nginx logs: `tail -f /var/log/nginx/error.log`

## Troubleshooting

### Build Fails
- Check Node.js version (requires 18+)
- Run `npm install` again
- Clear `.next` folder and rebuild

### API Routes Return 500
- Verify `OPENAI_API_KEY` is set correctly
- Check OpenAI API quota/billing
- Review server logs for specific errors

### File Upload Fails
- Check file size (max 10MB by default)
- Verify CSV/Excel format is correct
- Check browser console for errors

### Slow Processing
- Normal for large datasets (500+ responses)
- Consider upgrading to GPT-4o for better performance
- Process fewer questions at once

## Cost Optimization

- Use GPT-4o-mini (default) instead of GPT-4o
- Process questions in batches
- Cache results in browser/database
- Set spending limits in OpenAI dashboard

## Security

- Never commit `.env.local` to Git
- Use environment variables for all secrets
- Implement rate limiting for production
- Consider adding authentication for multi-user deployments
- Regularly update dependencies: `npm audit fix`

## Scaling

For high-volume production use:

1. **Add Database**: Store projects and results persistently
2. **Implement Queue**: Use Bull/Redis for background processing
3. **Add Caching**: Redis for LLM response caching
4. **Load Balancing**: Multiple server instances
5. **CDN**: Serve static assets via CDN

## Support

For deployment issues:
- Vercel: [vercel.com/support](https://vercel.com/support)
- Railway: [help.railway.app](https://help.railway.app)
- General: Open an issue in the repository
