import React, {useState, useEffect, useRef} from 'react';
import Card from "../components/Card.jsx";
import mockProducts from '../mockData/products';

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    categories: [],
    companies: []
  });

  const productListRef = useRef(null);

  // Available filters based on mock data
  const allCategories = [...new Set(mockProducts.map(p => p.category))];
  const allCompanies = [...new Set(mockProducts.map(p => p.company))];
  const priceMax = Math.max(...mockProducts.map(p => p.price));

  // Load more products when scrolling
  const loadMoreProducts = () => {
    if (loading) return;

    setLoading(true);
    // Simulate API call with setTimeout
    setTimeout(() => {
      // In a real app, you would fetch more products from API
      // For demo, we'll cycle through the same products with different IDs
      const newProducts = mockProducts.map(p => ({
        ...p,
        id: p.id + page * mockProducts.length
      }));

      setProducts(prev => [...prev, ...newProducts]);
      setPage(prev => prev + 1);
      setLoading(false);
    }, 800);
  };

  // Filter products based on selected filters
  const filterProducts = () => {
    let filtered = [...mockProducts];

    // Filter by price
    filtered = filtered.filter(p =>
      p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // Filter by categories
    if (filters.categories.length > 0) {
      filtered = filtered.filter(p => filters.categories.includes(p.category));
    }

    // Filter by companies
    if (filters.companies.length > 0) {
      filtered = filtered.filter(p => filters.companies.includes(p.company));
    }

    return filtered;
  };

  // Handle scroll event for infinite scroll
  const handleScroll = () => {
    if (productListRef.current) {
      const {scrollTop, scrollHeight, clientHeight} = productListRef.current;

      // Load more products when user scrolls to bottom
      if (scrollTop + clientHeight >= scrollHeight - 100 && !loading) {
        loadMoreProducts();
      }
    }
  };

  // Initialize products
  useEffect(() => {
    setProducts(mockProducts);
  }, []);

  // Handle filter changes
  const handleFilterChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
  };

  // Toggle category selection
  const toggleCategory = (category) => {
    setFilters(prev => {
      if (prev.categories.includes(category)) {
        return {
          ...prev,
          categories: prev.categories.filter(c => c !== category)
        };
      } else {
        return {
          ...prev,
          categories: [...prev.categories, category]
        };
      }
    });
  };

  // Toggle company selection
  const toggleCompany = (company) => {
    setFilters(prev => {
      if (prev.companies.includes(company)) {
        return {
          ...prev,
          companies: prev.companies.filter(c => c !== company)
        };
      } else {
        return {
          ...prev,
          companies: [...prev.companies, company]
        };
      }
    });
  };

  // Handle price range change
  const handlePriceChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setFilters(prev => ({
      ...prev,
      priceRange: [prev.priceRange[0], value]
    }));
  };

  // Handle min price change
  const handleMinPriceChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setFilters(prev => ({
      ...prev,
      priceRange: [value, prev.priceRange[1]]
    }));
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Filter sidebar - 15% width */}
      <div className="w-3/20 p-6 bg-white border-r border-gray-200 shadow-sm overflow-y-auto">
        <h2 className="text-xl font-semibold mb-5 text-gray-800">Filters</h2>

        {/* Price range filter */}
        <div className="mb-8">
          <h3 className="font-medium text-base mb-3 text-gray-700">Price Range</h3>
          <div className="flex flex-col">
            <span className="text-base text-gray-600 mb-2">
              ${filters.priceRange[0]} - ${filters.priceRange[1]}
            </span>
            <div className="flex items-center gap-3 mb-3">
              <input
                type="number"
                min="0"
                max={filters.priceRange[1]}
                value={filters.priceRange[0]}
                onChange={handleMinPriceChange}
                className="input input-sm w-20 bg-white border-gray-300"
              />
              <span className="text-gray-400">to</span>
              <input
                type="number"
                min={filters.priceRange[0]}
                max={priceMax}
                value={filters.priceRange[1]}
                onChange={handlePriceChange}
                className="input input-sm w-20 bg-white border-gray-300"
              />
            </div>
            <input
              type="range"
              min="0"
              max={priceMax}
              value={filters.priceRange[1]}
              onChange={handlePriceChange}
              className="range range-sm range-gray"
            />
          </div>
        </div>

        {/* Category filter */}
        <div className="mb-8">
          <h3 className="font-medium text-base mb-3 text-gray-700">Categories</h3>
          <div className="flex flex-col space-y-2 max-h-32 overflow-y-auto pr-2">
            {allCategories.map(category => (
              <label key={category} className="flex items-center text-base cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category)}
                  onChange={() => toggleCategory(category)}
                  className="checkbox checkbox-sm border-gray-400 mr-3"
                />
                <span className="text-gray-600">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Company filter */}
        <div className="mb-8">
          <h3 className="font-medium text-base mb-3 text-gray-700">Companies</h3>
          <input
            type="text"
            placeholder="Search companies..."
            className="input input-sm w-full bg-white border-gray-300 mb-3"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex flex-col space-y-2 max-h-32 overflow-y-auto pr-2">
            {allCompanies
              .filter(company => company.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(company => (
                <label key={company} className="flex items-center text-base cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.companies.includes(company)}
                    onChange={() => toggleCompany(company)}
                    className="checkbox checkbox-sm border-gray-400 mr-3"
                  />
                  <span className="text-gray-600">{company}</span>
                </label>
              ))}
          </div>
        </div>

        {/* Clear all filters button */}
        <button
          onClick={() => setFilters({
            priceRange: [0, priceMax],
            categories: [],
            companies: []
          })}
          className="btn btn-block bg-gray-700 hover:bg-gray-800 text-white border-none"
        >
          Clear All Filters
        </button>
      </div>

      {/* Products section - 85% width */}
      <div className="w-17/20 flex-1 flex flex-col">
        <div
          className="flex-1 p-6 overflow-y-auto bg-base-200"
          ref={productListRef}
          onScroll={handleScroll}
        >
          {/* Product grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filterProducts().map((product) => (
              <Card key={product.id} product={product} />
            ))}
          </div>

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-center items-center py-4">
              <span className="loading loading-spinner loading-md text-gray-600"></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;