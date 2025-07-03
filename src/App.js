// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import AdminDashboard from './components/admin/Dashboard';
import FlatManagement from './components/admin/FlatManagement';
import OwnerManagement from './components/admin/OwnerManagement';
import VehicleManagement from './components/admin/VehicleManagement';
import TransferOwnership from './components/admin/TransferOwnership';
import UserDashboard from './components/user/UserDashboard';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import './styles/globals.css';
import './styles/animations.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Navigate to="/login" />} />
            
            {/* Admin Routes */}
            <Route path="/admin/*" element={
              <ProtectedRoute requiredRole="admin">
                <div className="flex h-screen">
                  <Sidebar />
                  <div className="flex-1 flex flex-col">
                    <Navbar />
                    <main className="flex-1 overflow-y-auto p-6">
                      <Routes>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="flats" element={<FlatManagement />} />
                        <Route path="owners" element={<OwnerManagement />} />
                        <Route path="vehicles" element={<VehicleManagement />} />
                        <Route path="transfer" element={<TransferOwnership />} />
                        <Route path="*" element={<Navigate to="/admin/dashboard" />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            } />

            {/* User Routes */}
            <Route path="/user/*" element={
              <ProtectedRoute requiredRole="user">
                <div className="flex h-screen">
                  <Sidebar />
                  <div className="flex-1 flex flex-col">
                    <Navbar />
                    <main className="flex-1 overflow-y-auto p-6">
                      <Routes>
                        <Route path="dashboard" element={<UserDashboard />} />
                        <Route path="*" element={<Navigate to="/user/dashboard" />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            } />
            
            {/* 404 Route */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                  <p className="text-gray-600 mb-8">Page not found</p>
                  <button 
                    onClick={() => window.history.back()}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;