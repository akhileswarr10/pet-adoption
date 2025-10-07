import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { getPetMainImage } from '../../utils/imageUtils';
import { 
  HeartIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';

const UserDashboard = () => {
  const { user } = useAuthStore();

  // Fetch user's adoption requests
  const { data: adoptionsData, isLoading: adoptionsLoading } = useQuery(
    ['user-adoptions', user?.id],
    async () => {
      const response = await axios.get('/adoptions');
      return response.data;
    }
  );

  // Fetch user's favorites
  const { data: favoritesData, isLoading: favoritesLoading } = useQuery(
    ['user-favorites', user?.id],
    async () => {
      const response = await axios.get('/favorites');
      return response.data;
    }
  );

  const adoptions = adoptionsData?.adoptions || [];

  const stats = [
    {
      title: 'Total Applications',
      value: adoptions.length,
      icon: HeartIcon,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Pending',
      value: adoptions.filter(a => a.status === 'pending').length,
      icon: ClockIcon,
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      title: 'Approved',
      value: adoptions.filter(a => a.status === 'approved').length,
      icon: CheckCircleIcon,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Completed',
      value: adoptions.filter(a => a.status === 'completed').length,
      icon: CheckCircleIcon,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      approved: 'badge-success',
      rejected: 'badge-danger',
      completed: 'badge-success'
    };
    return badges[status] || 'badge-gray';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return ClockIcon;
      case 'approved':
      case 'completed':
        return CheckCircleIcon;
      case 'rejected':
        return XCircleIcon;
      default:
        return ClockIcon;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}
        </h2>
        <p className="text-gray-600">
          Track your adoption applications and discover new pets looking for homes.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {adoptionsLoading ? (
                      <div className="w-12 h-8 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      stat.value
                    )}
                  </p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/pets"
            className="p-4 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors block"
          >
            <MagnifyingGlassIcon className="w-8 h-8 text-primary-600 mb-2" />
            <p className="font-medium text-gray-900">Browse Pets</p>
            <p className="text-sm text-gray-600">Find your perfect companion</p>
          </Link>
          
          <Link
            to="/donate"
            className="p-4 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors block"
          >
            <PlusIcon className="w-8 h-8 text-primary-600 mb-2" />
            <p className="font-medium text-gray-900">Donate a Pet</p>
            <p className="text-sm text-gray-600">Help a pet find a new home</p>
          </Link>
          
          <Link
            to="/profile"
            className="p-4 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors block"
          >
            <CheckCircleIcon className="w-8 h-8 text-primary-600 mb-2" />
            <p className="font-medium text-gray-900">Update Profile</p>
            <p className="text-sm text-gray-600">Keep your information current</p>
          </Link>
        </div>
      </motion.div>

      {/* Adoption Applications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Your Adoption Applications
          </h3>
          <Link
            to="/pets"
            className="text-primary-600 hover:text-primary-500 text-sm font-medium"
          >
            Apply for More Pets
          </Link>
        </div>

        {adoptionsLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : adoptions.length > 0 ? (
          <div className="space-y-4">
            {adoptions.map((adoption) => {
              const StatusIcon = getStatusIcon(adoption.status);
              return (
                <div key={adoption.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-center space-x-4">
                    <img
                      src={getPetMainImage(adoption.pet?.images)}
                      alt={adoption.pet?.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {adoption.pet?.name}
                        </h4>
                        <span className={`badge ${getStatusBadge(adoption.status)}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {adoption.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {adoption.pet?.breed} • {adoption.pet?.age} years old
                      </p>
                      <p className="text-xs text-gray-500">
                        Applied on {new Date(adoption.created_at).toLocaleDateString()}
                      </p>
                      {adoption.status === 'approved' && (
                        <p className="text-sm text-green-600 mt-2 font-medium">
                          🎉 Congratulations! Your application has been approved.
                        </p>
                      )}
                      {adoption.status === 'rejected' && adoption.rejection_reason && (
                        <p className="text-sm text-red-600 mt-2">
                          Reason: {adoption.rejection_reason}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {adoption.application_message && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Your message:</span> {adoption.application_message}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <HeartIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No adoption applications yet
            </h4>
            <p className="text-gray-600 mb-6">
              Start your journey by browsing available pets and submitting your first application.
            </p>
            <Link to="/pets" className="btn-primary">
              <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
              Browse Available Pets
            </Link>
          </div>
        )}
      </motion.div>

      {/* Favorites Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <HeartIcon className="w-5 h-5 mr-2 text-red-500" />
            My Favorites ({favoritesData?.count || 0})
          </h3>
          <Link to="/favorites" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All →
          </Link>
        </div>

        {favoritesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : favoritesData?.favorites?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {favoritesData.favorites.slice(0, 3).map((pet) => (
              <Link
                key={pet.id}
                to={`/pets/${pet.id}`}
                className="group block bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-32 bg-gray-200 relative overflow-hidden">
                  {pet.images && pet.images.length > 0 ? (
                    <img
                      src={getPetMainImage(pet.images)}
                      alt={pet.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-gray-400 text-2xl">🐾</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      pet.adoption_status === 'available' 
                        ? 'bg-green-100 text-green-800' 
                        : pet.adoption_status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {pet.adoption_status}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                    {pet.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {pet.breed} • {pet.age} year{pet.age !== 1 ? 's' : ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <HeartIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h4 className="text-base font-medium text-gray-900 mb-2">
              No favorites yet
            </h4>
            <p className="text-gray-600 text-sm mb-4">
              Browse pets and click the heart icon to add them to your favorites!
            </p>
            <Link to="/pets" className="btn-primary text-sm">
              <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
              Browse Pets
            </Link>
          </div>
        )}
      </motion.div>

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          💡 Tips for Successful Adoption
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start space-x-2">
            <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
            <p className="text-gray-700">
              <strong>Be detailed:</strong> Provide comprehensive information about your living situation and experience with pets.
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
            <p className="text-gray-700">
              <strong>Be patient:</strong> The review process may take a few days as shelters carefully evaluate applications.
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
            <p className="text-gray-700">
              <strong>Stay responsive:</strong> Check your email regularly and respond promptly to any follow-up questions.
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
            <p className="text-gray-700">
              <strong>Prepare your home:</strong> Make sure you have all necessary supplies before bringing your new pet home.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserDashboard;
