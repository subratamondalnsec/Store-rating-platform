import React from 'react';
import { Link } from 'react-router-dom';
import { Store, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="p-4 bg-primary-50 rounded-2xl text-primary-600 mb-4">
        <Store className="h-12 w-12" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
      <p className="text-lg font-semibold text-slate-700 mt-2">Page Not Found</p>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary-600 text-white font-medium text-sm rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;
