import { ShoppingCart, Check } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router";
import { useCart } from "../context/CartContext";

const Card = ({ product }) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    setIsAdding(true);

    try {
      const result = await addToCart(product.id, 1);

      if (result.success) {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000); // Reset after 2 seconds
      } else {
        // Could show a toast message here
        console.error("Failed to add to cart:", result.message);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Link to={`/product/${product.id}`} className="block hover:shadow-md transition-shadow duration-300">
      <div className="card bg-base-100 shadow-sm h-full">
        <figure className="h-64 w-full overflow-hidden">
          <img
            src={product.imageUrl || product.image || '/api/placeholder/400/400'}
            alt={product.title || product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </figure>

        <div className="card-body p-4">
          <h3 className="card-title text-base">{product.title || product.name}</h3>
          <p className="text-sm text-base-content/70 line-clamp-2">{product.description}</p>
          <div className="flex justify-between items-center mt-2">
            <span className="font-medium text-lg">${product.price.toFixed(2)}</span>
            <button
              className={`btn btn-circle btn-sm ${isAdding || added ? 'bg-gray-800 text-white' : 'btn-ghost'}`}
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              {isAdding ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : added ? (
                <Check size={18} />
              ) : (
                <ShoppingCart size={18} />
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Card;