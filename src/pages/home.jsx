
import { useEffect, useState } from "react";

import {X, Users, Search, FileArchive, FileText, Calendar, Globe, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Hash, MessageCircle, FileSearch, ChevronDown, Building } from "lucide-react";

import SkeletonCard from "../components/skeletonCard";
import SocialMediaSidebar from "../components/socialMediaSideBar";
import ErrorCard from "../components/errorCard";

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
    end_index: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(50);

  // Quick search states
  const [showQuickSearch, setShowQuickSearch] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [showLimitDropdown, setShowLimitDropdown] = useState(false);

  const quickSearchOptions = [
    {
      id: "2015",
      label: "2015",
      icon: Calendar,
      query: "date:2015",
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      id: "2016",
      label: "2016",
      icon: Calendar,
      query: "date:2016",
      color: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      id: "people",
      label: "People",
      icon: Users,
      query: "type:people",
      color: "bg-green-50 text-green-700 border-green-200",
    },
    {
      id: "organisational",
      label: "Organisational",
      icon: Building,
      query: "type:organisational",
      color: "bg-orange-50 text-orange-700 border-orange-200",
    },
    {
      id: "available",
      label: "Available Only",
      icon: MessageCircle,
      query: "available:yes",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      id: "gov-source",
      label: "Gov Source",
      icon: Hash,
      query: "source:gov.lk",
      color: "bg-red-50 text-red-700 border-red-200",
    },
  ];

  const limitOptions = [10, 20, 50, 100];

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch(1); // Reset to first page on new search
    }
  };

  // Generic search function that accepts limit as parameter
  const handleSearchWithLimit = async (page = 1, searchLimit = limit) => {
    setLoading(true);
    setHasSearched(true);
    setCurrentPage(page);
    setShowQuickSearch(false);

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
          limit: searchLimit, // Use the passed limit parameter
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      setSearchResults(data.results || []);
      setPagination(
        data.pagination || {
          current_page: page,
          total_pages: 0,
          total_count: 0,
          limit: searchLimit, // Use the passed limit parameter
          has_next: false,
          has_prev: false,
          start_index: 0,
          end_index: 0,
        }
      );
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResults([]);
      setPagination({
        current_page: page,
        total_pages: 0,
        total_count: 0,
        limit: searchLimit, // Use the passed limit parameter
        has_next: false,
        has_prev: false,
        start_index: 0,
        end_index: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // Default search function using current limit state
  const handleSearch = async (page = 1) => {
    await handleSearchWithLimit(page, limit);
  };

  const handlePageChange = (newPage) => {
    if (
      newPage !== currentPage &&
      newPage >= 1 &&
      newPage <= pagination.total_pages
    ) {
      handleSearch(newPage);
    }
  };

  const handleBack = () => {
    setHasSearched(false);
    setSearchResults([]);
    setSearchQuery("");
    setCurrentPage(1);
    setActiveFilter(null);
    setShowQuickSearch(false);
    setPagination({
      current_page: 1,
      total_pages: 0,
      total_count: 0,
      limit: limit,
      has_next: false,
      has_prev: false,
      start_index: 0,
      end_index: 0,
    });
  };

  const clearSearch = () => {
    setSearchQuery("");
    setActiveFilter(null);
  };

  const handleQuickSearch = (option) => {
    setSearchQuery(option.query);
    setActiveFilter(option.id);
    setShowQuickSearch(false);
    setCurrentPage(1);
    // Call search immediately with the option query
    handleSearchWithQuery(option.query);
  };

  const handleSearchWithQuery = async (query) => {
    setLoading(true);
    setHasSearched(true);
    setCurrentPage(1);

    try {
      const apiUrl = window?.configs?.apiUrl ? window.configs.apiUrl : "/";
      const response = await fetch(`${apiUrl}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query.trim(),
          page: 1,
          limit: limit,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      setSearchResults(data.results || []);
      setPagination(
        data.pagination || {
          current_page: 1,
          total_pages: 0,
          total_count: 0,
          limit: limit,
          has_next: false,
          has_prev: false,
          start_index: 0,
          end_index: 0,
        }
      );
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResults([]);
      setPagination({
        current_page: 1,
        total_pages: 0,
        total_count: 0,
        limit: limit,
        has_next: false,
        has_prev: false,
        start_index: 0,
        end_index: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleQuickSearch = () => {
    setShowQuickSearch(!showQuickSearch);
    setShowLimitDropdown(false);
  };

  const handleSearchFocus = () => {
    if (!showQuickSearch) {
      setShowQuickSearch(true);
    }
    setShowLimitDropdown(false);
  };

  // FIXED: Remove setTimeout and pass newLimit directly
  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setShowLimitDropdown(false);
    // If we have an active search, re-search with new limit immediately
    if (hasSearched && searchQuery.trim()) {
      setCurrentPage(1);
      // Update pagination to reflect new limit immediately
      setPagination((prev) => ({
        ...prev,
        limit: newLimit,
        current_page: 1,
      }));
      // Call search immediately with the new limit - NO TIMEOUT!
      handleSearchWithLimit(1, newLimit);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".quick-search-container") &&
        !event.target.closest(".limit-dropdown-container") &&
        !event.target.closest(".search-input-container")
      ) {
        setShowQuickSearch(false);
        setShowLimitDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
        pages.push("...");
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
        pages.push("...");
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
              onClick={() => page !== "..." && onPageChange(page)}
              disabled={page === "..."}
              className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                page === currentPage
                  ? "bg-gray-800 text-white hover:cursor-pointer"
                  : page === "..."
                  ? "cursor-default text-gray-400"
                  : "border-none hover:cursor-pointer border-gray-200 hover:bg-gray-50 text-gray-700"
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


  const SearchResults = ({query, results, pagination, currentPage, onPageChange, onBack }) => {
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
              {/* Results per page dropdown */}
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
                          className="text-blue-500 hover:underline break-all"
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
                          className="text-blue-500 hover:underline"
                        >
                          Download
                        </a>
                      )}
                      {item.file_path && (
                        <a
                          href={item.file_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          View
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
    <>
      {/* Social Media Sidebar */}
      <SocialMediaSidebar />

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
                      hasSearched
                        ? "text-2xl sm:text-3xl"
                        : "text-3xl sm:text-4xl"
                    }`}
                  >
                    gztarchiver
                  </h1>
                </div>
              </div>

              {/* Enhanced Search Section */}
              <div className="flex flex-col items-center mb-6 sm:mb-8">
                {/* Main Search Bar */}
                <div className="relative w-full max-w-4xl search-input-container">
                  <input
                    type="text"
                    placeholder="Search documents, IDs, types, date or source..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyPress}
                    onFocus={handleSearchFocus}
                    className="w-full pl-10 sm:pl-14 pr-32 sm:pr-40 py-3 sm:py-4 text-base sm:text-md border border-gray-100 rounded-xl sm:rounded-2xl
                  focus:outline-none focus:ring-0 focus:ring-black
                  focus:shadow-lg transition-shadow duration-200
                  bg-white/80 backdrop-blur-sm placeholder-gray-400 placeholder:font-thin font-thin"
                  />
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-6 sm:h-6 text-gray-400" />

                  {/* Quick Search Toggle & Clear Button */}
                  <div className="absolute right-20 sm:right-26 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    {searchQuery && (
                      <button
                        onClick={clearSearch}
                        className="text-gray-400 hover:text-gray-600 hover:cursor-pointer transition-colors duration-200"
                      >
                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    )}
                    <button
                      onClick={toggleQuickSearch}
                      className={`p-1 rounded-md transition-all duration-200 hover:cursor-pointer ${
                        showQuickSearch
                          ? "text-gray-700 bg-gray-100 scale-105"
                          : "text-gray-400 hover:text-gray-600 hover:scale-105"
                      }`}
                    >
                      <FileSearch className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleSearch(1)}
                    className="absolute right-0 top-0 h-full bg-gray-800 hover:bg-gray-900 hover:cursor-pointer text-white px-4 sm:px-6 rounded-r-xl sm:rounded-r-2xl text-xs sm:text-sm font-thin transition-colors duration-200 focus:outline-none"
                  >
                    Search
                  </button>
                </div>

                {/* Quick Search Options with Enhanced Animation */}
                <div
                  className={`w-full max-w-4xl overflow-hidden quick-search-container transition-all duration-300 ease-out rounded-xl sm:rounded-2xl shadow-lg ${
                    showQuickSearch
                      ? "mt-3 sm:mt-4 max-h-96 opacity-100"
                      : "mt-0 max-h-0 opacity-0"
                  }`}
                >
                  <div
                    className={`bg-white/90 backdrop-blur-sm border border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 transform transition-all duration-300 ease-out ${
                      showQuickSearch
                        ? "scale-100 translate-y-0"
                        : "scale-95 -translate-y-2"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h3 className="text-sm sm:text-base font-medium text-gray-700">
                        Quick Search
                      </h3>
                      <button
                        onClick={() => setShowQuickSearch(false)}
                        className="text-gray-400 hover:text-gray-600 hover:cursor-pointer transition-colors duration-200 hover:scale-110"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                      {quickSearchOptions.map((option, index) => {
                        const IconComponent = option.icon;
                        return (
                          <button
                            key={option.id}
                            onClick={() => handleQuickSearch(option)}
                            className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border transition-all duration-200 hover:shadow-md hover:scale-[1.02] hover:cursor-pointer ${
                              activeFilter === option.id
                                ? option.color + " shadow-md"
                                : "bg-white text-gray-600 border-gray-100 hover:bg-gray-50"
                            }`}
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <IconComponent className="w-4 h-4 flex-shrink-0" />
                            <span className="text-xs sm:text-sm font-medium truncate">
                              {option.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Search Tips */}
                    <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-gray-100">
                      <p className="text-xs sm:text-sm text-gray-500 mb-2">
                        Search examples:
                      </p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                          available:yes
                        </span>
                        <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                          available:no
                        </span>
                        <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                          "exact phrase"
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Filter Display */}
                {activeFilter && (
                  <div className="w-full max-w-4xl mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm text-gray-500">
                        Active filter:
                      </span>
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all duration-200 ${
                          quickSearchOptions.find(
                            (opt) => opt.id === activeFilter
                          )?.color
                        }`}
                      >
                        <span>
                          {
                            quickSearchOptions.find(
                              (opt) => opt.id === activeFilter
                            )?.label
                          }
                        </span>
                        <button
                          onClick={() => {
                            setActiveFilter(null);
                            setSearchQuery("");
                          }}
                          className="hover:bg-black/10 rounded transition-colors duration-150"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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
                  <div className="flex flex-col gap-3 w-full max-w-6xl mx-auto">
                    {/* Top row - 3 stat cards */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full">
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
    </>
  );
};

export default Home; 