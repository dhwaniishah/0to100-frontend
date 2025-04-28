import React, { useState, useEffect, useRef } from 'react';
import Card from "../components/Card.jsx";
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

console.log(API_URL);

const scrollbarHideStyles = `
  /* Hide scrollbar for Chrome, Safari and Opera */
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  /* Hide scrollbar for IE, Edge and Firefox */
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  
  /* Hide arrows in number inputs */
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  /* For Firefox */
  input[type=number] {
    -moz-appearance: textfield;
  }
`;

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    categories: [],
    companies: []
  });
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [setCollapsedSections] = useState({
    priceRange: false,
    categories: false,
    companies: false
  });

  // For category and company filtering
  const [allCategories, setAllCategories] = useState([]);
  const [allCompanies, setAllCompanies] = useState([]);
  const [priceMax, setPriceMax] = useState(1000);
  const [companySearchTerm, setCompanySearchTerm] = useState('');

  const mainScrollRef = useRef(null);

  // Fetch all products from the backend
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${API_URL}/product`);

        if (response.data.error) {
          throw new Error(response.data.error);
        }

        if (response.data.data) {
          const fetchedProducts = response.data.data;
          setProducts(fetchedProducts);

          // Extract unique categories and companies
          const categories = [...new Set(fetchedProducts.map(p => p.category))];
          const companies = [...new Set(fetchedProducts.map(p => p.company?.name || p.company).filter(Boolean))];

          setAllCategories(categories);
          setAllCompanies(companies);

          // Set maximum price
          const maxPrice = Math.max(...fetchedProducts.map(p => p.price), 1000);
          setPriceMax(maxPrice);
          setFilters(prev => ({
            ...prev,
            priceRange: [0, maxPrice]
          }));
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(error.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on selected filters
  const filterProducts = () => {
    if (!products.length) return [];

    let filtered = [...products];

    // Apply price filter
    filtered = filtered.filter(p =>
      p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // Apply category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(p => filters.categories.includes(p.category));
    }

    // Apply company filter
    if (filters.companies.length > 0) {
      filtered = filtered.filter(p =>
          p.company && (
            filters.companies.includes(p.company.name) ||
            filters.companies.includes(p.company)
          )
      );
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(search) ||
        (p.description && p.description.toLowerCase().includes(search))
      );
    }

    return filtered;
  };

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

  const handlePriceChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setFilters(prev => ({
      ...prev,
      priceRange: [prev.priceRange[0], value]
    }));
  };

  const handleMinPriceChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setFilters(prev => ({
      ...prev,
      priceRange: [value, prev.priceRange[1]]
    }));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCompanySearch = (e) => {
    setCompanySearchTerm(e.target.value);
  };

  const toggleMobileFilter = () => {
    setIsMobileFilterOpen(!isMobileFilterOpen);
  };

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const FiltersContent = () => (
    <>
      <h2 className="text-xl font-semibold mb-5 text-gray-800">Filters</h2>

      <div className="mb-8">
        <h3 className="font-medium text-base mb-3 text-gray-700">Price Range</h3>
        <div className="flex flex-col">
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

      {allCategories.length > 0 && (
        <div className="mb-8">
          <h3 className="font-medium text-base mb-3 text-gray-700">Categories</h3>
          <div className="flex flex-col space-y-2 max-h-32 overflow-y-auto scrollbar-hide pr-2">
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
      )}

      {allCompanies.length > 0 && (
        <div className="mb-8">
          <h3 className="font-medium text-base mb-3 text-gray-700">Companies</h3>
          <input
            type="text"
            placeholder="Search companies..."
            className="input input-sm w-full bg-white border-gray-300 mb-3"
            value={companySearchTerm}
            onChange={handleCompanySearch}
          />
          <div className="flex flex-col space-y-2 max-h-32 overflow-y-auto scrollbar-hide pr-2">
            {allCompanies
              .filter(company =>
                company.toLowerCase().includes(companySearchTerm.toLowerCase())
              )
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
      )}

      <button
        onClick={() => {
          setFilters({
            priceRange: [0, priceMax],
            categories: [],
            companies: []
          });
          setSearchTerm('');
          setCompanySearchTerm('');
        }}
        className="btn btn-block bg-gray-700 hover:bg-gray-800 text-white border-none"
      >
        Clear All Filters
      </button>
    </>
  );

  const filteredProducts = filterProducts();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <style>{scrollbarHideStyles}</style>

      {/* Mobile filter button */}
      <div className="md:hidden sticky top-0 z-10 bg-white p-4 border-b shadow-sm">
        <button
          onClick={toggleMobileFilter}
          className="btn btn-sm bg-gray-700 hover:bg-gray-800 text-white border-none w-full flex items-center justify-center"
        >
          <span>{isMobileFilterOpen ? 'Hide Filters' : 'Show Filters'}</span>
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M3 12h18M3 20h18" />
          </svg>
        </button>
      </div>

      {/* Mobile filter overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity duration-300 ${
          isMobileFilterOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleMobileFilter}
      ></div>

      {/* Mobile filter sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 max-w-xs bg-white z-30 transform transition-transform duration-300 ease-in-out overflow-y-auto scrollbar-hide md:hidden ${
          isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
            <button onClick={toggleMobileFilter} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <FiltersContent />
        </div>
      </div>

      {/* Main content */}
      <div
        className="flex-1 flex md:flex-row overflow-y-auto scrollbar-hide"
        ref={mainScrollRef}
      >
        {/* Desktop filter sidebar */}
        <div className="hidden md:block w-58 flex-shrink-0 p-4 bg-gray-50 border-r border-gray-200 shadow-sm">
          <FiltersContent />
        </div>

        {/* Product grid */}
        <div className="flex-1 p-4 md:p-6 bg-base-200">
          {/* Search bar for desktop */}
          <div className="mb-6 max-w-lg mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-10 pr-4 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-300 transition duration-150"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <span className="loading loading-spinner loading-lg text-gray-600 mb-4"></span>
              <p className="text-gray-500">Loading products...</p>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mx-auto max-w-lg">
              <p className="font-medium">Error loading products</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCompanySearchTerm('');
                  setFilters({
                    priceRange: [0, priceMax],
                    categories: [],
                    companies: []
                  });
                }}
                className="btn btn-outline btn-sm rounded-md bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Product grid */}
          {!loading && !error && filteredProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <Card key={product._id} product={{
                  id: product._id,
                  title: product.name,
                  description: product.description,
                  price: product.price,
                  // Use the imageUrl from Cloudinary if available, otherwise use a placeholder
                  imageUrl: product.imageUrl,
                  image: product.imageUrl || '/api/placeholder/400/400',
                  category: product.category,
                  company: product.company
                }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;