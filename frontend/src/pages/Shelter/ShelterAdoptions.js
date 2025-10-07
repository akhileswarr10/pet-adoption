import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { getPetMainImage } from '../../utils/imageUtils';
import {
  HeartIcon,
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
  FunnelIcon,
  DocumentTextIcon
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

const ShelterAdoptions = () => {
  const { user } = useAuthStore();
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [selectedAdoption, setSelectedAdoption] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const queryClient = useQueryClient();

  // Fetch adoptions for shelter's pets
  const { data: adoptionsData, isLoading } = useQuery(
    ['shelter-adoptions', user?.id, selectedStatus],
    async () => {
      const response = await axios.get('/adoptions', {
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

  // Update adoption status
  const updateAdoptionMutation = useMutation(
    async ({ adoptionId, status, notes }) => {
      const response = await axios.put(`/adoptions/${adoptionId}`, {
        status,
        admin_notes: notes
      });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['shelter-adoptions']);
        toast.success('Adoption status updated successfully!');
        setShowModal(false);
        setSelectedAdoption(null);
        setAdminNotes('');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update adoption');
      }
    }
  );

  const handleStatusUpdate = (adoption, type) => {
    setSelectedAdoption(adoption);
    setModalType(type);
    setShowModal(true);
  };

  const confirmStatusUpdate = () => {
    if (!selectedAdoption) return;

    const status = modalType === 'approve' ? 'approved' : 'rejected';
    updateAdoptionMutation.mutate({
      adoptionId: selectedAdoption.id,
      status,
      notes: adminNotes
    });
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending Review', color: 'from-amber-500 to-orange-500', icon: ClockIcon },
    { value: 'approved', label: 'Approved', color: 'from-emerald-500 to-teal-500', icon: CheckCircleIcon },
    { value: 'rejected', label: 'Rejected', color: 'from-red-500 to-rose-500', icon: XCircleIcon },
    { value: 'completed', label: 'Completed', color: 'from-blue-500 to-indigo-500', icon: HeartIcon }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30',
      approved: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30',
      rejected: 'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-300 border-red-500/30',
      completed: 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-300 border-blue-500/30'
    };
    return statusConfig[status] || statusConfig.pending;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-pink-600/20 to-rose-600/20 rounded-full blur-3xl animate-pulse"></div>
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
          <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-full mb-6 backdrop-blur-sm border border-pink-500/20">
            <HeartIcon className="w-8 h-8 text-pink-400 animate-pulse" />
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-pink-400 via-rose-400 to-red-400 bg-clip-text text-transparent mb-4">
            Adoption Management
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Review and manage adoption applications for your pets
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
              <FunnelIcon className="w-6 h-6 text-pink-400" />
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

        {/* Adoptions List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 to-rose-600/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {statusOptions.find(opt => opt.value === selectedStatus)?.label} Adoptions
                </h3>
                <p className="text-gray-400">
                  {adoptionsData?.adoptions?.length || 0} adoption applications
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading adoptions...</p>
              </div>
            ) : adoptionsData?.adoptions?.length > 0 ? (
              <div className="space-y-6">
                {adoptionsData.adoptions.map((adoption) => (
                  <motion.div
                    key={adoption.id}
                    variants={itemVariants}
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:bg-gray-700/50 transition-all duration-300"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex items-start space-x-6">
                        <img
                          src={getPetMainImage(adoption.pet?.images)}
                          alt={adoption.pet?.name}
                          className="w-24 h-24 object-cover rounded-xl border-2 border-pink-500/30"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-xl font-semibold text-white">
                              {adoption.pet?.name}
                            </h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(adoption.status)}`}>
                              {adoption.status}
                            </span>
                          </div>
                          <p className="text-gray-400 mb-3">
                            {adoption.pet?.breed} • {adoption.pet?.age} years old • {adoption.pet?.gender}
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center space-x-2 text-gray-300">
                              <UserIcon className="w-4 h-4 text-pink-400" />
                              <span>{adoption.adopter?.name}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-300">
                              <PhoneIcon className="w-4 h-4 text-pink-400" />
                              <span>{adoption.adopter?.phone}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-300">
                              <EnvelopeIcon className="w-4 h-4 text-pink-400" />
                              <span>{adoption.adopter?.email}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-300">
                              <CalendarIcon className="w-4 h-4 text-pink-400" />
                              <span>Applied: {new Date(adoption.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {adoption.message && (
                            <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
                              <div className="flex items-center space-x-2 mb-2">
                                <ChatBubbleLeftIcon className="w-4 h-4 text-pink-400" />
                                <span className="text-sm font-medium text-gray-300">Application Message:</span>
                              </div>
                              <p className="text-sm text-gray-400">{adoption.message}</p>
                            </div>
                          )}

                          {adoption.experience && (
                            <div className="mt-3 p-3 bg-gray-700/50 rounded-lg">
                              <div className="flex items-center space-x-2 mb-2">
                                <DocumentTextIcon className="w-4 h-4 text-pink-400" />
                                <span className="text-sm font-medium text-gray-300">Pet Experience:</span>
                              </div>
                              <p className="text-sm text-gray-400">{adoption.experience}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-3 lg:w-48">
                        {selectedStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(adoption, 'approve')}
                              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-xl font-medium hover:from-emerald-400 hover:to-teal-400 transition-all duration-300 flex items-center justify-center space-x-2"
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(adoption, 'reject')}
                              className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-2 rounded-xl font-medium hover:from-red-400 hover:to-rose-400 transition-all duration-300 flex items-center justify-center space-x-2"
                            >
                              <XCircleIcon className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setSelectedAdoption(adoption);
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
                <HeartIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl font-medium text-white mb-2">No {selectedStatus} adoptions</p>
                <p className="text-gray-400">
                  {selectedStatus === 'pending' 
                    ? 'No pending adoption applications at the moment'
                    : `No ${selectedStatus} adoption applications found`
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
                {modalType === 'approve' ? 'Approve Adoption' : 
                 modalType === 'reject' ? 'Reject Adoption' : 'Adoption Details'}
              </h3>
              
              {modalType !== 'view' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                      rows="3"
                      placeholder="Add any notes or instructions..."
                    />
                  </div>
                </div>
              )}

              {modalType === 'view' && selectedAdoption && (
                <div className="space-y-4">
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">{selectedAdoption.pet?.name}</h4>
                    <p className="text-gray-400 text-sm">{selectedAdoption.pet?.breed} • {selectedAdoption.pet?.age} years old</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-1">Adopter Information:</p>
                    <p className="text-white">{selectedAdoption.adopter?.name}</p>
                    <p className="text-gray-400 text-sm">{selectedAdoption.adopter?.email}</p>
                    <p className="text-gray-400 text-sm">{selectedAdoption.adopter?.phone}</p>
                  </div>
                  {selectedAdoption.message && (
                    <div>
                      <p className="text-sm font-medium text-gray-300 mb-1">Message:</p>
                      <p className="text-gray-400 text-sm">{selectedAdoption.message}</p>
                    </div>
                  )}
                  {selectedAdoption.experience && (
                    <div>
                      <p className="text-sm font-medium text-gray-300 mb-1">Pet Experience:</p>
                      <p className="text-gray-400 text-sm">{selectedAdoption.experience}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex space-x-3 mt-6">
                {modalType !== 'view' ? (
                  <>
                    <button
                      onClick={confirmStatusUpdate}
                      disabled={updateAdoptionMutation.isLoading}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        modalType === 'approve'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400'
                          : 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400'
                      } text-white disabled:opacity-50`}
                    >
                      {updateAdoptionMutation.isLoading ? 'Processing...' : 'Confirm'}
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
                    className="w-full py-2 px-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-medium hover:from-pink-400 hover:to-rose-400 transition-colors"
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

export default ShelterAdoptions;
