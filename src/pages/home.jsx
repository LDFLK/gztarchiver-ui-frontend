import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useDashboardStats } from "../hooks/useDashboardQuery";
import SearchResults from "../components/searchResults";
import TracePane from "../components/tracePane";
import { useNavigate } from "react-router-dom";

import {
  X,
  Users,
  LayoutList,
  Search,
  FileArchive,
  FileText,
  Calendar,
  Globe,
  Hash,
  MessageCircle,
  FileSearch,
  Building,
  CircleAlert,
  SquareArrowOutUpRight,
  MessageSquare,
  Linkedin,
  Github,
  ChevronUp,
  ChevronDown,
  Info,
  BarChart3,
} from "lucide-react";

import SkeletonCard from "../components/skeletonCard";
import ErrorCard from "../components/errorCard";
import ThemeToggle from "../components/ThemeToggle";

import { getReadableRelationshipName } from "../utils/relationshipUtils";

const Home = () => {
  const [urlParams, setUrlParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [types, setTypes] = useState([]);
  const [searchCriteria, setSearchCriteria] = useState([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [selectedNodeInfo, setSelectedNodeInfo] = useState(null);
  const [isTracePaneExpanding, setIsTracePaneExpanding] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const currentUrlQuery = urlParams.get("search") || "";

  const navigate = useNavigate();

  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 0,
    total_count: 0,
    limit: 10,
    has_next: false,
    has_prev: false,
    start_index: 0,
    end_index: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMessage, setShowMobileMessage] = useState(false);
  const [showMobileStats, setShowMobileStats] = useState(false);

  const updateUrlQuery = useCallback(
    (newQuery) => {
      if (newQuery && newQuery.trim()) {
        setUrlParams({ search: newQuery.trim() });
      } else {
        setUrlParams({});
      }
    },
    [setUrlParams]
  );

  // Quick search states
  const [showQuickSearch, setShowQuickSearch] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const [showLimitDropdown, setShowLimitDropdown] = useState(false);


  const handleTraceClick = (documentId) => {
    // Always check mobile status dynamically
    const checkMobile = window.innerWidth < 1024;

    // If mobile, show message instead of loading tracePane
    if (checkMobile) {
      setShowMobileMessage(true);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    params.set("docId", documentId);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({ docId: documentId }, "", newUrl);
    setSelectedDocumentId(documentId);

    // Scroll to and highlight the document after a short delay to allow layout to settle
    setTimeout(() => {
      const documentElement = document.querySelector(`[data-document-id="${documentId}"]`);
      if (documentElement) {
        documentElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });

        // Add highlight effect
        documentElement.classList.add('ring-2', 'ring-cyan-400', 'ring-opacity-75', 'bg-cyan-500/10');

        // Remove highlight after 3 seconds
        setTimeout(() => {
          documentElement.classList.remove('ring-2', 'ring-cyan-400', 'ring-opacity-75', 'bg-cyan-500/10');
        }, 3000);
      }
    }, 100);
  };

  const handleClosePane = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete("docId");
    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    window.history.pushState({}, "", newUrl);
    setSelectedDocumentId(null);
    setSelectedNodeInfo(null);
  };

  const handleNodeSelect = (nodeData) => {
    setSelectedNodeInfo(nodeData);
  };

  const handleExpandingChange = (isExpanding) => {
    setIsTracePaneExpanding(isExpanding);
  };

  // Reusable Stats Component
  const StatsDisplay = ({ isMobile = false }) => {
    const containerClass = isMobile
      ? "grid grid-cols-2 gap-4"
      : "flex items-center space-x-4";

    const statCardClass = isMobile
      ? "text-center p-3 rounded-lg dark:bg-gray-900/50 bg-gray-100/50"
      : "text-center";

    const valueClass = isMobile
      ? "text-xl font-bold text-cyan-400 transition-all duration-100"
      : "text-2xl font-bold text-cyan-400 transition-all duration-100";

    const labelClass = isMobile
      ? "text-xs dark:text-gray-400 text-gray-600 mt-1"
      : "text-xs dark:text-gray-400 text-gray-600";

    const yearsValueClass = isMobile
      ? "text-lg font-bold text-cyan-400 transition-all duration-100"
      : "text-2xl font-bold text-cyan-400 transition-all duration-100";

    const spinnerWrapperClass = "flex justify-center mt-1";
    const spinnerBaseClass = "mx-auto rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin mb-3";
    const defaultSpinnerSize = isMobile ? "h-4 w-4" : "h-5 w-5";

    const renderStatValue = (value, { spinnerSize, valueClassName } = {}) => {
      if (isLoading) {
        return (
          <div role="status" className={spinnerWrapperClass}>
            <span className="sr-only">Loading</span>
            <div
              aria-hidden="true"
              className={`${spinnerBaseClass} ${spinnerSize || defaultSpinnerSize}`}
            />
          </div>
        );
      }

      return <div className={valueClassName || valueClass}>{value}</div>;
    };

    return (
      <div className={containerClass}>
        {/* Total Documents */}
        <div className={statCardClass}>
          {renderStatValue(apiData?.total_docs?.toLocaleString() || "0")}
          <div className={labelClass}>Document Entries</div>
        </div>

        {/* Available Docs Count */}
        <div className={statCardClass}>
          {renderStatValue(apiData?.available_docs?.toLocaleString() || "0")}
          <div className={labelClass}>Documents Available</div>
        </div>

        {/* Document Types Count */}
        <div className={statCardClass}>
          {renderStatValue(((apiData?.document_types || []).length || 0).toLocaleString())}
          <div className={labelClass}>Document Types</div>
        </div>

        {/* Years Range */}
        <div className={statCardClass}>
          {renderStatValue(
            `${apiData?.years_covered?.from || "0"} - ${apiData?.years_covered?.to || "0"}`,
            { valueClassName: yearsValueClass }
          )}
          <div className={labelClass}>Years Covered</div>
        </div>
      </div>
    );
  };

  // ADD THIS useEffect to initialize from URL
  useEffect(() => {
    // Read document ID from URL on mount
    const params = new URLSearchParams(window.location.search);
    const docId = params.get("docId");
    if (docId) {
      setSelectedDocumentId(docId);
    }

    // Listen for URL changes (browser back/forward)
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const docId = params.get("docId");
      setSelectedDocumentId(docId);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Function to parse search query and extract active filters (No change here, still uses query string)
  const parseActiveFilters = (query) => {
    if (!query || !query.trim()) {
      return [];
    }

    const filters = [];
    const trimmedQuery = query.trim();

    // Parse date patterns (date:YYYY, date:YYYY-MM, date:YYYY-MM-DD)
    const dateMatches = trimmedQuery.match(/date:\d{4}(?:-\d{2}){0,2}/gi);
    if (dateMatches) {
      dateMatches.forEach((match) => {
        if (!filters.some((f) => f.query === match)) {
          const dateValue = match.split(":")[1];
          filters.push({
            id: `date-${dateValue}`,
            label: `Date: ${dateValue}`,
            color: "bg-blue-50 text-blue-700 border-blue-200",
            query: match,
          });
        }
      });
    }

    // ID patterns (id:XXXX)
    const idMatches = trimmedQuery.match(/id:[\w-]+/gi);
    if (idMatches) {
      idMatches.forEach((match) => {
        if (!filters.some((f) => f.query === match)) {
          const idValue = match.split(":")[1];
          filters.push({
            id: `id-${idValue}`,
            label: `ID: ${idValue}`,
            color: "bg-indigo-50 text-indigo-700 border-indigo-200",
            query: match,
          });
        }
      });
    }

    // Type patterns (type:XXXX)
    const typeMatches = trimmedQuery.match(/type:[\w_-]+/gi);
    if (typeMatches) {
      typeMatches.forEach((match) => {
        if (!filters.some((f) => f.query === match)) {
          const typeValue = match.split(":")[1];
          filters.push({
            id: `type-${typeValue}`,
            label: `Type: ${typeValue.replace(/_/g, " ")}`,
            color: "bg-purple-50 text-purple-700 border-purple-200",
            query: match,
          });
        }
      });
    }

    // Source patterns (source:XXXX)
    const sourceMatches = trimmedQuery.match(/source:[\w.]+/gi);
    if (sourceMatches) {
      sourceMatches.forEach((match) => {
        if (!filters.some((f) => f.query === match)) {
          const sourceValue = match.split(":")[1];
          filters.push({
            id: `source-${sourceValue}`,
            label: `Source: ${sourceValue}`,
            color: "bg-orange-50 text-orange-700 border-orange-200",
            query: match,
          });
        }
      });
    }

    // Available patterns (available:XXXX)
    const availableMatches = trimmedQuery.match(/available:[\w]+/gi);
    if (availableMatches) {
      availableMatches.forEach((match) => {
        if (!filters.some((f) => f.query === match)) {
          const availableValue = match.split(":")[1];
          filters.push({
            id: `available-${availableValue}`,
            label: `Available: ${availableValue}`,
            color: "bg-green-50 text-green-700 border-green-200",
            query: match,
          });
        }
      });
    }

    // Exact phrase patterns ("...")
    const phraseMatches = trimmedQuery.match(/"([^"]+)"/g);
    if (phraseMatches) {
      phraseMatches.forEach((match) => {
        if (!filters.some((f) => f.query === match)) {
          const phrase = match.replace(/"/g, "");
          filters.push({
            id: `phrase-${phrase}`,
            label: `"${phrase}"`,
            color: "bg-pink-50 text-pink-700 border-pink-200",
            query: match,
          });
        }
      });
    }

    // Check for general text search (text without special patterns)
    const cleanedQuery = trimmedQuery
      .replace(/date:\d{4}(?:-\d{2}){0,2}/gi, "")
      .replace(/type:\w+/gi, "")
      .replace(/id:[\w-]+/gi, "")
      .replace(/available:\w+/gi, "")
      .replace(/source:[\w.]+/gi, "")
      .replace(/"[^"]+"/g, "")
      .trim();

    if (cleanedQuery) {
      filters.push({
        id: `search-${cleanedQuery}`,
        label: cleanedQuery,
        color: "bg-cyan-50 text-cyan-700 border-cyan-200",
        query: cleanedQuery,
      });
    }

    return filters;
  };

  useEffect(() => {
    const filters = parseActiveFilters(currentUrlQuery);
    setActiveFilters(filters);

    setSearchInput(currentUrlQuery);
  }, [currentUrlQuery]);

  const handleSearchExecution = useCallback(
    async (query, page, searchLimit) => {
      if (!query.trim()) {
        setHasSearched(false);
        setSearchResults([]);
        setLoading(false);
        return;
      }

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
            query: query.trim(),
            page: page,
            limit: searchLimit,
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
            limit: searchLimit,
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
          limit: searchLimit,
          has_next: false,
          has_prev: false,
          start_index: 0,
          end_index: 0,
        });
      } finally {
        setLoading(false);
      }
    },
    [setUrlParams]
  );

  useEffect(() => {
    // currentUrlQuery is the actual search query now
    handleSearchExecution(currentUrlQuery, currentPage, limit);
  }, [currentUrlQuery, currentPage, limit, handleSearchExecution]); // Trigger search on URL query, page, or limit change

  const formatSearchInput = (input) => {
    if (input.includes(":")) {
      return input;
    }

    const tokens = input.trim().split(/\s+/);
    const textTokens = [];
    const inferredFilters = [];

    const DATE_REGEX = /^(19|20)\d{2}(-\d{2}){0,2}$/;

    for (const token of tokens) {
      if (DATE_REGEX.test(token)) {
        inferredFilters.push(`date:${token}`);
      } else {
        textTokens.push(token);
      }
    }

    if (inferredFilters.length === 0) {
      return input;
    }

    return [...textTokens, ...inferredFilters].join(" ").trim();
  };

  const handleSearch = (page = 1) => {
    const formattedSearchInput = formatSearchInput(searchInput);
    updateUrlQuery(formattedSearchInput);
    // Reset to page 1 for a new search term
    if (currentUrlQuery !== formattedSearchInput) {
      setCurrentPage(1);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch(1);
    }
  };


  const handlePageChange = (newPage) => {
    if (
      newPage !== currentPage &&
      newPage >= 1 &&
      newPage <= pagination.total_pages
    ) {
      setCurrentPage(newPage);
    }
  };

  const handleBack = () => {
    updateUrlQuery("");
    setHasSearched(false);
    setSearchResults([]);
    setCurrentPage(1);
    setActiveFilters([]);
    setShowQuickSearch(false);
    setSelectedDocumentId(null);
    setSelectedNodeInfo(null);
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
    setSearchInput("");
    updateUrlQuery("");
    setActiveFilters([]);
  };

  const toggleQuickSearch = (e) => {
    if (e) {
      e.stopPropagation();
    }
    setShowQuickSearch(prev => !prev);
    setShowLimitDropdown(false);
  };

  const handleSearchFocus = () => {
    if (!showQuickSearch) {
      setShowQuickSearch(true);
    }
    setShowLimitDropdown(false);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setShowLimitDropdown(false);
    if (currentUrlQuery.trim()) {
      setCurrentPage(1);
    }
  };

  const handleTypes = (type) => {
    setUrlParams({ search: `type:${type.replace(/ /g, "_").toUpperCase()}` });
    console.log(type)
  }

  const handleRandomSearch = () => {
    if (types.length > 0) {
      // Randomly select a type from the types array
      const randomType = types[Math.floor(Math.random() * types.length)];
      // Format it the same way as handleTypes does
      const formattedQuery = `type:${randomType.replace(/ /g, "_").toUpperCase()}`;
      // Trigger the search
      updateUrlQuery(formattedQuery);
    }
  }

  const handleCriteria = (criteria) => {
    setSearchInput(criteria);
  }

  const handleGazetteClick = (gazetteId) => {
    // setUrlParams({ search: gazetteId });
    const baseUrl = window.location.origin;

    // Construct the new URL with the search parameter
    const newUrl = `${baseUrl}/?search=id%3A${gazetteId}`;

    // Open the new URL in a new window/tab
    window.open(newUrl, "_blank");
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Remove individual filter
  const removeFilter = (filterToRemove) => {
    let newQuery = currentUrlQuery;

    // Remove the filter's query from the search string
    if (filterToRemove.query) {
      newQuery = newQuery
        .replace(filterToRemove.query, "")
        .replace(/\s+/g, " ")
        .trim();
    }

    // Update both local input and the URL
    setSearchInput(newQuery);
    updateUrlQuery(newQuery);
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

      // Close mobile stats drawer when clicking outside
      if (
        showMobileStats &&
        !event.target.closest('[aria-label="Toggle stats"]') &&
        !event.target.closest('.mobile-stats-drawer')
      ) {
        setShowMobileStats(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMobileStats]);

  const {
    data: apiData,
    isLoading,
    error: queryError,
  } = useDashboardStats(true); // Always fetch dashboard data
  // Process the data when it arrives
  useEffect(() => {
    if (apiData) {
      const mappedStats = [
        {
          icon: <FileText className="w-8 h-8 dark:text-gray-800 text-gray-600" />,
          title: "Total Documents",
          value: apiData.total_docs?.toLocaleString() || "0",
          description: "Archived files",
        },
        {
          icon: <Globe className="w-8 h-8 dark:text-gray-800 text-gray-600" />,
          title: "Available Languages",
          value: "languages",
          description: "Supported formats",
        },
        {
          icon: <LayoutList className="w-8 h-8 dark:text-gray-800 text-gray-600" />,
          title: "Available Types",
          value: "types",
          description: "Click to search with types"
        },
        {
          icon: <Calendar className="w-8 h-8 dark:text-gray-800 text-gray-600" />,
          title: "Years Covered",
          value: `${apiData.years_covered?.from || ""} - ${apiData.years_covered?.to || ""
            }`,
          description: "Date range",
        },
        {
          icon: <Search className="w-8 h-8 dark:text-gray-800 text-gray-600" />,
          title: "Search Criteria",
          value: "criteria",
          description: "Click to add search criteria",
        },
      ];

      setStats(mappedStats);
      setLanguages(apiData.available_languages || []);
      setTypes(apiData.document_types || []);
      setSearchCriteria(["id:", "type:", "date:", "available:", "source:"]);

    }
  }, [apiData]);

  // Sync loading state
  useEffect(() => {
    if (!currentUrlQuery) {
      setLoading(isLoading);
    }
  }, [isLoading, currentUrlQuery]);
  // Sync error state
  useEffect(() => {
    if (queryError) {
      setError(queryError.message);
      console.error("Error fetching dashboard stats:", queryError);
    } else {
      setError(null);
    }
  }, [queryError]);

  // Scroll listener for scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      // Show button when scrolled down more than 300px and there are search results
      setShowScrollTop(scrollTop > 300 && currentUrlQuery);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentUrlQuery]);

  // Detect mobile/tablet
  useEffect(() => {
    const handleResize = () => {
      const wasMobile = isMobile;
      const nowMobile = window.innerWidth < 1024;
      setIsMobile(nowMobile);

      // Close mobile stats drawer if switching from mobile to desktop
      if (wasMobile && !nowMobile) {
        setShowMobileStats(false);
      }
    };

    handleResize(); // Run on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile]);

  return (
    <>
      {/* Modern Tech Archive Background */}
      <div className="min-h-screen dark:bg-gray-950 bg-white relative overflow-hidden">
        {/* Tech Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        {/* Animated Tech Lines */}
        <div className="absolute inset-0 overflow-hidden">
          {/* <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" style={{animationDelay: '1s'}}></div> */}
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div
          className={`min-h-screen flex flex-col transition-all duration-500 ${selectedDocumentId ? "pointer-events-none" : "pointer-events-auto"
            } ${selectedDocumentId ? "w-1/3 max-w-none h-screen overflow-y-auto scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-cyan-500 hover:scrollbar-thumb-cyan-400" : ""}`}
        >
          {/* Header Section */}
          <header className={`fixed top-0 left-0 right-0 z-1000 dark:border-b border-b dark:border-gray-800 dark:bg-gray-950 bg-white/95 backdrop-blur-sm transition-all duration-700 ease-out ${selectedDocumentId ? "pointer-events-auto" : ""}`}>
            <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                {/* Logo */}
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div>
                    <button
                      onClick={handleBack}
                      className="text-3xl sm:text-2xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent hover:from-cyan-300 hover:to-cyan-400 transition-all duration-200 cursor-pointer"
                    >
                      Archives
                    </button>
                  </div>
                </div>

                {/* Right Side: Stats Overview + Theme Toggle */}
                <div className="flex items-center space-x-2 sm:space-x-4">
                  {/* Mobile Stats Button - Only visible on mobile */}
                  <button
                    onClick={() => setShowMobileStats(!showMobileStats)}
                    className="md:hidden p-2 dark:text-gray-400 text-cyan-400 dark:hover:text-cyan-400 hover:text-cyan-500 hover:cursor-pointer rounded-lg dark:hover:bg-gray-800/50 hover:bg-gray-100 transition-all duration-200 relative"
                    aria-label="Toggle stats"
                  >
                    <BarChart3 className="w-5 h-5" />
                    {showMobileStats && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full"></div>
                    )}
                  </button>

                  {/* Stats Overview - Desktop Only */}
                  <div className="hidden md:flex items-center">
                    <StatsDisplay isMobile={false} />
                  </div>

                  {/* Theme Toggle */}
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </header>

          {/* Mobile Stats Drawer - Slides down from header */}
          {showMobileStats && (
            <div className={`mobile-stats-drawer fixed top-20 left-0 right-0 z-[999] md:hidden bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-b dark:border-gray-800 border-gray-300 shadow-lg animate-slideDown ${selectedDocumentId ? "pointer-events-auto" : ""}`}>
              <div className="max-w-7xl mx-auto px-4 py-5">
                <StatsDisplay isMobile={true} />
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className={`flex-1 relative z-10 transition-all duration-700 ease-out ${showMobileStats ? 'pt-[9rem]' : 'pt-16'} ${currentUrlQuery ? "flex items-start justify-start" : "flex items-center justify-center"
            } ${selectedDocumentId ? "pointer-events-auto" : ""}`}>
            <div className={`transition-all duration-700 ease-out ${selectedDocumentId ? "w-full" : "w-full max-w-7xl mx-auto"
              } px-4 sm:px-6 lg:px-8 py-8`}>
              <div
                className={`transition-all duration-700 ease-out ${currentUrlQuery ? "pt-4" : ""
                  }`}
              >
                {/* Hero Section */}
                {!currentUrlQuery && (
                  <div
                    className={`text-center mb-8 sm:mb-8 px-2 transition-all duration-500 ease-in-out ${showQuickSearch
                      ? 'scale-90'
                      : 'scale-100 translate-y-0 opacity-100'
                      }`}
                  >
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold dark:text-white text-gray-700 mb-4 sm:mb-6">
                      Sri Lanka Open
                      <span className="block bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">
                        Document Archive
                      </span>
                    </h2>
                    <p className="text-sm sm:text-lg md:text-xl dark:text-gray-300 text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 px-2">
                      Advanced search and analysis platform for open documents,
                      enabling connections and data-driven insights.
                    </p>
                  </div>
                )}

                {/* Search Section */}
                <div className={`${selectedDocumentId ? 'max-w-2xl' : 'max-w-4xl'} mx-auto mb-6 sm:mb-8 quick-search-container`}>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl sm:rounded-2xl blur-xl"></div>
                    <div className={`relative dark:bg-gray-900/80 bg-white backdrop-blur-sm dark:border dark:border-gray-800 rounded-full ${selectedDocumentId ? 'p-1' : 'p-1.5 sm:p-2'}`}>
                      <div className="flex items-center">
                        <Search className={`${selectedDocumentId ? 'w-4 h-4' : 'w-4 h-4 sm:w-5 sm:h-5'} dark:text-gray-400 text-gray-400 ${selectedDocumentId ? 'ml-2' : 'ml-2 sm:ml-4'}`} />
                        <input
                          type="text"
                          placeholder="Search documents..."
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          onKeyDown={handleKeyPress}
                          onFocus={handleSearchFocus}
                          className={`flex-1 bg-transparent dark:text-white text-gray-600 placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none text-base ${selectedDocumentId ? 'px-2 py-2 text-sm' : 'px-2 py-2 sm:px-4 sm:py-3'}`}
                        />
                        <div className={`flex items-center ${selectedDocumentId ? 'space-x-1 mr-1' : 'space-x-1 sm:space-x-2 mr-1 sm:mr-2'}`}>
                          {searchInput && (
                            <button
                              onClick={clearSearch}
                              className={`${selectedDocumentId ? 'p-1' : 'p-1 sm:p-2'} dark:text-gray-400 text-gray-400 dark:hover:dark:text-white hover:text-gray-900 dark:hover:bg-gray-700 hover:bg-gray-300 rounded-lg transition-colors`}
                            >
                              <X className={`${selectedDocumentId ? 'w-3 h-3' : 'w-3 h-3 sm:w-4 sm:h-4'}`} />
                            </button>
                          )}
                          <div className="relative group">
                            <button
                              onClick={toggleQuickSearch}
                              className={`${selectedDocumentId ? 'p-1' : 'p-1 sm:p-2'} rounded-lg transition-colors hover:cursor-pointer ${showQuickSearch
                                ? "text-cyan-400 bg-cyan-400/10"
                                : "dark:text-gray-400 text-gray-400 hover:text-cyan-300"
                                }`}
                            >
                              <FileSearch className={`${selectedDocumentId ? 'w-3 h-3' : 'w-3 h-3 sm:w-4 sm:h-4'}`} />
                            </button>
                            {/* Tooltip - appears below icon */}
                            {!showQuickSearch && (
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 text-xs font-medium text-white bg-gray-900 dark:bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                Quick search
                                {/* Tooltip arrow pointing to icon */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 translate-y-0">
                                  <div className="border-4 border-transparent border-b-gray-900 dark:border-b-gray-800"></div>
                                </div>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleSearch(1)}
                            className={`${selectedDocumentId ? 'px-3 py-1.5 text-xs' : 'px-3 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-base'} bg-gradient-to-r from-cyan-500 to-blue-500 dark:text-white text-white font-medium rounded-full hover:from-cyan-600 hover:to-blue-600 transition-colors duration-200 hover:cursor-pointer whitespace-nowrap`}
                          >
                            <span>Search</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Take me somewhere button */}
                  {!currentUrlQuery && !showQuickSearch && (
                    <div className={`${selectedDocumentId ? 'max-w-2xl' : 'max-w-4xl'} mx-auto mb-4 sm:mb-6 px-2 flex gap-3 justify-center mt-4`}>
                      <div className="relative group">
                        <button
                          onClick={handleRandomSearch}
                          disabled={types.length === 0}
                          className={`px-4 py-2 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 hover:cursor-pointer whitespace-nowrap ${types.length === 0
                            ? 'dark:text-gray-600 text-gray-300 cursor-not-allowed'
                            : 'text-cyan-400 hover:text-cyan-500'
                            }`}
                        >
                          Take me somewhere
                        </button>
                        {/* Tooltip - side message box */}
                        <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-1 px-3 py-2 text-xs font-medium text-white bg-gray-900 dark:bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                          Explore random documents
                          {/* Tooltip arrow pointing to button */}
                          <div className="absolute right-full top-1/2 transform -translate-y-1/2 -translate-x-0">
                            <div className="border-4 border-transparent border-r-gray-900 dark:border-r-gray-800"></div>
                          </div>
                        </div>
                      </div>

                    </div>

                  )}


                  {/* Quick Search Panel */}
                  <div className={`${selectedDocumentId ? 'max-w-2xl' : 'max-w-4xl'} mx-auto px-2 quick-search-container`}>
                    {showQuickSearch && (
                      <div className="mt-3 sm:mt-4 mb-6 sm:mb-8 transition-all duration-300 opacity-100">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl sm:rounded-2xl blur-xl"></div>
                          <div className={`relative dark:bg-gray-900 bg-white backdrop-blur-sm dark:border dark:border-gray-800 rounded-xl sm:rounded-2xl ${selectedDocumentId ? 'p-3' : 'p-4 sm:p-5'}`}>
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                              <h3 className={`${selectedDocumentId ? 'text-sm' : 'text-base sm:text-lg'} font-semibold dark:text-white text-gray-700`}>Quick Search</h3>
                              <button
                                onClick={() => setShowQuickSearch(false)}
                                className="dark:text-gray-400 text-gray-600 dark:hover:dark:text-white hover:text-gray-900 dark:hover:bg-gray-700 hover:bg-gray-300 rounded-lg transition-colors cursor-pointer p-1"
                              >
                                <X className={`${selectedDocumentId ? 'w-4 h-4' : 'w-4 h-4 sm:w-5 sm:h-5'}`} />
                              </button>
                            </div>

                            {/* Document Types */}
                            <div className="mb-3 sm:mb-4">
                              <p className="text-xs sm:text-sm dark:text-gray-400 text-gray-600 mb-2 font-medium">Document Types:</p>
                              <div className="flex flex-wrap gap-2">
                                {loading ? (
                                  <>
                                    <div className="px-3 py-1.5 dark:bg-gray-800 bg-gray-200/50 rounded-lg animate-pulse">
                                      <div className="w-16 h-4"></div>
                                    </div>
                                    <div className="px-3 py-1.5 dark:bg-gray-800 bg-gray-200/50 rounded-lg animate-pulse">
                                      <div className="w-16 h-4"></div>
                                    </div>
                                    <div className="px-3 py-1.5 dark:bg-gray-800 bg-gray-200/50 rounded-lg animate-pulse">
                                      <div className="w-16 h-4"></div>
                                    </div>
                                    <div className="px-3 py-1.5 dark:bg-gray-800 bg-gray-200/50 rounded-lg animate-pulse">
                                      <div className="w-16 h-4"></div>
                                    </div>
                                  </>
                                ) : types.length > 0 ? (
                                  types.map((type, index) => (
                                    <button
                                      key={index}
                                      onClick={() => handleTypes(type)}
                                      className="px-1.5 py-1 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-cyan-500/10 dark:hover:text-cyan-400 rounded-lg text-xs sm:text-sm font-medium bg-gray-100 hover:bg-cyan-500/10 hover:text-cyan-500 text-gray-500 cursor-pointer transition-all duration-200"
                                    >
                                      {type}
                                    </button>
                                  ))
                                ) : (
                                  <div className="text-gray-500 text-xs sm:text-sm">No document types available</div>
                                )}
                              </div>
                            </div>

                            {/* Search Criteria */}
                            <div className="border-t dark:border-gray-700 border-gray-300 pt-3 pb-3 sm:pt-4">
                              <p className="text-xs sm:text-sm dark:text-gray-400 text-gray-600 mb-2 font-medium">Search Criteria:</p>
                              <div className="flex flex-wrap gap-2">
                                {["id:", "type:", "date:", "available:", "source:"].map((criteria, index) => (
                                  <button
                                    key={index}
                                    onClick={() => handleCriteria(criteria)}
                                    className="px-1.5 py-1 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-cyan-500/10 dark:hover:text-cyan-400 rounded-lg text-xs sm:text-sm font-medium bg-gray-100 hover:bg-cyan-500/10 hover:text-cyan-500 text-gray-500 cursor-pointer transition-all duration-200"
                                  >
                                    {criteria}
                                  </button>
                                ))}
                              </div>
                            </div>

                          <div className="border-t dark:border-gray-700 border-gray-300 pt-3 sm:pt-4">
                            <p className="text-xs sm:text-sm dark:text-gray-400 text-gray-600 mb-2 sm:mb-3 font-medium">Search Examples:</p>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                              {["date:2015", "type:people", "id:2030-05", "available:yes", '"exact phrase"', "date:last-year", "date:last-x-days", "date:this-year"].map((example) => (
                                        <span
                                  key={example}
                                  className="px-1.5 py-1 dark:bg-gray-800 bg-gray-100 dark:text-gray-300 text-gray-500 rounded-lg text-xs font-medium"
                                        >
                                  {example}
                                        </span>
                                      ))}
                                    </div>
                                    </div>
                              </div>
                    </div>
                  </div>
                )}
              </div>

                  {/* Active Filters */}
                  {activeFilters.length > 0 && (
                    <div className={`${selectedDocumentId ? 'max-w-2xl' : 'max-w-4xl'} mx-auto mt-3 sm:mt-4 px-2 mb-4 sm:mb-6`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs sm:text-sm dark:text-gray-400 text-gray-600">Active filters:</span>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {activeFilters.map((filter) => (
                              <div
                                key={filter.id}
                                className="flex items-center space-x-1.5 sm:space-x-2 px-2 py-1 sm:px-3 sm:py-1 dark:bg-cyan-500/10 dark:border dark:border-cyan-500/30 rounded-lg dark:text-cyan-400 bg-gray-100 text-gray-500"
                              >
                                <span className="text-xs font-medium">{filter.label}</span>
                                <button
                                  onClick={() => removeFilter(filter)}
                                  className="dark:text-cyan-400 text-gray-500 dark:hover:dark:text-white hover:text-gray-900 hover:cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>


                {/* Search Results Section */}
                <div
                  className={`transition-all duration-700 ease-out ${currentUrlQuery
                    ? "opacity-100 scale-100 pointer-events-auto"
                    : "opacity-0 scale-95 pointer-events-none h-0 overflow-hidden"
                    }`}
                >
                  {currentUrlQuery && (
                    <SearchResults
                      query={currentUrlQuery}
                      results={searchResults}
                      pagination={pagination}
                      currentPage={currentPage}
                      onPageChange={handlePageChange}
                      onBack={handleBack}
                      loading={loading}
                      limit={limit}
                      showLimitDropdown={showLimitDropdown}
                      onTraceClick={handleTraceClick}
                      handleLimitChange={handleLimitChange}
                      setShowLimitDropdown={setShowLimitDropdown}
                      isShrunked={!!selectedDocumentId}
                    />
                  )}
                </div>

                {/* Loading State */}
                {loading && currentUrlQuery && (
                  <div className="flex justify-center items-center py-12">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-8 h-8 border-2 dark:border-gray-600 dark:border-t-cyan-400 border-t-cyan-400 rounded-full animate-spin"></div>
                      {/* <p className="dark:text-gray-400 text-gray-600 font-medium">Searching archives...</p> */}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className={`relative z-10 border-t dark:border-gray-800 border-gray-300/50 mt-12 ${selectedDocumentId ? "pointer-events-auto" : ""
            }`}>
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between">
                {/* Copyright */}
                <a href="https://opendata.lk" target="_blank" rel="noopener noreferrer">
                  <p className="dark:text-gray-400 text-gray-500 text-xs sm:text-sm">
                    <span className="dark:hover:dark:text-white dark:text-gray-400 text-gray-500 hover:text-gray-900">Open Data</span> © {new Date().getFullYear()}. All rights reserved.
                  </p>
                  <p className="dark:text-gray-400 text-gray-500 text-xs">
              Licensed under{" "}
              <a
                href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="dark:text-cyan-400 hover:underline"
              >
                CC BY-NC-SA 4.0
              </a>
            </p>
                </a>

                {/* Social Media Links */}
                <div className="flex items-center space-x-4">
                  <a
                    href="https://discord.gg/mg94NtHD9Y"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 dark:text-gray-400 text-gray-500 dark:hover:dark:text-white hover:text-gray-900 transition-all duration-200 hover:scale-110"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.linkedin.com/company/lankadata/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 dark:text-gray-400 text-gray-500 dark:hover:dark:text-white hover:text-gray-900 transition-all hover:scale-110"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a
                    href="https://github.com/LDFLK"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 dark:text-gray-400 text-gray-500 dark:hover:dark:text-white hover:text-gray-900 transition-all duration-200 hover:scale-110"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {selectedDocumentId && (
        <div className="fixed top-16 right-0 bottom-0 w-2/3 dark:bg-black/30 bg-white/30 z-40 transition-opacity duration-500"></div>
      )}

      {/* Left Info Panel (1/3 width) - Only show when a node is selected */}
      {selectedDocumentId && selectedNodeInfo && (
        <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-1/3 dark:bg-gray-950 bg-white shadow-2xl overflow-y-auto animate-slideInLeft dark:border-gray-800 scrollbar-thin dark:scrollbar-track-gray-900 dark:scrollbar-track-gray-200 dark:scrollbar-thumb-cyan-500 dark:hover:scrollbar-thumb-cyan-400 z-50">
          {/* Loading Overlay */}
          {isTracePaneExpanding && (
            <div className="absolute inset-0 flex items-center justify-center z-20 dark:bg-gray-950 bg-white/80 backdrop-blur-sm">
              <div className="text-center">
                <div className="inline-block w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
                <p className="text-sm dark:text-gray-400 text-gray-600 mt-2">Loading connections...</p>
              </div>
            </div>
          )}

          {/* Header with Icon and Title */}
          <div className={`pt-6 ${isTracePaneExpanding ? 'opacity-40' : ''}`}>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center">
                <FileText className="w-8 h-8 dark:text-white text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold dark:text-white text-cyan-400 mb-2">
                {selectedNodeInfo.node.data.title}
              </h2>
              <p className="text-sm dark:text-gray-400 text-gray-500 font-light">
                {selectedNodeInfo.connections.length} Relationship{selectedNodeInfo.connections.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
          <div className={`p-4 transition-opacity duration-300 ${isTracePaneExpanding ? 'opacity-40' : ''}`}>
            {/* Connections List */}
            {selectedNodeInfo.connections.length > 0 && (
              <div>
                <div className="space-y-2">
                  {selectedNodeInfo.connections
                    .slice() // create a shallow copy so the original array isn't mutated
                    .sort((a, b) => {
                      const order = ["AS_DOCUMENT", "AMENDS", "REFERS_TO"];
                      return order.indexOf(a.name) - order.indexOf(b.name);
                    })
                    .map((connection, index) => (
                      <div
                        key={index}
                        className={`p-4 border-b dark:border-gray-700 border-gray-300 
                          transform transition-all duration-300 ${connection.relatedEntityId !== "gov_01"
                            ? "hover:cursor-pointer hover:scale-[1.02] dark:hover:bg-gradient-to-br dark:hover:from-gray-700/50 dark:hover:to-gray-800/50 hover:bg-gradient-to-br hover:from-gray-100/50 hover:to-gray-200/50 hover:border-cyan-500/50 hover:shadow-lg"
                            : ""
                          }`}
                        onClick={() =>
                          handleGazetteClick(connection.document_number)
                        }
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-cyan-400" />
                            <p className="text-sm font-medium dark:text-white text-gray-900">
                              {connection.relatedEntityId !== "gov_01"
                                ? "Gazette "
                                : ""}
                              {connection.document_number}
                            </p>
                          </div>
                          {connection.relatedEntityId !== "gov_01" && (
                            <div className="relative group">
                              <SquareArrowOutUpRight className="text-cyan-400 w-4 h-4 hover:scale-110 transition-transform" />
                              {/* Tooltip - appears from left side */}
                              <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 px-3 py-2 text-xs font-medium text-white bg-gray-900 dark:bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                Open document
                                {/* Tooltip arrow pointing to icon */}
                                <div className="absolute left-full top-1/2 transform -translate-y-1/2 translate-x-0">
                                  <div className="border-4 border-transparent border-l-gray-900 dark:border-l-gray-800"></div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium dark:text-gray-400 text-gray-600">
                            Relationship:
                          </span>
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-semibold ${connection.name === "AS_DOCUMENT"
                              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                              : connection.name === "AMENDS"
                                ? "bg-teal-500/10 text-teal-400 border border-teal-500/30"
                                : connection.name === "REFERS_TO"
                                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30"
                                  : "bg-gray-500/10 dark:text-gray-400 text-gray-600 border border-gray-500/30"
                              }`}
                          >
                            {getReadableRelationshipName(
                              connection.name || "DEFAULT"
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {selectedNodeInfo.connections.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 dark:bg-gray-800/50 bg-gray-200/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CircleAlert className="w-8 h-8 dark:text-gray-500 text-gray-400" />
                </div>
                <p className="text-sm dark:text-gray-400 text-gray-600 font-medium">
                  No connections found for this document
                </p>
                <p className="text-xs dark:text-gray-500 text-gray-500 mt-2">
                  This document has no relationships with others
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedDocumentId && (
        <>
          <TracePane
            documentId={selectedDocumentId}
            onClose={handleClosePane}
            onNodeSelect={handleNodeSelect}
            onExpandingChange={handleExpandingChange}
          />

          {/* Mobile Message Overlay - Shows when mobile and tracePane is active */}
          {isMobile && (
            <div className="fixed inset-0 dark:bg-gray-950/95 bg-white backdrop-blur-sm z-[100] flex items-center justify-center text-center px-6">
              <div className="dark:bg-gray-900 bg-white border-none shadow-xl px-6 py-8 rounded-lg flex flex-col items-center justify-center text-center max-w-md mx-4">
                <Info className="text-cyan-400 mb-4 w-8 h-8" />
                <p className="dark:text-white text-gray-500 text-base font-medium mb-2">
                  Desktop Recommended
                </p>
                <p className="dark:text-gray-400 text-gray-500 text-sm mb-6">
                  Please use a Desktop browser to explore connections. Mobile and Tablet devices are not fully supported.
                </p>
                <button
                  onClick={handleClosePane}
                  className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 dark:text-white text-white rounded-lg transition-all font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Mobile Message Overlay - Shows when clicking Explore on mobile without tracePane */}
      {showMobileMessage && !selectedDocumentId && (
        <div className="fixed inset-0 dark:bg-gray-950 bg-white backdrop-blur-sm z-[100] flex items-center justify-center text-center px-6">
          <div className="dark:bg-gray-900 bg-white border-none shadow-xl px-6 py-8 rounded-lg flex flex-col items-center justify-center text-center max-w-md mx-4">
            <Info className="text-cyan-400 mb-4 w-8 h-8" />
            <p className="dark:text-white text-gray-500 text-base font-medium mb-2">
              Desktop Recommended
            </p>
            <p className="dark:text-gray-400 text-gray-500 text-sm mb-6">
              Please use a Desktop browser to explore connections. Mobile and Tablet devices are not fully supported.
            </p>
            <button
              onClick={() => setShowMobileMessage(false)}
              className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 dark:text-white text-white rounded-lg transition-all font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Scroll to Top Button - Only show when on search results page */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full shadow-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 hover:scale-110 flex items-center justify-center group hover:cursor-pointer"
          title="Go to top"
        >
          <ChevronUp className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
        </button>
      )}

      <style jsx>{`
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.3s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        /* Custom Scrollbar Styling - Light Theme (default) */
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f3f4f6; /* gray-100 */
          border-radius: 4px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #9ca3af; /* gray-400 */
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #6b7280; /* gray-500 */
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:active {
          background: #4b5563; /* gray-600 */
        }

        /* Dark Theme Scrollbar */
        .dark .scrollbar-thin::-webkit-scrollbar-track {
          background: #111827; /* gray-900 */
        }

        .dark .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #06b6d4; /* cyan-500 */
        }

        .dark .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #0891b2; /* cyan-600 */
        }

        .dark .scrollbar-thin::-webkit-scrollbar-thumb:active {
          background: #0e7490; /* cyan-700 */
        }

        /* Firefox scrollbar styling - Light Theme */
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: #9ca3af #f3f4f6; /* gray-400 gray-100 */
        }

        /* Firefox scrollbar styling - Dark Theme */
        .dark .scrollbar-thin {
          scrollbar-color: #06b6d4 #111827; /* cyan-500 gray-900 */
        }
      `}</style>
    </>
  );
};

export default Home;
