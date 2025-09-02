# N8N Interactive Storybook - Deployment Guide

## 🚀 Quick Deployment to Production

### Prerequisites

1. **API Keys Required:**
   - OpenAI API key for content generation
   - RunPod API key for video generation (optional)
   - Supabase project for database and storage (optional)
   - N8N instance credentials (optional, for direct integration)

2. **Accounts Needed:**
   - Vercel account for deployment
   - GitHub account for CI/CD

### 1. Deploy to Vercel (Recommended)

#### Option A: Deploy Button (Fastest)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/n8n-storybook-app)

#### Option B: Manual Deployment

1. **Fork or clone this repository**
   ```bash
   git clone https://github.com/your-username/n8n-storybook-app
   cd n8n-storybook-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your API keys:
   ```env
   OPENAI_API_KEY=sk-your-openai-key
   RUNPOD_API_KEY=your-runpod-key  # Optional
   SUPABASE_URL=https://your-project.supabase.co  # Optional
   # ... other keys
   ```

4. **Test locally**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

5. **Deploy to Vercel**
   ```bash
   npm i -g vercel
   vercel --prod
   ```

### 2. Environment Variables in Vercel

In your Vercel dashboard, add these environment variables:

#### Essential (Required for basic functionality)
```
OPENAI_API_KEY=sk-your-openai-key
NODE_ENV=production
```

#### Optional (Enable advanced features)
```
# Video Generation
RUNPOD_API_KEY=your-runpod-key
RUNPOD_TEMPLATE_ID=wan22-video-gen
RUNPOD_GPU_TYPE=RTX4090

# Database & Storage
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# N8N Direct Integration
N8N_BASE_URL=https://your-n8n-instance.com
N8N_API_KEY=your-n8n-api-key

# MCP & Tambo Integration
MCP_API_KEY=mcp_prod_2024_secure_bearer_key
VITE_TAMBO_API_KEY=tambo_2crvFKf2vvsK8WYm...
VITE_ABACUS_APP_ID=1573da0c2c
```

## 🏗️ Alternative Deployment Options

### Docker Deployment

1. **Build Docker image**
   ```bash
   docker build -t n8n-storybook .
   ```

2. **Run container**
   ```bash
   docker run -p 3000:3000 \
     -e OPENAI_API_KEY=your-key \
     -e NODE_ENV=production \
     n8n-storybook
   ```

### Google Cloud Run

1. **Build and deploy**
   ```bash
   gcloud run deploy n8n-storybook \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars OPENAI_API_KEY=your-key
   ```

### AWS Amplify

1. **Connect GitHub repository**
2. **Configure build settings:**
   - Build command: `npm run build`
   - Output directory: `.next`
3. **Add environment variables in Amplify console**

## 🔧 Advanced Configuration

### Custom Domain Setup

1. **In Vercel Dashboard:**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Configure DNS records as instructed

2. **SSL Certificate:**
   - Automatically provisioned by Vercel
   - Custom certificates supported for Enterprise plans

### Performance Optimization

1. **Enable Vercel Analytics:**
   ```bash
   npm install @vercel/analytics
   ```

2. **Configure caching:**
   - Static assets: Cached for 1 year
   - API responses: Cached for 5 minutes
   - Dynamic content: Cache-Control headers

3. **Image Optimization:**
   - Next.js automatic image optimization
   - WebP conversion for supported browsers
   - Responsive images with srcset

### Monitoring & Logging

1. **Error Tracking with Sentry:**
   ```env
   SENTRY_DSN=https://your-sentry-dsn
   ```

2. **Performance Monitoring:**
   - Vercel Speed Insights (automatic)
   - Custom performance metrics via API

3. **Uptime Monitoring:**
   - Use services like Uptime Robot
   - Monitor `/api/health` endpoint

## 🔒 Security Considerations

### API Keys Security
- Never commit API keys to repository
- Use Vercel environment variables
- Rotate keys regularly
- Use different keys for development/production

### Rate Limiting
- Implemented for OpenAI API calls
- RunPod rate limiting configured
- Client-side request throttling

### Content Security Policy
```javascript
// next.config.js
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;
```

## 📊 Analytics & Insights

### User Analytics
- Workflow upload tracking
- Storybook generation success rate
- Feature usage statistics
- Accessibility feature adoption

### Performance Metrics
- Page load times
- API response times
- Video generation duration
- Error rates by feature

### Business Intelligence
- Most popular workflow types
- User engagement patterns
- Feature conversion rates
- Support request trends

## 🆘 Troubleshooting

### Common Issues

1. **Build Failures:**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run build
   ```

2. **API Rate Limits:**
   - Check OpenAI usage dashboard
   - Implement exponential backoff
   - Consider upgrading API plan

3. **Memory Issues:**
   - Increase Vercel function memory
   - Optimize large dependencies
   - Use streaming for large responses

4. **Video Generation Timeout:**
   - Increase function timeout in vercel.json
   - Implement async processing with webhooks
   - Provide fallback content

### Support Channels
- GitHub Issues: Technical problems
- Discord Community: General questions
- Email Support: Enterprise customers

## 📈 Scaling Considerations

### Traffic Growth
- Vercel Pro plan for higher limits
- Database connection pooling
- CDN for static assets
- Edge functions for regional optimization

### Feature Scaling
- Microservices architecture
- Separate video generation service
- Background job processing
- Multi-region deployment

### Cost Optimization
- OpenAI token usage monitoring
- RunPod spot instances for video
- Efficient caching strategies
- Resource usage analytics

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### Automated Testing
- Unit tests for agents
- Integration tests for API routes
- E2E tests for critical user flows
- Accessibility tests with axe-core

### Quality Gates
- TypeScript compilation
- ESLint code quality
- Prettier formatting
- Security vulnerability scanning

---

## 🎉 Production Checklist

- [ ] All environment variables configured
- [ ] Custom domain setup (if applicable)
- [ ] SSL certificate verified
- [ ] Analytics tracking enabled
- [ ] Error monitoring configured
- [ ] Performance monitoring active
- [ ] Backup strategy implemented
- [ ] Security headers configured
- [ ] Rate limiting tested
- [ ] Accessibility compliance verified
- [ ] Mobile responsiveness confirmed
- [ ] Load testing completed
- [ ] Documentation updated
- [ ] Team access configured
- [ ] Support procedures established

**Your N8N Interactive Storybook is now ready for production! 🚀**
