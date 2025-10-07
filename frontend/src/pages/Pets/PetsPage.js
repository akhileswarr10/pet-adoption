import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'react-query';
import axios from 'axios';
import { 
  HeartIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { getPetMainImage } from '../../utils/imageUtils';
import FavoriteButton from '../../components/FavoriteButton';

const PetsPage = () => {
  const [filters, setFilters] = useState({
    search: '',
    breed: '',
    age_min: '',
    age_max: '',
    gender: '',
    size: '',
    good_with_kids: '',
    good_with_pets: '',
    energy_level: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState(new Set());

  // Fetch pets with filters
  const { data: petsData, isLoading, error } = useQuery(
    ['pets', filters, currentPage],
    async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.append('page', currentPage);
      params.append('limit', 12);
      
      const response = await axios.get(`/pets?${params}`);
      return response.data;
    },
    {
      keepPreviousData: true
    }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      breed: '',
      age_min: '',
      age_max: '',
      gender: '',
      size: '',
      good_with_kids: '',
      good_with_pets: '',
      energy_level: ''
    });
    setCurrentPage(1);
  };

  const toggleFavorite = (petId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(petId)) {
        newFavorites.delete(petId);
      } else {
        newFavorites.add(petId);
      }
      return newFavorites;
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      available: 'badge-success',
      pending: 'badge-warning',
      adopted: 'badge-gray'
    };
    return badges[status] || 'badge-gray';
  };

  const filterOptions = {
    gender: [
      { value: '', label: 'Any Gender' },
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' }
    ],
    size: [
      { value: '', label: 'Any Size' },
      { value: 'small', label: 'Small' },
      { value: 'medium', label: 'Medium' },
      { value: 'large', label: 'Large' }
    ],
    energy_level: [
      { value: '', label: 'Any Energy Level' },
      { value: 'low', label: 'Low Energy' },
      { value: 'medium', label: 'Medium Energy' },
      { value: 'high', label: 'High Energy' }
    ],
    good_with_kids: [
      { value: '', label: 'Any' },
      { value: 'true', label: 'Good with Kids' }
    ],
    good_with_pets: [
      { value: '', label: 'Any' },
      { value: 'true', label: 'Good with Pets' }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Find Your Perfect Pet
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Browse through our collection of loving pets waiting for their forever homes
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-outline w-full flex items-center justify-center"
              >
                <FunnelIcon className="w-5 h-5 mr-2" />
                Filters
              </button>
            </div>

            {/* Filters */}
            <AnimatePresence>
              {(showFilters || window.innerWidth >= 1024) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="card p-6 sticky top-4"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                    <button
                      onClick={clearFilters}
                      className="text-sm text-primary-600 hover:text-primary-500"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Search */}
                    <div>
                      <label className="label">Search</label>
                      <div className="relative">
                        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search by name or breed..."
                          value={filters.search}
                          onChange={(e) => handleFilterChange('search', e.target.value)}
                          className="input pl-10"
                        />
                      </div>
                    </div>

                    {/* Breed */}
                    <div>
                      <label className="label">Breed</label>
                      <input
                        type="text"
                        placeholder="e.g., Golden Retriever"
                        value={filters.breed}
                        onChange={(e) => handleFilterChange('breed', e.target.value)}
                        className="input"
                      />
                    </div>

                    {/* Age Range */}
                    <div>
                      <label className="label">Age Range</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          min="0"
                          value={filters.age_min}
                          onChange={(e) => handleFilterChange('age_min', e.target.value)}
                          className="input"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          min="0"
                          value={filters.age_max}
                          onChange={(e) => handleFilterChange('age_max', e.target.value)}
                          className="input"
                        />
                      </div>
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="label">Gender</label>
                      <select
                        value={filters.gender}
                        onChange={(e) => handleFilterChange('gender', e.target.value)}
                        className="input"
                      >
                        {filterOptions.gender.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Size */}
                    <div>
                      <label className="label">Size</label>
                      <select
                        value={filters.size}
                        onChange={(e) => handleFilterChange('size', e.target.value)}
                        className="input"
                      >
                        {filterOptions.size.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Energy Level */}
                    <div>
                      <label className="label">Energy Level</label>
                      <select
                        value={filters.energy_level}
                        onChange={(e) => handleFilterChange('energy_level', e.target.value)}
                        className="input"
                      >
                        {filterOptions.energy_level.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Good with Kids */}
                    <div>
                      <label className="label">Good with Kids</label>
                      <select
                        value={filters.good_with_kids}
                        onChange={(e) => handleFilterChange('good_with_kids', e.target.value)}
                        className="input"
                      >
                        {filterOptions.good_with_kids.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Good with Pets */}
                    <div>
                      <label className="label">Good with Other Pets</label>
                      <select
                        value={filters.good_with_pets}
                        onChange={(e) => handleFilterChange('good_with_pets', e.target.value)}
                        className="input"
                      >
                        {filterOptions.good_with_pets.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            {petsData && (
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600">
                  Showing {petsData.pets.length} of {petsData.pagination.totalItems} pets
                </p>
                <div className="text-sm text-gray-500">
                  Page {petsData.pagination.currentPage} of {petsData.pagination.totalPages}
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card p-4 animate-pulse">
                    <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <div className="text-red-600 mb-4">
                  <XMarkIcon className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Error loading pets
                </h3>
                <p className="text-gray-600">
                  Please try again later or contact support if the problem persists.
                </p>
              </div>
            )}

            {/* Pets Grid */}
            {petsData && petsData.pets.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {petsData.pets.map((pet) => (
                  <motion.div
                    key={pet.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="card-hover group"
                  >
                    <div className="relative">
                      <img
                        src={getPetMainImage(pet.images)}
                        alt={pet.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <span className={`badge ${getStatusBadge(pet.adoption_status)}`}>
                          {pet.adoption_status}
                        </span>
                        <FavoriteButton
                          petId={pet.id}
                          size="md"
                          className="bg-white shadow-sm hover:shadow-md"
                        />
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {pet.name}
                        </h3>
                        <span className="text-lg font-bold text-primary-600">
                          ${pet.adoption_fee}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">
                        {pet.breed} • {pet.age} {pet.age === 1 ? 'year' : 'years'} old
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="capitalize">{pet.gender}</span>
                        <span className="capitalize">{pet.size}</span>
                        <span className="capitalize">{pet.energy_level} energy</span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {pet.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPinIcon className="w-4 h-4 mr-1" />
                          {pet.uploader?.name}
                        </div>
                        <Link
                          to={`/pets/${pet.id}`}
                          className="btn-primary text-sm"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* No Results */}
            {petsData && petsData.pets.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <MagnifyingGlassIcon className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No pets found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search criteria
                </p>
                <button
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {petsData && petsData.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {[...Array(petsData.pagination.totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === petsData.pagination.totalPages ||
                    (page >= currentPage - 2 && page <= currentPage + 2)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          page === currentPage
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 3 ||
                    page === currentPage + 3
                  ) {
                    return (
                      <span key={page} className="px-2 text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(petsData.pagination.totalPages, prev + 1))}
                  disabled={currentPage === petsData.pagination.totalPages}
                  className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetsPage;
