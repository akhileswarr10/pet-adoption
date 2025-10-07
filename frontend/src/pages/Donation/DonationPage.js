import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from 'react-query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { 
  GiftIcon,
  HeartIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

const schema = yup.object({
  pet_name: yup
    .string()
    .required('Pet name is required'),
  pet_breed: yup
    .string()
    .required('Pet breed is required'),
  pet_age: yup
    .number()
    .positive('Age must be positive')
    .integer('Age must be a whole number')
    .max(30, 'Age cannot exceed 30 years')
    .required('Pet age is required'),
  pet_gender: yup
    .string()
    .oneOf(['male', 'female'], 'Please select a gender')
    .required('Pet gender is required'),
  pet_size: yup
    .string()
    .oneOf(['small', 'medium', 'large'], 'Please select a size')
    .required('Pet size is required'),
  pet_color: yup
    .string()
    .required('Pet color is required'),
  pet_description: yup
    .string()
    .required('Pet description is required'),
  health_status: yup
    .string()
    .oneOf(['healthy', 'needs_care', 'recovering'], 'Please select health status')
    .required('Health status is required'),
  vaccination_status: yup
    .boolean(),
  spayed_neutered: yup
    .boolean(),
  good_with_kids: yup
    .boolean(),
  good_with_pets: yup
    .boolean(),
  energy_level: yup
    .string()
    .oneOf(['low', 'medium', 'high'], 'Please select energy level')
    .required('Energy level is required'),
  shelter_id: yup
    .number()
    .positive('Please select a shelter')
    .required('Please select a shelter'),
  donor_name: yup
    .string()
    .required('Your name is required'),
  donor_email: yup
    .string()
    .email('Please enter a valid email')
    .required('Your email is required'),
  donor_phone: yup
    .string()
    .required('Your phone number is required'),
  donation_reason: yup
    .string()
    .required('Please explain why you need to donate your pet'),
  pet_background: yup
    .string()
    .required('Please provide background information about your pet'),
  pickup_date: yup
    .date()
    .min(new Date(), 'Pickup date must be in the future')
    .required('Preferred pickup date is required'),
  notes: yup
    .string()
    .optional()
});

const DonationPage = () => {
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);

  // Fetch shelters
  const { data: sheltersData, isLoading: sheltersLoading } = useQuery(
    'shelters',
    async () => {
      const response = await axios.get('/users/shelters/list');
      return response.data;
    }
  );

  // Submit donation request
  const donationMutation = useMutation(
    async (data) => {
      try {
        // Create FormData for file upload
        const formData = new FormData();
        
        // Add pet information with strict validation
        if (!data.pet_name?.trim()) throw new Error('Pet name is required');
        formData.append('pet_name', data.pet_name.trim());
        
        if (!data.pet_breed?.trim()) throw new Error('Pet breed is required');
        formData.append('pet_breed', data.pet_breed.trim());
        
        if (!data.pet_age || data.pet_age < 0 || data.pet_age > 30) throw new Error('Pet age must be between 0 and 30');
        formData.append('pet_age', data.pet_age.toString());
        
        if (!data.pet_gender || !['male', 'female'].includes(data.pet_gender)) throw new Error('Please select pet gender');
        formData.append('pet_gender', data.pet_gender);
        
        if (!data.pet_size || !['small', 'medium', 'large'].includes(data.pet_size)) throw new Error('Please select pet size');
        formData.append('pet_size', data.pet_size);
        
        if (!data.pet_color?.trim()) throw new Error('Pet color is required');
        formData.append('pet_color', data.pet_color.trim());
        
        if (!data.pet_description?.trim()) throw new Error('Pet description is required');
        formData.append('pet_description', data.pet_description.trim());
        
        if (!data.health_status || !['healthy', 'needs_care', 'recovering'].includes(data.health_status)) throw new Error('Please select health status');
        formData.append('health_status', data.health_status);
        
        // Handle boolean fields properly
        formData.append('vaccination_status', (data.vaccination_status === true).toString());
        formData.append('spayed_neutered', (data.spayed_neutered === true).toString());
        formData.append('good_with_kids', (data.good_with_kids === true).toString());
        formData.append('good_with_pets', (data.good_with_pets === true).toString());
        
        if (!data.energy_level || !['low', 'medium', 'high'].includes(data.energy_level)) throw new Error('Please select energy level');
        formData.append('energy_level', data.energy_level);
        
        // Add donor information with strict validation
        if (!data.shelter_id || data.shelter_id <= 0) throw new Error('Please select a shelter');
        formData.append('shelter_id', data.shelter_id.toString());
        
        if (!data.donor_name?.trim()) throw new Error('Your name is required');
        formData.append('donor_name', data.donor_name.trim());
        
        if (!data.donor_email?.trim()) throw new Error('Your email is required');
        formData.append('donor_email', data.donor_email.trim());
        
        if (!data.donor_phone?.trim()) throw new Error('Your phone is required');
        formData.append('donor_phone', data.donor_phone.trim());
        
        if (!data.donation_reason?.trim()) throw new Error('Donation reason is required');
        formData.append('donation_reason', data.donation_reason.trim());
        
        if (!data.pet_background?.trim()) throw new Error('Pet background is required');
        formData.append('pet_background', data.pet_background.trim());
        
        // Handle pickup date properly
        try {
          const pickupDate = new Date(data.pickup_date);
          if (isNaN(pickupDate.getTime())) {
            throw new Error('Invalid pickup date');
          }
          formData.append('pickup_date', pickupDate.toISOString());
        } catch (dateError) {
          console.error('Date parsing error:', dateError);
          throw new Error('Please select a valid pickup date');
        }
        
        if (data.notes?.trim()) formData.append('notes', data.notes.trim());
        
        // Add images
        images.forEach((image, index) => {
          formData.append('images', image);
        });

        // Debug: Log form data
        console.log('=== DONATION FORM DEBUG ===');
        console.log('Original form data:', data);
        console.log('User info:', user);
        console.log('Images count:', images.length);
        console.log('FormData being sent:');
        for (let [key, value] of formData.entries()) {
          console.log(`${key}:`, typeof value, value);
        }
        console.log('=== END DEBUG ===');

        const response = await axios.post('/donations/user-donation', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 30000 // 30 second timeout
        });
        return response.data;
      } catch (error) {
        console.error('Donation submission error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          statusText: error.response?.statusText
        });
        throw error;
      }
    },
    {
      onSuccess: () => {
        toast.success('Donation request submitted successfully!');
        reset();
        setCurrentStep(1);
        setImages([]);
        setImagePreview([]);
      },
      onError: (error) => {
        console.error('Donation submission error:', error.response?.data);
        
        // Handle different types of errors
        if (error.code === 'ECONNABORTED') {
          toast.error('Request timed out. Please check your connection and try again.');
        } else if (error.response?.status === 401) {
          toast.error('Please log in to submit a donation request.');
        } else if (error.response?.status === 403) {
          toast.error('You do not have permission to submit donation requests.');
        } else if (error.response?.data?.details) {
          // Show specific validation errors
          console.log('=== VALIDATION ERRORS ===');
          console.log('Full error response:', error.response.data);
          console.log('Validation details:', error.response.data.details);
          console.log('=== END VALIDATION ERRORS ===');
          
          if (Array.isArray(error.response.data.details)) {
            // Show a summary first
            toast.error(`Validation failed on ${error.response.data.details.length} field(s). Check console for details.`, { duration: 8000 });
            
            // Then show each specific error
            error.response.data.details.forEach((detail, index) => {
              const field = detail.path || detail.param || detail.field || `Field ${index + 1}`;
              const message = detail.msg || detail.message || detail.value || 'Invalid value';
              console.error(`❌ ${field}: ${message}`);
              toast.error(`${field}: ${message}`, { duration: 8000 });
            });
          } else {
            toast.error('Validation failed. Please check your input.');
          }
        } else {
          const message = error.response?.data?.error || error.message || 'Failed to submit donation request';
          toast.error(message);
        }
      },
      // Add retry configuration
      retry: (failureCount, error) => {
        // Don't retry on validation errors (4xx) or auth errors
        if (error.response?.status >= 400 && error.response?.status < 500) {
          return false;
        }
        // Retry up to 2 times for network/server errors
        return failureCount < 2;
      },
      retryDelay: 1000 // 1 second delay between retries
    }
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      vaccination_status: false,
      spayed_neutered: false,
      good_with_kids: true,
      good_with_pets: true
    }
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Check file count limit
    if (files.length + images.length > 3) {
      toast.error('Maximum 3 images allowed');
      return;
    }

    // Check file sizes
    const validFiles = [];
    const maxSize = 1024 * 1024; // 1MB
    
    files.forEach(file => {
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is 1MB.`);
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length === 0) {
      return;
    }

    setImages(prev => [...prev, ...validFiles]);
    
    // Create preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
    
    if (validFiles.length > 0) {
      toast.success(`${validFiles.length} image(s) added successfully`);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data) => {
    // Client-side validation
    if (images.length === 0) {
      toast.error('Please add at least one photo of your pet');
      return;
    }
    
    // Validate required fields
    const requiredFields = [
      { field: 'pet_name', label: 'Pet name' },
      { field: 'pet_breed', label: 'Pet breed' },
      { field: 'pet_age', label: 'Pet age' },
      { field: 'pet_gender', label: 'Pet gender' },
      { field: 'pet_size', label: 'Pet size' },
      { field: 'pet_color', label: 'Pet color' },
      { field: 'pet_description', label: 'Pet description' },
      { field: 'health_status', label: 'Health status' },
      { field: 'energy_level', label: 'Energy level' },
      { field: 'shelter_id', label: 'Shelter selection' },
      { field: 'donor_name', label: 'Your name' },
      { field: 'donor_email', label: 'Your email' },
      { field: 'donor_phone', label: 'Your phone' },
      { field: 'donation_reason', label: 'Donation reason' },
      { field: 'pet_background', label: 'Pet background' },
      { field: 'pickup_date', label: 'Pickup date' }
    ];
    
    for (const { field, label } of requiredFields) {
      if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
        toast.error(`${label} is required`);
        return;
      }
    }
    
    // Validate shelter_id is a number
    if (!data.shelter_id || isNaN(Number(data.shelter_id)) || Number(data.shelter_id) <= 0) {
      toast.error('Please select a valid shelter');
      return;
    }
    
    // Validate pickup date is in the future
    const pickupDate = new Date(data.pickup_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (pickupDate < today) {
      toast.error('Pickup date must be in the future');
      return;
    }
    
    console.log('Form data before submission:', data);
    
    // Additional validation check
    if (!sheltersData?.shelters?.length) {
      toast.error('No shelters available. Please try again later.');
      return;
    }
    
    // Check if selected shelter exists
    const selectedShelter = sheltersData.shelters.find(s => s.id === Number(data.shelter_id));
    if (!selectedShelter) {
      toast.error('Please select a valid shelter from the list.');
      return;
    }
    
    console.log('Selected shelter:', selectedShelter);
    
    // Reset any previous error state
    donationMutation.reset();
    
    // Submit the form
    donationMutation.mutate(data);
  };

  // Manual reset function for stuck states
  const resetSubmission = () => {
    donationMutation.reset();
    toast.info('Submission reset. You can try again.');
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Pet Information</h2>
              <p className="text-gray-600">Tell us about your pet and upload photos</p>
            </div>

            {/* Pet Images Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pet Photos *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                      <span>Upload photos</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 1MB each (max 3 photos)</p>
                  <p className="text-xs text-red-500 mt-1">⚠️ Large images may cause upload errors. Please resize images before uploading.</p>
                </div>
              </div>
              
              {/* Image Previews */}
              {imagePreview.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                  {imagePreview.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Pet Name *</label>
                <input
                  {...register('pet_name')}
                  type="text"
                  className={`input ${errors.pet_name ? 'input-error' : ''}`}
                  placeholder="Enter your pet's name"
                />
                {errors.pet_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.pet_name.message}</p>
                )}
              </div>

              <div>
                <label className="label">Breed *</label>
                <input
                  {...register('pet_breed')}
                  type="text"
                  className={`input ${errors.pet_breed ? 'input-error' : ''}`}
                  placeholder="e.g., Golden Retriever, Persian Cat"
                />
                {errors.pet_breed && (
                  <p className="mt-1 text-sm text-red-600">{errors.pet_breed.message}</p>
                )}
              </div>

              <div>
                <label className="label">Age (years) *</label>
                <input
                  {...register('pet_age', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  max="30"
                  className={`input ${errors.pet_age ? 'input-error' : ''}`}
                  placeholder="Pet's age in years"
                />
                {errors.pet_age && (
                  <p className="mt-1 text-sm text-red-600">{errors.pet_age.message}</p>
                )}
              </div>

              <div>
                <label className="label">Gender *</label>
                <select
                  {...register('pet_gender')}
                  className={`input ${errors.pet_gender ? 'input-error' : ''}`}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                {errors.pet_gender && (
                  <p className="mt-1 text-sm text-red-600">{errors.pet_gender.message}</p>
                )}
              </div>

              <div>
                <label className="label">Size *</label>
                <select
                  {...register('pet_size')}
                  className={`input ${errors.pet_size ? 'input-error' : ''}`}
                >
                  <option value="">Select size</option>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
                {errors.pet_size && (
                  <p className="mt-1 text-sm text-red-600">{errors.pet_size.message}</p>
                )}
              </div>

              <div>
                <label className="label">Color *</label>
                <input
                  {...register('pet_color')}
                  type="text"
                  className={`input ${errors.pet_color ? 'input-error' : ''}`}
                  placeholder="Pet's color/markings"
                />
                {errors.pet_color && (
                  <p className="mt-1 text-sm text-red-600">{errors.pet_color.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="label">Description *</label>
              <textarea
                {...register('pet_description')}
                rows={4}
                className={`input ${errors.pet_description ? 'input-error' : ''}`}
                placeholder="Describe your pet's personality, habits, and any special characteristics..."
              />
              {errors.pet_description && (
                <p className="mt-1 text-sm text-red-600">{errors.pet_description.message}</p>
              )}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Health & Behavior</h2>
              <p className="text-gray-600">Information about your pet's health and behavior</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Health Status *</label>
                <select
                  {...register('health_status')}
                  className={`input ${errors.health_status ? 'input-error' : ''}`}
                >
                  <option value="">Select health status</option>
                  <option value="healthy">Healthy</option>
                  <option value="needs_care">Needs Care</option>
                  <option value="recovering">Recovering</option>
                </select>
                {errors.health_status && (
                  <p className="mt-1 text-sm text-red-600">{errors.health_status.message}</p>
                )}
              </div>

              <div>
                <label className="label">Energy Level *</label>
                <select
                  {...register('energy_level')}
                  className={`input ${errors.energy_level ? 'input-error' : ''}`}
                >
                  <option value="">Select energy level</option>
                  <option value="low">Low Energy</option>
                  <option value="medium">Medium Energy</option>
                  <option value="high">High Energy</option>
                </select>
                {errors.energy_level && (
                  <p className="mt-1 text-sm text-red-600">{errors.energy_level.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  {...register('vaccination_status')}
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-3 text-sm text-gray-700">
                  Pet is up to date with vaccinations
                </label>
              </div>

              <div className="flex items-center">
                <input
                  {...register('spayed_neutered')}
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-3 text-sm text-gray-700">
                  Pet is spayed/neutered
                </label>
              </div>

              <div className="flex items-center">
                <input
                  {...register('good_with_kids')}
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-3 text-sm text-gray-700">
                  Good with children
                </label>
              </div>

              <div className="flex items-center">
                <input
                  {...register('good_with_pets')}
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-3 text-sm text-gray-700">
                  Good with other pets
                </label>
              </div>
            </div>

            <div>
              <label className="label">Pet Background *</label>
              <textarea
                {...register('pet_background')}
                rows={4}
                className={`input ${errors.pet_background ? 'input-error' : ''}`}
                placeholder="Tell us about your pet's history, training, and any behavioral notes..."
              />
              {errors.pet_background && (
                <p className="mt-1 text-sm text-red-600">{errors.pet_background.message}</p>
              )}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Donation Details</h2>
              <p className="text-gray-600">Your information and donation preferences</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Your Name *</label>
                <input
                  {...register('donor_name')}
                  type="text"
                  className={`input ${errors.donor_name ? 'input-error' : ''}`}
                  placeholder="Your full name"
                />
                {errors.donor_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.donor_name.message}</p>
                )}
              </div>

              <div>
                <label className="label">Your Email *</label>
                <input
                  {...register('donor_email')}
                  type="email"
                  className={`input ${errors.donor_email ? 'input-error' : ''}`}
                  placeholder="your.email@example.com"
                />
                {errors.donor_email && (
                  <p className="mt-1 text-sm text-red-600">{errors.donor_email.message}</p>
                )}
              </div>

              <div>
                <label className="label">Your Phone *</label>
                <input
                  {...register('donor_phone')}
                  type="tel"
                  className={`input ${errors.donor_phone ? 'input-error' : ''}`}
                  placeholder="Your phone number"
                />
                {errors.donor_phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.donor_phone.message}</p>
                )}
              </div>

              <div>
                <label className="label">Preferred Pickup Date *</label>
                <input
                  {...register('pickup_date')}
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className={`input ${errors.pickup_date ? 'input-error' : ''}`}
                />
                {errors.pickup_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.pickup_date.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="label">Select Shelter *</label>
              <select
                {...register('shelter_id', { valueAsNumber: true })}
                className={`input ${errors.shelter_id ? 'input-error' : ''}`}
                disabled={sheltersLoading}
              >
                <option value="">
                  {sheltersLoading ? 'Loading shelters...' : 'Choose a shelter'}
                </option>
                {sheltersData?.shelters.map((shelter) => (
                  <option key={shelter.id} value={shelter.id}>
                    {shelter.name}
                  </option>
                ))}
              </select>
              {errors.shelter_id && (
                <p className="mt-1 text-sm text-red-600">{errors.shelter_id.message}</p>
              )}
            </div>

            <div>
              <label className="label">Reason for Donation *</label>
              <textarea
                {...register('donation_reason')}
                rows={3}
                className={`input ${errors.donation_reason ? 'input-error' : ''}`}
                placeholder="Please explain why you need to find a new home for your pet..."
              />
              {errors.donation_reason && (
                <p className="mt-1 text-sm text-red-600">{errors.donation_reason.message}</p>
              )}
            </div>

            <div>
              <label className="label">Additional Notes</label>
              <textarea
                {...register('notes')}
                rows={3}
                className="input"
                placeholder="Any additional information or special requests..."
              />
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  // Check if user is logged in (after all hooks)
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h1>
          <p className="text-gray-600 mb-6">You must be logged in to submit a donation request.</p>
          <a href="/login" className="btn-primary">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <GiftIcon className="w-7 h-7 text-white" />
              </div>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Donate Your Pet
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Help us find a loving new home for your pet through our trusted shelter network
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step <= currentStep 
                    ? 'bg-primary-600 border-primary-600 text-white' 
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {step < currentStep ? (
                    <CheckCircleIcon className="w-6 h-6" />
                  ) : (
                    <span className="text-sm font-medium">{step}</span>
                  )}
                </div>
                {step < totalSteps && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    step < currentStep ? 'bg-primary-600' : 'bg-gray-300'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-center mt-2">
            <div className="grid grid-cols-3 gap-8 text-sm text-gray-600">
              <span className={currentStep >= 1 ? 'text-primary-600 font-medium' : ''}>
                Pet Info
              </span>
              <span className={currentStep >= 2 ? 'text-primary-600 font-medium' : ''}>
                Health & Behavior
              </span>
              <span className={currentStep >= 3 ? 'text-primary-600 font-medium' : ''}>
                Donation Details
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary"
                >
                  Next Step
                </button>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    type="submit"
                    disabled={donationMutation.isLoading}
                    className="btn-primary relative"
                  >
                    {donationMutation.isLoading ? (
                      <>
                        <div className="loading-spinner mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <HeartIcon className="w-5 h-5 mr-2" />
                        Submit Donation Request
                      </>
                    )}
                  </button>
                  
                  {/* Reset button when stuck in loading state */}
                  {donationMutation.isLoading && (
                    <button
                      type="button"
                      onClick={resetSubmission}
                      className="btn-outline text-sm"
                      title="Reset if submission is stuck"
                    >
                      Reset
                    </button>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Quick Debug Panel */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 bg-gray-100 border border-gray-300 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Debug Info (Development Only)</h4>
            <div className="text-sm text-gray-700 space-y-1">
              <div><strong>User:</strong> {user ? `${user.name} (${user.role})` : 'Not logged in'}</div>
              <div><strong>Shelters loaded:</strong> {sheltersData?.shelters?.length || 0}</div>
              <div><strong>Images uploaded:</strong> {images.length}</div>
              <div><strong>Current step:</strong> {currentStep}/{totalSteps}</div>
            </div>
            <button
              onClick={() => {
                console.log('=== DEBUG DUMP ===');
                console.log('User:', user);
                console.log('Shelters:', sheltersData);
                console.log('Images:', images);
                console.log('Form errors:', errors);
                console.log('=== END DEBUG ===');
              }}
              className="mt-2 text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded mr-2"
            >
              Log Debug Info
            </button>
            <button
              onClick={async () => {
                try {
                  console.log('Testing pet creation...');
                  const response = await axios.post('/donations/test-pet');
                  console.log('✅ Test pet creation successful:', response.data);
                  toast.success(`Test pet created with ID: ${response.data.petId}`);
                } catch (error) {
                  console.error('❌ Test pet creation failed:', error.response?.data);
                  toast.error(`Test failed: ${error.response?.data?.error || error.message}`);
                }
              }}
              className="mt-2 text-xs bg-blue-200 hover:bg-blue-300 px-2 py-1 rounded"
            >
              Test Pet Creation
            </button>
          </div>
        )}

        {/* Validation Help */}
        {donationMutation.isError && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start">
              <InformationCircleIcon className="w-6 h-6 text-red-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-medium text-red-900 mb-2">
                  Submission Failed - Common Issues
                </h3>
                <p className="text-red-800 mb-3">
                  Check the browser console (F12) for detailed error messages. Common issues:
                </p>
                <ul className="space-y-1 text-red-800 text-sm">
                  <li>• <strong>Authentication:</strong> Make sure you're logged in</li>
                  <li>• <strong>Shelter Selection:</strong> Choose a shelter from the dropdown</li>
                  <li>• <strong>Pickup Date:</strong> Must be a future date (not today or past)</li>
                  <li>• <strong>Required Fields:</strong> All fields marked with * must be filled</li>
                  <li>• <strong>Images:</strong> Upload at least one pet photo</li>
                  <li>• <strong>Age:</strong> Must be a number between 0-30</li>
                </ul>
                <button
                  onClick={() => donationMutation.reset()}
                  className="mt-3 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
                >
                  Clear Error and Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Debug Info - Show when submission is stuck */}
        {donationMutation.isLoading && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start">
              <InformationCircleIcon className="w-6 h-6 text-yellow-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-medium text-yellow-900 mb-2">
                  Submission in Progress
                </h3>
                <p className="text-yellow-800 mb-3">
                  Your donation request is being processed. If it's taking too long, try these steps:
                </p>
                <ul className="space-y-1 text-yellow-800 text-sm">
                  <li>• Check your internet connection</li>
                  <li>• Ensure you're logged in to your account</li>
                  <li>• Try clicking the "Reset" button and submit again</li>
                  <li>• Refresh the page if the issue persists</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <InformationCircleIcon className="w-6 h-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                What happens after you submit?
              </h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Your request will be reviewed by the selected shelter
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  The shelter will contact you to discuss next steps
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  A pickup or drop-off will be arranged
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Your pet will be listed for adoption with proper care
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationPage;
