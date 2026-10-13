import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import StarRating from '../components/StarRating';
import Alert from '../components/Alert';
import { User, Store, Mail, MapPin, Calendar, ArrowLeft, Shield } from 'lucide-react';

const UserDetailsPage = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const res = await api.get(`/admin/users/${id}`);
        setUser(res.data.data.user);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load user details.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="text-sm text-slate-500">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Alert type="error" message={error || 'User not found.'} />
        <Link
          to="/admin/users"
          className="mt-4 inline-flex items-center text-sm font-semibold text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Users List
        </Link>
      </div>
    );
  }

  const roleBadgeColors = {
    ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
    STORE_OWNER: 'bg-amber-100 text-amber-800 border-amber-200',
    USER: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/admin/users"
        className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Users List
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50/70 border-b border-slate-100 px-6 py-6 sm:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-100 text-primary-600 rounded-2xl">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
              <p className="text-xs text-slate-500 mt-0.5">User ID #{user.id}</p>
            </div>
          </div>
          <span
            className={`self-start sm:self-auto inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
              roleBadgeColors[user.role] || 'bg-slate-100 text-slate-800'
            }`}
          >
            <Shield className="h-3 w-3 mr-1" />
            {user.role.replace('_', ' ')}
          </span>
        </div>

        {/* Content Info */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Email Address</p>
                <p className="text-sm font-medium text-slate-800 break-all">{user.email}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Member Since</p>
                <p className="text-sm font-medium text-slate-800">
                  {new Date(user.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="sm:col-span-2 flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Physical Address</p>
                <p className="text-sm font-medium text-slate-800">{user.address}</p>
              </div>
            </div>
          </div>

          {/* If user is STORE_OWNER */}
          {user.role === 'STORE_OWNER' && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <Store className="h-5 w-5 text-amber-600" />
                <span>Assigned Store Details</span>
              </h2>

              {user.store ? (
                <div className="bg-amber-50/50 rounded-xl p-5 border border-amber-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{user.store.name}</h3>
                      <p className="text-xs text-slate-600">{user.store.email}</p>
                    </div>

                    <div className="flex flex-col sm:items-end">
                      <p className="text-xs font-semibold text-slate-500 uppercase">Average Rating</p>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <StarRating
                          value={user.store.averageRating}
                          readOnly
                          showValue
                          totalReviews={user.store.totalRatings}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-slate-700 flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                    <span>{user.store.address}</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-500">
                  This store owner currently has no assigned store. You can assign one from the{' '}
                  <Link to="/admin/stores" className="text-primary-600 font-medium underline">
                    Stores Management
                  </Link>{' '}
                  page.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPage;
