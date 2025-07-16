require('dotenv').config();
const fetch = require('node-fetch');
const FormData = require('form-data');

// Stability AI API configuration
const STABILITY_API_URL = 'https://api.stability.ai/v2beta/stable-image/generate/ultra';
const STABILITY_API_KEY = process.env.STABILITY_API_KEY;

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

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!STABILITY_API_KEY) {
      return res.status(500).json({
        error: 'STABILITY_API_KEY environment variable is required'
      });
    }

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
    console.error('Error in generate-image:', error);
    res.status(500).json({
      error: 'Failed to generate image',
      details: error.message
    });
  }
};