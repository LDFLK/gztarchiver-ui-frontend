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
  setShowLimitDropdown,
}) => {
  const limitOptions = [10, 20, 50, 100];

  const handleTraceClick = (e, documentId) => {
    e.preventDefault();
    onTraceClick(documentId);
  };

  if (!Array.isArray(results) || (results.length === 0 && !loading)) {
    return (
      <div className="w-full max-w-6xl mx-auto text-center py-8 sm:py-12">
          <p className="text-gray-300 text-sm sm:text-base mb-4">
            No results found for "{query}"
          </p>
          <button
            onClick={onBack}
            className="mt-4 text-sm text-cyan-400 hover:text-cyan-300 hover:cursor-pointer"
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
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Search Results for "{query}"
              </h2>
              {pagination.total_count > 0 && (
                <p className="text-xs sm:text-sm text-gray-400 font-light">
                  <span className="font-medium text-cyan-400">
                    {pagination.total_count.toLocaleString()}
                  </span>{" "}
                  records found - showing{" "}
                  <span className="font-medium text-cyan-400">
                    {pagination.start_index} - {pagination.end_index}
                  </span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="relative limit-dropdown-container">
                <button
                  onClick={() => setShowLimitDropdown(!showLimitDropdown)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-300 border border-gray-600 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-200 hover:cursor-pointer"
                >
                  <span>{limit} per page</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${
                      showLimitDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`absolute right-0 top-full mt-1 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg z-10 transition-all duration-200 origin-top ${
                    showLimitDropdown
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  {limitOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleLimitChange(option)}
                      className={`block w-full text-left px-3 py-2 text-xs hover:bg-gray-700/50 hover:cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        option === limit
                          ? "bg-cyan-500/10 text-cyan-400"
                          : "text-gray-300"
                      }`}
                    >
                      {option} per page
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={onBack}
                className="text-sm me-1 text-cyan-500 hover:text-cyan-300 transition-colors hover:cursor-pointer"
              >
                ← Back to Home
              </button>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {results.map((item, index) => (
              <div
                key={item.id || index}
                className="bg-gray-900/10 rounded-2xl p-4 sm:p-6 hover:bg-gray-800/60 transition-all duration-300 group"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-medium text-white mb-2 break-words">
                      {item.description || "No description"}
                    </h3>
                    <div className="text-gray-300 text-xs sm:text-sm mb-3 break-words">
                      <span className="block sm:inline">
                        Document Type:{" "}
                        <span className="text-cyan-400 font-medium">
                          {item.document_type
                            ? item.document_type
                                .toLowerCase()
                                .split("_")
                                .map(
                                  (word) =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                )
                                .join(" ")
                            : "Unknown"}
                        </span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                      <span className="break-all text-gray-300">
                        ID: <span className="text-cyan-400 font-mono">{item.document_id || "N/A"}</span>
                      </span>
                      <span className="text-gray-300">
                        Date: <span className="text-cyan-400">{item.document_date || "N/A"}</span>
                      </span>
                      {item.source && (
                        <a
                          href={item.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`transition-all duration-200 ${
                            item.availability === "Unavailable"
                              ? "text-gray-500 cursor-not-allowed"
                              : "text-cyan-400 hover:text-white"
                          }`}
                        >
                          Source
                        </a>
                      )}
                      {item.download_url && (
                        <a
                          href={item.download_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`transition-all duration-200 ${
                            item.availability === "Unavailable"
                              ? "text-gray-500 cursor-not-allowed"
                              : "text-cyan-400 hover:text-white"
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
                          className={`transition-all duration-200 ${
                            item.availability === "Unavailable"
                              ? "text-gray-500 cursor-not-allowed"
                              : "text-cyan-400 hover:text-white"
                          }`}
                        >
                          View
                        </a>
                      )}
                      <a
                        href="#"
                        onClick={(e) => handleTraceClick(e, item.document_id)}
                        className={`transition-all duration-200 ${
                          item.availability === "Unavailable"
                            ? "text-gray-500 cursor-not-allowed"
                            : "text-cyan-400 hover:text-white"
                        }`}
                      >
                        Explore Connections
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
