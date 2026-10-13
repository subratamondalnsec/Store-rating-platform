import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';
import Alert from '../components/Alert';
import { UserPlus } from 'lucide-react';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

  const validateClient = () => {
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

    if (!formData.address.trim()) {
      errs.address = 'Address is required.';
    } else if (formData.address.trim().length > 400) {
      errs.address = 'Address cannot exceed 400 characters.';
    }

    if (!formData.password) {
      errs.password = 'Password is required.';
    } else if (!passwordRegex.test(formData.password)) {
      errs.password = 'Password must be 8 to 16 characters long and contain at least one uppercase letter and one special character.';
    }

    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    const clientErrors = validateClient();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setLoading(true);
    try {
      await signup(formData);
      navigate('/stores', { replace: true });
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
        message: responseData?.message || 'Registration failed. Please check your inputs.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <div className="inline-flex p-3 bg-primary-100 rounded-2xl text-primary-600 mb-4 shadow-sm">
          <UserPlus className="h-10 w-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Create User Account
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Sign up to explore stores and submit ratings
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
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

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <FormInput
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Jonathan Alexander Doe Smith"
              required
              helperText={`Character count: ${formData.name.trim().length} (Must be 20 to 60 characters)`}
              error={errors.name}
            />

            <FormInput
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              required
              error={errors.email}
            />

            <FormInput
              label="Address"
              name="address"
              type="textarea"
              rows={2}
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Residential Parkway, City, State, ZIP"
              required
              helperText={`Character count: ${formData.address.trim().length} / 400`}
              error={errors.address}
            />

            <FormInput
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              helperText="8 to 16 characters, at least 1 uppercase letter and 1 special character"
              error={errors.password}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-700 underline underline-offset-2"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
