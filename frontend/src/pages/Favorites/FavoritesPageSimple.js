import React from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { HeartIcon } from '@heroicons/react/24/outline';

const FavoritesPageSimple = () => {
  const { user } = useAuthStore();

  // Simple favorites fetch
  const { data: favoritesData, isLoading, error } = useQuery(
    'favorites',
    async () => {
      console.log('Fetching favorites...');
      const response = await axios.get('/favorites');
      console.log('Favorites response:', response.data);
      return response.data;
    },
    {
      enabled: !!user,
      onError: (error) => {
        console.error('Favorites fetch error:', error);
      }
    }
  );

  console.log('User:', user);
  console.log('Favorites data:', favoritesData);
  console.log('Loading:', isLoading);
  console.log('Error:', error);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <HeartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h1>
          <p className="text-gray-600">You must be logged in to view favorites.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading favorites...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Favorites</h1>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <pre className="text-xs text-gray-500 bg-gray-100 p-4 rounded">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Favorites</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Debug Info</h2>
          <div className="space-y-2 text-sm">
            <p><strong>User ID:</strong> {user?.id}</p>
            <p><strong>User Role:</strong> {user?.role}</p>
            <p><strong>Favorites Count:</strong> {favoritesData?.count || 0}</p>
            <p><strong>Favorites Length:</strong> {favoritesData?.favorites?.length || 0}</p>
          </div>
        </div>

        {favoritesData?.favorites?.length > 0 ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Favorites List</h2>
            <div className="space-y-4">
              {favoritesData.favorites.map((pet, index) => (
                <div key={pet.id || index} className="border-b pb-4 last:border-b-0">
                  <h3 className="font-medium text-gray-900">{pet.name}</h3>
                  <p className="text-gray-600">{pet.breed} • {pet.age} years old</p>
                  <p className="text-sm text-gray-500">Status: {pet.adoption_status}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <HeartIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Favorites Yet</h3>
            <p className="text-gray-600">Start browsing pets to add some favorites!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPageSimple;
