import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Store, User, LogOut, KeyRound, LayoutDashboard, Users } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleBadgeColor = {
    ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
    STORE_OWNER: 'bg-amber-100 text-amber-800 border-amber-200',
    USER: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-3 text-primary-600 font-bold text-xl tracking-tight">
              <Store className="h-7 w-7 text-primary-600" />
              <span>StoreRate</span>
            </Link>

            {isAuthenticated && (
              <div className="hidden md:flex space-x-2">
                {user?.role === 'ADMIN' && (
                  <>
                    <Link
                      to="/admin"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/admin')
                          ? 'bg-primary-50 text-primary-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </span>
                    </Link>
                    <Link
                      to="/admin/users"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/admin/users')
                          ? 'bg-primary-50 text-primary-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        Users
                      </span>
                    </Link>
                    <Link
                      to="/admin/stores"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/admin/stores')
                          ? 'bg-primary-50 text-primary-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Store className="h-4 w-4" />
                        Stores
                      </span>
                    </Link>
                  </>
                )}

                {user?.role === 'USER' && (
                  <Link
                    to="/stores"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/stores')
                        ? 'bg-primary-50 text-primary-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Store className="h-4 w-4" />
                      Browse Stores
                    </span>
                  </Link>
                )}

                {user?.role === 'STORE_OWNER' && (
                  <Link
                    to="/owner"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/owner')
                        ? 'bg-primary-50 text-primary-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <LayoutDashboard className="h-4 w-4" />
                      Store Dashboard
                    </span>
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex flex-col items-end text-right">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-slate-800">{user?.name}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${
                        roleBadgeColor[user?.role] || 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {user?.role?.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">{user?.email}</span>
                </div>

                <div className="flex items-center space-x-1 border-l pl-3 border-slate-200">
                  <Link
                    to="/change-password"
                    title="Change Password"
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                  >
                    <KeyRound className="h-5 w-5" />
                  </Link>

                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-700 hover:text-primary-600 px-3 py-2 rounded-md"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-md shadow-sm transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
