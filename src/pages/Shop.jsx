import React, { useState, useEffect, useRef } from 'react';
import Card from "../components/Card.jsx";
import mockProducts from '../mockData/products';

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
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    categories: [],
    companies: []
  });
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    priceRange: false,
    categories: false,
    companies: false
  });

  const mainScrollRef = useRef(null);

  const allCategories = [...new Set(mockProducts.map(p => p.category))];
  const allCompanies = [...new Set(mockProducts.map(p => p.company))];
  const priceMax = Math.max(...mockProducts.map(p => p.price));

  const loadMoreProducts = () => {
    if (loading) return;

    setLoading(true);
    setTimeout(() => {
      const newProducts = mockProducts.map(p => ({
        ...p,
        id: p.id + page * mockProducts.length
      }));

      setProducts(prev => [...prev, ...newProducts]);
      setPage(prev => prev + 1);
      setLoading(false);
    }, 800);
  };

  const filterProducts = () => {
    let filtered = [...mockProducts];

    filtered = filtered.filter(p =>
      p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    if (filters.categories.length > 0) {
      filtered = filtered.filter(p => filters.categories.includes(p.category));
    }

    if (filters.companies.length > 0) {
      filtered = filtered.filter(p => filters.companies.includes(p.company));
    }

    return filtered;
  };

  const handleScroll = () => {
    if (mainScrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = mainScrollRef.current;

      if (scrollTop + clientHeight >= scrollHeight - 100 && !loading) {
        loadMoreProducts();
      }
    }
  };

  useEffect(() => {
    setProducts(mockProducts);
  }, []);

  useEffect(() => {
    const scrollContainer = mainScrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [loading]);

  const handleFilterChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
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
    </>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <style>{scrollbarHideStyles}</style>
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

      <div className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity duration-300 ${isMobileFilterOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={toggleMobileFilter}></div>

      <div className={`fixed top-0 left-0 h-full w-64 max-w-xs bg-white z-30 transform transition-transform duration-300 ease-in-out overflow-y-auto scrollbar-hide md:hidden ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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

      <div
        className="flex-1 flex md:flex-row overflow-y-auto scrollbar-hide"
        ref={mainScrollRef}
      >
        <div className="hidden md:block w-58 flex-shrink-0 p-4 bg-gray-50 border-r border-gray-200 shadow-sm">
          <FiltersContent />
        </div>

        <div className="flex-1 p-4 md:p-6 bg-base-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
            {filterProducts().map((product) => (
              <Card key={product.id} product={product} />
            ))}
          </div>

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