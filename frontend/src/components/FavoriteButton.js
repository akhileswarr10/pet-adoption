import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { 
  HeartIcon as HeartOutline,
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolid,
} from '@heroicons/react/24/solid';

const FavoriteButton = ({ 
  petId, 
  size = 'md', 
  showText = false, 
  className = '',
  onFavoriteChange = null 
}) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isAnimating, setIsAnimating] = useState(false);

  // Check if pet is favorited
  const { data: favoriteStatus, isLoading } = useQuery(
    ['favorite-status', petId],
    async () => {
      const response = await axios.get(`/favorites/check/${petId}`);
      return response.data;
    },
    {
      enabled: !!user && !!petId,
      staleTime: 30000 // Cache for 30 seconds
    }
  );

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation(
    async () => {
      if (favoriteStatus?.isFavorited) {
        await axios.delete(`/favorites/${petId}`);
        return { action: 'removed' };
      } else {
        const response = await axios.post(`/favorites/${petId}`);
        return { action: 'added', data: response.data };
      }
    },
    {
      onSuccess: (result) => {
        // Trigger animation
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 600);

        // Show toast
        if (result.action === 'added') {
          toast.success('Added to favorites! ❤️');
        } else {
          toast.success('Removed from favorites');
        }

        // Invalidate queries
        queryClient.invalidateQueries(['favorite-status', petId]);
        queryClient.invalidateQueries(['favorites']);
        queryClient.invalidateQueries(['favorites-stats']);

        // Call callback if provided
        if (onFavoriteChange) {
          onFavoriteChange(result.action === 'added', result.data?.favorite);
        }
      },
      onError: (error) => {
        console.error('Toggle favorite error:', error);
        const message = error.response?.data?.error || 'Failed to update favorites';
        toast.error(message);
      }
    }
  );

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please log in to add favorites');
      return;
    }

    toggleFavoriteMutation.mutate();
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      icon: 'w-4 h-4',
      button: 'p-1',
      text: 'text-xs'
    },
    md: {
      icon: 'w-5 h-5',
      button: 'p-2',
      text: 'text-sm'
    },
    lg: {
      icon: 'w-6 h-6',
      button: 'p-3',
      text: 'text-base'
    }
  };

  const config = sizeConfig[size] || sizeConfig.md;
  const isFavorited = favoriteStatus?.isFavorited || false;
  const isDisabled = !user || isLoading || toggleFavoriteMutation.isLoading;

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center rounded-full transition-all duration-200
        ${config.button}
        ${isFavorited 
          ? 'text-red-600 bg-red-50 hover:bg-red-100' 
          : 'text-gray-400 bg-gray-50 hover:bg-gray-100 hover:text-red-500'
        }
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}
        ${isAnimating ? 'animate-pulse scale-125' : ''}
        ${className}
      `}
      title={
        !user 
          ? 'Login to add favorites' 
          : isFavorited 
            ? 'Remove from favorites' 
            : 'Add to favorites'
      }
    >
      {/* Heart Icon */}
      <div className={`relative ${isAnimating ? 'animate-bounce' : ''}`}>
        {isFavorited ? (
          <HeartSolid className={`${config.icon} text-red-600`} />
        ) : (
          <HeartOutline className={config.icon} />
        )}
        
        {/* Loading spinner overlay */}
        {toggleFavoriteMutation.isLoading && (
          <div className={`absolute inset-0 flex items-center justify-center`}>
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
          </div>
        )}
      </div>

      {/* Optional text */}
      {showText && (
        <span className={`ml-1 ${config.text} font-medium`}>
          {isLoading 
            ? '...' 
            : isFavorited 
              ? 'Favorited' 
              : 'Favorite'
          }
        </span>
      )}
    </button>
  );
};

export default FavoriteButton;
