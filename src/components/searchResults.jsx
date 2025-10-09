import { ChevronDown, FileText } from "lucide-react";
import PaginationControls from "./paginationContrls";

const SearchResults = ({
  query,
  results,
  pagination,
  currentPage,
  onPageChange,
  onBack,
  loading,
  limit,
  showLimitDropdown,
  onTraceClick,
  handleLimitChange,
  setShowLimitDropdown
}) => {
  const limitOptions = [10, 20, 50, 100];

  const handleTraceClick = (e, documentId) => {
    e.preventDefault();
    onTraceClick(documentId);
  };

  if (!Array.isArray(results) || (results.length === 0 && !loading)) {
    return (
      <div className="w-full max-w-6xl mx-auto text-center py-8 sm:py-12">
        <p className="text-gray-500 text-sm sm:text-base">
          No results found for "{query}"
        </p>
        <button
          onClick={onBack}
          className="mt-4 text-sm text-blue-500 hover:text-blue-700 hover:cursor-pointer"
        >
          ← Back to Home
        </button>
      </div>
    );
  }

  if (!loading) {
    return (
      <>
        <div className="w-full max-w-6xl mx-auto">
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-thin text-gray-700 mb-2">
                Search Results for "{query}"
              </h2>
              {pagination.total_count > 0 && (
                <p className="text-xs sm:text-sm text-gray-500 font-light">
                  <span className="font-medium text-gray-700">
                    {pagination.total_count.toLocaleString()}
                  </span>{" "}
                  records found - showing{" "}
                  <span className="font-medium text-gray-700">
                    {pagination.start_index} - {pagination.end_index}
                  </span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="relative limit-dropdown-container">
                <button
                  onClick={() => setShowLimitDropdown(!showLimitDropdown)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 hover:cursor-pointer"
                >
                  <span>{limit} per page</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${
                      showLimitDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 transition-all duration-200 origin-top ${
                    showLimitDropdown
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  {limitOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleLimitChange(option)}
                      className={`block w-full text-left px-3 py-2 text-xs hover:bg-gray-50 hover:cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        option === limit
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-600"
                      }`}
                    >
                      {option} per page
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={onBack}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors hover:cursor-pointer"
              >
                ← Back to Home
              </button>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {results.map((item, index) => (
              <div
                key={item.id || index}
                className="bg-white border border-gray-100 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 break-words">
                      {item.description || "No description"}
                    </h3>
                    <div className="text-gray-600 text-xs sm:text-sm mb-3 break-words">
                      <span className="block sm:inline">
                        Document Type: {item.document_type || "Unknown"}
                      </span>
                      <span className="hidden sm:inline"> | </span>
                      <span className="block sm:inline">
                        Source:{" "}
                        <a
                          href={item.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${
                            item.availability === "Unavailable"
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-blue-500 hover:underline break-all"
                          }`}
                        >
                          View Source
                        </a>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span className="break-all">
                        ID: {item.document_id || "N/A"}
                      </span>
                      <span>Type: {item.document_type || "Unknown"}</span>
                      <span>Date: {item.document_date || "N/A"}</span>
                      {item.download_url && (
                        <a
                          href={item.download_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${
                            item.availability === "Unavailable"
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-blue-500 hover:underline"
                          }`}
                        >
                          Download
                        </a>
                      )}
                      {item.file_path && (
                        <a
                          href={item.file_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${
                            item.availability === "Unavailable"
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-blue-500 hover:underline"
                          }`}
                        >
                          View
                        </a>
                      )}
                      <a
                        href="#"
                        onClick={(e) => handleTraceClick(e, item.document_id)}
                        className={`${
                          item.availability === "Unavailable"
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-blue-500 hover:underline"
                        }`}
                      >
                        Trace
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <PaginationControls
            pagination={pagination}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        </div>
      </>
    );
  }
};

export default SearchResults;

// const SearchResults = ({
//     query,
//     results,
//     pagination,
//     currentPage,
//     onPageChange,
//     onBack,
//     loading,
//     limit,
//     showLimitDropdown,
//     onTraceClick, // NEW: Callback to parent
//   }) => {
//     const handleTraceClick = (e, documentId) => {
//       e.preventDefault();
//       onTraceClick(documentId); // Call parent handler
//     };

//     if (!Array.isArray(results) || (results.length === 0 && !loading)) {
//       return (
//         <div className="w-full max-w-6xl mx-auto text-center py-8 sm:py-12">
//           <p className="text-gray-500 text-sm sm:text-base">
//             No results found for "{query}"
//           </p>
//           <button
//             onClick={onBack}
//             className="mt-4 text-sm text-blue-500 hover:text-blue-700 hover:cursor-pointer"
//           >
//             ← Back to Home
//           </button>
//         </div>
//       );
//     }

//     if (!loading) {
//       return (
//         <div className="w-full max-w-6xl mx-auto">
//           <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//             <div>
//               <h2 className="text-xl sm:text-2xl font-thin text-gray-700 mb-2">
//                 Search Results for "{query}"
//               </h2>
//               {pagination.total_count > 0 && (
//                 <p className="text-xs sm:text-sm text-gray-500 font-light">
//                   <span className="font-medium text-gray-700">
//                     {pagination.total_count.toLocaleString()}
//                   </span>{" "}
//                   records found - showing{" "}
//                   <span className="font-medium text-gray-700">
//                     {pagination.start_index} - {pagination.end_index}
//                   </span>
//                 </p>
//               )}
//             </div>
//             <button
//               onClick={onBack}
//               className="text-sm text-gray-500 hover:text-gray-700 transition-colors hover:cursor-pointer"
//             >
//               ← Back to Home
//             </button>
//           </div>

//           <div className="space-y-3 sm:space-y-4">
//             {results.map((item, index) => (
//               <div
//                 key={item.id || index}
//                 className="bg-white border border-gray-100 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow"
//               >
//                 <div className="flex items-start gap-3 sm:gap-4">
//                   <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
//                     <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 break-words">
//                       {item.description || "No description"}
//                     </h3>
//                     <div className="text-gray-600 text-xs sm:text-sm mb-3 break-words">
//                       <span className="block sm:inline">
//                         Document Type: {item.document_type || "Unknown"}
//                       </span>
//                       <span className="hidden sm:inline"> | </span>
//                       <span className="block sm:inline">
//                         Source:{" "}
//                         <a
//                           href={item.source}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className={`${
//                             item.availability === "Unavailable"
//                               ? "text-gray-400 cursor-not-allowed"
//                               : "text-blue-500 hover:underline break-all"
//                           }`}
//                         >
//                           View Source
//                         </a>
//                       </span>
//                     </div>
//                     <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
//                       <span className="break-all">
//                         ID: {item.document_id || "N/A"}
//                       </span>
//                       <span>Type: {item.document_type || "Unknown"}</span>
//                       <span>Date: {item.document_date || "N/A"}</span>
//                       {item.download_url && (
//                         <a
//                           href={item.download_url}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className={`${
//                             item.availability === "Unavailable"
//                               ? "text-gray-400 cursor-not-allowed"
//                               : "text-blue-500 hover:underline"
//                           }`}
//                         >
//                           Download
//                         </a>
//                       )}
//                       {item.file_path && (
//                         <a
//                           href={item.file_path}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className={`${
//                             item.availability === "Unavailable"
//                               ? "text-gray-400 cursor-not-allowed"
//                               : "text-blue-500 hover:underline"
//                           }`}
//                         >
//                           View
//                         </a>
//                       )}
//                       <a
//                         href="#"
//                         onClick={(e) => handleTraceClick(e, item.document_id)}
//                         className={`${
//                           item.availability === "Unavailable"
//                             ? "text-gray-400 cursor-not-allowed"
//                             : "text-blue-500 hover:underline"
//                         }`}
//                       >
//                         Trace
//                       </a>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       );
//     }
//   };

//   export default SearchResults;
