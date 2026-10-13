import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import StarRating from '../components/StarRating';
import DataTable from '../components/DataTable';
import Alert from '../components/Alert';
import { Store, Star, Users, MapPin, Mail, Calendar } from 'lucide-react';

const OwnerDashboardPage = () => {
  const [data, setData] = useState({
    hasStore: false,
    store: null,
    averageRating: 0,
    totalRatings: 0,
    ratings: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sorting for ratings table
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchRater, setSearchRater] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/owner/dashboard');
        setData(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load owner dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleSort = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
  };

  // Filter and sort the ratings in memory
  const filteredRatings = data.ratings
    .filter((r) => {
      if (!searchRater) return true;
      const term = searchRater.toLowerCase();
      return (
        r.userName.toLowerCase().includes(term) ||
        r.userEmail.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'userName') {
        comparison = a.userName.localeCompare(b.userName);
      } else if (sortBy === 'userEmail') {
        comparison = a.userEmail.localeCompare(b.userEmail);
      } else if (sortBy === 'value') {
        comparison = a.value - b.value;
      } else if (sortBy === 'updatedAt' || sortBy === 'createdAt') {
        comparison = new Date(a.updatedAt || a.createdAt) - new Date(b.updatedAt || b.createdAt);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const columns = [
    {
      key: 'userName',
      label: 'Customer Name',
      sortable: true,
      render: (row) => <span className="font-semibold text-slate-800">{row.userName}</span>
    },
    {
      key: 'userEmail',
      label: 'Email Address',
      sortable: true
    },
    {
      key: 'value',
      label: 'Rating Submitted',
      sortable: true,
      render: (row) => (
        <div className="flex items-center space-x-2">
          <StarRating value={row.value} readOnly size="sm" />
          <span className="text-xs font-bold text-slate-700">({row.value} / 5)</span>
        </div>
      )
    },
    {
      key: 'updatedAt',
      label: 'Submitted Date',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-500">
          {new Date(row.updatedAt || row.createdAt).toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      )
    }
  ];

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="text-sm text-slate-500">Loading store dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Store Owner Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review customer satisfaction feedback and detailed rating history
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}

      {!data.hasStore ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-lg mx-auto">
          <Store className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No Store Assigned Yet</h3>
          <p className="text-xs text-slate-500 mt-1">
            An administrator has not yet assigned a store to your account. Please contact your system administrator.
          </p>
        </div>
      ) : (
        <>
          {/* Store Info & Rating Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Store Information Card */}
            <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2.5 bg-primary-100 text-primary-600 rounded-xl">
                    <Store className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{data.store.name}</h2>
                    <p className="text-xs text-slate-500">{data.store.email}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2 text-sm text-slate-600 mt-4">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{data.store.address}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Store ID: #{data.store.id}</span>
                <span>
                  Registered on{' '}
                  {new Date(data.store.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {/* Overall Rating Stat Card */}
            <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-sm bg-gradient-to-br from-amber-50/50 to-white flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">
                Overall Store Rating
              </span>
              <div className="text-4xl font-black text-slate-900 mb-2">
                {data.averageRating > 0 ? Number(data.averageRating).toFixed(1) : '0.0'}
                <span className="text-lg text-slate-400 font-medium"> / 5</span>
              </div>
              <StarRating value={data.averageRating} readOnly size="lg" />
              <p className="text-xs text-slate-500 mt-3 font-medium">
                Based on {data.totalRatings} customer {data.totalRatings === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          </div>

          {/* Customer Reviews Table */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Customer Ratings & Reviews</h3>
                <p className="text-xs text-slate-500">
                  Full list of verified customers who rated this store
                </p>
              </div>

              {/* Quick Search */}
              <div className="w-full sm:w-64">
                <input
                  type="text"
                  value={searchRater}
                  onChange={(e) => setSearchRater(e.target.value)}
                  placeholder="Filter by customer name or email..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
                />
              </div>
            </div>

            <DataTable
              columns={columns}
              data={filteredRatings}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              emptyMessage="No customer ratings have been submitted for your store yet."
            />
          </div>
        </>
      )}
    </div>
  );
};

export default OwnerDashboardPage;
