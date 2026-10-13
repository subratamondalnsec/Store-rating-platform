import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Alert from '../components/Alert';
import { Users, Store, Star, ArrowRight, UserPlus, PlusCircle } from 'lucide-react';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setStats(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: <Users className="h-7 w-7 text-blue-600" />,
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      link: '/admin/users'
    },
    {
      label: 'Total Stores',
      value: stats.totalStores,
      icon: <Store className="h-7 w-7 text-emerald-600" />,
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      link: '/admin/stores'
    },
    {
      label: 'Total Submitted Ratings',
      value: stats.totalRatings,
      icon: <Star className="h-7 w-7 text-amber-500" />,
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      link: '/admin/stores'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Administrator Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          High-level overview of system users, registered stores, and customer ratings
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {statCards.map((card, i) => (
          <div
            key={i}
            className={`p-6 rounded-2xl bg-white border ${card.border} shadow-sm flex items-center justify-between transition-all hover:shadow-md`}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                {card.label}
              </p>
              <p className="text-3xl font-extrabold text-slate-900">
                {loading ? '...' : card.value}
              </p>
              <Link
                to={card.link}
                className="inline-flex items-center text-xs font-medium text-primary-600 hover:text-primary-700 mt-3 group"
              >
                <span>View details</span>
                <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className={`p-4 rounded-2xl ${card.bg}`}>{card.icon}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4">Quick Management Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/users"
            className="flex items-center space-x-3 p-4 rounded-xl border border-slate-200 hover:border-primary-400 hover:bg-primary-50/30 transition-all text-slate-800"
          >
            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-lg">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Manage Users</p>
              <p className="text-xs text-slate-500">Filter, inspect, or add users</p>
            </div>
          </Link>

          <Link
            to="/admin/stores"
            className="flex items-center space-x-3 p-4 rounded-xl border border-slate-200 hover:border-primary-400 hover:bg-primary-50/30 transition-all text-slate-800"
          >
            <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-lg">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Manage Stores</p>
              <p className="text-xs text-slate-500">View ratings or add new stores</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
