import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import StarRating from '../components/StarRating';
import Alert from '../components/Alert';
import { Store, Search, MapPin, Sparkles, Filter, ArrowUpDown } from 'lucide-react';

const StoresListPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [submittingRatingId, setSubmittingRatingId] = useState(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [addressFilter, setAddressFilter] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        sortBy,
        order
      };
      if (searchTerm) params.search = searchTerm;
      if (nameFilter) params.name = nameFilter;
      if (addressFilter) params.address = addressFilter;

      const res = await api.get('/stores', { params });
      setStores(res.data.data.stores);
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to fetch stores.'
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, nameFilter, addressFilter, sortBy, order]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleRateStore = async (storeId, newRatingValue) => {
    setSubmittingRatingId(storeId);
    try {
      const res = await api.post(`/stores/${storeId}/rating`, {
        value: newRatingValue
      });

      const { rating, storeStats } = res.data.data;

      // Update state locally
      setStores((prevStores) =>
        prevStores.map((s) => {
          if (s.id === storeId) {
            return {
              ...s,
              userRating: rating.value,
              averageRating: storeStats.averageRating,
              totalRatings: storeStats.totalRatings
            };
          }
          return s;
        })
      );

      setAlert({
        type: 'success',
        message: `Your rating of ${newRatingValue} star(s) has been saved!`
      });
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to submit rating.'
      });
    } finally {
      setSubmittingRatingId(null);
    }
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setOrder('asc');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Explore & Rate Stores</h1>
        <p className="text-sm text-slate-500 mt-1">
          Discover local stores, view customer reviews, and share your own rating
        </p>
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

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search stores by name or address..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`inline-flex items-center space-x-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
              showAdvanced
                ? 'bg-primary-50 border-primary-300 text-primary-700'
                : 'border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Field Filters</span>
          </button>

          {/* Sort Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleSortChange('name')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border flex items-center gap-1 ${
                sortBy === 'name'
                  ? 'bg-primary-50 border-primary-300 text-primary-700'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Name {sortBy === 'name' && (order === 'asc' ? '↑' : '↓')}</span>
            </button>

            <button
              onClick={() => handleSortChange('rating')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border flex items-center gap-1 ${
                sortBy === 'rating'
                  ? 'bg-primary-50 border-primary-300 text-primary-700'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Rating {sortBy === 'rating' && (order === 'asc' ? '↑' : '↓')}</span>
            </button>

            {(searchTerm || nameFilter || addressFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setNameFilter('');
                  setAddressFilter('');
                }}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Detailed Filters */}
        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Store Name</label>
              <input
                type="text"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                placeholder="Name contains..."
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Address</label>
              <input
                type="text"
                value={addressFilter}
                onChange={(e) => setAddressFilter(e.target.value)}
                placeholder="Address contains..."
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Stores List */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="text-sm text-slate-500">Loading stores...</p>
        </div>
      ) : stores.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-lg mx-auto">
          <Store className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No Stores Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query or clear active filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{store.name}</h3>
                </div>

                <div className="flex items-center space-x-2 mb-3">
                  <StarRating
                    value={store.averageRating}
                    readOnly
                    showValue
                    totalReviews={store.totalRatings}
                  />
                </div>

                <div className="flex items-start space-x-2 text-xs text-slate-600 mb-4">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{store.address}</span>
                </div>
              </div>

              {/* User Rating Action Box */}
              <div className="pt-4 border-t border-slate-100 bg-slate-50/70 -mx-6 -mb-6 px-6 py-4 rounded-b-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-700">
                      {store.userRating ? 'Your Rating:' : 'Rate this store:'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {store.userRating
                        ? 'Click a star to modify'
                        : 'Select 1 to 5 stars'}
                    </p>
                  </div>

                  <div className="relative">
                    <StarRating
                      value={store.userRating || 0}
                      onChange={(starVal) => handleRateStore(store.id, starVal)}
                      size="md"
                    />
                    {submittingRatingId === store.id && (
                      <span className="absolute -top-4 right-0 text-[10px] text-primary-600 font-bold animate-pulse">
                        Saving...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoresListPage;
