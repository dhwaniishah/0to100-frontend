/**
 * Cloudinary configuration settings
 *
 * Instructions:
 * 1. Create a Cloudinary account at https://cloudinary.com (they have a free tier)
 * 2. Get your cloud name from your dashboard
 * 3. Create an upload preset:
 *    - Go to Settings > Upload > Upload presets
 *    - Click "Add upload preset"
 *    - Set the signing mode to "Unsigned"
 *    - Configure any upload options you want (resize, eager transformations, etc.)
 *    - Save your preset and use the preset name below
 */

// Your Cloudinary account cloud name
export const CLOUDINARY_CLOUD_NAME = 'dmqn4aaos';

// Your unsigned upload preset name
export const CLOUDINARY_UPLOAD_PRESET = 'cloudinary';

// Base URL for Cloudinary uploads
export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// Default image transformation options
export const DEFAULT_TRANSFORMATIONS = {
  quality: 'auto',
  format: 'auto',
  secure: true
};