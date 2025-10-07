import { useEffect, useRef } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const useRealTimeNotifications = () => {
  const { user } = useAuthStore();
  const previousCountsRef = useRef({});

  // Only run for admin users
  const { data: notificationData } = useQuery(
    'real-time-notifications',
    async () => {
      if (!user || user.role !== 'admin') return null;
      
      const [adoptionsRes, donationsRes] = await Promise.all([
        axios.get('/adoptions?status=pending&limit=1'),
        axios.get('/donations?status=pending&limit=1')
      ]);
      
      return {
        pendingAdoptions: adoptionsRes.data.pagination?.totalItems || 0,
        pendingDonations: donationsRes.data.pagination?.totalItems || 0,
        latestAdoption: adoptionsRes.data.adoptions?.[0],
        latestDonation: donationsRes.data.donations?.[0]
      };
    },
    {
      enabled: user?.role === 'admin',
      refetchInterval: 5000, // Check every 5 seconds
      refetchIntervalInBackground: true,
      staleTime: 0
    }
  );

  useEffect(() => {
    if (!notificationData || !user || user.role !== 'admin') return;

    const { pendingAdoptions, pendingDonations, latestAdoption, latestDonation } = notificationData;
    const previousCounts = previousCountsRef.current;

    // Check for new adoption requests
    if (previousCounts.pendingAdoptions !== undefined && 
        pendingAdoptions > previousCounts.pendingAdoptions) {
      
      const newCount = pendingAdoptions - previousCounts.pendingAdoptions;
      toast.success(
        `🐾 ${newCount} new adoption request${newCount > 1 ? 's' : ''}!${
          latestAdoption ? ` Latest: ${latestAdoption.pet?.name} by ${latestAdoption.adopter?.name}` : ''
        }`,
        {
          duration: 6000,
          icon: '💝',
          style: {
            background: '#f0f9ff',
            border: '1px solid #0ea5e9',
            color: '#0c4a6e'
          }
        }
      );
    }

    // Check for new donation requests
    if (previousCounts.pendingDonations !== undefined && 
        pendingDonations > previousCounts.pendingDonations) {
      
      const newCount = pendingDonations - previousCounts.pendingDonations;
      toast.success(
        `🎁 ${newCount} new pet donation${newCount > 1 ? 's' : ''}!${
          latestDonation ? ` Latest: ${latestDonation.pet?.name} from ${latestDonation.donor_name}` : ''
        }`,
        {
          duration: 6000,
          icon: '🏠',
          style: {
            background: '#f0fdf4',
            border: '1px solid #22c55e',
            color: '#14532d'
          }
        }
      );
    }

    // Update previous counts
    previousCountsRef.current = {
      pendingAdoptions,
      pendingDonations
    };
  }, [notificationData, user]);

  return notificationData;
};

export default useRealTimeNotifications;
