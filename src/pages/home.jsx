import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Database,
  CircleX,
  Search,
  FileArchive,
  FileText,
  Users,
  Calendar,
  Globe,
  ExternalLink,
  Download,
  BarChart3,
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState(null); // Changed from null to []

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Add this debugging code to your handleSearch function:
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setHasSearched(true);

    try {
      const apiUrl = window?.configs?.apiUrl ? window.configs.apiUrl : "/";
      const response = await fetch(`${apiUrl}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      // DEBUG: Log the actual API response structure
      console.log("API Response:", data);
      console.log("Type of data:", typeof data);
      console.log("Is array:", Array.isArray(data));
      console.log("Has results property:", data.hasOwnProperty("results"));

      setSearchResults(data);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setHasSearched(false);
    setSearchResults([]); // Changed from null to []
    setSearchQuery("");
    navigate("/");
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

  // Skeleton component
  const SkeletonCard = () => (
    <div className="bg-white border border-gray-100 rounded-lg p-6 w-full sm:flex-1">
      <div className="flex flex-col items-center text-center space-y-3">
        {/* Icon skeleton */}
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>

        <div className="space-y-2 w-full">
          {/* Title skeleton */}
          <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mx-auto"></div>

          {/* Value skeleton */}
          <div className="h-6 bg-gray-200 rounded animate-pulse w-16 mx-auto"></div>

          {/* Description skeleton */}
          <div className="h-3 bg-gray-200 rounded animate-pulse w-32 mx-auto"></div>
        </div>
      </div>
    </div>
  );

  // Error component
  const ErrorCard = () => (
    <div className="bg-white border border-gray-100 rounded-lg p-6 w-full sm:flex-1">
      <div className="flex flex-col items-center text-center space-y-3">
        {/* Icon skeleton */}
        <div>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>

        <h3 className="text-sm font-light text-gray-400">No Stats Found</h3>

        <p className="text-xs font-light text-gray-400 max-w-xs">
          Looks like there's no data available to show right now, This can be a
          error from db or try refreshing...
        </p>
      </div>
    </div>
  );

  // Update your SearchResults component to handle the correct structure:
  const SearchResults = ({ query, results, onBack }) => {
    // Add debugging
    console.log("SearchResults received:", results);

    // Handle both possible API response structures
    const searchData = results?.results || results || [];

    console.log("Processed searchData:", searchData);

    if (!Array.isArray(searchData) || searchData.length === 0) {
      return (
        <div className="w-full max-w-6xl mx-auto text-center py-12">
          <p className="text-gray-500">No results found for "{query}"</p>
          <button
            onClick={onBack}
            className="mt-4 text-sm text-blue-500 hover:text-blue-700"
          >
            ← Back to Home
          </button>
        </div>
      );
    }

    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-thin text-gray-700">
            Search Results for "{query}" ({searchData.length} found)
          </h2>
          <button
            onClick={onBack}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors hover:cursor-pointer"
          >
            ← Back to Home
          </button>
        </div>

        <div className="space-y-4">
          {searchData.map((item, index) => (
            <div
              key={item.id || index}
              className="bg-white border border-gray-100 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileArchive className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {item.description || "No description"}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Document Type: {item.document_type || "Unknown"} | Source:{" "}
                    <a
                      href={item.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      View Source
                    </a>
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>ID: {item.document_id || "N/A"}</span>
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
      </div>
    );
  };

  return (
    <div className="min-h-screen p-8 flex flex-col">
      {/* Main content with conditional positioning */}
      <div
        className={`flex-1 flex justify-center transition-all duration-700 ease-out ${
          hasSearched ? "items-start pt-8" : "items-center"
        }`}
      >
        <div className="w-full">
          <div
            className={`bg-white/70 backdrop-blur-sm rounded-3xl p-8 transition-all duration-700 ${
              hasSearched ? "bg-white/90" : ""
            }`}
          >
            {/* Header */}
            <div
              className={`text-center transition-all duration-500 ${
                hasSearched ? "mb-8" : "mb-12"
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center">
                  <FileArchive className="text-white w-6 h-6" />
                </div>
                <h1
                  className={`font-thin text-gray-600 flex items-center transition-all duration-500 ${
                    hasSearched ? "text-3xl" : "text-4xl"
                  }`}
                >
                  gztarchiver
                </h1>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex justify-center mb-8">
              <div className="relative w-full max-w-4xl">
                <input
                  type="text"
                  placeholder="Search documents, IDs, types, date, or reasoning..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-14 pr-28 py-4 text-md border border-gray-100 rounded-2xl
                  focus:outline-none focus:ring-0 focus:ring-black
                  focus:shadow-lg transition-shadow duration-200
                  bg-white/80 backdrop-blur-sm placeholder-gray-400 placeholder:font-thin font-thin"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                <button
                  onClick={handleSearch}
                  className="absolute right-0 top-0 h-full bg-gray-800 hover:bg-gray-900 hover:cursor-pointer text-white px-6 rounded-r-2xl text-sm font-thin transition-colors duration-200 focus:outline-none"
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
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full max-w-6xl mx-auto p-4">
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
                        className="bg-white border border-gray-100 rounded-lg p-6 w-full sm:flex-1 transition-all duration-200 hover:shadow-lg cursor-pointer"
                        style={{
                          transitionDelay: `${index * 100}ms`,
                        }}
                      >
                        <div className="flex flex-col items-center text-center space-y-3">
                          <div className="flex-shrink-0">{stat.icon}</div>
                          <div className="space-y-2">
                            {stat.value === "languages" ? (
                              <>
                                <p className="text-sm font-light text-gray-600">
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
                                <h3 className="text-lg font-thin text-gray-900 leading-tight">
                                  {stat.value}
                                </h3>
                                <p className="text-sm font-light text-gray-600">
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
                  query={searchQuery}
                  results={searchResults}
                  onBack={handleBack}
                />
              )}
            </div>

            {/* Loading state for search */}
            {loading && hasSearched && (
              <div className="flex justify-center items-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
                  <p className="text-gray-500 font-thin">
                    Searching archives...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer - fixed at bottom */}
      <div className="pt-6 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          Open Data @2025. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Home;
