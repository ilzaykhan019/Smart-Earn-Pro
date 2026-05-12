/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { user, userData, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && userData?.role !== 'admin') return <Navigate to="/dashboard" />;
  
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col relative overflow-x-hidden">
          <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_30%,#1e3a8a_0%,transparent_50%),radial-gradient(circle_at_70%_70%,#4c1d95_0%,transparent_50%)] opacity-40 pointer-events-none z-0"></div>
          <div className="relative z-10 flex flex-col min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <Navbar />
            <main className="flex-1 w-full">
              <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/dashboard/*" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/*" 
                element={
                  <ProtectedRoute adminOnly>
                    <AdminPanel />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

