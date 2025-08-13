import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  <div className="bg-white p-6 rounded-xl shadow-md">
    <h1 className="text-2xl font-bold mb-4">🧪 gztarchiver</h1>

    <h2 className="text-lg font-semibold mb-3">Available Years:</h2>

    <ul className="space-y-2">
      {data.doc_collections.slice().sort((a, b) => extractYear(b) - extractYear(a)).map((collection, index) => (
        <li
          key={index}
          onClick={() => handleCollectionClick(collection)}
          className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200"
        >
         📍 {extractYear(collection)}
        </li>
      ))}
    </ul>
  </div>
</div>

     );
}
 
export default Home;