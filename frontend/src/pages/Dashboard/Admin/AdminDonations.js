import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import ImageGallery from '../../../components/ImageGallery/ImageGallery';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  GiftIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const AdminDonations = () => {
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'accept' or 'reject'
  const [adminNotes, setAdminNotes] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const queryClient = useQueryClient();

  // Fetch donation requests with real-time updates
  const { data: donationsData, isLoading } = useQuery(
    ['admin-donations', selectedStatus],
    async () => {
      const response = await axios.get(`/donations?status=${selectedStatus}`);
      return response.data;
    },
    {
      refetchInterval: selectedStatus === 'pending' ? 3000 : 10000, // Faster refresh for pending requests
      refetchIntervalInBackground: true,
      staleTime: 0 // Always fetch fresh data
    }
  );

  // Update donation status mutation
  const updateDonationMutation = useMutation(
    async ({ id, status, admin_notes, pickup_date }) => {
      const response = await axios.put(`/donations/${id}`, {
        status,
        admin_notes,
        pickup_date
      });
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Pet submission updated successfully!');
        // Invalidate multiple queries to update all related data
        queryClient.invalidateQueries(['admin-donations']);
        queryClient.invalidateQueries(['admin-stats']);
        queryClient.invalidateQueries(['admin-pending-requests']);
        setShowModal(false);
        setSelectedDonation(null);
        setAdminNotes('');
        setPickupDate('');
      },
      onError: (error) => {
        const message = error.response?.data?.error || 'Failed to update pet submission';
        toast.error(message);
      }
    }
  );

  const handleAccept = (donation) => {
    setSelectedDonation(donation);
    setModalType('accept');
    setPickupDate(donation.pickup_date ? donation.pickup_date.split('T')[0] : '');
    setShowModal(true);
  };

  const handleReject = (donation) => {
    setSelectedDonation(donation);
    setModalType('reject');
    setShowModal(true);
  };

  const confirmAction = () => {
    if (modalType === 'accept') {
      if (!pickupDate) {
        toast.error('Please select an approval date');
        return;
      }
      updateDonationMutation.mutate({
        id: selectedDonation.id,
        status: 'accepted',
        admin_notes: adminNotes || 'Pet submission approved by admin',
        pickup_date: pickupDate
      });
    } else if (modalType === 'reject') {
      if (!adminNotes.trim()) {
        toast.error('Please provide a reason for rejection');
        return;
      }
      updateDonationMutation.mutate({
        id: selectedDonation.id,
        status: 'rejected',
        admin_notes: adminNotes
      });
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return ClockIcon;
      case 'accepted':
      case 'completed':
        return CheckCircleIcon;
      case 'rejected':
        return XCircleIcon;
      default:
        return ClockIcon;
    }
  };

  const donations = donationsData?.donations || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pet Donations & Submissions</h1>
          <p className="text-gray-600">Review pet donations from users and submissions from shelters</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-500">Auto-refreshing</span>
          {donationsData?.pagination?.totalItems && (
            <span className="bg-primary-100 text-primary-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {donationsData.pagination.totalItems} {selectedStatus}
            </span>
          )}
        </div>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex space-x-4">
          {['pending', 'accepted', 'rejected', 'completed'].map((status) => (
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

      {/* Donation Requests List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading donations...</p>
          </div>
        ) : donations.length === 0 ? (
          <div className="p-8 text-center">
            <GiftIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {selectedStatus} donations
            </h3>
            <p className="text-gray-600">
              There are currently no donations with {selectedStatus} status.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {donations.map((donation) => {
              const StatusIcon = getStatusIcon(donation.status);
              return (
                <motion.div
                  key={donation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {/* Pet Image Gallery */}
                      <div className="w-20">
                        <ImageGallery 
                          images={donation.pet?.images}
                          petName={donation.pet?.name}
                          maxHeight="h-16"
                          showThumbnails={false}
                        />
                      </div>
                      
                      {/* Request Details */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {donation.pet?.name}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(donation.status)}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {donation.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-2">
                            <UserIcon className="w-4 h-4" />
                            <span>
                              <strong>Donor:</strong> {donation.donor_name}
                            </span>
                          </div>
                          <div>
                            <strong>Email:</strong> {donation.donor_email}
                          </div>
                          <div>
                            <strong>Phone:</strong> {donation.donor_phone}
                          </div>
                          <div className="flex items-center space-x-2">
                            <CalendarIcon className="w-4 h-4" />
                            <span>
                              <strong>Requested Pickup:</strong> {new Date(donation.pickup_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Pet Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                          <div>
                            <strong className="text-gray-700">Breed:</strong>
                            <p className="text-gray-600">{donation.pet?.breed}</p>
                          </div>
                          <div>
                            <strong className="text-gray-700">Age:</strong>
                            <p className="text-gray-600">{donation.pet?.age} years</p>
                          </div>
                          <div>
                            <strong className="text-gray-700">Gender:</strong>
                            <p className="text-gray-600 capitalize">{donation.pet?.gender}</p>
                          </div>
                          <div>
                            <strong className="text-gray-700">Size:</strong>
                            <p className="text-gray-600 capitalize">{donation.pet?.size}</p>
                          </div>
                        </div>

                        {/* Donation Reason */}
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>Reason for Donation:</strong>
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {donation.donation_reason}
                          </p>
                        </div>

                        {/* Pet Background */}
                        <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>Pet Background:</strong>
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {donation.pet_background}
                          </p>
                        </div>

                        {/* Additional Notes */}
                        {donation.notes && (
                          <div className="mb-3 p-3 bg-yellow-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <strong>Additional Notes:</strong>
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {donation.notes}
                            </p>
                          </div>
                        )}

                        {/* Admin Notes */}
                        {donation.admin_notes && (
                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-800">
                              <strong>Admin Notes:</strong> {donation.admin_notes}
                            </p>
                          </div>
                        )}

                        {/* Shelter Assignment */}
                        <div className="mt-3 text-sm">
                          <strong className="text-gray-700">Assigned Shelter:</strong>
                          <span className="text-gray-600 ml-2">
                            {donation.shelter?.name || 'Not assigned'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {donation.status === 'pending' && (
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleAccept(donation)}
                          disabled={updateDonationMutation.isLoading}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                          <CheckCircleIcon className="w-4 h-4 mr-1" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(donation)}
                          disabled={updateDonationMutation.isLoading}
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

      {/* Action Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {modalType === 'accept' ? 'Approve Pet Submission' : 'Reject Pet Submission'}
            </h3>
            
            {modalType === 'accept' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approval Date *
                  </label>
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notes (Optional)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Any additional notes or instructions..."
                  />
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Please provide a reason for rejecting this pet submission.
                </p>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter rejection reason..."
                />
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedDonation(null);
                  setAdminNotes('');
                  setPickupDate('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                disabled={updateDonationMutation.isLoading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 ${
                  modalType === 'accept'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {updateDonationMutation.isLoading 
                  ? (modalType === 'accept' ? 'Approving...' : 'Rejecting...')
                  : (modalType === 'accept' ? 'Approve Submission' : 'Reject Submission')
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDonations;
