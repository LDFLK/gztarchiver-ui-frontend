import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const CollectionPage = () => {
  const { collection } = useParams(); // Get collection name from URL
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollectionData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Make fetch request using the collection name
        const response = await fetch(`/api/documents/${collection}`);
        
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
        
        <div className="bg-white p-4 rounded border">
          <h2 className="text-lg font-semibold mb-3">Collection Data</h2>
          
          {/* Display the fetched data */}
          <pre className="bg-gray-50 p-3 rounded border overflow-auto text-sm mb-4">
            {JSON.stringify(data, null, 2)}
          </pre>
          
          {/* If data has specific structure, you can render it more nicely */}
          {data && (
            <div className="space-y-3">
              <div>
                <strong>Collection Name:</strong> {collection}
              </div>
              
              {/* Example: If your API returns documents array */}
              {data.documents && (
                <div>
                  <strong>Documents ({data.documents.length}):</strong>
                  <ul className="mt-2 space-y-1">
                    {data.documents.map((doc, index) => (
                      <li key={index} className="ml-4">
                        • {doc.title || doc.name || `Document ${index + 1}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Example: If your API returns total count */}
              {data.total && (
                <div>
                  <strong>Total Items:</strong> {data.total}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionPage;