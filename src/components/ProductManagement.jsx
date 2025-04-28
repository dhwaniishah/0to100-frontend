import React, { useState, useEffect } from 'react';
import {
  Pencil,
  Trash2,
  PlusCircle,
  RefreshCw,
  AlertCircle,
  Package,
  X,
  Database
} from 'lucide-react';
import axios from "axios";
import InventoryManagement from './InventoryManagement';
import ProductForm from "./ProductForm.jsx";

const API_URL = import.meta.env.API_URL;

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showInventory, setShowInventory] = useState(false);

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/product`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // Ensure data is an array and set products
      const productsData = response.data.data || [];
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error.response?.data?.error || error.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Fetch companies
  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/company`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      setCompanies(response.data.data || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    const initializeData = async () => {
      await fetchProducts();
      await fetchCompanies();
    };

    initializeData();
  }, []);

  // Handle edit product
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowAddForm(true);
  };

  // Handle delete product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await axios.delete(
        `${API_URL}/product/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // Remove product from list
      setProducts(prevProducts =>
        prevProducts.filter(p => p._id !== productId)
      );
    } catch (error) {
      console.error("Error deleting product:", error);
      alert(error.response?.data?.error || error.message || 'Failed to delete product');
    }
  };

  // Handle form submission success
  const handleFormSubmitSuccess = (updatedProduct) => {
    // Refresh the product list
    fetchProducts();

    // Close the form
    setShowAddForm(false);
    setEditingProduct(null);
  };

  // Handle inventory management
  const handleManageInventory = (product) => {
    setSelectedProduct(product);
    setShowInventory(true);
  };

  // If showing inventory management for a specific product
  if (showInventory && selectedProduct) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-800 text-white px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Inventory Management - {selectedProduct.name}</h2>
            <button
              onClick={() => {
                setShowInventory(false);
                setSelectedProduct(null);
              }}
              className="btn btn-sm btn-outline border-white text-white hover:bg-gray-700"
            >
              Back to Products
            </button>
          </div>
          <div className="p-6">
            <InventoryManagement product={selectedProduct} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-800 text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Product Management</h1>
        <div className="flex space-x-2">
          <button
            onClick={fetchProducts}
            className="btn btn-sm btn-outline border-white text-white hover:bg-gray-700"
            disabled={loading}
          >
            <RefreshCw size={16} className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowAddForm(!showAddForm);
            }}
            className="btn btn-sm bg-green-600 hover:bg-green-700 text-white border-none"
          >
            <PlusCircle size={16} className="mr-1" />
            Add Product
          </button>
        </div>
      </div>

      {/* Add/Edit Product Form */}
      {showAddForm && (
        <div className="border-b border-gray-200 p-6 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingProduct(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <ProductForm
            initialData={editingProduct}
            onSubmitSuccess={handleFormSubmitSuccess}
            onCancel={() => {
              setShowAddForm(false);
              setEditingProduct(null);
            }}
          />
        </div>
      )}

      {/* Products Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center">
              <RefreshCw size={32} className="text-gray-400 animate-spin mb-4" />
              <p className="text-gray-500">Loading products...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle size={32} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load products</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={fetchProducts}
              className="btn btn-sm btn-outline border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-20 w-20 mx-auto text-gray-400 mb-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <Package size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first product</p>
            <button
              onClick={() => {
                setEditingProduct(null);
                setShowAddForm(true);
              }}
              className="btn btn-sm bg-gray-800 text-white hover:bg-gray-700"
            >
              Add Product
            </button>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/api/placeholder/80/80';
                          }}
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-300 flex items-center justify-center text-gray-500 text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {product.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{product.category}</div>
                  {product.company && (
                    <div className="text-sm text-gray-500">
                      {companies.find(c => c._id === product.company)?.name || product.company}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">${product.price.toFixed(2)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleManageInventory(product)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Manage Inventory"
                    >
                      <Database size={16} />
                    </button>
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Edit Product"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Product"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;