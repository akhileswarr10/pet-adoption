import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { getPetMainImage } from '../../utils/imageUtils';
import { 
  HeartIcon,
  UserIcon,
  PhoneIcon,
  HomeIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const AdoptionPage = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    application_message: '',
    contact_phone: '',
    contact_address: '',
    experience_with_pets: '',
    living_situation: '',
    other_pets: ''
  });

  // Fetch pet details
  const { data: petData, isLoading: petLoading } = useQuery(
    ['pet', petId],
    async () => {
      const response = await axios.get(`/pets/${petId}`);
      return response.data.pet;
    }
  );

  // Submit adoption application
  const adoptionMutation = useMutation(
    async (applicationData) => {
      const response = await axios.post('/adoptions', {
        pet_id: parseInt(petId),
        ...applicationData
      });
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Adoption application submitted successfully!');
        navigate('/dashboard/user');
      },
      onError: (error) => {
        const message = error.response?.data?.error || 'Failed to submit application';
        toast.error(message);
      }
    }
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.application_message.trim()) {
      toast.error('Please provide an application message');
      return;
    }

    adoptionMutation.mutate(formData);
  };

  if (petLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!petData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pet Not Found</h2>
          <p className="text-gray-600">The pet you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Pet Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/3">
              <img
                src={getPetMainImage(petData.images)}
                alt={petData.name}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
            <div className="lg:w-2/3">
              <div className="flex items-center mb-4">
                <HeartIcon className="w-6 h-6 text-primary-600 mr-2" />
                <h1 className="text-3xl font-bold text-gray-900">{petData.name}</h1>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Breed</p>
                  <p className="font-medium">{petData.breed}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Age</p>
                  <p className="font-medium">{petData.age} years old</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="font-medium capitalize">{petData.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Size</p>
                  <p className="font-medium capitalize">{petData.size}</p>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Description</p>
                <p className="text-gray-800">{petData.description}</p>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <UserIcon className="w-4 h-4 mr-1" />
                <span>Listed by {petData.uploader?.name}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Adoption Application Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center mb-6">
            <HeartIcon className="w-6 h-6 text-primary-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Adoption Application</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Application Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Why do you want to adopt {petData.name}? *
              </label>
              <textarea
                name="application_message"
                value={formData.application_message}
                onChange={handleInputChange}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Tell us why you'd be a great match for this pet..."
                required
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <PhoneIcon className="w-4 h-4 inline mr-1" />
                  Contact Phone
                </label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Your phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <HomeIcon className="w-4 h-4 inline mr-1" />
                  Address
                </label>
                <input
                  type="text"
                  name="contact_address"
                  value={formData.contact_address}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Your address"
                />
              </div>
            </div>

            {/* Experience and Living Situation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience with Pets
              </label>
              <textarea
                name="experience_with_pets"
                value={formData.experience_with_pets}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Describe your experience with pets..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Living Situation
              </label>
              <textarea
                name="living_situation"
                value={formData.living_situation}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Describe your living situation (house/apartment, yard, etc.)..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Other Pets
              </label>
              <textarea
                name="other_pets"
                value={formData.other_pets}
                onChange={handleInputChange}
                rows={2}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Do you have other pets? Tell us about them..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="flex items-center text-sm text-gray-600">
                <InformationCircleIcon className="w-4 h-4 mr-1" />
                <span>Your application will be reviewed by the shelter</span>
              </div>
              <button
                type="submit"
                disabled={adoptionMutation.isLoading}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adoptionMutation.isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <HeartIcon className="w-5 h-5 mr-2" />
                    Submit Application
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AdoptionPage;