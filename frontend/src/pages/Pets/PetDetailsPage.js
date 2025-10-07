import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import axios from 'axios';
import { 
  HeartIcon,
  ArrowLeftIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useAuthStore } from '../../store/authStore';
import FavoriteButton from '../../components/FavoriteButton';
import { parsePetImages } from '../../utils/imageUtils';

const PetDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch pet details
  const { data: petData, isLoading, error } = useQuery(
    ['pet', id],
    async () => {
      const response = await axios.get(`/pets/${id}`);
      return response.data;
    }
  );

  const pet = petData?.pet;

  const handleAdopt = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/adopt/${id}` } } });
      return;
    }
    navigate(`/adopt/${id}`);
  };

  const getStatusBadge = (status) => {
    const badges = {
      available: { class: 'badge-success', text: 'Available' },
      pending: { class: 'badge-warning', text: 'Adoption Pending' },
      adopted: { class: 'badge-gray', text: 'Adopted' }
    };
    return badges[status] || badges.available;
  };

  const getHealthStatusBadge = (status) => {
    const badges = {
      healthy: { class: 'badge-success', text: 'Healthy' },
      needs_care: { class: 'badge-warning', text: 'Needs Care' },
      recovering: { class: 'badge-info', text: 'Recovering' }
    };
    return badges[status] || badges.healthy;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <XCircleIcon className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pet Not Found</h2>
          <p className="text-gray-600 mb-4">
            The pet you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/pets" className="btn-primary">
            Browse Other Pets
          </Link>
        </div>
      </div>
    );
  }

  // Parse images using utility function
  const images = parsePetImages(pet.images);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const statusBadge = getStatusBadge(pet.adoption_status);
  const healthBadge = getHealthStatusBadge(pet.health_status);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Pets
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="card overflow-hidden">
              <div className="relative">
                <img
                  src={images[currentImageIndex]}
                  alt={pet.name}
                  className="w-full h-96 object-cover"
                />
                
                {/* Navigation arrows for multiple images */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                    
                    {/* Image counter */}
                    <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
                
                <div className="absolute top-4 right-4">
                  <FavoriteButton
                    petId={pet.id}
                    size="lg"
                    className="bg-white shadow-lg hover:shadow-xl"
                  />
                </div>
                <div className="absolute top-4 left-4">
                  <span className={`badge ${statusBadge.class}`}>
                    {statusBadge.text}
                  </span>
                </div>
              </div>
              
              {images.length > 1 && (
                <div className="p-4">
                  <div className="flex gap-2 overflow-x-auto">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                          index === currentImageIndex
                            ? 'border-primary-500'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${pet.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Pet Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Basic Info */}
            <div className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{pet.name}</h1>
                  <p className="text-xl text-gray-600">{pet.breed}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-600 mb-1">
                    ${pet.adoption_fee}
                  </div>
                  <div className="text-sm text-gray-500">Adoption Fee</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">
                    {pet.age} {pet.age === 1 ? 'year' : 'years'} old
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 flex items-center justify-center">
                    {pet.gender === 'male' ? '♂' : '♀'}
                  </span>
                  <span className="text-gray-600 capitalize">{pet.gender}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 text-gray-400 text-sm">📏</span>
                  <span className="text-gray-600 capitalize">{pet.size}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 text-gray-400 text-sm">⚡</span>
                  <span className="text-gray-600 capitalize">{pet.energy_level} energy</span>
                </div>
              </div>

              <div className="flex gap-2 mb-6">
                <span className={`badge ${healthBadge.class}`}>
                  {healthBadge.text}
                </span>
                {pet.vaccination_status && (
                  <span className="badge-success">
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    Vaccinated
                  </span>
                )}
                {pet.spayed_neutered && (
                  <span className="badge-info">
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    Spayed/Neutered
                  </span>
                )}
              </div>

              <p className="text-gray-700 leading-relaxed">{pet.description}</p>
            </div>

            {/* Characteristics */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Characteristics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Good with kids</span>
                  {pet.good_with_kids ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Good with pets</span>
                  {pet.good_with_pets ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
              
              {pet.special_needs && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-1">Special Needs</h4>
                  <p className="text-yellow-700 text-sm">{pet.special_needs}</p>
                </div>
              )}
            </div>

            {/* Shelter Info */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Shelter Information</h3>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{pet.uploader?.name}</h4>
                  <p className="text-gray-600 capitalize mb-2">{pet.uploader?.role}</p>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <EnvelopeIcon className="w-4 h-4 mr-2" />
                      {pet.uploader?.email}
                    </div>
                    {pet.uploader?.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <PhoneIcon className="w-4 h-4 mr-2" />
                        {pet.uploader?.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {pet.adoption_status === 'available' ? (
                <button
                  onClick={handleAdopt}
                  className="w-full btn-primary text-lg py-3"
                >
                  <HeartIcon className="w-5 h-5 mr-2" />
                  Adopt {pet.name}
                </button>
              ) : (
                <div className="w-full bg-gray-100 text-gray-500 text-center py-3 rounded-lg text-lg font-medium">
                  {pet.adoption_status === 'pending' ? 'Adoption Pending' : 'Already Adopted'}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <button className="btn-outline">
                  <EnvelopeIcon className="w-4 h-4 mr-2" />
                  Contact Shelter
                </button>
                <button className="btn-outline">
                  <MapPinIcon className="w-4 h-4 mr-2" />
                  Get Directions
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Similar Pets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Pets</h2>
          <div className="text-center py-8 text-gray-500">
            <p>Similar pets will be displayed here based on breed, size, and age.</p>
            <Link to="/pets" className="btn-primary mt-4">
              Browse All Pets
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PetDetailsPage;
