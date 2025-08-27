// import { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import DocumentCard from "../components/doc_card";
// import {
//   SlidersHorizontal,
//   ChevronDown,
//   X,
//   CircleX,
//   MoveLeft,
//   ChevronLeft,
//   ChevronRight,
//   ChevronsLeft,
//   ChevronsRight,
// } from "lucide-react";

// const CollectionPage = () => {
//   const { collection } = useParams();
//   const navigate = useNavigate();

//   const [searchQuery, setSearchQuery] = useState("");
//   const [showFilters, setShowFilters] = useState(false);
//   const [filters, setFilters] = useState({
//     month: "",
//     day: "",
//     type: "",
//   });
//   const [data, setData] = useState([]);
//   const [filterData, setFilterData] = useState([]);
//   const [pagination, setPagination] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize, setPageSize] = useState(20);

//   // Fetch data function
//   const fetchCollectionData = async (page = 1, limit = pageSize) => {
//     try {
//       setLoading(true);
//       setError(null);

//       const apiUrl = window?.configs?.apiUrl ? window.configs.apiUrl : "/";
//       const offset = (page - 1) * limit;

//       // Build URL with pagination parameters
//       const url = `${apiUrl}/documents/${collection}?limit=${limit}&offset=${offset}`;
//       const response = await fetch(url);

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const result = await response.json();

//       if (result.pagination) {
//         // Paginated response
//         setData(result.documents || []);
//         setPagination(result.pagination);
//       } else {
//         // Non-paginated response (fallback)
//         setData(result.documents || result || []);
//         setPagination(null);
//       }
//     } catch (err) {
//       setError(err.message);
//       console.error("Error fetching collection data:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchFiltersForCollection = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const apiUrl = window?.configs?.apiUrl ? window.configs.apiUrl : "/";

//       // Build URL with pagination parameters
//       const url = `${apiUrl}/documents/filters/${collection}`;
//       const response = await fetch(url);

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const result = await response.json();
//       setFilterData(result);
//     } catch (err) {
//       setError(err.message);
//       console.error("Error fetching collection filter data:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Initial load and page changes
//   useEffect(() => {
//     if (collection) {
//       fetchCollectionData(currentPage, pageSize);
//       fetchFiltersForCollection();
//     }
//   }, [collection, currentPage, pageSize]);

//   const goBack = () => {
//     navigate("/");
//   };

//   const extractYear = (collection) => {
//     const yearMatch = collection.match(/(\d{4})/);
//     return yearMatch ? yearMatch[1] : null;
//   };

//   // Set filters from the API response safely
//   const uniqueTypes = filterData?.document_types || [];

//   // Convert month numbers to month names safely
//   const uniqueMonths =
//     filterData?.months?.map((month) =>
//       new Date(0, month - 1).toLocaleString("default", { month: "long" })
//     ) || [];

//   // Convert days to 2-digit strings safely
//   const uniqueDays =
//     filterData?.days?.map((day) => day.toString().padStart(2, "0")) || [];

//   console.log("Types:", uniqueTypes);
//   console.log("Months:", uniqueMonths);
//   console.log("Days:", uniqueDays);

//   // Filter data based on search query and filters
//   const filteredData = data.filter((doc) => {
//     const matchesSearch =
//       doc.document_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       doc.reasoning.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       doc.document_id.toLowerCase().includes(searchQuery.toLowerCase());

//     const docDate = new Date(doc.document_date);
//     const docMonth = docDate.toLocaleString("default", { month: "long" });
//     const docDay = docDate.getDate().toString().padStart(2, "0");

//     const matchesMonth = !filters.month || docMonth === filters.month;
//     const matchesDay = !filters.day || docDay === filters.day;
//     const matchesType = !filters.type || doc.document_type === filters.type;

//     return matchesSearch && matchesMonth && matchesDay && matchesType;
//   });

//   const clearFilters = () => {
//     setFilters({
//       month: "",
//       day: "",
//       type: "",
//     });
//   };

//   const hasActiveFilters = filters.month || filters.day || filters.type;

//   // Pagination handlers
//   const handlePageChange = (newPage) => {
//     setCurrentPage(newPage);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const handlePageSizeChange = (newSize) => {
//     setPageSize(newSize);
//     setCurrentPage(1); // Reset to first page when changing page size
//   };

//   // Pagination component
//   const PaginationControls = () => {
//     if (!pagination || pagination.total_pages <= 1) return null;

//     const { current_page, total_pages, has_previous, has_next } = pagination;

//     // Generate page numbers to show
//     const getPageNumbers = () => {
//       const pages = [];
//       const maxVisible = 5;

//       if (total_pages <= maxVisible) {
//         for (let i = 1; i <= total_pages; i++) {
//           pages.push(i);
//         }
//       } else {
//         if (current_page <= 3) {
//           for (let i = 1; i <= 4; i++) {
//             pages.push(i);
//           }
//           pages.push("...");
//           pages.push(total_pages);
//         } else if (current_page >= total_pages - 2) {
//           pages.push(1);
//           pages.push("...");
//           for (let i = total_pages - 3; i <= total_pages; i++) {
//             pages.push(i);
//           }
//         } else {
//           pages.push(1);
//           pages.push("...");
//           for (let i = current_page - 1; i <= current_page + 1; i++) {
//             pages.push(i);
//           }
//           pages.push("...");
//           pages.push(total_pages);
//         }
//       }
//       return pages;
//     };

//     return (
//       <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
//         {/* Page info and page size selector */}
//         <div className="flex items-center gap-4 text-sm text-gray-600">
//           <span>
//             Showing {(current_page - 1) * pageSize + 1} to{" "}
//             {Math.min(current_page * pageSize, pagination.total_count)} of{" "}
//             {pagination.total_count} results
//           </span>
//           <div className="flex items-center gap-2">
//             <label>Show:</label>
//             <div className="relative">
//               <select
//                 value={pageSize}
//                 onChange={(e) => handlePageSizeChange(Number(e.target.value))}
//                 className="px-2 py-1 border border-gray-300 rounded text-sm appearance-none pr-8"
//               >
//                 <option value={10}>10</option>
//                 <option value={20}>20</option>
//                 <option value={50}>50</option>
//                 <option value={100}>100</option>
//               </select>
//               {/* Custom dropdown arrow */}
//               <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
//                 <svg
//                   className="w-4 h-4 text-gray-500"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     d="M19 9l-7 7-7-7"
//                   />
//                 </svg>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Pagination controls */}
//         <div className="flex items-center gap-1">
//           {/* First page */}
//           <button
//             onClick={() => handlePageChange(1)}
//             disabled={!has_previous}
//             className={`p-2 rounded ${
//               !has_previous
//                 ? "text-gray-400 cursor-not-allowed"
//                 : "text-gray-600 hover:bg-gray-100"
//             }`}
//           >
//             <ChevronsLeft className="w-4 h-4" />
//           </button>

//           {/* Previous page */}
//           <button
//             onClick={() => handlePageChange(current_page - 1)}
//             disabled={!has_previous}
//             className={`p-2 rounded ${
//               !has_previous
//                 ? "text-gray-400 cursor-not-allowed"
//                 : "text-gray-600 hover:bg-gray-100"
//             }`}
//           >
//             <ChevronLeft className="w-4 h-4" />
//           </button>

//           {/* Page numbers */}
//           {getPageNumbers().map((page, index) => (
//             <button
//               key={index}
//               onClick={() => typeof page === "number" && handlePageChange(page)}
//               disabled={page === "..."}
//               className={`px-3 py-2 rounded text-sm ${
//                 page === current_page
//                   ? "bg-black text-white"
//                   : page === "..."
//                   ? "text-gray-400 cursor-default"
//                   : "text-gray-600 hover:bg-gray-100"
//               }`}
//             >
//               {page}
//             </button>
//           ))}

//           {/* Next page */}
//           <button
//             onClick={() => handlePageChange(current_page + 1)}
//             disabled={!has_next}
//             className={`p-2 rounded ${
//               !has_next
//                 ? "text-gray-400 cursor-not-allowed"
//                 : "text-gray-600 hover:bg-gray-100"
//             }`}
//           >
//             <ChevronRight className="w-4 h-4" />
//           </button>

//           {/* Last page */}
//           <button
//             onClick={() => handlePageChange(total_pages)}
//             disabled={!has_next}
//             className={`p-2 rounded ${
//               !has_next
//                 ? "text-gray-400 cursor-not-allowed"
//                 : "text-gray-600 hover:bg-gray-100"
//             }`}
//           >
//             <ChevronsRight className="w-4 h-4" />
//           </button>
//         </div>
//       </div>
//     );
//   };

//   // Loading state
//   if (loading) {
//     return (
//       <div className="min-h-screen p-8 max-w-2xl mx-auto">
//         <div className="p-4 rounded-lg">
//           <button
//             onClick={goBack}
//             className="mb-4 px-2 py-2 -ms-2 hover:bg-gray-100 rounded-full text-sm cursor-pointer"
//           >
//             <MoveLeft className="w-6 h-6 text-gray-500" />
//           </button>
//           <div className="flex items-center justify-center h-32">
//             <div className="flex flex-col items-center space-y-4">
//               <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Error state
//   if (error) {
//     return (
//       <div className="min-h-screen p-8 max-w-2xl mx-auto">
//         <div className="p-4 rounded-lg">
//           <button
//             onClick={goBack}
//             className="mb-4 px-2 py-2 -ms-2 hover:bg-gray-100 rounded-full text-sm cursor-pointer"
//           >
//             <MoveLeft className="w-6 h-6 text-gray-500" />
//           </button>
//           <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//             <h2 className="flex items-center gap-2 text-lg font-semibold text-red-500 mb-2">
//               <CircleX className="w-5 h-5 text-red-500" /> Error Loading Data
//             </h2>
//             <p className="text-red-500">
//               Failed to load {extractYear(collection)} data: {error}
//             </p>
//             <button
//               onClick={() => window.location.reload()}
//               className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-sm text-red-500 cursor-pointer"
//             >
//               Retry
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Success state - render the fetched data
//   return (
//     <div className="min-h-screen p-8 max-w-2xl mx-auto">
//       <div className="p-4 rounded-lg">
//         <button
//           onClick={goBack}
//           className="mb-2 px-2 py-2 -ms-2 hover:bg-gray-100 rounded-full text-sm cursor-pointer"
//         >
//           <MoveLeft className="w-6 h-6 text-gray-500" />
//         </button>
//         <h1 className="text-2xl font-medium text-gray-900 mb-2">
//           Gazettes - {extractYear(collection)}
//         </h1>
//         <p className="text-sm text-gray-500 mb-8">
//           {pagination ? pagination.total_count : data.length} items
//           {pagination &&
//             ` • Page ${pagination.current_page} of ${pagination.total_pages}`}
//         </p>

//         {/* Search and Filter Section */}
//         <div className="mb-6 space-y-4">
//           {/* Search Bar with Filter Button */}
//           <div className="flex gap-3">
//             <div className="flex-1">
//               <input
//                 type="text"
//                 placeholder="Search documents"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="w-full px-4 py-3 border border-gray-100 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-300"
//               />
//             </div>
//             <button
//               onClick={() => setShowFilters(!showFilters)}
//               className={`px-4 py-3 border rounded-lg text-sm font-medium transition-colors flex items-center gap-2 hover:cursor-pointer ${
//                 showFilters || hasActiveFilters
//                   ? "bg-blue-50 border-blue-200 text-blue-700"
//                   : "border-gray-100 text-gray-700 hover:bg-gray-50"
//               }`}
//             >
//               <SlidersHorizontal className="w-4 h-4" />
//               <span className="hidden sm:inline">Filter</span>
//               <ChevronDown
//                 className={`w-4 h-4 transition-transform hidden sm:inline ${
//                   showFilters ? "rotate-180" : ""
//                 }`}
//               />
//             </button>
//           </div>

//           {/* Filter Dropdown */}
//           {showFilters && (
//             <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 space-y-4">
//               <div className="flex items-center justify-between">
//                 <h3 className="font-medium text-gray-900">Filters</h3>
//                 {hasActiveFilters && (
//                   <button
//                     onClick={clearFilters}
//                     className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
//                   >
//                     <X className="w-3 h-3" />
//                     Clear all
//                   </button>
//                 )}
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 {/* Month Filter */}
//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-2">
//                     Month
//                   </label>
//                   <div className="relative w-full">
//                     <select
//                       value={filters.month}
//                       onChange={(e) =>
//                         setFilters((prev) => ({
//                           ...prev,
//                           month: e.target.value,
//                         }))
//                       }
//                       className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
//                     >
//                       <option value="">All months</option>
//                       {uniqueMonths.map((month) => (
//                         <option key={month} value={month}>
//                           {month}
//                         </option>
//                       ))}
//                     </select>

//                     {/* Custom dropdown arrow */}
//                     <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
//                       <svg
//                         className="w-4 h-4 text-gray-500"
//                         fill="none"
//                         stroke="currentColor"
//                         strokeWidth="2"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           d="M19 9l-7 7-7-7"
//                         />
//                       </svg>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Day Filter */}
//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-2">
//                     Day
//                   </label>
//                   <div className="relative w-full">
//                     <select
//                       value={filters.day}
//                       onChange={(e) =>
//                         setFilters((prev) => ({
//                           ...prev,
//                           day: e.target.value,
//                         }))
//                       }
//                       className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
//                     >
//                       <option value="">All days</option>
//                       {uniqueDays.map((day) => (
//                         <option key={day} value={day}>
//                           {day}
//                         </option>
//                       ))}
//                     </select>

//                     {/* Custom dropdown arrow */}
//                     <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
//                       <svg
//                         className="w-4 h-4 text-gray-500"
//                         fill="none"
//                         stroke="currentColor"
//                         strokeWidth="2"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           d="M19 9l-7 7-7-7"
//                         />
//                       </svg>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Type Filter */}
//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-2">
//                     Document Type
//                   </label>
//                   <div className="relative w-full">
//                     <select
//                       value={filters.type}
//                       onChange={(e) =>
//                         setFilters((prev) => ({
//                           ...prev,
//                           type: e.target.value,
//                         }))
//                       }
//                       className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
//                     >
//                       <option value="">All types</option>
//                       {uniqueTypes.map((type) => (
//                         <option key={type} value={type}>
//                           {type}
//                         </option>
//                       ))}
//                     </select>

//                     {/* Custom dropdown arrow */}
//                     <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
//                       <svg
//                         className="w-4 h-4 text-gray-500"
//                         fill="none"
//                         stroke="currentColor"
//                         strokeWidth="2"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           d="M19 9l-7 7-7-7"
//                         />
//                       </svg>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Active Filters Display */}
//           {hasActiveFilters && (
//             <div className="flex flex-wrap gap-2">
//               {filters.month && (
//                 <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
//                   Month: {filters.month}
//                   <button
//                     onClick={() =>
//                       setFilters((prev) => ({ ...prev, month: "" }))
//                     }
//                     className="text-blue-600 hover:text-blue-800"
//                   >
//                     <X className="w-3 h-3" />
//                   </button>
//                 </span>
//               )}
//               {filters.day && (
//                 <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
//                   Day: {filters.day}
//                   <button
//                     onClick={() => setFilters((prev) => ({ ...prev, day: "" }))}
//                     className="text-blue-600 hover:text-blue-800"
//                   >
//                     <X className="w-3 h-3" />
//                   </button>
//                 </span>
//               )}
//               {filters.type && (
//                 <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
//                   Type: {filters.type}
//                   <button
//                     onClick={() =>
//                       setFilters((prev) => ({ ...prev, type: "" }))
//                     }
//                     className="text-blue-600 hover:text-blue-800"
//                   >
//                     <X className="w-3 h-3" />
//                   </button>
//                 </span>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Documents Grid */}
//         <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1 bg-white">
//           {filteredData.map((doc) => (
//             <DocumentCard
//               key={doc.id}
//               doc_id={doc.id}
//               documentId={doc.document_id}
//               description={doc.description}
//               date={doc.document_date}
//               type={doc.document_type}
//               reasoning={doc.reasoning}
//               file_path={doc.file_path}
//               downloadUrl={doc.download_url}
//               availability={doc.availability}
//               collection={collection}
//             />
//           ))}
//         </div>

//         {/* No results message */}
//         {filteredData.length === 0 && data && data.length > 0 && (
//           <div className="text-center py-12">
//             <p className="text-gray-500">
//               No documents found matching your criteria.
//             </p>
//           </div>
//         )}

//         {/* Pagination Controls */}
//         <PaginationControls />
//       </div>
//     </div>
//   );
// };

// export default CollectionPage;



import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DocumentCard from "../components/doc_card";
import {
  SlidersHorizontal,
  ChevronDown,
  X,
  CircleX,
  MoveLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react";

const CollectionPage = () => {
  const { collection } = useParams();
  const navigate = useNavigate();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    month: "",
    day: "",
    type: "",
  });

  // Data states
  const [data, setData] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, filters.month, filters.day, filters.type]);

  // Fetch data function with server-side filtering
  const fetchCollectionData = useCallback(async (page = 1, limit = pageSize) => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = window?.configs?.apiUrl ? window.configs.apiUrl : "/";
      const offset = (page - 1) * limit;

      // Build URL with pagination and filter parameters
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      // Add search parameter if exists
      if (debouncedSearchQuery.trim()) {
        params.append("search", debouncedSearchQuery.trim());
      }

      // Add filter parameters if they exist
      if (filters.month) params.append("month", filters.month);
      if (filters.day) params.append("day", filters.day);
      if (filters.type) params.append("type", filters.type);

      const url = `${apiUrl}/documents/${collection}?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.pagination) {
        // Paginated response
        setData(result.documents || []);
        setPagination(result.pagination);
      } else {
        // Non-paginated response (fallback)
        setData(result.documents || result || []);
        setPagination(null);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching collection data:", err);
    } finally {
      setLoading(false);
    }
  }, [collection, debouncedSearchQuery, filters, pageSize]);

  const fetchFiltersForCollection = async () => {
    try {
      const apiUrl = window?.configs?.apiUrl ? window.configs.apiUrl : "/";
      const url = `${apiUrl}/documents/filters/${collection}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setFilterData(result);
    } catch (err) {
      console.error("Error fetching collection filter data:", err);
    }
  };

  // Initial load and when dependencies change
  useEffect(() => {
    if (collection) {
      fetchCollectionData(currentPage, pageSize);
    }
  }, [collection, currentPage, pageSize, debouncedSearchQuery, filters, fetchCollectionData]);

  // Load filter data once
  useEffect(() => {
    if (collection) {
      fetchFiltersForCollection();
    }
  }, [collection]);

  const goBack = () => {
    navigate("/");
  };

  const extractYear = (collection) => {
    const yearMatch = collection.match(/(\d{4})/);
    return yearMatch ? yearMatch[1] : null;
  };

  // Set filters from the API response safely
  const uniqueTypes = filterData?.document_types || [];

  // Convert month numbers to month names safely
  const uniqueMonths =
    filterData?.months?.map((month) =>
      new Date(0, month - 1).toLocaleString("default", { month: "long" })
    ) || [];

  // Convert days to 2-digit strings safely
  const uniqueDays =
    filterData?.days?.map((day) => day.toString().padStart(2, "0")) || [];

  const clearFilters = () => {
    setFilters({
      month: "",
      day: "",
      type: "",
    });
  };

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
  };

  const clearAll = () => {
    clearSearch();
    clearFilters();
  };

  const hasActiveFilters = filters.month || filters.day || filters.type;
  const hasActiveSearch = debouncedSearchQuery.trim();
  const hasAnyActive = hasActiveFilters || hasActiveSearch;

  // Pagination handlers
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Pagination component
  const PaginationControls = () => {
    if (!pagination || pagination.total_pages <= 1) return null;

    const { current_page, total_pages, has_previous, has_next } = pagination;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;

      if (total_pages <= maxVisible) {
        for (let i = 1; i <= total_pages; i++) {
          pages.push(i);
        }
      } else {
        if (current_page <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i);
          }
          pages.push("...");
          pages.push(total_pages);
        } else if (current_page >= total_pages - 2) {
          pages.push(1);
          pages.push("...");
          for (let i = total_pages - 3; i <= total_pages; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push("...");
          for (let i = current_page - 1; i <= current_page + 1; i++) {
            pages.push(i);
          }
          pages.push("...");
          pages.push(total_pages);
        }
      }
      return pages;
    };

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>
            Showing {(current_page - 1) * pageSize + 1} to{" "}
            {Math.min(current_page * pageSize, pagination.total_count)} of{" "}
            {pagination.total_count} results
            {hasAnyActive && " (filtered)"}
          </span>
          <div className="flex items-center gap-2">
            <label>Show:</label>
            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none hover:cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => handlePageChange(1)}
            disabled={!has_previous}
            className={`p-2 rounded ${
              !has_previous
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100 hover:cursor-pointer"
            }`}
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => handlePageChange(current_page - 1)}
            disabled={!has_previous}
            className={`p-2 rounded ${
              !has_previous
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100 hover:cursor-pointer"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === "number" && handlePageChange(page)}
              disabled={page === "..."}
              className={`px-3 py-2 rounded text-sm ${
                page === current_page
                  ? "bg-black text-white hover:cursor-pointer "
                  : page === "..."
                  ? "text-gray-400 cursor-default"
                  : "text-gray-600 hover:bg-gray-100 hover:cursor-pointer "
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(current_page + 1)}
            disabled={!has_next}
            className={`p-2 rounded ${
              !has_next
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100 hover:cursor-pointer"
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => handlePageChange(total_pages)}
            disabled={!has_next}
            className={`p-2 rounded ${
              !has_next
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100 hover:cursor-pointer"
            }`}
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading && !data.length) {
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
        
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <span>
            {pagination ? pagination.total_count : data.length} items
            {pagination && ` • Page ${pagination.current_page} of ${pagination.total_pages}`}
          </span>
          {loading && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="text-blue-600">Searching...</span>
            </div>
          )}
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 space-y-4">
          {/* Search Bar with Filter Button */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-3 flex items-center">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search documents, IDs, types, or reasoning..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-100 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-300"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 hover:cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
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
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    Clear filters
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
                      className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none hover:cursor-pointer"
                    >
                      <option value="">All months</option>
                      {uniqueMonths.map((month) => (
                        <option key={month} value={month}>
                          {month}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Day Filter */}
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
                      className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none hover:cursor-pointer"
                    >
                      <option value="">All days</option>
                      {uniqueDays.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
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
                      className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none hover:cursor-pointer"
                    >
                      <option value="">All types</option>
                      {uniqueTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {(hasActiveSearch || hasActiveFilters) && (
            <div className="flex flex-wrap gap-2 items-center">
              {hasActiveSearch && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Search: "{debouncedSearchQuery}"
                  <button
                    onClick={clearSearch}
                    className="text-green-600 hover:text-green-800 hover:cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.month && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Month: {filters.month}
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, month: "" }))
                    }
                    className="text-blue-600 hover:text-blue-800 hover:cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.day && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Day: {filters.day}
                  <button
                    onClick={() => setFilters((prev) => ({ ...prev, day: "" }))}
                    className="text-blue-600 hover:text-blue-800 hover:cursor-pointer"
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
                    className="text-blue-600 hover:text-blue-800 hover:cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {hasAnyActive && (
                <button
                  onClick={clearAll}
                  className="text-xs text-gray-500 hover:text-gray-700 underline hover:cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>

        {/* Documents Grid */}
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1 bg-white">
          {data.map((doc) => (
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
        {data.length === 0 && !loading && (
          <div className="text-center">
            <div className="bg-gray-50 rounded-lg p-8">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No documents found
              </h3>
              {hasAnyActive ? (
                <div className="space-y-2">
                  <p className="text-gray-500">
                    No documents match your current search criteria.
                  </p>
                  <button
                    onClick={clearAll}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors mt-2 hover:cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    Clear all filters
                  </button>
                </div>
              ) : (
                <p className="text-gray-500">
                  No documents available in this collection.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        <PaginationControls />
      </div>
    </div>
  );
};

export default CollectionPage;