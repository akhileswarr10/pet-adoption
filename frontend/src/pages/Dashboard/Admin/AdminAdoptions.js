import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getPetMainImage } from '../../../utils/imageUtils';
import { 
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ClockIcon,
  UserIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const AdminAdoptions = () => {
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [selectedAdoption, setSelectedAdoption] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const queryClient = useQueryClient();

  // Fetch adoption requests with real-time updates
  const { data: adoptionsData, isLoading } = useQuery(
    ['admin-adoptions', selectedStatus],
    async () => {
      const response = await axios.get(`/adoptions?status=${selectedStatus}`);
      return response.data;
    },
    {
      refetchInterval: selectedStatus === 'pending' ? 3000 : 10000, // Faster refresh for pending requests
      refetchIntervalInBackground: true,
      staleTime: 0 // Always fetch fresh data
    }
  );

  // Update adoption status mutation
  const updateAdoptionMutation = useMutation(
    async ({ id, status, rejection_reason, admin_notes }) => {
      const response = await axios.put(`/adoptions/${id}`, {
        status,
        rejection_reason,
        admin_notes
      });
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Adoption request updated successfully!');
        // Invalidate multiple queries to update all related data
        queryClient.invalidateQueries(['admin-adoptions']);
        queryClient.invalidateQueries(['admin-stats']);
        queryClient.invalidateQueries(['admin-pending-requests']);
        setShowModal(false);
        setSelectedAdoption(null);
        setRejectionReason('');
      },
      onError: (error) => {
        const message = error.response?.data?.error || 'Failed to update adoption request';
        toast.error(message);
      }
    }
  );

  const handleApprove = (adoption) => {
    updateAdoptionMutation.mutate({
      id: adoption.id,
      status: 'approved',
      admin_notes: 'Application approved by admin'
    });
  };

  const handleReject = (adoption) => {
    setSelectedAdoption(adoption);
    setShowModal(true);
  };

  const confirmReject = () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    updateAdoptionMutation.mutate({
      id: selectedAdoption.id,
      status: 'rejected',
      rejection_reason: rejectionReason,
      admin_notes: `Application rejected: ${rejectionReason}`
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
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

  const adoptions = adoptionsData?.adoptions || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Adoption Requests</h1>
          <p className="text-gray-600">Review and manage pet adoption applications</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-500">Auto-refreshing</span>
          {adoptionsData?.pagination?.totalItems && (
            <span className="bg-primary-100 text-primary-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {adoptionsData.pagination.totalItems} {selectedStatus}
            </span>
          )}
        </div>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex space-x-4">
          {['pending', 'approved', 'rejected', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Adoption Requests List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading adoption requests...</p>
          </div>
        ) : adoptions.length === 0 ? (
          <div className="p-8 text-center">
            <HeartIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {selectedStatus} adoption requests
            </h3>
            <p className="text-gray-600">
              There are currently no adoption requests with {selectedStatus} status.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {adoptions.map((adoption) => {
              const StatusIcon = getStatusIcon(adoption.status);
              return (
                <motion.div
                  key={adoption.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {/* Pet Image */}
                      <img
                        src={getPetMainImage(adoption.pet?.images)}
                        alt={adoption.pet?.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      
                      {/* Request Details */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {adoption.pet?.name}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(adoption.status)}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {adoption.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <UserIcon className="w-4 h-4" />
                            <span>
                              <strong>Applicant:</strong> {adoption.adopter?.name}
                            </span>
                          </div>
                          <div>
                            <strong>Email:</strong> {adoption.adopter?.email}
                          </div>
                          <div>
                            <strong>Phone:</strong> {adoption.contact_phone}
                          </div>
                          <div>
                            <strong>Applied:</strong> {new Date(adoption.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Application Message */}
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>Why they want to adopt:</strong>
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {adoption.application_message}
                          </p>
                        </div>

                        {/* Additional Details */}
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <strong className="text-gray-700">Experience:</strong>
                            <p className="text-gray-600">{adoption.experience_with_pets}</p>
                          </div>
                          <div>
                            <strong className="text-gray-700">Living Situation:</strong>
                            <p className="text-gray-600">{adoption.living_situation}</p>
                          </div>
                          <div>
                            <strong className="text-gray-700">Other Pets:</strong>
                            <p className="text-gray-600">{adoption.other_pets}</p>
                          </div>
                          <div>
                            <strong className="text-gray-700">Address:</strong>
                            <p className="text-gray-600">{adoption.contact_address}</p>
                          </div>
                        </div>

                        {/* Rejection Reason */}
                        {adoption.status === 'rejected' && adoption.rejection_reason && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">
                              <strong>Rejection Reason:</strong> {adoption.rejection_reason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {adoption.status === 'pending' && (
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleApprove(adoption)}
                          disabled={updateAdoptionMutation.isLoading}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                          <CheckCircleIcon className="w-4 h-4 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(adoption)}
                          disabled={updateAdoptionMutation.isLoading}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                        >
                          <XCircleIcon className="w-4 h-4 mr-1" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Reject Adoption Request
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting this adoption request. This will be sent to the applicant.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter rejection reason..."
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedAdoption(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={updateAdoptionMutation.isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
              >
                {updateAdoptionMutation.isLoading ? 'Rejecting...' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAdoptions;
