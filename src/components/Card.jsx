import {ShoppingCart} from "lucide-react";
import React from "react";
import { Link } from "react-router";

const Card = ({product}) => {
  return (
    <Link to={`/product/${product.id}`} className="block hover:shadow-md transition-shadow duration-300">
      <div className="card bg-base-100 shadow-sm h-full">
        <figure className="h-64 w-full overflow-hidden">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </figure>

        <div className="card-body p-4">
          <h3 className="card-title text-base">{product.title}</h3>
          <p className="text-sm text-base-content/70">{product.description}</p>
          <div className="flex justify-between items-center mt-2">
            <span className="font-medium text-lg">${product.price.toFixed(2)}</span>
            <button
              className="btn btn-circle btn-sm btn-ghost"
              onClick={(e) => {
                e.preventDefault();
                // Add to cart functionality here
                console.log("Add to cart:", product.id);
              }}
            >
              <ShoppingCart size={18}/>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default Card;