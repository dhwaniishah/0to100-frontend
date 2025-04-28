import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Check } from 'lucide-react';
import { uploadToCloudinary } from '../utils/cloudinary';

/**
 * Image upload component with Cloudinary integration
 *
 * @param {Object} props
 * @param {Function} props.onImageUpload - Callback when image is successfully uploaded (receives Cloudinary response)
 * @param {string} [props.initialImage] - Optional initial image URL
 * @param {string} [props.className] - Optional additional CSS classes
 * @param {Object} [props.buttonProps] - Optional props for the upload button
 */
const ImageUpload = ({ onImageUpload, initialImage = null, className = '', buttonProps = {} }) => {
  const [image, setImage] = useState(initialImage);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Basic validation
    if (!file.type.match('image.*')) {
      setError('Please select an image file (jpg, png, etc)');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // Create a temporary local preview
      const localPreview = URL.createObjectURL(file);
      setImage(localPreview);

      // Upload to Cloudinary
      const result = await uploadToCloudinary(file, (progress) => {
        setUploadProgress(progress);
      });

      // Update with the real Cloudinary URL
      setImage(result.secure_url);

      // Call the callback with the Cloudinary response
      if (onImageUpload) {
        onImageUpload(result);
      }

    } catch (err) {
      console.error('Upload failed:', err);
      setError('Failed to upload image. Please try again.');
      setImage(initialImage); // Revert to initial image
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const removeImage = () => {
    setImage(null);
    // Notify parent component
    if (onImageUpload) {
      onImageUpload(null);
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        ref={fileInputRef}
        className="hidden"
      />

      {image ? (
        // Image preview
        <div className="relative w-full mb-4">
          <img
            src={image}
            alt="Uploaded preview"
            className="w-full h-48 object-cover rounded-md border border-gray-300"
          />

          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
          >
            <X size={16} />
          </button>

          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center rounded-md">
              <div className="text-white mb-2">Uploading... {uploadProgress}%</div>
              <div className="w-3/4 bg-gray-300 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Upload button when no image is selected
        <button
          type="button"
          onClick={triggerFileInput}
          disabled={isUploading}
          className="w-full h-48 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center p-4 hover:border-gray-400 transition-colors mb-4"
          {...buttonProps}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Upload className="h-10 w-10 text-gray-400 mb-2 animate-pulse" />
              <p className="text-sm text-gray-500">Uploading... {uploadProgress}%</p>
              <div className="w-3/4 bg-gray-200 rounded-full h-2.5 mt-2">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">
                Click to upload an image
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPG, PNG, GIF up to 10MB
              </p>
            </div>
          )}
        </button>
      )}

      {error && (
        <div className="text-red-500 text-sm mb-2">{error}</div>
      )}

      {image && !isUploading && (
        <div className="flex items-center text-sm text-green-600">
          <Check size={16} className="mr-1" />
          Image uploaded successfully
        </div>
      )}
    </div>
  );
};

export default ImageUpload;