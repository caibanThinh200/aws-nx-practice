# Serverless Local Development Setup

## ✅ Configuration Complete

Your serverless API is now configured for local development with **in-memory storage** (no DynamoDB needed).

---

## 📋 What's Configured

### 1. **serverless.yml**
- ✅ `serverless-esbuild` - Fast TypeScript compilation
- ✅ `serverless-offline` - Local API Gateway + Lambda emulation
- ✅ Port 3000 for HTTP API
- ✅ No DynamoDB local required

### 2. **In-Memory Data Store**
- ✅ `src/utils/store.ts` - In-memory storage for local dev
- ✅ `src/utils/db.ts` - Unified DB interface (auto-switches between local/AWS)
- ✅ All Lambda handlers updated to use the new db utility

### 3. **Environment Detection**
- Local: Uses in-memory store (no external dependencies)
- AWS: Uses real DynamoDB tables

---

## 🚀 How to Run Locally

### Prerequisites

**Important: Use Node.js 22.14**
```bash
nvm use 22.14
```

If you get "structuredClone is not defined" error, you're on the wrong Node version.

### Start the API

**Option 1: Using npm scripts (recommended)**
```bash
npm run dev        # Start both API + Web
npm run dev:api    # Start API only
```

**Option 2: From the API directory**
```bash
cd packages/api
npm run dev        # With nodemon (hot reload)
# or
npm run offline    # Without nodemon
```

**Option 3: Using Nx**
```bash
npx nx serve api
```

### Verify It's Running

```bash
# Check health
curl http://localhost:3000/api/items

# Create an item
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Item","description":"Testing local serverless"}'

# Get all items
curl http://localhost:3000/api/items
```

---

## 🔧 Configuration Details

### serverless.yml Key Settings

```yaml
plugins:
  - serverless-esbuild    # Compiles TypeScript
  - serverless-offline    # Local API Gateway emulation

custom:
  serverless-offline:
    httpPort: 3000                    # API runs on port 3000
    noPrependStageInUrl: true         # Clean URLs without /dev
  
  esbuild:
    bundle: true                      # Bundle dependencies
    target: 'node20'                  # Match Lambda runtime
    exclude:                          # Don't bundle AWS SDK
      - 'aws-sdk'
      - '@aws-sdk/client-dynamodb'
      - '@aws-sdk/lib-dynamodb'
```

### Environment Variables

When running locally with serverless-offline:
- `IS_OFFLINE=true` - Indicates local development mode
- `ITEMS_TABLE=items-local` - Dummy table name (not used with in-memory store)

---

## 📁 File Structure for Local Dev

```
packages/api/
├── src/
│   ├── functions/
│   │   └── items/
│   │       ├── list.ts      ✅ Uses db utility
│   │       ├── get.ts       ✅ Uses db utility
│   │       ├── create.ts    ✅ Uses db utility
│   │       ├── update.ts    ✅ Uses db utility
│   │       └── delete.ts    ✅ Uses db utility
│   └── utils/
│       ├── db.ts            🔧 DB abstraction layer
│       └── store.ts         💾 In-memory storage
├── serverless.yml           ⚙️ Serverless config
└── nodemon.json             🔥 Hot reload config
```

---

## 🎯 How It Works

### Local Development Flow

1. **nodemon** watches for file changes
2. **serverless-offline** emulates API Gateway + Lambda
3. **IS_OFFLINE=true** triggers in-memory storage mode
4. **db utility** routes to in-memory store instead of DynamoDB
5. Data is stored in RAM (resets on restart)

### Production Flow

1. **serverless deploy** creates CloudFormation stack
2. **IS_OFFLINE** is undefined
3. **db utility** routes to real DynamoDB
4. Data persists in DynamoDB tables

---

## 🐛 Troubleshooting

### Error: "structuredClone is not defined"
**Solution:** You're on Node 16. Switch to Node 22:
```bash
nvm use 22.14
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Error: "Cannot find module 'serverless-esbuild'"
**Solution:** Reinstall dependencies:
```bash
npm install --legacy-peer-deps
```

### Error: "Port 3000 already in use"
**Solution:** Kill the process using port 3000:
```bash
lsof -ti:3000 | xargs kill -9
```

### Lambdas not reloading on file change
**Solution:** Check nodemon is watching correctly:
```bash
cd packages/api
npm run dev  # Uses nodemon
```

### Data not persisting between restarts
**Expected behavior:** In local mode, data is stored in memory and resets on restart. This is intentional for local development.

---

## 🔄 Switching Between Local and AWS

### Local Development (In-Memory)
```bash
npm run dev:api
# IS_OFFLINE=true → Uses in-memory store
```

### AWS Development (Real DynamoDB)
```bash
cd packages/api
npm run deploy:dev
# IS_OFFLINE undefined → Uses DynamoDB
```

### Testing with Real DynamoDB Locally (Advanced)
If you want to test with DynamoDB locally:

1. Install DynamoDB Local
2. Set AWS credentials
3. Remove the `IS_OFFLINE` check in `db.ts`
4. Point to DynamoDB Local endpoint

---

## ✨ Benefits of This Setup

- ✅ **No external dependencies** - No DynamoDB Local, Docker, etc.
- ✅ **Fast startup** - Instant, no infrastructure to spin up
- ✅ **Hot reload** - Changes apply immediately
- ✅ **Same code** - Handlers work identically in local/AWS
- ✅ **Easy testing** - Simple curl commands to test APIs
- ✅ **Clean slate** - Fresh data on each restart

---

## 📚 Next Steps

1. ✅ Switch to Node 22.14: `nvm use 22.14`
2. ✅ Reinstall dependencies: `npm install --legacy-peer-deps`
3. ✅ Start development: `npm run dev`
4. ✅ Test the API: `curl http://localhost:3000/api/items`
5. ✅ Build your features!

For deployment to AWS, see the main [README.md](../../README.md#-deployment).
