/**
 * Vercel Serverless Function: Generate Image
 * 
 * Deployment Instructions:
 * 1. Deploy to Vercel: `vercel --prod`
 * 2. Set environment variable: `vercel env add STABILITY_API_KEY`
 * 3. Enter your Stability AI API key when prompted
 * 4. Redeploy: `vercel --prod`
 * 
 * Endpoint: POST /api/generate-image
 * Body: { prompt, aspect_ratio?, output_format? }
 */

import FormData from 'form-data';
import { getMimeType, validateParams } from '../lib/helpers.js';

// Stability AI API configuration
const STABILITY_API_URL = 'https://api.stability.ai/v2beta/stable-image/generate/ultra';

/**
 * Call Stability AI API for image generation
 * @param {Object} params - Validated parameters
 * @returns {Promise<string>} Base64 encoded image
 */
async function callStabilityAPI(params) {
  const { prompt, aspect_ratio, output_format } = params;
  
  // Get API key from environment
  const apiKey = process.env.STABILITY_API_KEY;
  if (!apiKey) {
    throw new Error('STABILITY_API_KEY environment variable is required');
  }
  
  // Create form data for Stability API
  const formData = new FormData();
  formData.append('prompt', prompt);
  formData.append('aspect_ratio', aspect_ratio);
  formData.append('output_format', output_format);
  formData.append('none', ''); // Dummy field to satisfy API requirements
  
  try {
    const response = await fetch(STABILITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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
    
    if (!result.image) {
      throw new Error('No image data received from Stability API');
    }
    
    return result.image;
  } catch (error) {
    console.error('Stability API call failed:', error);
    throw error;
  }
}

/**
 * Vercel serverless function handler
 * @param {import('http').IncomingMessage} req 
 * @param {import('http').ServerResponse} res 
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests'
    });
    return;
  }
  
  try {
    // Parse JSON body
    let body;
    try {
      const rawBody = req.body || '';
      body = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    } catch (parseError) {
      res.status(400).json({
        error: 'Invalid JSON',
        message: 'Request body must be valid JSON'
      });
      return;
    }
    
    // Validate and set defaults
    const params = validateParams(body);
    
    // Call Stability AI API
    const base64Image = await callStabilityAPI(params);
    
    // Get appropriate MIME type
    const mimeType = getMimeType(params.output_format);
    
    // Return response
    res.status(200).json({
      image_url: `data:${mimeType};base64,${base64Image}`,
      metadata: {
        prompt: params.prompt,
        aspect_ratio: params.aspect_ratio,
        output_format: params.output_format,
        generated_at: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Generate image error:', error);
    
    // Determine appropriate status code
    let statusCode = 500;
    if (error.message.includes('required') || error.message.includes('must be')) {
      statusCode = 400;
    } else if (error.message.includes('STABILITY_API_KEY')) {
      statusCode = 500; // Server configuration error
    } else if (error.message.includes('Stability API error')) {
      statusCode = 502; // Bad gateway
    }
    
    res.status(statusCode).json({
      error: 'Image generation failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}