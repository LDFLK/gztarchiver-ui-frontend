import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DocumentCard from "../components/doc_card";
import { SlidersHorizontal, ChevronDown, X, CircleX, MoveLeft } from "lucide-react";

const CollectionPage = () => {
  const { collection } = useParams(); // Get collection name from URL
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    month: "",
    day: "",
    type: "",
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiUrl = window?.configs?.apiUrl ? window.configs.apiUrl : "/";
    const fetchCollectionData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Make fetch request using the collection name
        const response = await fetch(`${apiUrl}/documents/${collection}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching collection data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (collection) {
      fetchCollectionData();
    }
  }, [collection]); // Refetch when collection parameter changes

  const goBack = () => {
    navigate("/");
  };

  const extractYear = (collection) => {
    const yearMatch = collection.match(/(\d{4})/);
    return yearMatch ? yearMatch[1] : null;
  };

  // Get unique values for filter options - with null checks
  const uniqueTypes = data
    ? [...new Set(data.map((doc) => doc.document_type))]
    : [];
  const uniqueMonths = data
    ? [
        ...new Set(
          data.map((doc) => {
            const date = new Date(doc.document_date);
            return date.toLocaleString("default", { month: "long" });
          })
        ),
      ]
    : [];
  const uniqueDays = data
    ? [
        ...new Set(
          data.map((doc) => {
            const date = new Date(doc.document_date);
            return date.getDate().toString().padStart(2, '0');
          })
        ),
      ]
    : [];

  // Filter data based on search query and filters - with null checks
  const filteredData = data
    ? data.filter((doc) => {
        const matchesSearch =
          doc.document_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.reasoning.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.document_id.toLowerCase().includes(searchQuery.toLowerCase());

        const docDate = new Date(doc.document_date);
        const docMonth = docDate.toLocaleString("default", { month: "long" });
        const docDay = docDate.getDate().toString().padStart(2, '0');

        const matchesMonth = !filters.month || docMonth === filters.month;
        const matchesDay = !filters.day || docDay === filters.day;
        const matchesType = !filters.type || doc.document_type === filters.type;

        return matchesSearch && matchesMonth && matchesDay && matchesType;
      })
    : [];

  const clearFilters = () => {
    setFilters({
      month: "",
      day: "",
      type: "",
    });
  };

  const hasActiveFilters = filters.month || filters.day || filters.type;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen p-8 max-w-2xl mx-auto">
        <div className="p-4 rounded-lg">
          <button
            onClick={goBack}
            className="mb-4 px-2 py-2 -ms-2 hover:bg-gray-100 rounded-full text-sm cursor-pointer"
          >
            <MoveLeft className="w-6 h-6 text-gray-500" />
          </button>
          <div className="flex items-center justify-center h-32">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen p-8 max-w-2xl mx-auto">
        <div className="p-4 rounded-lg">
          <button
            onClick={goBack}
            className="mb-4 px-2 py-2 -ms-2 hover:bg-gray-100 rounded-full text-sm cursor-pointer"
          >
            <MoveLeft className="w-6 h-6 text-gray-500" />
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-red-500 mb-2">
              <CircleX className="w-5 h-5 text-red-500" /> Error Loading Data
            </h2>
            <p className="text-red-500">
              Failed to load {extractYear(collection)} data: {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-sm text-red-500 cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state - render the fetched data
  return (
    <div className="min-h-screen p-8 max-w-2xl mx-auto">
      <div className="p-4 rounded-lg">
        <button
          onClick={goBack}
          className="mb-2 px-2 py-2 -ms-2 hover:bg-gray-100 rounded-full text-sm cursor-pointer"
        >
          <MoveLeft className="w-6 h-6 text-gray-500" />
        </button>
        <h1 className="text-2xl font-medium text-gray-900 mb-2">
          Gazettes - {extractYear(collection)}
        </h1>
        <p className="text-sm text-gray-500 mb-8">{data?.length || 0} items</p>

        {/* Search and Filter Section */}
        <div className="mb-6 space-y-4">
          {/* Search Bar with Filter Button */}
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search documents"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-100 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-300"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 border rounded-lg text-sm font-medium transition-colors flex items-center gap-2 hover:cursor-pointer ${
                showFilters || hasActiveFilters
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "border-gray-100 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform hidden sm:inline ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* Filter Dropdown */}
          {showFilters && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Filters</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Clear all
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Month Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Month
                  </label>
                  <div className="relative w-full">
                    <select
                      value={filters.month}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          month: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    >
                      <option value="">All months</option>
                      {uniqueMonths.map((month) => (
                        <option key={month} value={month}>
                          {month}
                        </option>
                      ))}
                    </select>

                    {/* Custom dropdown arrow */}
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <svg
                        className="w-4 h-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Year Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Day
                  </label>
                  <div className="relative w-full">
                    <select
                      value={filters.day}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          day: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    >
                      <option value="">All days</option>
                      {uniqueDays.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>

                    {/* Custom dropdown arrow */}
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <svg
                        className="w-4 h-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Type Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Document Type
                  </label>
                  <div className="relative w-full">
                    <select
                      value={filters.type}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          type: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    >
                      <option value="">All types</option>
                      {uniqueTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>

                    {/* Custom dropdown arrow */}
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <svg
                        className="w-4 h-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {filters.month && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Month: {filters.month}
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, month: "" }))
                    }
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.day && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Day: {filters.day}
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, day: "" }))
                    }
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.type && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Type: {filters.type}
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, type: "" }))
                    }
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Documents Grid */}
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1 bg-white">
          {filteredData.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc_id={doc.id}
              documentId={doc.document_id}
              description={doc.description}
              date={doc.document_date}
              type={doc.document_type}
              reasoning={doc.reasoning}
              file_path={doc.file_path}
              downloadUrl={doc.download_url}
              availability={doc.availability}
              collection={collection}
            />
          ))}
        </div>

        {/* No results message */}
        {filteredData.length === 0 && data && data.length > 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No documents found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionPage;
