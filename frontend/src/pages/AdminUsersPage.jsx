import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import Alert from '../components/Alert';
import { UserPlus, Search, Filter, Eye, RefreshCw } from 'lucide-react';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Filters & Sorting state
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    name: '',
    email: '',
    address: ''
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Add User Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'USER'
  });
  const [formErrors, setFormErrors] = useState({});

  const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        sortBy,
        order: sortOrder
      };
      if (filters.search) params.search = filters.search;
      if (filters.role) params.role = filters.role;
      if (filters.name) params.name = filters.name;
      if (filters.email) params.email = filters.email;
      if (filters.address) params.address = filters.address;

      const res = await api.get('/admin/users', { params });
      setUsers(res.data.data.users);
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to fetch users list.'
      });
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
      role: '',
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
    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      errs.name = 'Name is required.';
    } else if (trimmedName.length < 20 || trimmedName.length > 60) {
      errs.name = 'Name must be between 20 and 60 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errs.email = 'Email is required.';
    } else if (!emailRegex.test(formData.email)) {
      errs.email = 'Please provide a valid email address.';
    }

    if (!formData.password) {
      errs.password = 'Password is required.';
    } else if (!passwordRegex.test(formData.password)) {
      errs.password = 'Password must be 8 to 16 characters long and contain at least one uppercase letter and one special character.';
    }

    if (!formData.address.trim()) {
      errs.address = 'Address is required.';
    } else if (formData.address.trim().length > 400) {
      errs.address = 'Address cannot exceed 400 characters.';
    }

    if (!formData.role) {
      errs.role = 'Role is required.';
    }

    return errs;
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const validationErrors = validateModalForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setModalLoading(true);
    try {
      await api.post('/admin/users', formData);
      setAlert({
        type: 'success',
        message: `User '${formData.name}' created successfully.`
      });
      setIsModalOpen(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        address: '',
        role: 'USER'
      });
      fetchUsers();
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
          message: responseData?.message || 'Failed to create user.'
        });
      }
    } finally {
      setModalLoading(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (row) => (
        <span className="font-medium text-slate-900">{row.name}</span>
      )
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (row) => {
        const badgeColors = {
          ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
          STORE_OWNER: 'bg-amber-100 text-amber-800 border-amber-200',
          USER: 'bg-blue-100 text-blue-800 border-blue-200'
        };
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              badgeColors[row.role] || 'bg-slate-100 text-slate-800'
            }`}
          >
            {row.role.replace('_', ' ')}
          </span>
        );
      }
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
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (row) => (
        <Link
          to={`/admin/users/${row.id}`}
          className="inline-flex items-center space-x-1 text-xs font-semibold text-primary-600 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-2.5 py-1.5 rounded-md transition-colors"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>View</span>
        </Link>
      )
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            View, filter, and add platform administrators, store owners, and normal users
          </p>
        </div>

        <button
          onClick={() => {
            setFormErrors({});
            setIsModalOpen(true);
          }}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add New User</span>
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
              placeholder="Quick search across name, email, or address..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
            />
          </div>

          <div className="w-full md:w-48">
            <select
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="w-full py-2 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 bg-white"
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="STORE_OWNER">Store Owner</option>
              <option value="USER">Normal User</option>
            </select>
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

          {(filters.search || filters.role || filters.name || filters.email || filters.address) && (
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
                placeholder="Name contains..."
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
                placeholder="Email contains..."
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
                placeholder="Address contains..."
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Users DataTable */}
      <DataTable
        columns={columns}
        data={users}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        loading={loading}
        emptyMessage="No users found matching your filters."
      />

      {/* Add User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New User"
      >
        <form onSubmit={handleCreateUser} className="space-y-4" noValidate>
          <FormInput
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
            placeholder="e.g. Jonathan Alexander Doe Smith"
            required
            helperText={`Length: ${formData.name.trim().length} (Must be 20 to 60 characters)`}
            error={formErrors.name}
          />

          <FormInput
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleFormChange}
            placeholder="user@example.com"
            required
            error={formErrors.email}
          />

          <FormInput
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleFormChange}
            placeholder="••••••••"
            required
            helperText="8 to 16 characters with at least 1 uppercase and 1 special character"
            error={formErrors.password}
          />

          <FormInput
            label="Role"
            name="role"
            type="select"
            value={formData.role}
            onChange={handleFormChange}
            required
            options={[
              { value: 'USER', label: 'Normal User' },
              { value: 'STORE_OWNER', label: 'Store Owner' },
              { value: 'ADMIN', label: 'Administrator' }
            ]}
            error={formErrors.role}
          />

          <FormInput
            label="Address"
            name="address"
            type="textarea"
            rows={2}
            value={formData.address}
            onChange={handleFormChange}
            placeholder="Full physical street address..."
            required
            helperText={`Length: ${formData.address.trim().length} / 400`}
            error={formErrors.address}
          />

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
              disabled={modalLoading}
              className="px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 focus:outline-none disabled:opacity-50 transition-colors shadow-sm"
            >
              {modalLoading ? 'Creating User...' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminUsersPage;
