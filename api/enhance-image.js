/**
 * Vercel Serverless Function: Enhance Image
 * 
 * Deployment Instructions:
 * 1. Deploy to Vercel: `vercel --prod`
 * 2. Set environment variable: `vercel env add STABILITY_API_KEY`
 * 3. Enter your Stability AI API key when prompted
 * 4. Redeploy: `vercel --prod`
 * 
 * Endpoint: POST /api/enhance-image
 * Body: { prompt, image_url, aspect_ratio?, output_format?, strength? }
 */

import FormData from 'form-data';
import { getMimeType, validateParams, downloadImage, getFileExtension } from '../lib/helpers.js';

// Stability AI API configuration
const STABILITY_API_URL = 'https://api.stability.ai/v2beta/stable-image/generate/ultra';

/**
 * Call Stability AI API for image enhancement
 * @param {Object} params - Validated parameters
 * @param {Buffer} imageBuffer - Image data buffer
 * @param {string} contentType - Original image content type
 * @returns {Promise<string>} Base64 encoded enhanced image
 */
async function callStabilityAPI(params, imageBuffer, contentType) {
  const { prompt, aspect_ratio, output_format, strength } = params;
  
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
  
  // Add strength parameter if provided
  if (strength !== undefined) {
    formData.append('strength', strength.toString());
  }
  
  // Add image file with appropriate filename
  const fileExtension = getFileExtension(contentType);
  formData.append('image', imageBuffer, {
    filename: `input${fileExtension}`,
    contentType: contentType
  });
  
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
 * Validate image URL and ensure it's accessible
 * @param {string} imageUrl - URL to validate
 * @returns {string} Validated URL
 */
function validateImageUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') {
    throw new Error('image_url is required and must be a string');
  }
  
  try {
    const url = new URL(imageUrl);
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('image_url must use HTTP or HTTPS protocol');
    }
    return imageUrl;
  } catch (error) {
    throw new Error('image_url must be a valid URL');
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
    
    // Validate image URL
    const imageUrl = validateImageUrl(body.image_url);
    
    // Validate other parameters
    const params = validateParams(body);
    
    // Download the image
    let imageData;
    try {
      imageData = await downloadImage(imageUrl);
    } catch (downloadError) {
      res.status(400).json({
        error: 'Image download failed',
        message: downloadError.message,
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Validate image size (optional - add reasonable limits)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (imageData.buffer.length > maxSize) {
      res.status(400).json({
        error: 'Image too large',
        message: `Image size (${Math.round(imageData.buffer.length / 1024 / 1024)}MB) exceeds maximum allowed size (10MB)`,
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Call Stability AI API
    const base64Image = await callStabilityAPI(params, imageData.buffer, imageData.contentType);
    
    // Get appropriate MIME type for output
    const mimeType = getMimeType(params.output_format);
    
    // Return response
    res.status(200).json({
      image_url: `data:${mimeType};base64,${base64Image}`,
      metadata: {
        prompt: params.prompt,
        aspect_ratio: params.aspect_ratio,
        output_format: params.output_format,
        strength: params.strength,
        input_image_url: imageUrl,
        input_image_type: imageData.contentType,
        input_image_size_bytes: imageData.buffer.length,
        enhanced_at: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Enhance image error:', error);
    
    // Determine appropriate status code
    let statusCode = 500;
    if (error.message.includes('required') || error.message.includes('must be')) {
      statusCode = 400;
    } else if (error.message.includes('STABILITY_API_KEY')) {
      statusCode = 500; // Server configuration error
    } else if (error.message.includes('Stability API error')) {
      statusCode = 502; // Bad gateway
    } else if (error.message.includes('download') || error.message.includes('URL')) {
      statusCode = 400; // Bad request - invalid URL or download failed
    }
    
    res.status(statusCode).json({
      error: 'Image enhancement failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}