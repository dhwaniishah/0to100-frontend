import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Package,
  RefreshCw,
  AlertCircle,
  Save,
  Plus,
  Minus,
  Search
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

// Helper function to determine stock status
const getStockStatus = (stock) => {
  if (stock <= 0) return {
    text: 'Out of Stock',
    color: 'text-red-500',
    bgColor: 'bg-red-100'
  };
  if (stock < 5) return {
    text: 'Low Stock',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100'
  };
  if (stock < 20) return {
    text: 'Limited Stock',
    color: 'text-orange-500',
    bgColor: 'bg-orange-100'
  };
  return {
    text: 'In Stock',
    color: 'text-green-500',
    bgColor: 'bg-green-100'
  };
};

const InventoryManagement = ({ product = null }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockEdits, setStockEdits] = useState({});
  const [updateMessage, setUpdateMessage] = useState({ type: null, text: null });

  // Fetch products with their inventory
  const fetchInventory = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      if (product) {
        // If a specific product is provided, just get inventory for that product
        try {
          const inventoryResponse = await axios.get(`${API_URL}/inventory/${product._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          // Create a list with just this one product
          setProducts([{
            ...product,
            inventory: inventoryResponse.data.data || { stock: 0 }
          }]);
        } catch (error) {
          console.warn(`Could not fetch inventory for product ${product._id}`, error);
          setProducts([{
            ...product,
            inventory: { stock: 0 }
          }]);
        }
      } else {
        // Fetch all products
        const productsResponse = await axios.get(`${API_URL}/product`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Fetch inventory for each product
        const productsWithInventory = await Promise.all(
          (productsResponse.data.data || []).map(async (product) => {
            try {
              const inventoryResponse = await axios.get(`${API_URL}/inventory/${product._id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });

              return {
                ...product,
                inventory: inventoryResponse.data.data || { stock: 0 }
              };
            } catch (inventoryError) {
              console.warn(`Could not fetch inventory for product ${product._id}`, inventoryError);
              return {
                ...product,
                inventory: { stock: 0 }
              };
            }
          })
        );

        setProducts(productsWithInventory);
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      setError(error.response?.data?.error || error.message || 'Failed to load inventory');

      // Fallback for demo purposes
      if (product) {
        setProducts([{
          ...product,
          inventory: { stock: 0 }
        }]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Update inventory for a product
  const updateInventory = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const newStock = stockEdits[productId];

      const response = await axios.put(
        `${API_URL}/inventory/${productId}`,
        { stock: newStock },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // Update local state
      setProducts(prevProducts =>
        prevProducts.map(p =>
          p._id === productId
            ? { ...p, inventory: { ...p.inventory, stock: newStock } }
            : p
        )
      );

      // Clear edit for this product
      setStockEdits(prev => {
        const newEdits = { ...prev };
        delete newEdits[productId];
        return newEdits;
      });

      // Show success message
      setUpdateMessage({
        type: 'success',
        text: 'Inventory updated successfully!'
      });

      // Clear message after delay
      setTimeout(() => {
        setUpdateMessage({ type: null, text: null });
      }, 3000);
    } catch (error) {
      console.error(`Error updating inventory for product ${productId}:`, error);
      setUpdateMessage({
        type: 'error',
        text: error.response?.data?.error || error.message || 'Failed to update inventory'
      });
    }
  };

  // Handle stock edit input
  const handleStockEdit = (productId, value) => {
    const intValue = parseInt(value);
    if (!isNaN(intValue) && intValue >= 0) {
      setStockEdits(prev => ({
        ...prev,
        [productId]: intValue
      }));
    }
  };

  // Adjust stock increment/decrement
  const adjustStock = (productId, adjustment) => {
    const product = products.find(p => p._id === productId);
    if (!product) return;

    const currentStock = stockEdits[productId] !== undefined
      ? stockEdits[productId]
      : (product.inventory?.stock || 0);

    const newStock = Math.max(0, currentStock + adjustment);

    setStockEdits(prev => ({
      ...prev,
      [productId]: newStock
    }));
  };

  // Initial fetch
  useEffect(() => {
    fetchInventory();
  }, [product]);

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header - Only show if not specific product */}
      {!product && (
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Inventory Management</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchInventory}
              className="btn btn-sm btn-ghost"
              disabled={loading}
            >
              <RefreshCw
                size={16}
                className={`mr-2 ${loading ? 'animate-spin' : ''}`}
              />
              Refresh
            </button>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {updateMessage.type && (
        <div className={`m-4 p-3 rounded-md ${
          updateMessage.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {updateMessage.text}
        </div>
      )}

      {/* Search Bar */}
      {!product && (
        <div className="p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
          <div className="flex items-start">
            <AlertCircle className="text-red-500 mr-2 flex-shrink-0" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <RefreshCw size={32} className="animate-spin text-gray-500" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center p-6 text-gray-500">
            <Package size={32} className="mx-auto mb-4" />
            <p>No products found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase">Current Stock</th>
              <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
            </thead>
            <tbody>
            {filteredProducts.map((product) => {
              const currentStock = stockEdits[product._id] !== undefined
                ? stockEdits[product._id]
                : (product.inventory?.stock || 0);
              const stockStatus = getStockStatus(currentStock);

              return (
                <tr key={product._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div className="flex items-center">
                      <Package size={20} className="mr-3 text-gray-400" />
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => adjustStock(product._id, -1)}
                        className="btn btn-xs btn-ghost"
                        disabled={currentStock <= 0}
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        type="number"
                        value={currentStock}
                        onChange={(e) => handleStockEdit(product._id, e.target.value)}
                        className="w-16 text-center mx-2 border rounded"
                        min="0"
                      />
                      <button
                        onClick={() => adjustStock(product._id, 1)}
                        className="btn btn-xs btn-ghost"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bgColor} ${stockStatus.color}`}
                      >
                        {stockStatus.text}
                      </span>
                  </td>
                  <td className="p-3 text-center">
                    {stockEdits[product._id] !== undefined && (
                      <button
                        onClick={() => updateInventory(product._id)}
                        className="btn btn-sm bg-gray-800 text-white hover:bg-gray-700"
                      >
                        <Save size={16} className="mr-2" />
                        Save
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default InventoryManagement;