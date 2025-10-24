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
} from "lucide-react";

import SkeletonCard from "../components/skeletonCard";
import ErrorCard from "../components/errorCard";

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
  const [animatedStats, setAnimatedStats] = useState({
    totalDocs: 0,
    availableDocs: 0,
    documentTypes: 0,
    yearsFrom: 0,
    yearsTo: 0
  });
  const [animationIntervals, setAnimationIntervals] = useState([]);
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

  const quickSearchOptions = [
    {
      id: "2015",
      label: "2015",
      icon: Calendar,
      query: "date:2015",
      color: "bg-blue-50 text-blue-700 border-blue-200",
      pattern: /date:2015\b(?!-\d)/i,
    },
    {
      id: "2016",
      label: "2016",
      icon: Calendar,
      query: "date:2016",
      color: "bg-purple-50 text-purple-700 border-purple-200",
      pattern: /date:2016\b(?!-\d)/i,
    },
    {
      id: "people",
      label: "People",
      icon: Users,
      query: "type:people",
      color: "bg-green-50 text-green-700 border-green-200",
      pattern: /type:people/i,
    },
    {
      id: "organisational",
      label: "Organisational",
      icon: Building,
      query: "type:organisational",
      color: "bg-orange-50 text-orange-700 border-orange-200",
      pattern: /type:organisational/i,
    },
    {
      id: "available",
      label: "Available Only",
      icon: MessageCircle,
      query: "available:yes",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      pattern: /available:yes/i,
    },
    {
      id: "gov-source",
      label: "Gov Source",
      icon: Hash,
      query: "source:gov.lk",
      color: "bg-red-50 text-red-700 border-red-200",
      pattern: /source:gov\.lk/i,
    },
  ];

  const handleTraceClick = (documentId) => {
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

    // Check for predefined quick search patterns
    quickSearchOptions.forEach((option) => {
      if (option.pattern && option.pattern.test(trimmedQuery)) {
        filters.push({
          id: option.id,
          label: option.label,
          color: option.color,
          query: option.query,
        });
      }
    });

    // Parse other patterns that might not be in quick search
    const dateMatches = trimmedQuery.match(/date:(\d{4}(?:-\d{2}){0,2})/gi);
    if (dateMatches) {
      dateMatches.forEach((match) => {
        const dateValue = match.split(":")[1];
        // Only add if not already in filters
        if (!filters.some((f) => f.query === match)) {
          filters.push({
            id: `date-${dateValue}`,
            label: dateValue,
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

  const handleSearch = (page = 1) => {
    updateUrlQuery(searchInput);
    // Reset to page 1 for a new search term
    if (currentUrlQuery !== searchInput) {
      setCurrentPage(1);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch(1);
    }
  };

  const handleQuickSearch = (option) => {
    setCurrentPage(1);
    setSearchInput(option.query);
    updateUrlQuery(option.query);
    setShowQuickSearch(false);
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

  // Rapid continuous counter function
  const startRapidCounters = () => {
    // Clear any existing intervals
    animationIntervals.forEach(interval => clearInterval(interval));
    
    const intervals = [];
    
    // Total Documents - rapid increment
    const totalDocsInterval = setInterval(() => {
      setAnimatedStats(prev => ({
        ...prev,
        totalDocs: Math.floor(Math.random() * 99999) + 1000
      }));
    }, 50); // Very fast - every 50ms
    
    // Available Docs - rapid increment
    const availableDocsInterval = setInterval(() => {
      setAnimatedStats(prev => ({
        ...prev,
        availableDocs: Math.floor(Math.random() * 99999) + 1000
      }));
    }, 100); // Fast - every 100ms
    
    // Document Types - rapid increment
    const documentTypesInterval = setInterval(() => {
      setAnimatedStats(prev => ({
        ...prev,
        documentTypes: Math.floor(Math.random() * 20) + 1
      }));
    }, 120); // Medium speed - every 120ms
    
    // Years - rapid increment
    const yearsFromInterval = setInterval(() => {
      setAnimatedStats(prev => ({
        ...prev,
        yearsFrom: Math.floor(Math.random() * 50) + 1970
      }));
    }, 80); // Fast - every 80ms
    
    const yearsToInterval = setInterval(() => {
      setAnimatedStats(prev => ({
        ...prev,
        yearsTo: Math.floor(Math.random() * 30) + 2020
      }));
    }, 80); // Fast - every 80ms
    
    intervals.push(totalDocsInterval, availableDocsInterval, documentTypesInterval, yearsFromInterval, yearsToInterval);
    setAnimationIntervals(intervals);
  };

  // Stop rapid counters
  const stopRapidCounters = () => {
    animationIntervals.forEach(interval => clearInterval(interval));
    setAnimationIntervals([]);
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
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
          icon: <LayoutList className="w-8 h-8 text-gray-800" />,
          title: "Available Types",
          value: "types",
          description: "Click to search with types"
        },
        {
          icon: <Calendar className="w-8 h-8 text-gray-800" />,
          title: "Years Covered",
          value: `${apiData.years_covered?.from || ""} - ${
            apiData.years_covered?.to || ""
          }`,
          description: "Date range",
        },
        {
          icon: <Search className="w-8 h-8 text-gray-800" />,
          title: "Search Criteria",
          value: "criteria",
          description: "Click to add search criteria",
        },
      ];

      setStats(mappedStats);
      setLanguages(apiData.available_languages || []);
      setTypes(apiData.document_types || []);
      setSearchCriteria(["id:", "type:", "date:", "available:", "source:"]);

      // Stop rapid counters and set real values when data loads
      stopRapidCounters();
      
      const totalDocs = parseInt(apiData.total_docs) || 0;
      const availableDocs = parseInt(apiData.available_docs) || 0;
      const documentTypesCount = (apiData.document_types || []).length;
      const yearsFrom = parseInt(apiData.years_covered?.from) || 0;
      const yearsTo = parseInt(apiData.years_covered?.to) || 0;

      // Set real values
      setAnimatedStats({
        totalDocs: totalDocs,
        availableDocs: availableDocs,
        documentTypes: documentTypesCount,
        yearsFrom: yearsFrom,
        yearsTo: yearsTo
      });
    }
  }, [apiData]);

  // Sync loading state
  useEffect(() => {
    if (!currentUrlQuery) {
      setLoading(isLoading);
    }
  }, [isLoading, currentUrlQuery]);

  // Start rapid counters when loading starts (always when data is loading)
  useEffect(() => {
    if (isLoading) {
      // Reset to 0 first
      setAnimatedStats({
        totalDocs: 0,
        availableDocs: 0,
        documentTypes: 0,
        yearsFrom: 0,
        yearsTo: 0
      });
      // Start rapid counting
      startRapidCounters();
    } else if (!isLoading) {
      // Stop rapid counters when not loading
      stopRapidCounters();
    }
  }, [isLoading]);

  // Sync error state
  useEffect(() => {
    if (queryError) {
      setError(queryError.message);
      console.error("Error fetching dashboard stats:", queryError);
    } else {
      setError(null);
    }
  }, [queryError]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      stopRapidCounters();
    };
  }, []);

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

  return (
    <>
      {/* Modern Tech Archive Background */}
      <div className="min-h-screen bg-gray-950 relative overflow-hidden">
        {/* Tech Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        
        {/* Animated Tech Lines */}
        <div className="absolute inset-0 overflow-hidden">
          {/* <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" style={{animationDelay: '1s'}}></div> */}
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        <div
          className={`min-h-screen flex flex-col transition-all duration-500 ${
          selectedDocumentId ? "pointer-events-none" : "pointer-events-auto"
        } ${selectedDocumentId ? "w-1/3 max-w-none h-screen overflow-y-auto scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-cyan-500 hover:scrollbar-thumb-cyan-400" : ""}`}
        >
          {/* Header Section */}
           <header className="fixed top-0 left-0 right-0 z-1000 border-b border-gray-800/50 bg-gray-950/95 backdrop-blur-sm transition-all duration-700 ease-out">
            <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                {/* Logo */}
                <div className="flex items-center space-x-3">
                  {/* <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                    <FileArchive className="w-6 h-6 text-white" />
                  </div> */}
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">Archives</h1>
                    {/* <p className="text-xs text-gray-400">Sri Lankan Government Documents Archive</p> */}
                  </div>
                </div>

                {/* Stats Overview - Always Visible */}
                <div className="hidden md:flex items-center space-x-4">
                  {/* Total Documents */}
                  <div className="text-center">
                    <div className={`text-2xl font-bold text-cyan-400 transition-all duration-100`}>
                      {isLoading ? 
                        animatedStats.totalDocs.toLocaleString().padStart(5, '0') : 
                        (apiData?.total_docs?.toLocaleString() || "0")
                      }
                    </div>
                    <div className="text-xs text-gray-400">Document Entries</div>
                  </div>
                  
                  {/* Available Docs Count */}
                  <div className="text-center">
                    <div className={`text-2xl font-bold text-cyan-400 transition-all duration-100`}>
                      {isLoading ? 
                        animatedStats.availableDocs.toLocaleString().padStart(5, '0') : 
                        (apiData?.available_docs?.toLocaleString() || "0")
                      }
                    </div>
                    <div className="text-xs text-gray-400">Documents Available</div>
                  </div>
                  
                  {/* Document Types Count */}
                  <div className="text-center">
                    <div className={`text-2xl font-bold text-cyan-400 transition-all duration-100`}>
                      {isLoading ? 
                        animatedStats.documentTypes.toString().padStart(2, '0') : 
                        ((apiData?.document_types || []).length || 0)
                      }
                    </div>
                    <div className="text-xs text-gray-400">Document Types</div>
                  </div>
                  
                  {/* Years Range */}
                  <div className="text-center">
                    <div className={`text-2xl font-bold text-cyan-400 transition-all duration-100`}>
                      {isLoading ? 
                        `${animatedStats.yearsFrom.toString().padStart(4, '0')} - ${animatedStats.yearsTo.toString().padStart(4, '0')}` : 
                        `${apiData?.years_covered?.from || "0"} - ${apiData?.years_covered?.to || "0"}`
                      }
                    </div>
                    <div className="text-xs text-gray-400">Years Covered</div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className={`flex-1 relative z-10 transition-all duration-700 ease-out pt-16 ${
            currentUrlQuery ? "flex items-start justify-start" : "flex items-center justify-center"
          } ${selectedDocumentId ? "pointer-events-auto" : ""}`}>
            <div className={`transition-all duration-700 ease-out ${
              selectedDocumentId ? "w-full" : "w-full max-w-7xl mx-auto"
            } px-4 sm:px-6 lg:px-8 py-8`}>
              <div
                className={`transition-all duration-700 ease-out ${
                  currentUrlQuery ? "pt-4" : ""
                }`}
              >
                {/* Hero Section */}
                {!currentUrlQuery && (
                  <div className="text-center mb-12">
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
                      Government
                      <span className="block bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">
                        Document Archive
                      </span>
                    </h2>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                      Advanced search and analysis platform for government documents, 
                      enabling transparency and data-driven insights.
                    </p>
                  </div>
                )}

                {/* Search Section */}
                <div className="max-w-4xl mx-auto mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl"></div>
                    <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-2">
                      <div className="flex items-center">
                        <Search className="w-5 h-5 text-gray-400 ml-4" />
                  <input
                    type="text"
                    placeholder="Search documents, IDs, types, date or source..."
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    onFocus={handleSearchFocus}
                          className="flex-1 bg-transparent text-white placeholder-gray-400 px-4 py-4 focus:outline-none"
                        />
                        <div className="flex items-center space-x-2 mr-2">
                          {searchInput && (
                      <button
                        onClick={clearSearch}
                              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                      >
                              <X className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={toggleQuickSearch}
                            className={`p-2 rounded-lg transition-colors hover:cursor-pointer ${
                        showQuickSearch
                                ? "text-cyan-400 bg-cyan-400/10"
                                : "text-gray-400 hover:text-cyan-300"
                      }`}
                    >
                            <FileSearch className="w-4 h-4" />
                    </button>
                  <button
                    onClick={() => handleSearch(1)}
                            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-colors duration-200 hover:cursor-pointer"
                  >
                    Search
                  </button>
                        </div>
                      </div>
                    </div>
                </div>

                  {/* Quick Search Panel */}
                <div
                    className={`mt-4 transition-all duration-300 ${
                    showQuickSearch
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0 overflow-hidden"
                    }`}
                  >
                    <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Quick Search</h3>
                      <button
                        onClick={() => setShowQuickSearch(false)}
                          className="text-gray-400 hover:text-white"
                      >
                          <X className="w-5 h-5" />
                      </button>
                    </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                        {quickSearchOptions.map((option) => {
                        const IconComponent = option.icon;
                        return (
                          <button
                            key={option.id}
                            onClick={() => handleQuickSearch(option)}
                              className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                              activeFilters.some((f) => f.id === option.id)
                                  ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400"
                                  : "bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:border-gray-500"
                              }`}
                            >
                              <IconComponent className="w-4 h-4" />
                              <span className="text-sm font-medium">{option.label}</span>
                          </button>
                        );
                      })}
                    </div>

                      <div className="border-t border-gray-700 pt-4">
                        <p className="text-sm text-gray-400 mb-3">Search Examples:</p>
                        <div className="flex flex-wrap gap-2">
                          {["date:2015", "type:people", "id:2030-05", "available:yes", '"exact phrase"'].map((example) => (
                            <span
                              key={example}
                              className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs font-mono"
                            >
                              {example}
                        </span>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>

                  {/* Active Filters */}
                {activeFilters.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-400">Active filters:</span>
                      <div className="flex flex-wrap gap-2">
                        {activeFilters.map((filter) => (
                          <div
                            key={filter.id}
                                className="flex items-center space-x-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400"
                          >
                                <span className="text-xs font-medium">{filter.label}</span>
                            <button
                              onClick={() => removeFilter(filter)}
                                  className="text-cyan-400 hover:text-white hover:cursor-pointer"
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

                  {/* Tags and Criteria - Directly under search bar */}
                  {/* <div className="mt-2">
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {loading ? (
                          <>
                            <div className="px-3 py-1.5 bg-gray-500/30 rounded-lg animate-pulse">
                              <div className="w-16 h-4"></div>
                              </div>
                            <div className="px-3 py-1.5 bg-gray-500/30 rounded-lg animate-pulse">
                              <div className="w-16 h-4 "></div>
                                    </div>
                            <div className="px-3 py-1.5 bg-gray-500/30 rounded-lg animate-pulse">
                              <div className="w-16 h-4 "></div>
                                    </div>
                            <div className="px-3 py-1.5 bg-gray-500/30 rounded-lg animate-pulse">
                              <div className="w-16 h-4 "></div>
                              </div>
                            <div className="px-3 py-1.5 bg-gray-500/30 rounded-lg animate-pulse">
                              <div className="w-16 h-4 "></div>
                            </div>
                            <div className="px-3 py-1.5 bg-gray-500/30 rounded-lg animate-pulse">
                              <div className="w-16 h-4 "></div>
                    </div>
                          </>
                        ) : types.length > 0 ? (
                          types.map((type, index) => (
                            <button
                              key={index}
                              onClick={() => handleTypes(type)}
                              className="px-3 py-1.5 bg-gray-800/50 border border-gray-600 text-gray-300 rounded-lg text-sm font-medium hover:bg-green-500/10 hover:border-green-500/50 hover:text-green-400 transition-all duration-200"
                            >
                              {type}
                            </button>
                          ))
                        ) : (
                          <div className="text-gray-500 text-sm">No document types available</div>
                                  )}
                                </div>
                              </div>

                    <div>
                      <div className="flex flex-wrap gap-2">
                        {["id:", "type:", "date:", "available:", "source:"].map((criteria, index) => (
                          <button
                            key={index}
                            onClick={() => handleCriteria(criteria)}
                            className="px-3 py-1.5 bg-gray-800/50 border border-gray-600 text-gray-300 rounded-lg text-sm font-mono hover:bg-blue-500/10 hover:border-blue-500/50 hover:text-blue-400 transition-all duration-200"
                          >
                            {criteria}
                          </button>
                        ))}
                            </div>
                    </div>
                  </div> */}
              </div>


                {/* Search Results Section */}
              <div
                className={`transition-all duration-700 ease-out ${
                    currentUrlQuery
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
                  />
                )}
              </div>

                {/* Loading State */}
                {loading && currentUrlQuery && (
                  <div className="flex justify-center items-center py-12">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-8 h-8 border-2 border-gray-600 border-t-cyan-400 rounded-full animate-spin"></div>
                      {/* <p className="text-gray-400 font-medium">Searching archives...</p> */}
                    </div>
                  </div>
                )}

            </div>
          </div>
          </main>

          {/* Footer */}
          <footer className={`relative z-10 border-t border-gray-800/50 mt-12 ${
            selectedDocumentId ? "pointer-events-auto" : ""
          }`}>
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between">
                {/* Copyright */}
                <a href="https://opendata.lk" target="_blank" rel="noopener noreferrer">
                <p className="text-gray-400 text-sm">
                    <span className="hover:text-white">Open Data</span> @{new Date().getFullYear()}. // All rights reserved.
                  </p>
                </a>
                
                {/* Social Media Links */}
                <div className="flex items-center space-x-4">
                  <a
                    href="https://discord.gg/wYKFyVEY"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-white transition-all duration-200 hover:scale-110"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </a>
                  <a
                    href="https://www.linkedin.com/company/lankadata/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-white transition-all hover:scale-110"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a
                    href="https://github.com/LDFLK"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-white transition-all duration-200 hover:scale-110"
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
        <div className="fixed top-16 right-0 bottom-0 w-2/3 bg-black/30 z-40 transition-opacity duration-500"></div>
      )}

      {/* Left Info Panel (1/3 width) - Only show when a node is selected */}
      {selectedDocumentId && selectedNodeInfo && (
        <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-1/3 bg-gray-900 shadow-2xl z-50 overflow-y-auto animate-slideInLeft">
          <div className="bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-thin text-white">
                Gazette {selectedNodeInfo.node.data.title}
              </h2>
              <p className="text-sm text-gray-400 font-light">
                ({selectedNodeInfo.connections.length}) Relationships found
              </p>
            </div>
          </div>
          <div className="p-4">
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
                        className={`rounded-lg p-3 bg-gray-800
                          transform transition-all duration-300 ${connection.relatedEntityId != "gov_01" ? "hover:cursor-pointer hover:scale-105 hover:bg-gray-700" : "" }`}
                        onClick={() =>
                          handleGazetteClick(connection.document_number)
                        }
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm font-light text-white">
                            {connection.relatedEntityId !== "gov_01"
                              ? "Gazette "
                              : ""}
                            {connection.document_number}
                          </p>
                          {connection.relatedEntityId !== "gov_01" ? <SquareArrowOutUpRight className="text-white w-4 h-4" /> : ""}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-ligh text-white`}>
                            Relationship:
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-xl ${
                              connection.name === "AS_DOCUMENT"
                                ? "bg-cyan-200 text-cyan-800"
                                : connection.name === "AMENDS"
                                ? "bg-teal-200 text-teal-800"
                                : connection.name === "REFERS_TO"
                                ? "bg-indigo-200 text-indigo-900"
                                : "text-black"
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
              <div className="text-center py-8">
                <CircleAlert className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">
                  No connections found for this document
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedDocumentId && (
        <TracePane
          documentId={selectedDocumentId}
          onClose={handleClosePane}
          onNodeSelect={handleNodeSelect}
        />
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

        .animate-slideInLeft {
          animation: slideInLeft 0.3s ease-out;
        }

        /* Custom Scrollbar Styling */
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: #111827;
          border-radius: 4px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #06b6d4;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #0891b2;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:active {
          background: #0e7490;
        }

        /* Firefox scrollbar styling */
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: #06b6d4 #111827;
        }
      `}</style>
    </>
  );
};

export default Home;
