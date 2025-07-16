# Stability Landbot Middleware

A modern Node.js Vercel serverless application for Stability AI image generation and enhancement using ES modules and native fetch.

## Features

- **Image Generation**: Generate images from text prompts using Stability AI's Ultra API
- **Image Enhancement**: Enhance existing images by downloading from URLs and applying prompts
- **Modern Architecture**: Built with ES modules, native fetch (Node 18+), and Vercel serverless functions
- **Type Safety**: Full JSDoc type annotations for better development experience
- **Error Handling**: Comprehensive error handling with appropriate HTTP status codes
- **CORS Support**: Ready for web browser consumption with proper CORS headers

## Project Structure

```
stability-landbot-middleware/
├── api/
│   ├── generate-image.js    # Image generation endpoint
│   └── enhance-image.js     # Image enhancement endpoint
├── lib/
│   └── helpers.js           # Utility functions
├── package.json             # Dependencies and scripts
├── README.md                # This file
└── .env.example             # Environment variables template
```

## API Endpoints

### POST /api/generate-image

Generates an image from a text prompt.

**Request Body:**
```json
{
  "prompt": "A beautiful sunset over mountains",
  "aspect_ratio": "16:9",
  "output_format": "webp"
}
```

**Parameters:**
- `prompt` (required): Text description of the image to generate
- `aspect_ratio` (optional): Image aspect ratio, default "1:1" (e.g., "16:9", "4:3")
- `output_format` (optional): Output format, default "webp" (webp, png, jpeg)

**Response:**
```json
{
  "image_url": "data:image/webp;base64,UklGRnoGAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA",
  "metadata": {
    "prompt": "A beautiful sunset over mountains",
    "aspect_ratio": "16:9",
    "output_format": "webp",
    "generated_at": "2023-12-07T19:30:00.000Z"
  }
}
```

### POST /api/enhance-image

Enhances an existing image using a text prompt.

**Request Body:**
```json
{
  "prompt": "Make this image more vibrant and add dramatic lighting",
  "image_url": "https://example.com/image.jpg",
  "aspect_ratio": "1:1",
  "output_format": "webp",
  "strength": 0.7
}
```

**Parameters:**
- `prompt` (required): Text description of how to enhance the image
- `image_url` (required): URL of the image to enhance (must be publicly accessible)
- `aspect_ratio` (optional): Output aspect ratio, default "1:1"
- `output_format` (optional): Output format, default "webp"
- `strength` (optional): Enhancement strength (0.0 to 1.0), higher values = more dramatic changes

**Response:**
```json
{
  "image_url": "data:image/webp;base64,UklGRnoGAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA",
  "metadata": {
    "prompt": "Make this image more vibrant and add dramatic lighting",
    "aspect_ratio": "1:1",
    "output_format": "webp",
    "strength": 0.7,
    "input_image_url": "https://example.com/image.jpg",
    "input_image_type": "image/jpeg",
    "input_image_size_bytes": 245760,
    "enhanced_at": "2023-12-07T19:30:00.000Z"
  }
}
```

## Deployment on Vercel

### Prerequisites

- [Vercel CLI](https://vercel.com/cli) installed: `npm install -g vercel`
- Stability AI API key from [platform.stability.ai](https://platform.stability.ai/account/keys)
- Node.js 18+ for local development

### Method 1: Vercel CLI (Recommended)

1. **Clone and setup the repository:**
   ```bash
   git clone <repository-url>
   cd stability-landbot-middleware
   npm install
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy to production:**
   ```bash
   vercel --prod
   ```

4. **Add environment variables:**
   ```bash
   vercel env add STABILITY_API_KEY
   ```
   When prompted, enter your Stability AI API key and select "Production" environment.

5. **Redeploy to apply environment variables:**
   ```bash
   vercel --prod
   ```

### Method 2: Vercel Dashboard

1. **Push code to Git repository** (GitHub, GitLab, or Bitbucket)

2. **Import project in Vercel:**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your repository
   - Vercel will auto-detect it as a Node.js project

3. **Configure environment variables:**
   - In project settings, go to "Environment Variables"
   - Add variable:
     - **Name**: `STABILITY_API_KEY`
     - **Value**: Your Stability AI API key
     - **Environment**: Production (and Preview/Development if needed)

4. **Deploy the project**

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `STABILITY_API_KEY` | Your Stability AI API key from platform.stability.ai | Yes |

### Getting a Stability AI API Key

1. Visit [Stability AI Platform](https://platform.stability.ai/account/keys)
2. Create an account or sign in
3. Generate a new API key
4. Copy the key and add it to your Vercel environment variables

## Local Development

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Add your API key to `.env`:**
   ```env
   STABILITY_API_KEY=your_stability_ai_api_key_here
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

The development server will start and you can test endpoints at:
- `http://localhost:3000/api/generate-image`
- `http://localhost:3000/api/enhance-image`

## Example Usage

### Generate Image

```bash
curl -X POST https://your-project.vercel.app/api/generate-image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A futuristic city skyline at sunset with flying cars",
    "aspect_ratio": "16:9",
    "output_format": "webp"
  }'
```

### Enhance Image

```bash
curl -X POST https://your-project.vercel.app/api/enhance-image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Make this image more dramatic with enhanced colors and lighting",
    "image_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    "aspect_ratio": "1:1",
    "output_format": "png",
    "strength": 0.8
  }'
```

### JavaScript/Fetch Examples

**Generate Image:**
```javascript
const response = await fetch('https://your-project.vercel.app/api/generate-image', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'A serene mountain landscape with a crystal clear lake',
    aspect_ratio: '4:3',
    output_format: 'webp'
  })
});

const result = await response.json();
console.log('Generated image:', result.image_url);
```

**Enhance Image:**
```javascript
const response = await fetch('https://your-project.vercel.app/api/enhance-image', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'Transform this into a cyberpunk scene with neon lights',
    image_url: 'https://example.com/my-image.jpg',
    strength: 0.6,
    output_format: 'png'
  })
});

const result = await response.json();
console.log('Enhanced image:', result.image_url);
```

## Error Handling

The API provides detailed error responses with appropriate HTTP status codes:

- **400 Bad Request**: Invalid input, missing required fields, or malformed JSON
- **405 Method Not Allowed**: Using wrong HTTP method (only POST is allowed)
- **500 Internal Server Error**: Server configuration issues (missing API key)
- **502 Bad Gateway**: Stability AI API errors

Example error response:
```json
{
  "error": "Image generation failed",
  "message": "Prompt is required and must be a non-empty string",
  "timestamp": "2023-12-07T19:30:00.000Z"
}
```

## Technical Details

### Dependencies

- **form-data**: For creating multipart/form-data requests to Stability AI
- **Node.js 18+**: Uses native fetch and modern ES modules

### Architecture

- **ES Modules**: Modern JavaScript module system with `"type": "module"`
- **Serverless Functions**: Each endpoint is a separate Vercel function for optimal performance
- **Native Fetch**: No external HTTP libraries needed, uses Node.js built-in fetch
- **Type Safety**: JSDoc annotations for better development experience

### Image Processing

- **URL Validation**: Ensures image URLs are valid and use HTTPS/HTTP
- **Size Limits**: 10MB maximum file size for image enhancement
- **Format Support**: Supports WebP, PNG, and JPEG formats
- **MIME Type Detection**: Automatic content-type detection and file extension mapping

## License

MIT

## Support

For issues related to:
- **Stability AI API**: Check [Stability AI documentation](https://platform.stability.ai/docs)
- **Vercel deployment**: Check [Vercel documentation](https://vercel.com/docs)
- **This project**: Open an issue in the repository