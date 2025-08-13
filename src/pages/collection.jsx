import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DocumentCard from '../components/doc_card';
import PreLoader from '../components/pre_loader';
import { MoveLeft } from 'lucide-react';

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

  const extractYear = (collection) => {
    const yearMatch = collection.match(/(\d{4})/);
    return yearMatch ? yearMatch[1] : null;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen p-8 max-w-2xl mx-auto">
        <div className="p-4 rounded-lg">
          <button 
          onClick={goBack}
          className="mb-4 px-2 py-2 -ms-2 hover:bg-gray-100 rounded-full text-sm cursor-pointer"
        >
           <MoveLeft className="w-6 h-6 text-gray-500" />
        </button>
          <div className="flex items-center justify-center h-32">
            <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen p-8 max-w-2xl mx-auto">
        <div className="p-4 rounded-lg">
          <button 
          onClick={goBack}
          className="mb-4 px-2 py-2 -ms-2 hover:bg-gray-100 rounded-full text-sm cursor-pointer"
        >
           <MoveLeft className="w-6 h-6 text-gray-500" />
        </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-red-500 mb-2">Error Loading Data</h2>
            <p className="text-red-500">Failed to load {extractYear(collection)} data: {error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-sm text-red-500 cursor-pointer"
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
    <div className="min-h-screen p-8 max-w-2xl mx-auto">
      <div className="p-4 rounded-lg">
        <button 
          onClick={goBack}
          className="mb-2 px-2 py-2 -ms-2 hover:bg-gray-100 rounded-full text-sm cursor-pointer"
        >
           <MoveLeft className="w-6 h-6 text-gray-500" />
        </button>
        <h1 className="text-2xl font-medium text-gray-900 mb-2">Documents - {extractYear(collection)}</h1>
        <p className="text-sm text-gray-500 mb-8">{data.length} items</p>
  
        {/* <h1 className="text-2xl font-bold mb-4">Document Collection: {extractYear(collection)}</h1> */}
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1 bg-white">
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