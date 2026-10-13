import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';
import Alert from '../components/Alert';
import { KeyRound, Check } from 'lucide-react';

const ChangePasswordPage = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const { updatePassword } = useAuth();
  const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

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

    const clientErrors = {};
    if (!formData.currentPassword) {
      clientErrors.currentPassword = 'Current password is required.';
    }

    if (!formData.newPassword) {
      clientErrors.newPassword = 'New password is required.';
    } else if (!passwordRegex.test(formData.newPassword)) {
      clientErrors.newPassword =
        'New password must be 8 to 16 characters long and contain at least one uppercase letter and one special character.';
    } else if (formData.newPassword === formData.currentPassword) {
      clientErrors.newPassword = 'New password must be different from current password.';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      clientErrors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setLoading(true);
    try {
      await updatePassword(formData.currentPassword, formData.newPassword);
      setAlert({
        type: 'success',
        message: 'Your password has been successfully updated.'
      });
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
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
        message: responseData?.message || 'Failed to update password.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4 sm:px-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 bg-primary-100 text-primary-600 rounded-xl">
            <KeyRound className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Change Password</h1>
            <p className="text-sm text-slate-500">
              Update your account password to keep your profile secure
            </p>
          </div>
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

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormInput
            label="Current Password"
            name="currentPassword"
            type="password"
            value={formData.currentPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
            error={errors.currentPassword}
          />

          <FormInput
            label="New Password"
            name="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
            helperText="8 to 16 characters with at least one uppercase letter and one special character"
            error={errors.newPassword}
          />

          <FormInput
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
            error={errors.confirmPassword}
          />

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 bg-primary-600 text-white font-medium text-sm rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 transition-colors shadow-sm"
            >
              {loading ? 'Updating Password...' : 'Save New Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
