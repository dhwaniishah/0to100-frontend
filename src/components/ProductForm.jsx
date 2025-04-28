import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, AlertCircle } from 'lucide-react';
import ImageUpload from './ImageUpload';

const API_URL = import.meta.env.API_URL;

/**
 * Product form with Cloudinary image upload integration
 *
 * @param {Object} props
 * @param {Function} props.onSubmitSuccess - Callback on successful form submission
 * @param {Object} [props.initialData] - Optional initial product data for editing
 */
const ProductForm = ({ onSubmitSuccess, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    company: '',
    imageUrl: null
  });
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [imageUploadData, setImageUploadData] = useState(null);

  // Fetch companies for the dropdown
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(`${API_URL}/company`);
        if (response.data.data) {
          setCompanies(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching companies:', err);
      }
    };

    fetchCompanies();
  }, []);

  // Initialize form with data if editing an existing product
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price || '',
        category: initialData.category || '',
        company: initialData.company || '',
        imageUrl: initialData.imageUrl || null
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (cloudinaryData) => {
    // Store the full Cloudinary response
    setImageUploadData(cloudinaryData);

    // Update the form data with the image URL
    if (cloudinaryData) {
      setFormData(prev => ({
        ...prev,
        imageUrl: cloudinaryData.secure_url
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        imageUrl: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Prepare product data with Cloudinary image URL
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        company: formData.company || undefined,
        imageUrl: formData.imageUrl
      };

      // Get token for authenticated requests
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      let response;
      if (initialData && initialData._id) {
        // Update existing product
        response = await axios.put(
          `${API_URL}/product/${initialData._id}`,
          productData,
          { headers }
        );
      } else {
        // Create new product
        response = await axios.post(`${API_URL}/product`, productData, { headers });
      }

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      setSuccess(true);

      // Call the success callback with the response data
      if (onSubmitSuccess) {
        onSubmitSuccess(response.data.data);
      }

      // Reset form if creating a new product (not editing)
      if (!initialData) {
        setFormData({
          name: '',
          description: '',
          price: '',
          category: '',
          company: '',
          imageUrl: null
        });
        setImageUploadData(null);
      }

    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.message || 'Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-start">
          <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
          Product {initialData ? 'updated' : 'created'} successfully!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Product Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price (USD) *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            step="0.01"
            min="0.01"
            required
            value={formData.price}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category *
          </label>
          <input
            type="text"
            id="category"
            name="category"
            required
            value={formData.category}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
          />
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700">
            Company
          </label>
          <select
            id="company"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
          >
            <option value="">Select a company</option>
            {companies.map(company => (
              <option key={company._id} value={company._id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            rows="3"
            required
            value={formData.description}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
          ></textarea>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Image
          </label>
          <ImageUpload
            onImageUpload={handleImageUpload}
            initialImage={formData.imageUrl}
          />
          {imageUploadData && (
            <div className="mt-2 text-xs text-gray-500">
              <p>Image ID: {imageUploadData.public_id}</p>
              <p>Size: {Math.round(imageUploadData.bytes / 1024)} KB</p>
              <p>Format: {imageUploadData.format}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-gray-800 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center"
        >
          <Save size={16} className="mr-2" />
          {loading ? 'Saving...' : initialData ? 'Update Product' : 'Save Product'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;