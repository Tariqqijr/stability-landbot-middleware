# Stability Landbot Middleware

A Node.js Express middleware application that provides endpoints for image generation and enhancement using Stability AI's Ultra API.

## Features

- **Image Generation**: Generate images from text prompts
- **Image Enhancement**: Enhance existing images with prompts
- **Vercel Ready**: Configured for easy deployment on Vercel
- **Error Handling**: Comprehensive error handling and validation

## API Endpoints

### POST /generate-image

Generates an image from a text prompt.

**Request Body (JSON):**
```json
{
  "prompt": "A beautiful sunset over mountains",
  "aspect_ratio": "16:9",
  "output_format": "webp"
}
```

**Response:**
```json
{
  "image_url": "data:image/webp;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

### POST /enhance-image

Enhances an existing image using a text prompt.

**Request (multipart/form-data):**
- `image`: Image file (required)
- `prompt`: Text prompt for enhancement (required)
- `aspect_ratio`: Desired aspect ratio (required)
- `output_format`: Output format (required)

**Response:**
```json
{
  "image_url": "data:image/webp;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "message": "Stability Landbot Middleware is running"
}
```

## Local Development

### Prerequisites

- Node.js 14 or higher
- Stability AI API key

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd stability-landbot-middleware
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Edit `.env` and add your Stability AI API key:
```env
STABILITY_API_KEY=your_stability_ai_api_key_here
```

5. Start the development server:
```bash
npm start
```

The server will start on port 3000. You can test the health endpoint at `http://localhost:3000/health`.

### Getting a Stability AI API Key

1. Visit [Stability AI Platform](https://platform.stability.ai/account/keys)
2. Create an account or sign in
3. Generate a new API key
4. Copy the key to your `.env` file

## Deployment on Vercel

### Method 1: Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy the project:
```bash
vercel
```

4. Set environment variables:
```bash
vercel env add STABILITY_API_KEY
```
Enter your Stability AI API key when prompted.

5. Redeploy to apply environment variables:
```bash
vercel --prod
```

### Method 2: Vercel Dashboard

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)

3. Click "New Project" and import your repository

4. In the project settings, go to "Environment Variables"

5. Add the following environment variable:
   - **Name**: `STABILITY_API_KEY`
   - **Value**: Your Stability AI API key
   - **Environment**: Production (and Preview/Development if needed)

6. Deploy the project

### Method 3: Using Vercel Secrets (Recommended for production)

1. Add your API key as a secret:
```bash
vercel secrets add stability-api-key your_actual_api_key_here
```

2. The `vercel.json` file is already configured to use this secret

3. Deploy:
```bash
vercel --prod
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `STABILITY_API_KEY` | Your Stability AI API key | Yes |
| `PORT` | Port for local development | No (defaults to 3000) |

## Dependencies

- **express**: Web framework
- **node-fetch**: HTTP client for making requests to Stability AI
- **form-data**: For creating multipart/form-data requests
- **multer**: Middleware for handling file uploads
- **dotenv**: Environment variable management

## Error Handling

The application includes comprehensive error handling:

- **400 Bad Request**: Missing required fields or invalid input
- **500 Internal Server Error**: API errors or server issues
- **404 Not Found**: Invalid endpoints

All errors return JSON responses with error details.

## API Usage Examples

### Generate Image with curl

```bash
curl -X POST http://localhost:3000/generate-image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A futuristic city at sunset",
    "aspect_ratio": "16:9",
    "output_format": "webp"
  }'
```

### Enhance Image with curl

```bash
curl -X POST http://localhost:3000/enhance-image \
  -F "image=@path/to/your/image.jpg" \
  -F "prompt=Make this image more vibrant and colorful" \
  -F "aspect_ratio=1:1" \
  -F "output_format=webp"
```

## License

MIT