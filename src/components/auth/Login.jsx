import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Building, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { motion } from 'framer-motion';


const Login = () => {
  const { signIn, userData, loading } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [redirectTo, setRedirectTo] = useState(null);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const validateForm = () => {
    const errors = {};
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    if (emailError) errors.email = emailError;
    if (passwordError) errors.password = passwordError;
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await signIn(formData.email, formData.password);

      const role = result?.role;
      if (!role) throw new Error('User role not found');

      if (role === 'admin') setRedirectTo('/admin/dashboard');
      else if (role === 'user') setRedirectTo('/user/dashboard');
      else if (role === 'security') setRedirectTo('/security/dashboard');
      else throw new Error('Unauthorized role');
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Failed to sign in';
      if (error.code === 'auth/user-not-found') errorMessage = 'No account found with this email address';
      else if (error.code === 'auth/wrong-password') errorMessage = 'Incorrect password';
      else if (error.code === 'auth/invalid-email') errorMessage = 'Invalid email address';
      else if (error.code === 'auth/user-disabled') errorMessage = 'This account has been disabled';
      else if (error.code === 'auth/too-many-requests') errorMessage = 'Too many failed attempts. Please try again later';
      else if (error.code === 'auth/network-request-failed') errorMessage = 'Network error. Please check your connection';
      else if (error.message) errorMessage = error.message;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoCredentials = (type) => {
    const credentials = {
      admin: { email: 'admin@demo.com', password: 'admin123' },
      user: { email: 'user@demo.com', password: 'user123' },
      security: { email: 'security@demo.com', password: 'security123' }
    };
    setFormData(credentials[type]);
    setValidationErrors({});
    setError('');
  };

  // Redirect after login
  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  // Redirect if already logged in
  if (userData?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (userData?.role === 'user') return <Navigate to="/user/dashboard" replace />;
  if (userData?.role === 'security') return <Navigate to="/security/dashboard" replace />;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-purple-50">
        <LoadingSpinner size="lg" text="Checking authentication..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-purple-50">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Building className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your Flat Management System</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 animate-slide-in">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="email" className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="      Enter your email"
                  className={`input pl-11 ${validationErrors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  required
                />
                {validationErrors.email && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 w-5 h-5" />}
              </div>
              {validationErrors.email && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{validationErrors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="      Enter your password"
                  className={`input pl-11 pr-11 ${validationErrors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {validationErrors.password && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{validationErrors.password}</p>}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 animate-fade-in">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary py-3 text-base font-semibold relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" color="white" />
                  <span className="ml-2">Signing in...</span>
                </div>
              ) : 'Sign In'}
            </button>
          </form>

             <motion.div 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     transition={{ delay: 0.9 }}
                     className="mt-6 text-center">

                     <p className="text-gray-600">
                       Don't have an account?{' '}
                       <Link to="/signup" className="text-purple-600 hover:text-purple-800 font-medium">
                         Sign Up
                       </Link>
                     </p>
          </motion.div>
    
        </div>

  

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm animate-fade-in">
          <p>© 2025 Flat Management System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
