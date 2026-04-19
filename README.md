# Serverless CRUD Monorepo

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

A production-ready serverless CRUD application built with:

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: AWS Lambda + API Gateway + DynamoDB
- **Infrastructure**: Serverless Framework + CloudFormation
- **Monorepo**: Nx workspace with TypeScript
- **CI/CD**: GitHub Actions with preview environments

---

## 📦 Project Structure

```
org/
├── packages/
│   ├── api/              # AWS Lambda Functions (Node.js 20)
│   │   ├── src/
│   │   │   └── functions/
│   │   │       └── items/    # CRUD handlers
│   │   ├── serverless.yml    # Serverless config
│   │   └── nodemon.json      # Hot reload config
│   │
│   ├── web/              # React Application
│   │   ├── src/
│   │   │   ├── components/   # React components
│   │   │   ├── services/     # API client (axios)
│   │   │   └── App.tsx       # Main app
│   │   ├── vite.config.mts   # Vite + Proxy
│   │   └── tailwind.config.js
│   │
│   └── shared/           # Shared TypeScript types
│       └── src/
│           └── lib/
│               └── shared.ts # Item interfaces
│
├── .github/
│   └── workflows/        # CI/CD pipelines
│       ├── preview.yml           # PR preview deployments
│       ├── cleanup-preview.yml   # Clean up on PR close
│       └── deploy-prod.yml       # Production deployment
│
└── nx.json               # Nx configuration
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 22.14+ (use `nvm use 22.14`)
- npm or pnpm
- AWS Account (for deployment)
- AWS CLI configured (optional, for manual deploys)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd org

# Switch to Node 22.14
nvm use 22.14

# Install dependencies
npm install --legacy-peer-deps
```

---

## 💻 Local Development

### Start Both Services (Recommended)

```bash
# One command to start both API and Web servers
npm run dev
```

This will start:
- **API** (serverless-offline on port 3000) with blue prefix
- **Web** (Vite dev server on port 4200) with green prefix

Then open http://localhost:4200 in your browser. The frontend will proxy API requests to the backend.

### Start Services Individually

```bash
# Terminal 1: Start API only
npm run dev:api
# or
npx nx serve api

# Terminal 2: Start Web only
npm run dev:web
# or
npx nx serve web
```

### Individual Commands

```bash
# Run API with hot reload (nodemon)
cd packages/api && npm run dev

# Run API without nodemon
cd packages/api && npm run offline

# Run Web app
npx nx serve web

# Build all projects
npx nx run-many -t build

# Type check
npx nx run-many -t typecheck
```

---

## 🏗️ Architecture

### Frontend → Backend Connection

```
React App (localhost:4200)
    ↓
Vite Proxy (/api/*)
    ↓
Serverless Offline (localhost:3000)
    ↓
Lambda Handlers
    ↓
In-Memory Storage (dev) / DynamoDB (prod)
```

### API Endpoints

| Method | Endpoint         | Description     |
| ------ | ---------------- | --------------- |
| GET    | `/api/items`     | List all items  |
| GET    | `/api/items/:id` | Get single item |
| POST   | `/api/items`     | Create new item |
| PUT    | `/api/items/:id` | Update item     |
| DELETE | `/api/items/:id` | Delete item     |

---

## ☁️ Deployment

### Manual Deployment

```bash
# Deploy to dev environment
cd packages/api
npm run deploy:dev

# Deploy to production
npm run deploy:prod

# Remove deployment
npm run remove -- --stage dev
```

### CI/CD with GitHub Actions

The repository includes three workflows:

#### 1. **PR Preview Environments** (`.github/workflows/preview.yml`)

- Triggers on: PR opened/updated
- Creates: `org-api-pr-{number}` stack
- Comments: API URL in PR for testing

#### 2. **Cleanup on PR Close** (`.github/workflows/cleanup-preview.yml`)

- Triggers on: PR closed
- Deletes: CloudFormation stack
- Frees up: AWS resources

#### 3. **Production Deployment** (`.github/workflows/deploy-prod.yml`)

- Triggers on: Push to `main`
- Deploys: `org-api-prod` stack
- Updates: Production environment

### Required GitHub Secrets

Add these in your repository settings (`Settings → Secrets and variables → Actions`):

```
AWS_ACCESS_KEY_ID       # Your AWS access key
AWS_SECRET_ACCESS_KEY   # Your AWS secret key
```

### IAM Permissions Required

Your AWS user needs:

- CloudFormation (full)
- Lambda (full)
- API Gateway (full)
- DynamoDB (full)
- IAM (create/delete roles)
- S3 (for deployment artifacts)
- CloudWatch Logs

---

## 📚 Key Technologies

### Frontend Stack

- **React 18**: Modern UI library
- **Vite**: Fast dev server with HMR
- **Tailwind CSS**: Utility-first CSS
- **tailwind-merge**: Class name merging
- **axios**: HTTP client with interceptors
- **TypeScript**: Type safety

### Backend Stack

- **AWS Lambda**: Serverless functions (Node.js 20)
- **API Gateway HTTP API**: RESTful endpoints
- **DynamoDB**: NoSQL database (pay-per-request)
- **CloudFormation**: Infrastructure as Code
- **Serverless Framework**: Deployment tool
- **serverless-offline**: Local Lambda emulation
- **serverless-esbuild**: Fast TypeScript compilation
- **nodemon**: Hot reload during development

### Development Tools

- **Nx**: Monorepo management
- **TypeScript**: Type safety across packages
- **ESBuild**: Fast builds
- **GitHub Actions**: CI/CD pipelines

---

## 🔧 Configuration

### Environment Variables

Create `.env` files for environment-specific config:

```bash
# packages/web/.env.local
VITE_API_URL=https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com
```

### Vite Proxy (Development)

The proxy is configured in [packages/web/vite.config.mts](packages/web/vite.config.mts):

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
}
```

### Serverless Configuration

Edit [packages/api/serverless.yml](packages/api/serverless.yml) to:

- Change AWS region
- Modify DynamoDB configuration
- Add environment variables
- Configure CORS settings

---

## 🧪 Testing

```bash
# Test API locally
curl http://localhost:3000/api/items

# Create an item
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Item","description":"Test description"}'

# Get all items
curl http://localhost:3000/api/items
```

---

## 📖 Learn More

- [Nx Documentation](https://nx.dev)
- [Serverless Framework](https://www.serverless.com/framework/docs)
- [AWS Lambda](https://aws.amazon.com/lambda/)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vite.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Open a PR (preview environment will be created automatically)
4. After approval, merge to `main` (deploys to production)

---

## 📝 License

MIT

To manually trigger the process to sync the project graph dependencies information to the TypeScript project references, run the following command:

```sh
npx nx sync
```

You can enforce that the TypeScript project references are always in the correct state when running in CI by adding a step to your CI job configuration that runs the following command:

```sh
npx nx sync:check
```

[Learn more about nx sync](https://nx.dev/reference/nx-commands#sync)

## Nx Cloud

Nx Cloud ensures a [fast and scalable CI](https://nx.dev/ci/intro/why-nx-cloud?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) pipeline. It includes features such as:

- [Remote caching](https://nx.dev/ci/features/remote-cache?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task distribution across multiple machines](https://nx.dev/ci/features/distribute-task-execution?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Automated e2e test splitting](https://nx.dev/ci/features/split-e2e-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task flakiness detection and rerunning](https://nx.dev/ci/features/flaky-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

### Set up CI (non-Github Actions CI)

**Note:** This is only required if your CI provider is not GitHub Actions.

Use the following command to configure a CI workflow for your workspace:

```sh
npx nx g ci-workflow
```

[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/nx-api/js?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:

- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
