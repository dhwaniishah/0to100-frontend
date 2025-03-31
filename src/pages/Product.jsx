import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Heart, ShoppingCart, Share2, Star } from 'lucide-react';
import { useParams, useNavigate } from 'react-router';

const ProductPage = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(4);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);

      try {
        await new Promise(resolve => setTimeout(resolve, 500));

        const mockProducts = await import('../mockData/products').then(
          module => module.default || module
        ).catch(() => {
          return [defaultProduct];
        });

        const foundProduct = mockProducts.find(p => p.id === parseInt(id));

        if (foundProduct) {
          setProduct({
            ...foundProduct,
            images: [foundProduct.image], // In a real app, we'd have multiple images
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
          navigate('/shop');
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const defaultProduct = {
    id: 0,
    title: "Product Title",
    description: "Product description not available",
    price: 0,
    image: "/api/placeholder/800/500",
    category: "Category",
    company: "Company",
    rating: 0,
    reviews: 0,
    features: [],
    specifications: [],
    images: ["/api/placeholder/800/500"]
  };

  const productData = product || defaultProduct;

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % productData.images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + productData.images.length) % productData.images.length);
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="loading loading-spinner loading-lg text-gray-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
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
                src={productData.images[selectedImage] || productData.image}
                alt={`${productData.title} - View ${selectedImage + 1}`}
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{productData.title}</h1>

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
              <button className="btn w-full sm:w-48 bg-gray-900 hover:bg-black text-white border-none rounded-md shadow-sm transition-all duration-200 flex items-center justify-center px-4 py-2 h-10">
                <ShoppingCart className="w-4 h-4 mr-2" />
                <span className="font-medium text-sm">Add to Cart</span>
              </button>
              <button className="btn w-full sm:w-48 bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 rounded-md shadow-sm transition-all duration-200 flex items-center justify-center px-4 py-2 h-10">
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