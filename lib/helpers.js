/**
 * Helper functions for MIME type and file extension handling
 */

/**
 * Get MIME type from output format
 * @param {string} format - Output format (webp, png, jpeg)
 * @returns {string} MIME type
 */
export function getMimeType(format) {
  const mimeTypes = {
    'webp': 'image/webp',
    'png': 'image/png',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg'
  };
  
  return mimeTypes[format?.toLowerCase()] || 'image/webp';
}

/**
 * Get file extension from content-type header
 * @param {string} contentType - Content-Type header value
 * @returns {string} File extension
 */
export function getFileExtension(contentType) {
  const extensions = {
    'image/webp': '.webp',
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'application/octet-stream': '.bin'
  };
  
  // Extract main content type (ignore charset, etc.)
  const mainType = contentType?.split(';')[0]?.toLowerCase();
  return extensions[mainType] || '.bin';
}

/**
 * Download image from URL and return buffer
 * @param {string} imageUrl - URL of the image to download
 * @returns {Promise<{buffer: Buffer, contentType: string}>} Image data and content type
 */
export async function downloadImage(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    return { buffer, contentType };
  } catch (error) {
    throw new Error(`Image download failed: ${error.message}`);
  }
}

/**
 * Validate and set default values for API parameters
 * @param {Object} params - Input parameters
 * @returns {Object} Validated parameters with defaults
 */
export function validateParams(params) {
  const { prompt, aspect_ratio, output_format, strength } = params;
  
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw new Error('Prompt is required and must be a non-empty string');
  }
  
  const validatedParams = {
    prompt: prompt.trim(),
    aspect_ratio: aspect_ratio || '1:1',
    output_format: output_format || 'webp'
  };
  
  // Add strength parameter if provided (for enhance-image)
  if (strength !== undefined) {
    const strengthNum = parseFloat(strength);
    if (isNaN(strengthNum) || strengthNum < 0 || strengthNum > 1) {
      throw new Error('Strength must be a number between 0 and 1');
    }
    validatedParams.strength = strengthNum;
  }
  
  // Validate aspect ratio format
  if (!/^\d+:\d+$/.test(validatedParams.aspect_ratio)) {
    throw new Error('Aspect ratio must be in format "width:height" (e.g., "16:9")');
  }
  
  // Validate output format
  const validFormats = ['webp', 'png', 'jpeg'];
  if (!validFormats.includes(validatedParams.output_format.toLowerCase())) {
    throw new Error(`Output format must be one of: ${validFormats.join(', ')}`);
  }
  
  return validatedParams;
}