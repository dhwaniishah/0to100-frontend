import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Heart, ShoppingCart, Share2, Star, AlertCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router';
import axios from 'axios';
import { useCart } from '../context/CartContext';

const API_URL = import.meta.env.VITE_API_URL;

const ProductPage = () => {
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch product from the backend API
        const response = await axios.get(`${API_URL}/product/${id}`);

        if (response.data.error) {
          throw new Error(response.data.error);
        }

        if (response.data.data) {
          const productData = response.data.data;

          // Build images array using the imageUrl if available, otherwise use placeholder
          const images = productData.imageUrl
            ? [productData.imageUrl]
            : ['/api/placeholder/800/500'];

          // Enhance the product data with additional details
          setProduct({
            ...productData,
            images,
            rating: 4.7,
            reviews: 124,
            features: [
              "High-quality materials",
              "Compatible with most vehicle models",
              "Easy installation",
              "Backed by manufacturer warranty"
            ],
            specifications: [
              { name: "Material", value: "Premium Alloy" },
              { name: "Weight", value: "8.5 kg" },
              { name: "Dimensions", value: "19 inch" },
              { name: "Warranty", value: "2 Years" }
            ]
          });
        } else {
          throw new Error('Product not found');
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setError(error.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const defaultProduct = {
    id: 0,
    name: "Product Title",
    description: "Product description not available",
    price: 0,
    imageUrl: null,
    category: "Category",
    company: null,
    rating: 0,
    reviews: 0,
    features: [],
    specifications: [],
    images: ["/api/placeholder/800/500"]
  };

  const productData = product || defaultProduct;

  const nextImage = () => {
    if (productData.images && productData.images.length > 1) {
      setSelectedImage((prev) => (prev + 1) % productData.images.length);
    }
  };

  const prevImage = () => {
    if (productData.images && productData.images.length > 1) {
      setSelectedImage((prev) => (prev - 1 + productData.images.length) % productData.images.length);
    }
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const showMessage = (message, isError = false) => {
    setActionMessage({
      text: message,
      isError
    });

    // Clear message after 3 seconds
    setTimeout(() => {
      setActionMessage(null);
    }, 3000);
  };

  const handleAddToCart = async () => {
    if (!product || !product._id) {
      showMessage('Product not found', true);
      return;
    }

    setAddingToCart(true);

    try {
      const result = await addToCart(product._id, quantity);

      if (result.success) {
        showMessage(`${quantity} item(s) added to cart`);
      } else {
        showMessage(result.message || 'Failed to add to cart', true);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showMessage('Error adding to cart', true);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      await handleAddToCart();
      navigate('/cart');
    } catch (error) {
      console.error('Error in buy now:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="loading loading-spinner loading-lg text-gray-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p>{error}</p>
        </div>
        <button
          onClick={() => navigate('/shop')}
          className="px-4 py-2 bg-gray-800 text-white rounded-md"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {actionMessage && (
          <div className={`p-4 ${actionMessage.isError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'} flex items-center justify-center`}>
            {actionMessage.isError ? (
              <AlertCircle className="mr-2 h-5 w-5" />
            ) : (
              <ShoppingCart className="mr-2 h-5 w-5" />
            )}
            <span>{actionMessage.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images Section */}
          <div className="p-6">
            <div className="relative rounded-lg overflow-hidden bg-gray-100 mb-4">
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md z-10"
              >
                <ChevronLeft className="h-6 w-6 text-gray-700" />
              </button>

              <img
                src={productData.images[selectedImage]}
                alt={`${productData.name || productData.title} - View ${selectedImage + 1}`}
                className="w-full aspect-square object-cover"
              />

              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md z-10"
              >
                <ChevronRight className="h-6 w-6 text-gray-700" />
              </button>
            </div>

            {productData.images && productData.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {productData.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded border-2 flex-shrink-0 ${selectedImage === idx ? 'border-black' : 'border-gray-200'}`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <span>{productData.category}</span>
              {productData.company && (
                <>
                  <span>•</span>
                  <span>{productData.company}</span>
                </>
              )}
            </div>

            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{productData.name || productData.title}</h1>

              {productData.rating > 0 && (
                <div className="flex items-center mb-4">
                  <div className="flex items-center mr-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(productData.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">{productData.rating} ({productData.reviews} reviews)</span>
                  </div>
                </div>
              )}

              <p className="text-4xl font-bold text-gray-900 mb-6">${(productData.price || 0).toFixed(2)}</p>

              <p className="text-gray-600 mb-6">{productData.description}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Quantity</h3>
              <div className="flex w-36 h-12 border border-gray-300 rounded-md">
                <button
                  className="w-12 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <div className="flex-1 flex items-center justify-center border-l border-r border-gray-300">
                  {quantity}
                </div>
                <button
                  className="w-12 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100"
                  onClick={increaseQuantity}
                >
                  +
                </button>
              </div>
              {productData.category === "Wheels" && (
                <p className="text-sm text-gray-500 mt-2">Set of {quantity} wheels</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="btn w-full sm:w-48 bg-gray-900 hover:bg-black text-white border-none rounded-md shadow-sm transition-all duration-200 flex items-center justify-center px-4 py-2 h-10"
              >
                {addingToCart ? (
                  <span className="loading loading-spinner loading-xs mr-2"></span>
                ) : (
                  <ShoppingCart className="w-4 h-4 mr-2" />
                )}
                <span className="font-medium text-sm">
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </span>
              </button>
              <button
                onClick={handleBuyNow}
                disabled={addingToCart}
                className="btn w-full sm:w-48 bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 rounded-md shadow-sm transition-all duration-200 flex items-center justify-center px-4 py-2 h-10"
              >
                <span className="font-medium text-sm">Buy Now</span>
              </button>
            </div>

            <div className="flex justify-center gap-3 mb-6">
              <button className="btn btn-circle btn-sm btn-ghost text-gray-500 hover:bg-gray-100 p-2">
                <Heart className="w-4 h-4" />
              </button>
              <button className="btn btn-circle btn-sm btn-ghost text-gray-500 hover:bg-gray-100 p-2">
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {productData.features && productData.features.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Key Features</h3>
                <ul className="space-y-2 list-disc pl-5">
                  {productData.features.map((feature, idx) => (
                    <li key={idx} className="text-gray-600">
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {productData.specifications && productData.specifications.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Specifications</h3>
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="bg-white divide-y divide-gray-200">
                    {productData.specifications.map((spec, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-6 py-3 text-sm font-medium text-gray-500">{spec.name}</td>
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{spec.value}</td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;