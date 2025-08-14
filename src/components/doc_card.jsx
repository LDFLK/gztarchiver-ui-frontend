import { useNavigate } from "react-router-dom";

const DocumentCard = ({ doc_id, documentId, date, type, gdriveUrl, downloadUrl, collection }) => {

  const navigate = useNavigate();

  const navigateSingleDoc = () => {
    navigate(`/${collection}/${doc_id}`)
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 hover:bg-white/90 hover:border-gray-200 hover:shadow-lg transition-all duration-300 group">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 hover:cursor-pointer" 
        onClick={navigateSingleDoc}>
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <h3 className="text-gray-900 font-medium hover:text-blue-500 transition-all duration-100 ease-in-out cursor-pointer">GAZETTE {documentId}</h3>
        </div>
        <span className="text-xs text-gray-400 font-mono">{date}</span>
      </div>
      
      {/* Type */}
      <div className="mb-6">
        <span className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full border">
          {type}
        </span>
      </div>
      
      {/* Actions */}
      <div className="flex gap-2">
        <a
          href={gdriveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center py-2 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors duration-200"
        >
          View
        </a>
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center py-2 text-xs text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors duration-200"
        >
          Download
        </a>
      </div>
    </div>
  );
};

export default DocumentCard;
