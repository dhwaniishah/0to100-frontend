import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Pencil, Trash2, AlertCircle, RefreshCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const CompaniesSection = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch companies
  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);

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
      setError(error.response?.data?.error || error.message || 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) errors.name = 'Company name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.location.trim()) errors.location = 'Location is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');

      let response;

      if (editingCompany) {
        // Update existing company
        response = await axios.put(
          `${API_URL}/company/${editingCompany._id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      } else {
        // Create new company
        response = await axios.post(
          `${API_URL}/company`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // Reset form
      setFormData({
        name: '',
        description: '',
        location: ''
      });

      // Show success message
      setSuccessMessage(editingCompany ? 'Company updated successfully!' : 'Company added successfully!');

      // Refresh companies list
      fetchCompanies();

      // Close form after small delay
      setTimeout(() => {
        setShowAddForm(false);
        setEditingCompany(null);
        setSuccessMessage('');
      }, 2000);

    } catch (error) {
      console.error("Error saving company:", error);
      setError(error.response?.data?.error || error.message || 'Failed to save company');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle edit company
  const handleEditCompany = (company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      description: company.description,
      location: company.location
    });
    setShowAddForm(true);
  };

  // Handle delete company
  const handleDeleteCompany = async (companyId) => {
    if (!window.confirm('Are you sure you want to delete this company?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await axios.delete(
        `${API_URL}/company/${companyId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // Remove company from list
      setCompanies(prevCompanies =>
        prevCompanies.filter(c => c._id !== companyId)
      );
    } catch (error) {
      console.error("Error deleting company:", error);
      alert(error.response?.data?.error || error.message || 'Failed to delete company');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-800 text-white px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Company Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={fetchCompanies}
            className="btn btn-sm btn-outline border-white text-white hover:bg-gray-700"
            disabled={loading}
          >
            <RefreshCw size={16} className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => {
              setEditingCompany(null);
              setFormData({
                name: '',
                description: '',
                location: ''
              });
              setShowAddForm(!showAddForm);
            }}
            className="btn btn-sm bg-green-600 hover:bg-green-700 text-white border-none"
          >
            <PlusCircle size={16} className="mr-1" />
            Add Company
          </button>
        </div>
      </div>

      {/* Add/Edit Company Form */}
      {showAddForm && (
        <div className="border-b border-gray-200 p-6 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingCompany ? 'Edit Company' : 'Add New Company'}
          </h3>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-start">
              <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Company Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full border ${formErrors.name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500`}
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full border ${formErrors.location ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500`}
                />
                {formErrors.location && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.location}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full border ${formErrors.description ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500`}
                ></textarea>
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingCompany(null);
                }}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="bg-gray-800 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                {submitLoading ? (
                  <>
                    <RefreshCw size={16} className="inline mr-2 animate-spin" />
                    {editingCompany ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  editingCompany ? 'Update Company' : 'Add Company'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Companies Table */}
      <div className="overflow-x-auto">
        {loading && !companies.length ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center">
              <RefreshCw size={32} className="text-gray-400 animate-spin mb-4" />
              <p className="text-gray-500">Loading companies...</p>
            </div>
          </div>
        ) : error && !companies.length ? (
          <div className="text-center py-12">
            <AlertCircle size={32} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load companies</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={fetchCompanies}
              className="btn btn-sm btn-outline border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Try Again
            </button>
          </div>
        ) : !companies.length ? (
          <div className="text-center py-12">
            <div className="h-20 w-20 mx-auto text-gray-400 mb-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <PlusCircle size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first company</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-sm bg-gray-800 text-white hover:bg-gray-700"
            >
              Add Company
            </button>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {companies.map((company) => (
              <tr key={company._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">
                      {company.name}
                    </div>
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {company.description}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{company.location}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                    onClick={() => handleEditCompany(company)}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900"
                    onClick={() => handleDeleteCompany(company._id)}
                  >
                    <Trash2 size={16} />
                  </button>
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

export default CompaniesSection;