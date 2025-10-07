import React, { useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import DocumentUpload from '../../components/DocumentUpload';
import DocumentList from '../../components/DocumentList';
import { 
  DocumentTextIcon,
  FolderIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const DocumentsPage = () => {
  const { user } = useAuthStore();
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState('');

  // Fetch user's pets for document association
  const { data: petsData, isLoading: petsLoading } = useQuery(
    'user-pets',
    async () => {
      const response = await axios.get('/pets/my-pets');
      return response.data;
    },
    {
      enabled: !!user
    }
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h1>
          <p className="text-gray-600 mb-6">You must be logged in to manage documents.</p>
          <a href="/login" className="btn-primary">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  const handleUploadSuccess = (document) => {
    setShowUploadForm(false);
    setSelectedPetId('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                <DocumentTextIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Document Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Upload and manage your pet documents
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              {showUploadForm ? 'Cancel Upload' : 'Upload Document'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Form */}
          <div className="lg:col-span-1">
            {showUploadForm && (
              <div className="mb-8">
                <DocumentUpload
                  petId={selectedPetId || null}
                  onUploadSuccess={handleUploadSuccess}
                />
                
                {/* Pet Selection for Upload */}
                {!petsLoading && petsData?.pets?.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      Associate with Pet (Optional)
                    </label>
                    <select
                      value={selectedPetId}
                      onChange={(e) => setSelectedPetId(e.target.value)}
                      className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="">No specific pet</option>
                      {petsData.pets.map((pet) => (
                        <option key={pet.id} value={pet.id}>
                          {pet.name} - {pet.breed}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-blue-700 mt-1">
                      Link this document to a specific pet for better organization
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FolderIcon className="w-5 h-5 text-gray-600 mr-2" />
                Quick Stats
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Documents</span>
                  <span className="font-medium text-gray-900">-</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Verified</span>
                  <span className="font-medium text-green-600">-</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending Review</span>
                  <span className="font-medium text-yellow-600">-</span>
                </div>
              </div>
            </div>

            {/* Document Types Guide */}
            <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Document Types
              </h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <strong className="text-gray-900">Vaccination Record:</strong>
                  <p className="text-gray-600">Pet vaccination certificates and schedules</p>
                </div>
                <div>
                  <strong className="text-gray-900">Health Certificate:</strong>
                  <p className="text-gray-600">Official health clearance documents</p>
                </div>
                <div>
                  <strong className="text-gray-900">Medical History:</strong>
                  <p className="text-gray-600">Complete medical records and treatment history</p>
                </div>
                <div>
                  <strong className="text-gray-900">Adoption Contract:</strong>
                  <p className="text-gray-600">Signed adoption agreements and contracts</p>
                </div>
                <div>
                  <strong className="text-gray-900">Identification:</strong>
                  <p className="text-gray-600">ID documents, licenses, and registrations</p>
                </div>
              </div>
            </div>
          </div>

          {/* Documents List */}
          <div className="lg:col-span-2">
            <DocumentList showActions={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;
