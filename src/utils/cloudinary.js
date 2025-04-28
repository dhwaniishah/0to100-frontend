/**
 * Utility functions for handling Cloudinary image uploads
 */

import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
  CLOUDINARY_UPLOAD_URL,
  DEFAULT_TRANSFORMATIONS
} from '../config/cloudinary.js';

/**
 * Uploads an image file to Cloudinary
 * @param {File} file - The image file to upload
 * @param {Function} onProgress - Optional callback for upload progress (0-100)
 * @returns {Promise<Object>} - Resolves to the Cloudinary response containing the image URL
 */
export const uploadToCloudinary = async (file, onProgress = null) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    // Add required parameters for the upload
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    // Setup progress tracking if a callback was provided
    if (onProgress && typeof onProgress === 'function') {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          onProgress(percentComplete);
        }
      };
    }

    xhr.open('POST', CLOUDINARY_UPLOAD_URL, true);

    xhr.onload = function() {
      if (this.status >= 200 && this.status < 300) {
        const response = JSON.parse(this.responseText);
        resolve(response);
      } else {
        reject(new Error(`Cloudinary upload failed with status: ${this.status}`));
      }
    };

    xhr.onerror = function() {
      reject(new Error('Cloudinary upload failed due to a network error'));
    };

    xhr.send(formData);
  });
};

/**
 * Formats the Cloudinary image URL with transformation parameters
 * @param {string} publicId - The Cloudinary public ID of the image
 * @param {Object} options - Transformation options
 * @returns {string} - The formatted Cloudinary URL
 */
export const getCloudinaryUrl = (publicId, options = {}) => {
  const {
    width = null,
    height = null,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
  } = options;

  let transformations = 'f_' + format + ',q_' + quality;

  if (width) transformations += ',w_' + width;
  if (height) transformations += ',h_' + height;
  if (crop) transformations += ',c_' + crop;

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformations}/${publicId}`;
};

/**
 * Extracts the public ID from a Cloudinary URL
 * @param {string} url - The Cloudinary URL
 * @returns {string|null} - The public ID or null if not a valid Cloudinary URL
 */
export const getPublicIdFromUrl = (url) => {
  if (!url || typeof url !== 'string') return null;

  const regex = new RegExp(`https://res\\.cloudinary\\.com/${CLOUDINARY_CLOUD_NAME}/image/upload/.*?/(.+)`);
  const match = url.match(regex);

  return match ? match[1] : null;
};