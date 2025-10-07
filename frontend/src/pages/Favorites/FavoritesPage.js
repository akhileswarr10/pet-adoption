import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import FavoriteButton from '../../components/FavoriteButton';
import { 
  HeartIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  MapPinIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const FavoritesPage = () => {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch favorites
  const { data: favoritesData, isLoading, error, refetch } = useQuery(
    'favorites',
    async () => {
      const response = await axios.get('/favorites');
      return response.data;
    },
    {
      enabled: !!user
    }
  );

  // Fetch favorites statistics
  const { data: statsData } = useQuery(
    'favorites-stats',
    async () => {
      const response = await axios.get('/favorites/stats');
      return response.data;
    },
    {
      enabled: !!user
    }
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <HeartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h1>
          <p className="text-gray-600 mb-6">You must be logged in to view your favorites.</p>
          <Link to="/login" className="btn-primary">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const favorites = favoritesData?.favorites || [];
  const stats = statsData || { total: 0, available: 0, adopted: 0, pending: 0 };

  // Filter and sort favorites
  const filteredFavorites = favorites
    .filter(pet => {
      const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pet.breed.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || pet.adoption_status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.favoritedAt) - new Date(a.favoritedAt);
        case 'oldest':
          return new Date(a.favoritedAt) - new Date(b.favoritedAt);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'age':
          return a.age - b.age;
        default:
          return 0;
      }
    });

  const handleFavoriteChange = (isAdded, favoriteData) => {
    if (!isAdded) {
      // Refresh the list when a favorite is removed
      refetch();
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      available: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      adopted: 'bg-gray-100 text-gray-800'
    };
    
    const labels = {
      available: 'Available',
      pending: 'Pending',
      adopted: 'Adopted'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Favorites</h1>
          <p className="text-gray-600 mb-6">{error.message}</p>
          <button onClick={() => refetch()} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
                <HeartIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  My Favorites
                </h1>
                <p className="text-gray-600 mt-1">
                  {stats.total} favorite pet{stats.total !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                  <HeartIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-900">Available</p>
                  <p className="text-2xl font-bold text-green-900">{stats.available}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
                  <CalendarIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-900">Pending</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center mr-3">
                  <HeartIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Adopted</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.adopted}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                  <HeartIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-900">Total</p>
                  <p className="text-2xl font-bold text-red-900">{stats.total}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search favorites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="pending">Pending</option>
                <option value="adopted">Adopted</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name A-Z</option>
                <option value="age">Age (Young to Old)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Favorites Grid */}
        {filteredFavorites.length === 0 ? (
          <div className="text-center py-12">
            <HeartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {favorites.length === 0 ? 'No favorites yet' : 'No pets match your filters'}
            </h3>
            <p className="text-gray-600 mb-6">
              {favorites.length === 0 
                ? 'Start browsing pets and click the heart icon to add them to your favorites!'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {favorites.length === 0 && (
              <Link to="/pets" className="btn-primary">
                Browse Pets
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((pet, index) => (
              <motion.div
                key={pet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  {/* Pet Image */}
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    {pet.images && pet.images.length > 0 ? (
                      <img
                        src={pet.images[0]}
                        alt={pet.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-gray-400 text-4xl">🐾</span>
                      </div>
                    )}
                  </div>

                  {/* Favorite Button */}
                  <div className="absolute top-3 right-3">
                    <FavoriteButton
                      petId={pet.id}
                      size="md"
                      onFavoriteChange={handleFavoriteChange}
                    />
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    {getStatusBadge(pet.adoption_status)}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {pet.name}
                      </h3>
                      <p className="text-gray-600">{pet.breed}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Age:</span> {pet.age} year{pet.age !== 1 ? 's' : ''}
                    </div>
                    <div>
                      <span className="font-medium">Size:</span> {pet.size}
                    </div>
                    <div>
                      <span className="font-medium">Gender:</span> {pet.gender}
                    </div>
                    <div>
                      <span className="font-medium">Energy:</span> {pet.energy_level}
                    </div>
                  </div>

                  {pet.adoption_fee > 0 && (
                    <div className="flex items-center text-green-600 mb-4">
                      <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                      <span className="font-medium">${pet.adoption_fee}</span>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mb-4">
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      Favorited {new Date(pet.favoritedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Link
                      to={`/pets/${pet.id}`}
                      className="flex-1 bg-red-600 text-white text-center py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      View Details
                    </Link>
                    
                    {pet.adoption_status === 'available' && (
                      <Link
                        to={`/adopt/${pet.id}`}
                        className="flex-1 bg-gray-100 text-gray-700 text-center py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                      >
                        Adopt
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
