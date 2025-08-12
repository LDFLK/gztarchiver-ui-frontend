import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DocumentCard from '../components/doc_card';

const CollectionPage = () => {
  const { collection } = useParams(); // Get collection name from URL
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiUrl = window?.configs?.apiUrl ? window.configs.apiUrl : "/"
    const fetchCollectionData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Make fetch request using the collection name
        const response = await fetch(`${apiUrl}/documents/${collection}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching collection data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (collection) {
      fetchCollectionData();
    }
  }, [collection]); // Refetch when collection parameter changes

  const goBack = () => {
    navigate('/');
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <button 
            onClick={goBack}
            className="mb-4 px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
          >
            ← Back to Home
          </button>
          <div className="flex items-center justify-center h-32">
            <div className="text-lg">Loading {collection}...</div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <button 
            onClick={goBack}
            className="mb-4 px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
          >
            ← Back to Home
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Collection</h2>
            <p className="text-red-600">Failed to load {collection}: {error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-sm text-red-800"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state - render the fetched data
  return (
    <div className="p-6">
      <div className="bg-gray-100 p-4 rounded-lg">
        <button 
          onClick={goBack}
          className="mb-4 px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm cursor-pointer"
        >
          ← Back to Home
        </button>
        
        <h1 className="text-2xl font-bold mb-4">Collection: {collection}</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 bg-white p-4">
          {data.map((doc) => (
            <DocumentCard
          key={doc.id}
          documentId={doc.document_id}
          date={doc.document_date}
          type={doc.document_type}
          reasoning={doc.reasoning}
          gdriveUrl={doc.gdrive_file_url}
          downloadUrl={doc.download_url}
        />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollectionPage;