import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  DocumentIcon,
  EyeIcon,
  TrashIcon,
  CheckBadgeIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const DocumentList = ({ petId = null, showActions = true }) => {
  const queryClient = useQueryClient();

  // Fetch documents
  const { data: documentsData, isLoading, error } = useQuery(
    petId ? ['documents', 'pet', petId] : ['documents'],
    async () => {
      const url = petId ? `/documents/pet/${petId}` : '/documents';
      const response = await axios.get(url);
      return response.data;
    }
  );

  // Delete document mutation
  const deleteMutation = useMutation(
    async (documentId) => {
      await axios.delete(`/documents/${documentId}`);
    },
    {
      onSuccess: () => {
        toast.success('Document deleted successfully');
        queryClient.invalidateQueries(['documents']);
        if (petId) {
          queryClient.invalidateQueries(['documents', 'pet', petId]);
        }
      },
      onError: (error) => {
        const message = error.response?.data?.error || 'Failed to delete document';
        toast.error(message);
      }
    }
  );

  const handleDelete = (documentId, fileName) => {
    if (window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      deleteMutation.mutate(documentId);
    }
  };

  const handleView = (document) => {
    // Open document in new tab
    window.open(`/api/documents/${document.id}/download`, '_blank');
  };

  const getDocumentTypeLabel = (type) => {
    const types = {
      vaccination_record: 'Vaccination Record',
      health_certificate: 'Health Certificate',
      medical_history: 'Medical History',
      adoption_contract: 'Adoption Contract',
      identification: 'Identification',
      other: 'Other'
    };
    return types[type] || 'Unknown';
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) {
      return '🖼️';
    } else if (mimeType === 'application/pdf') {
      return '📄';
    } else if (mimeType.includes('word')) {
      return '📝';
    }
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getVerificationStatus = (document) => {
    if (document.is_verified) {
      return {
        icon: <CheckBadgeIcon className="w-5 h-5 text-green-600" />,
        text: 'Verified',
        color: 'text-green-600 bg-green-50'
      };
    } else if (document.verified_by) {
      return {
        icon: <XCircleIcon className="w-5 h-5 text-red-600" />,
        text: 'Rejected',
        color: 'text-red-600 bg-red-50'
      };
    } else {
      return {
        icon: <ClockIcon className="w-5 h-5 text-yellow-600" />,
        text: 'Pending',
        color: 'text-yellow-600 bg-yellow-50'
      };
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center text-red-600">
          <p>Error loading documents: {error.message}</p>
        </div>
      </div>
    );
  }

  const documents = documentsData?.documents || [];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <DocumentIcon className="w-6 h-6 text-blue-600 mr-2" />
          Documents {petId && '(for this pet)'}
        </h3>
        <span className="text-sm text-gray-500">
          {documents.length} document{documents.length !== 1 ? 's' : ''}
        </span>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <DocumentIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p>No documents uploaded yet</p>
          <p className="text-sm">Upload documents using the form above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((document) => {
            const verification = getVerificationStatus(document);
            
            return (
              <div
                key={document.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="text-2xl">
                      {getFileIcon(document.mime_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900 truncate">
                          {document.file_name}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${verification.color}`}>
                          {verification.icon}
                          <span className="ml-1">{verification.text}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                        <span>{getDocumentTypeLabel(document.document_type)}</span>
                        <span>{formatFileSize(document.file_size)}</span>
                        <span>
                          Uploaded {new Date(document.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {document.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {document.description}
                        </p>
                      )}

                      {document.pet && (
                        <p className="text-sm text-blue-600">
                          Pet: {document.pet.name} ({document.pet.breed})
                        </p>
                      )}

                      {document.verification_notes && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                          <strong>Admin Notes:</strong> {document.verification_notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {showActions && (
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleView(document)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                        title="View document"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(document.id, document.file_name)}
                        disabled={deleteMutation.isLoading}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                        title="Delete document"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DocumentList;
