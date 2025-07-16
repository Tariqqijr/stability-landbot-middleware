require('dotenv').config();
const express = require('express');
// Updated: Removed vercel.json secret reference
const fetch = require('node-fetch');
const FormData = require('form-data');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Stability AI API configuration
const STABILITY_API_URL = 'https://api.stability.ai/v2beta/stable-image/generate/ultra';
const STABILITY_API_KEY = process.env.STABILITY_API_KEY;

if (!STABILITY_API_KEY) {
  console.error('STABILITY_API_KEY environment variable is required');
  process.exit(1);
}

// Helper function to call Stability AI API
async function callStabilityAPI(formData) {
  try {
    const response = await fetch(STABILITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STABILITY_API_KEY}`,
        'Accept': 'application/json',
        ...formData.getHeaders()
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Stability API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    // Extract base64 image from response
    if (result.image) {
      return {
        image_url: `data:image/webp;base64,${result.image}`
      };
    } else {
      throw new Error('No image data received from Stability API');
    }
  } catch (error) {
    console.error('Error calling Stability API:', error);
    throw error;
  }
}

// POST /generate-image endpoint
app.post('/generate-image', async (req, res) => {
  try {
    const { prompt, aspect_ratio, output_format } = req.body;

    // Validate required fields
    if (!prompt || !aspect_ratio || !output_format) {
      return res.status(400).json({
        error: 'Missing required fields: prompt, aspect_ratio, output_format'
      });
    }

    // Create form data for Stability API
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('aspect_ratio', aspect_ratio);
    formData.append('output_format', output_format);
    formData.append('none', ''); // Dummy field to satisfy file requirement

    const result = await callStabilityAPI(formData);
    res.json(result);

  } catch (error) {
    console.error('Error in /generate-image:', error);
    res.status(500).json({
      error: 'Failed to generate image',
      details: error.message
    });
  }
});

// POST /enhance-image endpoint
app.post('/enhance-image', upload.single('image'), async (req, res) => {
  try {
    const { prompt, aspect_ratio, output_format } = req.body;
    const imageFile = req.file;

    // Validate required fields
    if (!prompt || !aspect_ratio || !output_format) {
      return res.status(400).json({
        error: 'Missing required fields: prompt, aspect_ratio, output_format'
      });
    }

    if (!imageFile) {
      return res.status(400).json({
        error: 'Image file is required'
      });
    }

    // Create form data for Stability API
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('aspect_ratio', aspect_ratio);
    formData.append('output_format', output_format);
    formData.append('image', imageFile.buffer, {
      filename: imageFile.originalname,
      contentType: imageFile.mimetype
    });

    const result = await callStabilityAPI(formData);
    res.json(result);

  } catch (error) {
    console.error('Error in /enhance-image:', error);
    res.status(500).json({
      error: 'Failed to enhance image',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Stability Landbot Middleware is running' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    details: error.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found'
  });
});

app.listen(port, () => {
  console.log(`Stability Landbot Middleware listening on port ${port}`);
  console.log(`Health check available at: http://localhost:${port}/health`);
});