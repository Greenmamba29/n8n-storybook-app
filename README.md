# 🚀 N8N Interactive Storybook

[![Build Status](https://img.shields.io/github/workflow/status/your-username/n8n-storybook-app/Deploy%20N8N%20Interactive%20Storybook)](https://github.com/your-username/n8n-storybook-app/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](package.json)
[![Accessibility](https://img.shields.io/badge/accessibility-WCAG%202.1%20AA-green.svg)](#accessibility)

> **Transform N8N automation workflows into interactive, accessible educational experiences using sophisticated AI agents**

An enterprise-grade educational technology platform that leverages multi-agent AI orchestration to convert N8N workflows into engaging, interactive storybooks with video tutorials and WCAG 2.1 AA accessibility compliance.

![N8N Interactive Storybook Demo](https://via.placeholder.com/800x400/4f46e5/ffffff?text=N8N+Interactive+Storybook)

## ✨ Features

### 🤖 **Multi-Agent AI System**
- **6 Specialized AI Agents** working in orchestration
- **Tambo MCP Router** for intelligent request routing
- **OpenAI GPT-4** powered educational content generation
- **Wan2.2 Video Generation** with RunPod GPU cloud integration

### 📚 **Educational Excellence**
- **Interactive Storybooks** with step-by-step guidance
- **AI-Generated Videos** with closed captions and audio descriptions
- **Progressive Learning** with quizzes and assessments
- **Multi-format Workflow Import** (JSON, URL, GitHub repositories)

### ♿ **Accessibility Leadership**
- **WCAG 2.1 AA Compliance** automation with axe-core
- **Screen Reader Optimization** with ARIA enhancements
- **Keyboard Navigation** support throughout
- **Automatic Accessibility Repairs** with confidence scoring

### 🏗️ **Production Ready**
- **Enterprise Architecture** with 4-layer design
- **Kubernetes Deployment** with auto-scaling (3-10 pods)
- **Docker Containerization** with security hardening
- **CI/CD Pipeline** with GitHub Actions
- **Comprehensive Health Monitoring** and performance metrics

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key (required)
- RunPod API key (optional for video generation)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/n8n-storybook-app.git
   cd n8n-storybook-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🔧 Environment Configuration

```env
# Required for content generation
OPENAI_API_KEY=sk-your-openai-api-key

# Optional for video generation
RUNPOD_API_KEY=your-runpod-api-key

# Optional for data persistence
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# Authentication (for production)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

## 📖 API Documentation

### Workflow Management
- `POST /api/workflow/upload` - Upload and analyze N8N workflows
- `GET /api/workflow/upload?id=<id>` - Retrieve workflow details

### Storybook Generation  
- `POST /api/storybook/generate` - Generate interactive storybooks
- `GET /api/storybook/generate?id=<id>` - Get storybook details
- `PATCH /api/storybook/generate` - Update learning progress

### Video Generation
- `POST /api/video/generate` - Generate educational videos  
- `GET /api/video/generate?id=<id>` - Check generation status
- `DELETE /api/video/generate?id=<id>` - Cancel generation

### Accessibility & Health
- `POST /api/accessibility/check` - WCAG compliance testing
- `GET /api/health` - System health monitoring
- `GET /api/health/ping` - Simple health check

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                           │
│  Next.js 14 + React + Tailwind CSS + Accessibility UI     │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                   API GATEWAY LAYER                        │
│     Next.js API Routes + Rate Limiting + Validation       │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                  SERVICE LAYER                             │
│  N8N Integration + Agent Orchestrator + Video Generation   │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                   AGENT LAYER                              │
│  Tambo MCP Router + 6 Specialized AI Agents               │
└─────────────────────────────────────────────────────────────┘
```

### Agent System
- **Tambo MCP Router** - Central orchestration hub
- **N8N Workflow Analyzer** - Workflow parsing & educational mapping
- **OpenAI Content Generator** - Interactive content creation
- **Wan2.2 Video Agent** - AI video generation with RunPod
- **Accessibility Agent** - WCAG compliance automation
- **Quality Assurance Agent** - Content validation & optimization

## 🚀 Deployment

### Option 1: Vercel (Recommended)
```bash
npm i -g vercel
vercel --prod
```

### Option 2: Docker
```bash
docker build -t n8n-storybook-app .
docker run -p 3000:3000 n8n-storybook-app
```

### Option 3: Docker Compose (Full Stack)
```bash
docker-compose up -d
```

### Option 4: Kubernetes (Enterprise)
```bash
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/deployment.yaml
```

[🔧 **Detailed Deployment Guide**](./DEPLOYMENT.md)

## 🧪 Testing

```bash
# Build the project
npm run build

# Run tests
npm test

# Check API health
curl http://localhost:3000/api/health/ping
```

## 📊 Performance

- **Bundle Size**: 197 kB (optimized)
- **Build Time**: 10.8 seconds
- **First Load JS**: 197 kB
- **API Response Time**: < 2s average
- **Accessibility Score**: 95+ (WCAG 2.1 AA)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🛣️ Roadmap

### Phase 1: Foundation ✅
- [x] Multi-agent AI orchestration system
- [x] Complete API infrastructure  
- [x] Production deployment configurations
- [x] WCAG 2.1 AA accessibility compliance

### Phase 2: Enhancement (Q2 2024)
- [ ] Real-time collaboration features
- [ ] Advanced analytics and reporting
- [ ] Mobile app development
- [ ] Enterprise SSO integration

### Phase 3: Scale (Q3 2024)
- [ ] Multi-language support
- [ ] Advanced video editing capabilities
- [ ] Marketplace for educational content
- [ ] White-label solutions

## 🏢 Enterprise

### Business Model
- **SaaS Platform**: $50-500/month per organization
- **Enterprise Licensing**: $5,000-50,000+ annually
- **API Licensing**: Developer platform revenue
- **Professional Services**: Implementation and training

### Enterprise Features
- **Single Sign-On (SSO)** integration
- **Custom branding** and white-labeling
- **Advanced analytics** and reporting
- **Priority support** and SLA guarantees
- **On-premise deployment** options

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [N8N](https://n8n.io/) - The extensible workflow automation platform
- [OpenAI](https://openai.com/) - GPT-4 AI model for content generation
- [RunPod](https://runpod.io/) - GPU cloud infrastructure for video generation
- [Axe-core](https://github.com/dequelabs/axe-core) - Accessibility testing engine

## 📞 Support

- **Documentation**: [Full documentation](./docs/)
- **Issues**: [GitHub Issues](https://github.com/your-username/n8n-storybook-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/n8n-storybook-app/discussions)

---

**Built with ❤️ for the automation and accessibility communities**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/n8n-storybook-app)

**Ready to transform how people learn automation? Deploy now and start making an impact!** 🚀
