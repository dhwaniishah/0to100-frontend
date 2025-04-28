import { useState } from 'react';
import { uploadToCloudinary } from '../utils/cloudinary';

/**
 * Custom hook for managing Cloudinary image uploads
 *
 * @returns {Object} Upload state and handlers
 */
const useCloudinaryUpload = (initialImage = null) => {
  const [image, setImage] = useState(initialImage);
  const [uploadData, setUploadData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  /**
   * Upload an image file to Cloudinary
   *
   * @param {File} file - The image file to upload
   * @returns {Promise<Object|null>} - The Cloudinary response or null on error
   */
  const uploadImage = async (file) => {
    if (!file) return null;

    if (!file.type.match('image.*')) {
      setError('Please select an image file (jpg, png, etc)');
      return null;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Create a temporary local preview
      const localPreview = URL.createObjectURL(file);
      setImage(localPreview);

      // Upload to Cloudinary
      const result = await uploadToCloudinary(file, (progressValue) => {
        setProgress(progressValue);
      });

      // Update with the real Cloudinary URL
      setImage(result.secure_url);
      setUploadData(result);

      return result;
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Failed to upload image. Please try again.');
      setImage(initialImage);
      return null;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  /**
   * Clear the current image and upload data
   */
  const clearImage = () => {
    setImage(null);
    setUploadData(null);
  };

  /**
   * Reset any error state
   */
  const resetError = () => {
    setError(null);
  };

  return {
    image,
    uploadData,
    isUploading,
    progress,
    error,
    uploadImage,
    clearImage,
    resetError
  };
};

export default useCloudinaryUpload;