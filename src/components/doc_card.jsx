const DocumentCard = ({ documentId, date, type, reasoning, gdriveUrl, downloadUrl }) => {
  return (
    <div className="bg-white border rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-gray-800">📄 {documentId}</h2>
        <span className="text-sm text-gray-500">{date}</span>
      </div>

      <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
        {type}
      </span>

      <p className="mt-3 text-gray-700 text-sm line-clamp-3">
        {reasoning}
      </p>

      <div className="mt-4 flex gap-3">
        <a
          href={gdriveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          View
        </a>
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
        >
          Download
        </a>
      </div>
    </div>
  );
};

export default DocumentCard;
