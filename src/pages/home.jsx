import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Database, CircleX } from "lucide-react";

// import PreLoader from "../components/pre_loader";

const Home = () => {

  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {

    const apiUrl = window?.configs?.apiUrl ? window.configs.apiUrl : "/"

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiUrl}/documents`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const extractYear = (collection) => {
    const yearMatch = collection.match(/(\d{4})/);
    return yearMatch ? yearMatch[1] : null;
  };
  
  const handleCollectionClick = (collection) => {
    navigate(`/${collection}`);
  };

   const [selectedYear, setSelectedYear] = useState(null);

  const handleYearClick = (collection) => {
    const year = extractYear(collection);
    setSelectedYear(year);
    handleCollectionClick(collection);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/70 backdrop-blur-sm  rounded-3xl p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
                <img src="/logo.png" alt="company-logo" className="w-8 h-8 inline-block me-2"/>
              <div>
                <h1 className="text-xl font-medium text-gray-900">gztarchiver</h1>
                <p className="text-sm text-gray-500">Lanka Data Foundation</p>
              </div>
            </div>
          </div>

          {/* Years Section */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Available Years</h2>
             <div className="flex items-center justify-center h-32">
            <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          </div>
          </div>

          {/* Footer info */}
          <div className="pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              Select a year to view available documents
            </p>
          </div>
        </div>
      </div>
    </div>



    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/70 backdrop-blur-sm  rounded-3xl p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
                <img src="/logo.png" alt="company-logo" className="w-8 h-8 inline-block me-2"/>
              <div>
                <h1 className="text-xl font-medium text-gray-900">gztarchiver</h1>
                <p className="text-sm text-gray-500">Lanka Data Foundation</p>
              </div>
            </div>
          </div>

          {/* Years Section */}
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-red-500 mb-2">
              <CircleX className="w-5 h-5 text-red-500" />Error Loading Data</h2>
            <p className="text-red-500">Failed to load years data: {error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-sm text-red-500 cursor-pointer"
            >
              Retry
            </button>
          </div>
          </div>

          {/* Footer info */}
          <div className="pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              Select a year to view available documents
            </p>
          </div>
        </div>
      </div>
    </div>



    );
  }
  
   return ( 
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/70 backdrop-blur-sm  rounded-3xl p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
                <img src="/logo.png" alt="company-logo" className="w-8 h-8 inline-block me-2"/>
              <div>
                <h1 className="text-xl font-medium text-gray-900">gztarchiver</h1>
                <p className="text-sm text-gray-500">Lanka Data Foundation</p>
              </div>
            </div>
          </div>

          {/* Years Section */}
          <div className="mb-6">
            {data?.doc_collections && data.doc_collections.length > 0 ? (
              <>
              <h2 className="text-lg font-medium text-gray-900 mb-6">Available Years</h2>
              <div className="space-y-3">
              {data?.doc_collections?.slice().sort((a, b) => extractYear(b) - extractYear(a)).map((collection, index) => {
                const year = extractYear(collection);
                const isSelected = selectedYear === year;
                return (
                  <div
                    key={index}
                    onClick={() => handleYearClick(collection)}
                    className={`group relative px-6 py-4 rounded-2xl cursor-pointer transition-all duration-300 ${
                      isSelected 
                        ? 'bg-gray-900 text-white shadow-lg' 
                        : 'bg-gray-50/50 hover:bg-white hover:shadow-md border border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                        {year}
                      </span>
                      <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        isSelected 
                          ? 'bg-white' 
                          : 'bg-gray-300 group-hover:bg-gray-400'
                      }`}></div>
                    </div>
                    
                    {/* Subtle hover indicator */}
                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full transition-all duration-300 ${
                      isSelected ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
                    }`}></div>
                  </div>
                );
              })}
            </div>
              </>              
            ) : (
              <div className="mb-6">
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-lg p-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-500 mb-2">
             <Database className="w-5 h-5 text-gray-500" /> No Data Found</h2>
            <p className="text-gray-500">We couldn't find any data to display right now. This might be temporary - try refreshing to see if new data is available.</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 transition-all duration-100 rounded text-sm text-white cursor-pointer"
            >
              Retry
            </button>
          </div>
          </div>
            )}
            
          </div>

          {/* Footer info */}
          <div className="pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              Select a year to view available documents
            </p>
          </div>
        </div>
      </div>
    </div>
     );
}
 
export default Home;