# Development Guide

## Getting Started

### Node Version

This project requires Node.js 22.14. Use nvm to switch:

```bash
nvm use
```

If you don't have this version installed:

```bash
nvm install 22.14
```

### Install Dependencies

```bash
npm install --legacy-peer-deps
```

Note: We use `--legacy-peer-deps` due to peer dependency conflicts between Vite 8 and esbuild versions. This is safe and doesn't affect functionality.

---

## Running the Application

### Option 1: Both Services Together (Recommended)

```bash
npm run dev
```

This single command starts both:
- **API** (serverless-offline with nodemon on port 3000) - shown with blue prefix
- **Web** (Vite dev server on port 4200) - shown with green prefix

The output is color-coded and prefixed for easy identification. Press `Ctrl+C` to stop both services.

### Option 2: Individual Services

Open two terminal windows:

**Terminal 1 - API:**
```bash
npm run dev:api
# or
npx nx serve api
```
This starts serverless-offline with nodemon for hot reload on port 3000.

**Terminal 2 - Web:**
```bash
npm run dev:web
# or
npx nx serve web
```
This starts the Vite dev server on port 4200.

Then navigate to: http://localhost:4200

### Option 3: Package-Level Commands

From within the package directories:

**API only:**
```bash
cd packages/api
npm run dev          # With nodemon hot reload
# or
npm run offline      # Without hot reload
```

**Web only:**
```bash
cd packages/web
npm run dev          # Vite dev server
```

---

## How It Works

### Local Development Flow

1. React app runs on `localhost:4200`
2. API calls to `/api/*` are proxied by Vite to `localhost:3000`
3. Serverless Offline emulates API Gateway and Lambda locally
4. Lambda handlers respond with JSON data
5. React updates the UI

### File Watching

- **Frontend**: Vite provides instant HMR (Hot Module Replacement)
- **Backend**: Nodemon watches `*.ts` and `*.yml` files, restarts serverless-offline on changes

---

## Project Structure

### Shared Types (`packages/shared`)

Common TypeScript interfaces used by both frontend and backend:

- `Item` - Main data model
- `CreateItemDto` - Create request payload
- `UpdateItemDto` - Update request payload
- `ApiResponse<T>` - Standardized API response

Import in packages:

```typescript
import { Item, CreateItemDto } from '@org/shared';
```

### API (`packages/api`)

Serverless Lambda functions:

- `list.ts` - GET /api/items
- `get.ts` - GET /api/items/:id
- `create.ts` - POST /api/items
- `update.ts` - PUT /api/items/:id
- `delete.ts` - DELETE /api/items/:id

Each handler:

1. Receives API Gateway event
2. Processes request
3. Interacts with DynamoDB
4. Returns formatted response

### Web (`packages/web`)

React application structure:

- `components/` - Reusable React components
  - `ItemList.tsx` - Display items in a grid
  - `ItemForm.tsx` - Create/edit form
- `services/api.ts` - Axios instance with interceptors
- `App.tsx` - Main application logic

---

## Making Changes

### Adding a New Field to Item

1. **Update shared types** (`packages/shared/src/lib/shared.ts`):

```typescript
export interface Item {
  id: string;
  name: string;
  description: string;
  category: string; // New field
  createdAt: string;
  updatedAt: string;
}
```

2. **Update Lambda handlers** (e.g., `packages/api/src/functions/items/create.ts`):

```typescript
const item: Item = {
  id: randomUUID(),
  name: data.name,
  description: data.description,
  category: data.category, // Add new field
  createdAt: now,
  updatedAt: now,
};
```

3. **Update React components** (`packages/web/src/components/ItemForm.tsx`):

```typescript
const [category, setCategory] = useState('');

// Add input field in JSX
<input value={category} onChange={(e) => setCategory(e.target.value)} />;
```

### Adding a New API Endpoint

1. **Create handler** (`packages/api/src/functions/items/search.ts`):

```typescript
export const handler: APIGatewayProxyHandler = async (event) => {
  // Implementation
};
```

2. **Update serverless.yml**:

```yaml
functions:
  searchItems:
    handler: src/functions/items/search.handler
    events:
      - httpApi:
          path: /api/items/search
          method: get
```

3. **Use in React**:

```typescript
const response = await api.get('/items/search', {
  params: { q: 'query' },
});
```

---

## Deployment

### Test Locally First

```bash
# Start both services
npx nx serve api
npx nx serve web

# Test in browser: http://localhost:4200
# Verify CRUD operations work
```

### Deploy to AWS

**Prerequisites:**

- AWS CLI configured
- IAM user with required permissions
- AWS credentials in environment

**Deploy to dev:**

```bash
cd packages/api
npm run deploy:dev
```

**Deploy to prod:**

```bash
npm run deploy:prod
```

### Verify Deployment

```bash
# Get API URL
npx serverless info --stage dev

# Test endpoint
curl https://your-api-id.execute-api.us-east-1.amazonaws.com/api/items
```

---

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000 (API)
lsof -ti:3000 | xargs kill -9

# Kill process on port 4200 (Web)
lsof -ti:4200 | xargs kill -9
```

### Module Not Found Errors

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Serverless Offline Not Starting

```bash
# Verify serverless installation
npx serverless --version

# Test without nodemon
cd packages/api
npx serverless offline start
```

### React Hot Reload Not Working

```bash
# Restart Vite server
# Press 'r' to restart, or
# Ctrl+C and run: npx nx serve web
```

### DynamoDB Errors in Production

```bash
# Check CloudFormation stack
aws cloudformation describe-stacks --stack-name org-api-dev

# View Lambda logs
npx serverless logs -f listItems --stage dev --tail
```

---

## Useful Commands

```bash
# View project graph
npx nx graph

# Build all projects
npx nx run-many -t build

# Type check everywhere
npx nx run-many -t typecheck

# Format code
npx nx format:write

# Run specific project
npx nx serve web
npx nx build api

# Clear Nx cache
npx nx reset
```

---

## Next Steps

- [ ] Add authentication (Cognito or Auth0)
- [ ] Implement data validation (Zod)
- [ ] Add unit tests (Vitest)
- [ ] Set up error tracking (Sentry)
- [ ] Add API rate limiting
- [ ] Implement pagination
- [ ] Add database indexes
- [ ] Set up monitoring (CloudWatch)
- [ ] Add E2E tests (Playwright)
- [ ] Configure custom domain
