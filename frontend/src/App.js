import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import PetsPage from './pages/Pets/PetsPage';
import PetDetailsPage from './pages/Pets/PetDetailsPage';
import AdoptionPage from './pages/Adoption/AdoptionPage';
import AddPetPage from './pages/Shelter/AddPetPage';
import DonationPage from './pages/Donation/DonationPage';
import DocumentsPage from './pages/Documents/DocumentsPage';
import FavoritesPage from './pages/Favorites/FavoritesPage';
import ProfilePage from './pages/Profile/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Dashboard Pages
import DashboardPage from './pages/Dashboard/DashboardPage';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import ShelterDashboard from './pages/Dashboard/ShelterDashboard';
import UserDashboard from './pages/Dashboard/UserDashboard';
import ShelterAdoptions from './pages/Shelter/ShelterAdoptions';
import ShelterPets from './pages/Shelter/ShelterPets';
import ShelterDonations from './pages/Shelter/ShelterDonations';
import ShelterProfile from './pages/Shelter/ShelterProfile';

// Admin Pages
import AdminAdoptions from './pages/Dashboard/Admin/AdminAdoptions';
import AdminDonations from './pages/Dashboard/Admin/AdminDonations';
import AdminUsers from './pages/Dashboard/Admin/AdminUsers';
function App() {
  const { user, isLoading, initialize } = useAuthStore();

  // Initialize auth state on app start
  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="pets" element={<PetsPage />} />
          <Route path="pets/:id" element={<PetDetailsPage />} />
          <Route path="donate" element={<DonationPage />} />
          
          {/* Auth Routes - redirect if already logged in */}
          <Route 
            path="login" 
            element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
          />
          <Route 
            path="register" 
            element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} 
          />
          
          {/* Protected Routes */}
          <Route path="adopt/:petId" element={
            <ProtectedRoute>
              <AdoptionPage />
            </ProtectedRoute>
          } />
          
          <Route path="profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          
          <Route path="documents" element={
            <ProtectedRoute>
              <DocumentsPage />
            </ProtectedRoute>
          } />
          
          <Route path="favorites" element={
            <ProtectedRoute>
              <FavoritesPage />
            </ProtectedRoute>
          } />
          
          {/* Dashboard Routes */}
          <Route path="dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardRedirect />} />
            <Route path="admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="admin/adoptions" element={
              <ProtectedRoute requiredRole="admin">
                <AdminAdoptions />
              </ProtectedRoute>
            } />
            <Route path="admin/donations" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDonations />
              </ProtectedRoute>
            } />
            <Route path="admin/users" element={
              <ProtectedRoute requiredRole="admin">
                <AdminUsers />
              </ProtectedRoute>
            } />
            <Route path="shelter" element={
              <ProtectedRoute requiredRole="shelter">
                <ShelterDashboard />
              </ProtectedRoute>
            } />
            <Route path="shelter/add-pet" element={
              <ProtectedRoute requiredRole="shelter">
                <AddPetPage />
              </ProtectedRoute>
            } />
            <Route path="shelter/adoptions" element={
              <ProtectedRoute requiredRole="shelter">
                <ShelterAdoptions />
              </ProtectedRoute>
            } />
            <Route path="shelter/pets" element={
              <ProtectedRoute requiredRole="shelter">
                <ShelterPets />
              </ProtectedRoute>
            } />
            <Route path="shelter/donations" element={
              <ProtectedRoute requiredRole="shelter">
                <ShelterDonations />
              </ProtectedRoute>
            } />
            <Route path="shelter/profile" element={
              <ProtectedRoute requiredRole="shelter">
                <ShelterProfile />
              </ProtectedRoute>
            } />
            <Route path="user" element={
              <ProtectedRoute requiredRole="user">
                <UserDashboard />
              </ProtectedRoute>
            } />
          </Route>
          
          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </div>
  );
}

// Component to redirect to appropriate dashboard based on user role
function DashboardRedirect() {
  const { user } = useAuthStore();
  
  if (!user) return <Navigate to="/login" replace />;
  
  switch (user.role) {
    case 'admin':
      return <Navigate to="/dashboard/admin" replace />;
    case 'shelter':
      return <Navigate to="/dashboard/shelter" replace />;
    case 'user':
      return <Navigate to="/dashboard/user" replace />;
    default:
      return <Navigate to="/" replace />;
  }
}

export default App;
