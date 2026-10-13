import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';
import Alert from '../components/Alert';
import { Store, ShieldCheck, User, Sparkles } from 'lucide-react';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [demoLoadingRole, setDemoLoadingRole] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const showDemoLogins = import.meta.env.VITE_SHOW_DEMO_LOGINS === 'true';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleRedirect = (role) => {
    const from = location.state?.from?.pathname;
    if (from) {
      navigate(from, { replace: true });
    } else if (role === 'ADMIN') {
      navigate('/admin', { replace: true });
    } else if (role === 'STORE_OWNER') {
      navigate('/owner', { replace: true });
    } else {
      navigate('/stores', { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setAlert(null);

    // Client-side quick check
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required.';
    if (!formData.password) newErrors.password = 'Password is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const user = await login(formData.email, formData.password);
      handleRedirect(user.role);
    } catch (err) {
      const responseData = err.response?.data;
      if (responseData?.errors && responseData.errors.length > 0) {
        const fieldErrors = {};
        responseData.errors.forEach((errObj) => {
          fieldErrors[errObj.field] = errObj.message;
        });
        setErrors(fieldErrors);
      }
      setAlert({
        type: 'error',
        message: responseData?.message || 'Failed to login. Please check your credentials.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setErrors({});
    setAlert(null);
    setDemoLoadingRole(role);

    const demoCredentials = {
      ADMIN: { email: 'demo.admin@storerating.com', password: 'Demo@12345' },
      STORE_OWNER: { email: 'demo.owner@storerating.com', password: 'Demo@12345' },
      USER: { email: 'demo.user@storerating.com', password: 'Demo@12345' }
    };

    const creds = demoCredentials[role];
    if (!creds) {
      setDemoLoadingRole(null);
      return;
    }

    try {
      const user = await login(creds.email, creds.password);
      handleRedirect(user.role);
    } catch (err) {
      const responseData = err.response?.data;
      setAlert({
        type: 'error',
        message:
          responseData?.message ||
          `Failed to log in as ${role}. Please ensure database is seeded.`
      });
    } finally {
      setDemoLoadingRole(null);
    }
  };

  const isAnyLoading = loading || demoLoadingRole !== null;

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex p-3 bg-primary-100 rounded-2xl text-primary-600 mb-4 shadow-sm">
          <Store className="h-10 w-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Sign in to access your Store Rating Platform account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-md sm:rounded-2xl sm:px-10 border border-slate-200">
          {alert && (
            <div className="mb-6">
              <Alert
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert(null)}
              />
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <FormInput
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              disabled={isAnyLoading}
              error={errors.email}
            />

            <FormInput
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              disabled={isAnyLoading}
              error={errors.password}
            />

            <button
              type="submit"
              disabled={isAnyLoading}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-medium text-primary-600 hover:text-primary-700 underline underline-offset-2"
            >
              Sign up as normal user
            </Link>
          </div>

          {showDemoLogins && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="h-4 w-4 text-primary-600" />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Try a demo account
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-200">
                    Instant Access
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Click a role below to log in instantly with pre-seeded demo credentials:
                </p>

                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    id="demo-login-admin-btn"
                    disabled={isAnyLoading}
                    onClick={() => handleDemoLogin('ADMIN')}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white hover:bg-slate-100/80 active:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className="flex items-center space-x-2.5">
                      {demoLoadingRole === 'ADMIN' ? (
                        <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ShieldCheck className="h-4 w-4 text-purple-600 group-hover:scale-110 transition-transform" />
                      )}
                      <span className="text-slate-800">
                        {demoLoadingRole === 'ADMIN' ? 'Logging in as Admin...' : 'Login as Admin'}
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      ADMIN
                    </span>
                  </button>

                  <button
                    type="button"
                    id="demo-login-owner-btn"
                    disabled={isAnyLoading}
                    onClick={() => handleDemoLogin('STORE_OWNER')}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white hover:bg-slate-100/80 active:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className="flex items-center space-x-2.5">
                      {demoLoadingRole === 'STORE_OWNER' ? (
                        <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Store className="h-4 w-4 text-amber-600 group-hover:scale-110 transition-transform" />
                      )}
                      <span className="text-slate-800">
                        {demoLoadingRole === 'STORE_OWNER' ? 'Logging in as Store Owner...' : 'Login as Store Owner'}
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      STORE_OWNER
                    </span>
                  </button>

                  <button
                    type="button"
                    id="demo-login-user-btn"
                    disabled={isAnyLoading}
                    onClick={() => handleDemoLogin('USER')}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white hover:bg-slate-100/80 active:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className="flex items-center space-x-2.5">
                      {demoLoadingRole === 'USER' ? (
                        <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <User className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
                      )}
                      <span className="text-slate-800">
                        {demoLoadingRole === 'USER' ? 'Logging in as Normal User...' : 'Login as Normal User'}
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      USER
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
