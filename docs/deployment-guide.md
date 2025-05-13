# Deployment Guide

This guide provides detailed instructions for deploying the AI Maturity Assessment application to production environments. It covers deployment options, configuration, and best practices.

## Deployment Options

The application can be deployed in several ways:

1. **Vercel** (Recommended): Zero-configuration deployment platform optimized for Next.js
2. **Netlify**: Similar to Vercel with good Next.js support
3. **Self-hosted**: Deploy to your own server or cloud provider
4. **Docker**: Containerized deployment for more complex environments

## Vercel Deployment

### Prerequisites

- A GitHub, GitLab, or Bitbucket account with your project repository
- A Vercel account (free tier available)
- Your environment variables ready

### Steps

1. **Push your code to a repository**:
   ```bash
   git push origin main
   ```

2. **Import your project to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Select your repository
   - Click "Import"

3. **Configure your project**:
   - Project Name: Choose a name or use the default
   - Framework Preset: Next.js (should be auto-detected)
   - Build and Output Settings: Use defaults for Next.js

4. **Configure environment variables**:
   - Add all required environment variables:
     - `OPENAI_API_KEY`
     - `RESEND_API_KEY`
     - `EMAIL_FROM`
     - Firebase configuration variables (if using Firebase)

5. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete (typically a few minutes)

6. **Verify your deployment**:
   - Visit the deployment URL provided by Vercel
   - Test key functionality to ensure everything works

### Custom Domain (Optional)

1. From your project dashboard, click "Domains"
2. Add your custom domain
3. Follow Vercel's instructions to configure DNS settings

## Netlify Deployment

### Prerequisites

- A GitHub, GitLab, or Bitbucket account with your project repository
- A Netlify account

### Steps

1. **Push your code to a repository**

2. **Import your project to Netlify**:
   - Go to [Netlify Dashboard](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Select your repository

3. **Configure build settings**:
   - Build command: `npm run build` or `yarn build`
   - Publish directory: `.next`

4. **Configure environment variables**:
   - Go to Site settings → Environment variables
   - Add all required environment variables

5. **Deploy**:
   - Click "Deploy site"

6. **Configure Netlify for Next.js**:
   - Create a `netlify.toml` file in your project root:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

7. **Install Netlify Next.js plugin**:
   ```bash
   npm install -D @netlify/plugin-nextjs
   # or
   yarn add -D @netlify/plugin-nextjs
   ```

8. **Redeploy** with the new configuration

## Self-hosted Deployment

### Prerequisites

- A server or VPS (e.g., AWS EC2, DigitalOcean Droplet)
- Node.js installed (v18+)
- npm or yarn
- Optional: Nginx for reverse proxy
- Optional: PM2 for process management

### Basic Deployment

1. **Clone your repository**:
   ```bash
   git clone https://github.com/yourusername/ai-maturity-app.git
   cd ai-maturity-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Create environment file**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

4. **Build the application**:
   ```bash
   npm run build
   # or
   yarn build
   ```

5. **Start the server**:
   ```bash
   npm run start
   # or
   yarn start
   ```

This starts the server on port 3000 by default.

### Using PM2 (Recommended)

PM2 keeps your application running and can restart it automatically if it crashes.

1. **Install PM2**:
   ```bash
   npm install -g pm2
   ```

2. **Create a PM2 ecosystem file**:
   Create `ecosystem.config.js` in your project root:
   ```javascript
   module.exports = {
     apps: [
       {
         name: 'ai-maturity-app',
         script: 'npm',
         args: 'start',
         env: {
           NODE_ENV: 'production',
           // Add other environment variables here or use .env.local
         },
         instances: 'max',
         exec_mode: 'cluster',
         autorestart: true,
         watch: false,
         max_memory_restart: '1G',
       },
     ],
   };
   ```

3. **Start with PM2**:
   ```bash
   pm2 start ecosystem.config.js
   ```

4. **Set up PM2 to start on system boot**:
   ```bash
   pm2 startup
   pm2 save
   ```

### Nginx Configuration (Recommended)

Nginx can act as a reverse proxy to your Node.js application, providing additional features like SSL termination and load balancing.

1. **Install Nginx**:
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

2. **Create an Nginx configuration file**:
   ```bash
   sudo nano /etc/nginx/sites-available/ai-maturity-app
   ```

3. **Add the configuration**:
   ```nginx
   server {
     listen 80;
     server_name yourdomain.com www.yourdomain.com;

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

4. **Enable the site**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/ai-maturity-app /etc/nginx/sites-enabled/
   sudo nginx -t  # Test configuration
   sudo systemctl restart nginx
   ```

5. **Set up SSL with Let's Encrypt**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

## Docker Deployment

### Prerequisites

- Docker installed
- Docker Compose (optional, but recommended)

### Steps

1. **Create a Dockerfile** in your project root:
   ```Dockerfile
   FROM node:18-alpine AS base

   # Install dependencies only when needed
   FROM base AS deps
   WORKDIR /app
   COPY package.json package-lock.json* ./
   RUN npm ci

   # Rebuild the source code only when needed
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npm run build

   # Production image, copy all the files and run next
   FROM base AS runner
   WORKDIR /app

   ENV NODE_ENV production

   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs

   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

   USER nextjs

   EXPOSE 3000

   ENV PORT 3000

   CMD ["node", "server.js"]
   ```

2. **Update next.config.js** to enable standalone output:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     reactStrictMode: true,
     output: 'standalone',
   };

   module.exports = nextConfig;
   ```

3. **Create a .dockerignore file**:
   ```
   node_modules
   .next
   .git
   .env*
   ```

4. **Create a docker-compose.yml file** (optional):
   ```yaml
   version: '3'

   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - OPENAI_API_KEY=${OPENAI_API_KEY}
         - RESEND_API_KEY=${RESEND_API_KEY}
         - EMAIL_FROM=${EMAIL_FROM}
         - NEXT_PUBLIC_FIREBASE_API_KEY=${NEXT_PUBLIC_FIREBASE_API_KEY}
         - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}
         - NEXT_PUBLIC_FIREBASE_PROJECT_ID=${NEXT_PUBLIC_FIREBASE_PROJECT_ID}
         - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}
         - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}
         - NEXT_PUBLIC_FIREBASE_APP_ID=${NEXT_PUBLIC_FIREBASE_APP_ID}
         - NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=${NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID}
   ```

5. **Build and run the Docker container**:
   ```bash
   # With Docker
   docker build -t ai-maturity-app .
   docker run -p 3000:3000 --env-file .env.local ai-maturity-app

   # Or with Docker Compose
   docker-compose up -d
   ```

## Environment Variable Management

### Production Security

For production deployments, ensure:

1. **Environment Variables are Secure**:
   - Never commit `.env` files to your repository
   - Use your deployment platform's secret management
   - Restrict access to environment variable configuration

2. **Rate Limiting**:
   - Consider implementing rate limiting for API routes
   - Monitor API usage to avoid unexpected costs

### Required Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `OPENAI_ORGANIZATION` | OpenAI organization ID | No |
| `RESEND_API_KEY` | Resend email service API key | Yes |
| `EMAIL_FROM` | Verified sender email | Yes |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase configuration | Future |

## Post-Deployment Steps

After deploying:

1. **Monitor the application**:
   - Set up logging and error tracking
   - Monitor API usage and costs
   - Set up uptime monitoring

2. **Performance optimization**:
   - Consider implementing caching where appropriate
   - Monitor and optimize API response times
   - Use a CDN for static assets

3. **Security considerations**:
   - Regularly update dependencies
   - Implement rate limiting
   - Set up CORS policies appropriately

## Troubleshooting

### Common Issues

1. **API Errors**:
   - Verify environment variables are correctly set
   - Check API service status (OpenAI, Firebase, Resend)
   - Look for rate limiting or quota issues

2. **Build Failures**:
   - Check build logs for syntax errors
   - Verify dependencies are correctly installed
   - Test build locally before deploying

3. **Runtime Errors**:
   - Check server logs for detailed error messages
   - Verify environment configuration
   - Test in different browsers if frontend issues occur

## Maintenance

Regular maintenance steps:

1. **Update dependencies**: Run npm audit and update packages regularly
2. **Monitor API costs**: Keep track of OpenAI API usage
3. **Update API models**: When new OpenAI models become available, consider upgrading
4. **Database backups**: When using Firebase, set up regular backups

## Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation for Next.js](https://docs.netlify.com/integrations/frameworks/next-js)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Docker Documentation](https://docs.docker.com/)
