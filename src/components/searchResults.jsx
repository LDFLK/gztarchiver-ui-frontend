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
  isShrunked = false,
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
          <div className={`${isShrunked ? 'mb-2' : 'mb-4 sm:mb-6'} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
            <div>
              <h2 className={`font-bold dark:text-white text-gray-900 mb-2 ${isShrunked ? 'text-sm' : 'text-xl sm:text-2xl'}`}>
                Search Results for "{query}"
              </h2>
              {pagination.total_count > 0 && (
                <p className={`dark:text-gray-400 text-gray-600 font-light ${isShrunked ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                  <span className="font-medium dark:text-cyan-400 text-gray-900">
                    {pagination.total_count.toLocaleString()}
                  </span>{" "}
                  records found - showing{" "}
                  <span className="font-medium dark:text-cyan-400 text-gray-900">
                    {pagination.start_index} - {pagination.end_index}
                  </span>
                </p>
              )}
            </div>
            <div className={`flex items-center ${isShrunked ? 'gap-1' : 'gap-3'}`}>
              <div className="relative limit-dropdown-container">
                <button
                  onClick={() => setShowLimitDropdown(!showLimitDropdown)}
                  className={`flex items-center gap-1 ${isShrunked ? 'px-2 py-1 text-[0.65rem]' : 'px-3 py-1.5 text-xs'} text-gray-900 border border-gray-200 dark:text-gray-300 dark:border dark:border-gray-600 dark:bg-gray-800/50 dark:hover:bg-gray-700/50 transition-colors duration-200 hover:cursor-pointer rounded-lg`}
                >
                  <span>{limit} per page</span>
                  <ChevronDown
                    className={`transition-transform duration-200 ${isShrunked ? 'w-2.5 h-2.5' : 'w-3 h-3'} ${
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
                className={`${isShrunked ? 'text-xs' : 'text-sm'} me-1 text-gray-800 hover:text-gray-900 dark:text-cyan-500 dark:hover:text-cyan-300 transition-colors hover:cursor-pointer`}
              >
                ← Back to Home
              </button>
            </div>
          </div>

          <div className={`space-y-3 sm:space-y-4 ${isShrunked ? 'mt-5' : 'mt-0'}`}>
            {results.map((item, index) => (
              <div
                key={item.id || index}
                data-document-id={item.document_id}
                className="dark:bg-gray-900/10 bg-transparent rounded-2xl p-4 sm:p-6 hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-all duration-300 group"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-6 h-6 sm:w-8 sm:h-8 dark:text-cyan-400 text-gray-900" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-medium dark:text-white text-gray-900 mb-2 break-words">
                      {item.description || "No description"}
                    </h3>
                    <div className="dark:text-gray-300 text-gray-600 text-xs sm:text-sm mb-3 break-words">
                      <span className="block sm:inline">
                        Document Type:{" "}
                        <span className="dark:text-cyan-400 text-gray-600 font-medium">
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
                      <span className="break-all dark:text-gray-300 text-gray-600">
                        ID: <span className="dark:text-cyan-400 text-gray-600 font-mono">{item.document_id || "N/A"}</span>
                      </span>
                      <span className="dark:text-gray-300 text-gray-600">
                        Date: <span className="dark:text-cyan-400 text-gray-600">{item.document_date || "N/A"}</span>
                      </span>
                      {item.source && (
                        <a
                          href={item.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`transition-all duration-200 ${
                            item.availability === "Unavailable"
                              ? "text-gray-500 cursor-not-allowed"
                              : "dark:text-cyan-400 text-gray-700 dark:hover:text-white hover:text-gray-900"
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
                              : "dark:text-cyan-400 text-gray-700 dark:hover:text-white hover:text-gray-900"
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
                              : "dark:text-cyan-400 text-gray-700 dark:hover:text-white hover:text-gray-900"
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
                            : "dark:text-cyan-400 text-gray-700 dark:hover:text-white hover:text-gray-900"
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
