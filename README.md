# RAG Chatbot Frontend

React + TypeScript frontend for the RAG chatbot, built with Vite and Tailwind CSS.

## Features

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Axios** for API calls
- **Vite** for fast development and optimized builds

## Local Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env and set VITE_API_URL to your backend URL

# Run development server
npm run dev
```

The app will be available at `http://localhost:5173`

## Build for Production

```bash
# Build
npm run build

# Preview production build
npm run preview
```

## Docker Build

```bash
# Build
docker build -t chatbot-frontend .

# Run
docker run -p 8080:8080 chatbot-frontend
```

## Deploy to Cloud Run

### Prerequisites

1. Backend must be deployed first to get its URL
2. Update `.env.production` with your backend URL

### Deployment Steps

```bash
# 1. Set your project
export PROJECT_ID=your-gcp-project-id
gcloud config set project $PROJECT_ID

# 2. Update .env.production with your backend URL
# Edit .env.production and replace the backend URL

# 3. Build and push
gcloud builds submit --tag gcr.io/$PROJECT_ID/chatbot-frontend

# 4. Deploy
gcloud run deploy chatbot-frontend \
  --image gcr.io/$PROJECT_ID/chatbot-frontend \
  --platform managed \
  --region us-central1 \
  --memory 512Mi \
  --cpu 1 \
  --allow-unauthenticated

# 5. Get the frontend URL
gcloud run services describe chatbot-frontend \
  --region us-central1 \
  --format 'value(status.url)'

# 6. Update backend CORS
# Add the frontend URL to backend's CORS_ORIGINS environment variable
gcloud run services update chatbot-backend \
  --region us-central1 \
  --set-env-vars CORS_ORIGINS="http://localhost:5173,https://your-frontend-url.run.app"
```

## Environment Variables

- `VITE_API_URL` - Backend API URL (set in `.env.production` before building)

## Architecture

```
React SPA (Vite)
├── Chat UI Components
├── API Client (Axios)
└── Tailwind CSS Styling
    ↓ (HTTPS requests)
Backend API (Cloud Run)
```

## Communication with Backend

The frontend communicates with the backend via REST API:
- Frontend URL: `https://chatbot-frontend-xxx.run.app`
- Backend URL: `https://chatbot-backend-xxx.run.app`
- CORS is configured on the backend to allow frontend origin
- Typical latency: 10-50ms (same region)

## Updating Backend URL

After backend deployment:

1. Get backend URL:
   ```bash
   gcloud run services describe chatbot-backend --region us-central1 --format 'value(status.url)'
   ```

2. Update `.env.production`:
   ```
   VITE_API_URL=https://chatbot-backend-xxxxx.run.app
   ```

3. Rebuild and redeploy frontend

## Notes

- The backend URL is baked into the build at compile time
- To change the backend URL, you must rebuild and redeploy the frontend
- For development, use `.env` file to point to local backend
