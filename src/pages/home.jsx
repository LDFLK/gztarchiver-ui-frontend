import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {

  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/documents');
        
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

  
  const handleCollectionClick = (collection) => {
    navigate(`/${collection}`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Home</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Home</h1>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }
  
   return ( 
    <div className="p-6">
      <div className="bg-gray-100 p-4 rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Home</h1>
        <h2 className="text-lg font-semibold mb-2">Available Years:</h2>
        <pre className="bg-white p-3 rounded border overflow-auto text-sm">
          {data.doc_collections.map((collection, index) => (
              <li 
              key={index}
              className="py-1 px-2 border-b last:border-b-0 hover:cursor-pointer"
              onClick={() => handleCollectionClick(collection)}>
                {collection}
              </li>
            ))}
        </pre>
      </div>
    </div>
     );
}
 
export default Home;