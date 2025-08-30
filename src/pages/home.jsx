import { useEffect, useState } from "react";
import {
  X,
  Search,
  FileArchive,
  FileText,
  Calendar,
  Globe,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const Home = () => {

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 0,
    total_count: 0,
    limit: 50,
    has_next: false,
    has_prev: false,
    start_index: 0,
    end_index: 0
  });
  const [currentPage, setCurrentPage] = useState(1);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch(1); // Reset to first page on new search
    }
  };

  const handleSearch = async (page = 1) => {
    setLoading(true);
    setHasSearched(true);
    setCurrentPage(page);

    try {
      const apiUrl = window?.configs?.apiUrl ? window.configs.apiUrl : "/";
      const response = await fetch(`${apiUrl}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          query: searchQuery.trim(),
          page: page,
          limit: 50
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      setSearchResults(data.results || []);
      setPagination(data.pagination || {
        current_page: 1,
        total_pages: 0,
        total_count: 0,
        limit: 50,
        has_next: false,
        has_prev: false,
        start_index: 0,
        end_index: 0
      });
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResults([]);
      setPagination({
        current_page: 1,
        total_pages: 0,
        total_count: 0,
        limit: 50,
        has_next: false,
        has_prev: false,
        start_index: 0,
        end_index: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage !== currentPage && newPage >= 1 && newPage <= pagination.total_pages) {
      handleSearch(newPage);
    }
  };

  const handleBack = () => {
    setHasSearched(false);
    setSearchResults([]);
    setSearchQuery("");
    setCurrentPage(1);
    setPagination({
      current_page: 1,
      total_pages: 0,
      total_count: 0,
      limit: 50,
      has_next: false,
      has_prev: false,
      start_index: 0,
      end_index: 0
    });
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const apiUrl = window?.configs?.apiUrl ? window.configs.apiUrl : "/";
        setLoading(true);
        const response = await fetch(`${apiUrl}/dashboard-status`);

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard stats");
        }

        const apiData = await response.json();

        // Map API data to stats format
        const mappedStats = [
          {
            icon: <FileText className="w-8 h-8 text-gray-800" />,
            title: "Total Documents",
            value: apiData.total_docs?.toLocaleString() || "0",
            description: "Archived files",
          },
          {
            icon: <Globe className="w-8 h-8 text-gray-800" />,
            title: "Available Languages",
            value: "languages",
            description: "Supported formats",
          },
          {
            icon: <Calendar className="w-8 h-8 text-gray-800" />,
            title: "Years Covered",
            value: `${apiData.years_covered?.from || ""} - ${
              apiData.years_covered?.to || ""
            }`,
            description: "Date range",
          },
        ];

        setStats(mappedStats);
        setLanguages(apiData.available_languages || []);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // Pagination component
  const PaginationControls = ({ pagination, currentPage, onPageChange }) => {
    if (pagination.total_pages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const totalPages = pagination.total_pages;
      const current = currentPage;
      
      // Always show first page
      pages.push(1);
      
      if (current > 4) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, current - 1);
      const end = Math.min(totalPages - 1, current + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
      
      if (current < totalPages - 3) {
        pages.push('...');
      }
      
      // Always show last page if more than 1 page
      if (totalPages > 1 && !pages.includes(totalPages)) {
        pages.push(totalPages);
      }
      
      return pages;
    };

    return (
      <div className="flex items-center justify-center gap-1 sm:gap-2 mt-8">
        {/* First page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 sm:p-2 rounded-lg border-none hover:bg-gray-50 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronsLeft className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>

        {/* Previous page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!pagination.has_prev}
          className="p-1.5 sm:p-2 rounded-lg border-none hover:bg-gray-50 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => page !== '...' && onPageChange(page)}
              disabled={page === '...'}
              className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                page === currentPage
                  ? 'bg-gray-800 text-white hover:cursor-pointer'
                  : page === '...'
                  ? 'cursor-default text-gray-400'
                  : 'border-none hover:cursor-pointer border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Next page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!pagination.has_next}
          className="p-1.5 sm:p-2 rounded-lg border-none hover:bg-gray-50 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>

        {/* Last page */}
        <button
          onClick={() => onPageChange(pagination.total_pages)}
          disabled={currentPage === pagination.total_pages}
          className="p-1.5 sm:p-2 rounded-lg border-none hover:bg-gray-50 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronsRight className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
      </div>
    );
  };

  // Skeleton component
  const SkeletonCard = () => (
    <div className="bg-white border border-gray-100 rounded-lg p-4 sm:p-6 w-full sm:flex-1">
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="space-y-2 w-full">
          <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-20 sm:w-24 mx-auto"></div>
          <div className="h-4 sm:h-6 bg-gray-200 rounded animate-pulse w-12 sm:w-16 mx-auto"></div>
          <div className="h-2 sm:h-3 bg-gray-200 rounded animate-pulse w-24 sm:w-32 mx-auto"></div>
        </div>
      </div>
    </div>
  );

  // Error component
  const ErrorCard = () => (
    <div className="bg-white border border-gray-100 rounded-lg p-4 sm:p-6 w-full sm:flex-1">
      <div className="flex flex-col items-center text-center space-y-3">
        <div>
          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        </div>
        <h3 className="text-xs sm:text-sm font-light text-gray-400">No Stats Found</h3>
        <p className="text-xs font-light text-gray-400 max-w-xs">
          Looks like there's no data available to show right now, This can be a
          error from db or try refreshing...
        </p>
      </div>
    </div>
  );

  const SearchResults = ({ query, results, pagination, currentPage, onPageChange, onBack }) => {
    if (!Array.isArray(results) || (results.length === 0 && !loading)) {
      return (
        <div className="w-full max-w-6xl mx-auto text-center py-8 sm:py-12">
          <p className="text-gray-500 text-sm sm:text-base">No results found for "{query}"</p>
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
                  </span>{' '}
                  records found - showing{' '}
                  <span className="font-medium text-gray-700">
                    {pagination.start_index} - {pagination.end_index}
                  </span>
                </p>
              )}
            </div>
            <button
              onClick={onBack}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors hover:cursor-pointer self-start sm:self-auto"
            >
              ← Back to Home
            </button>
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
                      <span className="block sm:inline">Document Type: {item.document_type || "Unknown"}</span>
                      <span className="hidden sm:inline"> | </span>
                      <span className="block sm:inline">Source:{" "}
                        <a
                          href={item.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline break-all"
                        >
                          View Source
                        </a>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span className="break-all">ID: {item.document_id || "N/A"}</span>
                      <span>Type: {item.document_type || "Unknown"}</span>
                      <span>Date: {item.document_date || "N/A"}</span>
                      {item.download_url && (
                        <a
                          href={item.download_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          Download
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <PaginationControls
            pagination={pagination}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen p-3 sm:p-6 lg:p-8 flex flex-col">
      {/* Main content with conditional positioning */}
      <div
        className={`flex-1 flex justify-center transition-all duration-700 ease-out ${
          hasSearched ? "items-start pt-4 sm:pt-8" : "items-center"
        }`}
      >
        <div className="w-full">
          <div
            className={`bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 transition-all duration-700 ${
              hasSearched ? "bg-white/90" : ""
            }`}
          >
            {/* Header */}
            <div
              className={`text-center transition-all duration-500 ${
                hasSearched ? "mb-6 sm:mb-8" : "mb-8 sm:mb-12"
              }`}
            >
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <FileArchive className="text-white w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                </div>
                <h1
                  className={`font-thin text-gray-600 flex items-center transition-all duration-500 ${
                    hasSearched ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl"
                  }`}
                >
                  gztarchiver
                </h1>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="relative w-full max-w-4xl">
                <input
                  type="text"
                  placeholder="Search documents, IDs, types, date, or reasoning..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="w-full pl-10 sm:pl-14 pr-20 sm:pr-28 py-3 sm:py-4 text-base sm:text-md border border-gray-100 rounded-xl sm:rounded-2xl
                  focus:outline-none focus:ring-0 focus:ring-black
                  focus:shadow-lg transition-shadow duration-200
                  bg-white/80 backdrop-blur-sm placeholder-gray-400 placeholder:font-thin font-thin"
                />
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-6 sm:h-6 text-gray-400" />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-16 sm:right-27 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:cursor-pointer"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
                <button
                  onClick={() => handleSearch(1)}
                  className="absolute right-0 top-0 h-full bg-gray-800 hover:bg-gray-900 hover:cursor-pointer text-white px-4 sm:px-6 rounded-r-xl sm:rounded-r-2xl text-xs sm:text-sm font-thin transition-colors duration-200 focus:outline-none"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Stats Cards with conditional rendering */}
            <div
              className={`transition-all duration-700 ease-out ${
                hasSearched
                  ? "opacity-0 scale-95 pointer-events-none h-0 overflow-hidden"
                  : "opacity-100 scale-100 pointer-events-auto"
              }`}
            >
              {!hasSearched && (
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full max-w-6xl mx-auto">
                  {error ? (
                    <>
                      <ErrorCard />
                      <ErrorCard />
                      <ErrorCard />
                    </>
                  ) : loading ? (
                    <>
                      <SkeletonCard />
                      <SkeletonCard />
                      <SkeletonCard />
                    </>
                  ) : (
                    stats.map((stat, index) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-100 rounded-lg p-4 sm:p-6 w-full sm:flex-1 transition-all duration-200 hover:shadow-lg cursor-pointer"
                        style={{
                          transitionDelay: `${index * 100}ms`,
                        }}
                      >
                        <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
                          <div className="flex-shrink-0">{stat.icon}</div>
                          <div className="space-y-1 sm:space-y-2">
                            {stat.value === "languages" ? (
                              <>
                                <p className="text-xs sm:text-sm font-light text-gray-600">
                                  {stat.title}
                                </p>
                                <div className="flex flex-wrap justify-center gap-1">
                                  {languages.map((language, langIndex) => (
                                    <span
                                      key={langIndex}
                                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-thin"
                                    >
                                      {language}
                                    </span>
                                  ))}
                                </div>
                                <p className="text-xs font-thin text-gray-500">
                                  {stat.description}
                                </p>
                              </>
                            ) : (
                              <>
                                <h3 className="text-base sm:text-lg font-thin text-gray-900 leading-tight">
                                  {stat.value}
                                </h3>
                                <p className="text-xs sm:text-sm font-light text-gray-600">
                                  {stat.title}
                                </p>
                                <p className="text-xs font-thin text-gray-500">
                                  {stat.description}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Search Results Section */}
            <div
              className={`transition-all duration-700 ease-out ${
                hasSearched && searchResults
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-95 pointer-events-none h-0 overflow-hidden"
              }`}
            >
              {hasSearched && searchResults && (
                <SearchResults
                  query={searchQuery.trim()}
                  results={searchResults}
                  pagination={pagination}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                  onBack={handleBack}
                />
              )}
            </div>

            {/* Loading state for search */}
            {loading && hasSearched && (
              <div className="flex justify-center items-center py-8 sm:py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
                  <p className="text-gray-500 font-thin text-sm sm:text-base">
                    Searching archives...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer - fixed at bottom */}
      <div className="pt-4 sm:pt-6 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          Open Data @{new Date().getFullYear()}. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Home;