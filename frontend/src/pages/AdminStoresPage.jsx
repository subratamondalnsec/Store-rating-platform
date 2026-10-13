import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import Alert from '../components/Alert';
import StarRating from '../components/StarRating';
import { Store, PlusCircle, Search, Filter } from 'lucide-react';

const AdminStoresPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Filters & Sorting state
  const [filters, setFilters] = useState({
    search: '',
    name: '',
    email: '',
    address: ''
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Add Store Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [availableOwners, setAvailableOwners] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        sortBy,
        order: sortOrder
      };
      if (filters.search) params.search = filters.search;
      if (filters.name) params.name = filters.name;
      if (filters.email) params.email = filters.email;
      if (filters.address) params.address = filters.address;

      const res = await api.get('/admin/stores', { params });
      setStores(res.data.data.stores);
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to fetch stores list.'
      });
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, sortOrder]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const fetchAvailableOwners = async () => {
    try {
      const res = await api.get('/admin/available-owners');
      setAvailableOwners(res.data.data.owners);
      if (res.data.data.owners.length > 0) {
        setFormData((prev) => ({ ...prev, ownerId: String(res.data.data.owners[0].id) }));
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: 'Failed to load available store owners.'
      });
    }
  };

  const handleOpenAddModal = async () => {
    setFormErrors({});
    await fetchAvailableOwners();
    setIsModalOpen(true);
  };

  const handleSort = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      name: '',
      email: '',
      address: ''
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateModalForm = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Store name is required.';
    } else if (formData.name.trim().length < 3 || formData.name.trim().length > 255) {
      errs.name = 'Store name must be between 3 and 255 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errs.email = 'Store email is required.';
    } else if (!emailRegex.test(formData.email)) {
      errs.email = 'Please provide a valid store email address.';
    }

    if (!formData.address.trim()) {
      errs.address = 'Store address is required.';
    } else if (formData.address.trim().length > 400) {
      errs.address = 'Store address cannot exceed 400 characters.';
    }

    if (!formData.ownerId) {
      errs.ownerId = 'You must assign a store owner.';
    }

    return errs;
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    const validationErrors = validateModalForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setModalLoading(true);
    try {
      await api.post('/admin/stores', {
        name: formData.name,
        email: formData.email,
        address: formData.address,
        ownerId: parseInt(formData.ownerId, 10)
      });
      setAlert({
        type: 'success',
        message: `Store '${formData.name}' created successfully.`
      });
      setIsModalOpen(false);
      setFormData({
        name: '',
        email: '',
        address: '',
        ownerId: ''
      });
      fetchStores();
    } catch (err) {
      const responseData = err.response?.data;
      if (responseData?.errors && responseData.errors.length > 0) {
        const fieldErrors = {};
        responseData.errors.forEach((errObj) => {
          fieldErrors[errObj.field] = errObj.message;
        });
        setFormErrors(fieldErrors);
      } else {
        setAlert({
          type: 'error',
          message: responseData?.message || 'Failed to create store.'
        });
      }
    } finally {
      setModalLoading(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Store Name',
      sortable: true,
      render: (row) => <span className="font-semibold text-slate-900">{row.name}</span>
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true
    },
    {
      key: 'address',
      label: 'Address',
      sortable: true,
      render: (row) => (
        <span className="max-w-xs truncate block" title={row.address}>
          {row.address}
        </span>
      )
    },
    {
      key: 'rating',
      label: 'Overall Rating',
      sortable: true,
      render: (row) => (
        <StarRating
          value={row.averageRating}
          readOnly
          showValue
          totalReviews={row.totalRatings}
        />
      )
    },
    {
      key: 'owner',
      label: 'Assigned Owner',
      sortable: false,
      render: (row) => (
        <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded">
          {row.owner?.name || `Owner #${row.ownerId}`}
        </span>
      )
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stores Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor registered stores, overall ratings, and assign store owners
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add New Store</span>
        </button>
      </div>

      {alert && (
        <div className="mb-6">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search stores by name, email, or address..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`inline-flex items-center space-x-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
              showAdvancedFilters
                ? 'bg-primary-50 border-primary-300 text-primary-700'
                : 'border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Field Filters</span>
          </button>

          {(filters.search || filters.name || filters.email || filters.address) && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Reset
            </button>
          )}
        </div>

        {/* Detailed Per-Field Filters */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Filter by Name</label>
              <input
                type="text"
                name="name"
                value={filters.name}
                onChange={handleFilterChange}
                placeholder="Store name contains..."
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Filter by Email</label>
              <input
                type="text"
                name="email"
                value={filters.email}
                onChange={handleFilterChange}
                placeholder="Store email contains..."
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Filter by Address</label>
              <input
                type="text"
                name="address"
                value={filters.address}
                onChange={handleFilterChange}
                placeholder="Store address contains..."
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Stores DataTable */}
      <DataTable
        columns={columns}
        data={stores}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        loading={loading}
        emptyMessage="No stores found matching your filters."
      />

      {/* Add Store Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Store"
      >
        <form onSubmit={handleCreateStore} className="space-y-4" noValidate>
          <FormInput
            label="Store Name"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
            placeholder="e.g. Artisanal Roasters & Cafe"
            required
            error={formErrors.name}
          />

          <FormInput
            label="Store Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleFormChange}
            placeholder="contact@store.com"
            required
            error={formErrors.email}
          />

          <FormInput
            label="Store Address"
            name="address"
            type="textarea"
            rows={2}
            value={formData.address}
            onChange={handleFormChange}
            placeholder="Physical business address..."
            required
            helperText={`Length: ${formData.address.trim().length} / 400`}
            error={formErrors.address}
          />

          {/* Store Owner Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Assign Store Owner <span className="text-red-500">*</span>
            </label>
            {availableOwners.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs">
                No unassigned store owners available! Please create a new user with the{' '}
                <strong>Store Owner</strong> role first.
              </div>
            ) : (
              <select
                name="ownerId"
                value={formData.ownerId}
                onChange={handleFormChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-white"
              >
                {availableOwners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} ({owner.email})
                  </option>
                ))}
              </select>
            )}
            {formErrors.ownerId && (
              <p className="text-xs font-medium text-red-600">{formErrors.ownerId}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalLoading || availableOwners.length === 0}
              className="px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 focus:outline-none disabled:opacity-50 transition-colors shadow-sm"
            >
              {modalLoading ? 'Creating Store...' : 'Create Store'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminStoresPage;
