import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { getPetMainImage } from '../../utils/imageUtils';
import {
  GiftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  SparklesIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.6, 
      ease: [0.25, 0.46, 0.45, 0.94] 
    } 
  }
};

const ShelterDonations = () => {
  const { user } = useAuthStore();
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const queryClient = useQueryClient();

  // Fetch donations
  const { data: donationsData, isLoading } = useQuery(
    ['shelter-donations', user?.id, selectedStatus],
    async () => {
      const response = await axios.get('/donations', {
        params: { 
          shelter_id: user.id,
          status: selectedStatus 
        }
      });
      return response.data;
    },
    {
      enabled: !!user?.id
    }
  );

  // Update donation status
  const updateDonationMutation = useMutation(
    async ({ donationId, status, notes, pickup_date }) => {
      const response = await axios.put(`/donations/${donationId}`, {
        status,
        admin_notes: notes,
        pickup_date
      });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['shelter-donations']);
        toast.success('Donation status updated successfully!');
        setShowModal(false);
        setSelectedDonation(null);
        setAdminNotes('');
        setPickupDate('');
      },
      onError: (error) => {
        console.error('Donation update error:', error);
        console.error('Error response:', error.response?.data);
        const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to update donation';
        toast.error(`Error: ${errorMessage}`);
      }
    }
  );

  const handleStatusUpdate = (donation, type) => {
    setSelectedDonation(donation);
    setModalType(type);
    setShowModal(true);
  };

  const confirmStatusUpdate = () => {
    if (!selectedDonation) return;

    const status = modalType === 'accept' ? 'accepted' : 'rejected';
    console.log('Updating donation:', {
      donationId: selectedDonation.id,
      status,
      modalType,
      notes: adminNotes,
      pickup_date: modalType === 'accept' ? pickupDate : null
    });
    
    const payload = {
      donationId: selectedDonation.id,
      status,
      notes: adminNotes
    };
    
    // Only include pickup_date for acceptance and if it has a value
    if (modalType === 'accept' && pickupDate) {
      payload.pickup_date = pickupDate;
    }
    
    updateDonationMutation.mutate(payload);
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending Review', color: 'from-amber-500 to-orange-500', icon: ClockIcon },
    { value: 'accepted', label: 'Accepted', color: 'from-emerald-500 to-teal-500', icon: CheckCircleIcon },
    { value: 'rejected', label: 'Rejected', color: 'from-red-500 to-rose-500', icon: XCircleIcon },
    { value: 'completed', label: 'Completed', color: 'from-blue-500 to-indigo-500', icon: GiftIcon }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30',
      accepted: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30',
      rejected: 'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-300 border-red-500/30',
      completed: 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-300 border-blue-500/30'
    };
    return statusConfig[status] || statusConfig.pending;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 space-y-8 p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full mb-6 backdrop-blur-sm border border-purple-500/20">
            <GiftIcon className="w-8 h-8 text-purple-400 animate-pulse" />
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent mb-4">
            Donation Management
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Review and manage pet donation requests to your shelter
          </p>
        </motion.div>

        {/* Status Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gray-800/40 to-gray-700/40 rounded-2xl blur-xl"></div>
          <div className="relative bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center space-x-4 mb-6">
              <FunnelIcon className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-bold text-white">Filter by Status</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statusOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedStatus === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setSelectedStatus(option.value)}
                    className={`p-4 rounded-xl border transition-all duration-300 ${
                      isSelected
                        ? `bg-gradient-to-r ${option.color}/20 border-gray-600/50 shadow-lg`
                        : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50'
                    }`}
                  >
                    <div className={`w-8 h-8 bg-gradient-to-r ${option.color} rounded-lg flex items-center justify-center mb-3 mx-auto`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                      {option.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Donations List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {statusOptions.find(opt => opt.value === selectedStatus)?.label} Donations
                </h3>
                <p className="text-gray-400">
                  {donationsData?.donations?.length || 0} donation requests
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading donations...</p>
              </div>
            ) : donationsData?.donations?.length > 0 ? (
              <div className="space-y-6">
                {donationsData.donations.map((donation) => (
                  <motion.div
                    key={donation.id}
                    variants={itemVariants}
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:bg-gray-700/50 transition-all duration-300"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex items-start space-x-6">
                        <img
                          src={getPetMainImage(donation.pet?.images)}
                          alt={donation.pet?.name}
                          className="w-24 h-24 object-cover rounded-xl border-2 border-purple-500/30"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-xl font-semibold text-white">
                              {donation.pet?.name}
                            </h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(donation.status)}`}>
                              {donation.status}
                            </span>
                          </div>
                          <p className="text-gray-400 mb-3">
                            {donation.pet?.breed} • {donation.pet?.age} years old • {donation.pet?.gender}
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center space-x-2 text-gray-300">
                              <UserIcon className="w-4 h-4 text-purple-400" />
                              <span>{donation.donor_name}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-300">
                              <PhoneIcon className="w-4 h-4 text-purple-400" />
                              <span>{donation.donor_phone}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-300">
                              <EnvelopeIcon className="w-4 h-4 text-purple-400" />
                              <span>{donation.donor_email}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-300">
                              <CalendarIcon className="w-4 h-4 text-purple-400" />
                              <span>Preferred: {new Date(donation.pickup_date).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {donation.reason && (
                            <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
                              <div className="flex items-center space-x-2 mb-2">
                                <ChatBubbleLeftIcon className="w-4 h-4 text-purple-400" />
                                <span className="text-sm font-medium text-gray-300">Reason for Donation:</span>
                              </div>
                              <p className="text-sm text-gray-400">{donation.reason}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-3 lg:w-48">
                        {selectedStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(donation, 'accept')}
                              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-xl font-medium hover:from-emerald-400 hover:to-teal-400 transition-all duration-300 flex items-center justify-center space-x-2"
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                              <span>Accept</span>
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(donation, 'reject')}
                              className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-2 rounded-xl font-medium hover:from-red-400 hover:to-rose-400 transition-all duration-300 flex items-center justify-center space-x-2"
                            >
                              <XCircleIcon className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setSelectedDonation(donation);
                            setShowModal(true);
                            setModalType('view');
                          }}
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-xl font-medium hover:from-blue-400 hover:to-indigo-400 transition-all duration-300 flex items-center justify-center space-x-2"
                        >
                          <EyeIcon className="w-4 h-4" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl border border-gray-700/50">
                <GiftIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl font-medium text-white mb-2">No {selectedStatus} donations</p>
                <p className="text-gray-400">
                  {selectedStatus === 'pending' 
                    ? 'No pending donation requests at the moment'
                    : `No ${selectedStatus} donation requests found`
                  }
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                {modalType === 'accept' ? 'Accept Donation' : 
                 modalType === 'reject' ? 'Reject Donation' : 'Donation Details'}
              </h3>
              
              {modalType !== 'view' && (
                <div className="space-y-4">
                  {modalType === 'accept' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Pickup Date
                      </label>
                      <input
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows="3"
                      placeholder="Add any notes or instructions..."
                    />
                  </div>
                </div>
              )}

              {modalType === 'view' && selectedDonation && (
                <div className="space-y-4">
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">{selectedDonation.pet?.name}</h4>
                    <p className="text-gray-400 text-sm">{selectedDonation.pet?.breed} • {selectedDonation.pet?.age} years old</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-1">Donor Information:</p>
                    <p className="text-white">{selectedDonation.donor_name}</p>
                    <p className="text-gray-400 text-sm">{selectedDonation.donor_email}</p>
                    <p className="text-gray-400 text-sm">{selectedDonation.donor_phone}</p>
                  </div>
                  {selectedDonation.reason && (
                    <div>
                      <p className="text-sm font-medium text-gray-300 mb-1">Reason:</p>
                      <p className="text-gray-400 text-sm">{selectedDonation.reason}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex space-x-3 mt-6">
                {modalType !== 'view' ? (
                  <>
                    <button
                      onClick={confirmStatusUpdate}
                      disabled={updateDonationMutation.isLoading || (modalType === 'accept' && !pickupDate)}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        modalType === 'accept'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400'
                          : 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400'
                      } text-white disabled:opacity-50`}
                    >
                      {updateDonationMutation.isLoading ? 'Processing...' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-500 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-400 hover:to-pink-400 transition-colors"
                  >
                    Close
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShelterDonations;
