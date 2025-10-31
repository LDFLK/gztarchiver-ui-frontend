import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const PaginationControls = ({ pagination, currentPage, onPageChange }) => {
  if (pagination.total_pages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const totalPages = pagination.total_pages;
    const current = currentPage;

    pages.push(1);

    if (current > 4) {
      pages.push("...");
    }

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

    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mt-8">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="p-1.5 sm:p-2  text-cyan-300 hover:text-cyan-500 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        <ChevronsLeft className="w-3 h-3 sm:w-5 sm:h-5" />
      </button>

      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!pagination.has_prev}
        className="p-1.5 sm:p-2 rounded-lg text-cyan-300 hover:text-cyan-500 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        <ChevronLeft className="w-3 h-3 sm:w-5 sm:h-5" />
      </button>

      <div className="flex items-center gap-0.5 sm:gap-1">
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => page !== "..." && onPageChange(page)}
            disabled={page === "..."}
            className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
              page === currentPage
                ? " dark:text-white text-gray-900 hover:cursor-pointer"
                : page === "..."
                ? "cursor-default text-gray-400"
                : "text-cyan-400 dark:hover:text-white hover:text-gray-900 hover:cursor-pointer"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!pagination.has_next}
        className="p-1.5 sm:p-2 rounded-lg text-cyan-300 hover:text-cyan-500 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        <ChevronRight className="w-3 h-3 sm:w-5 sm:h-5" />
      </button>

      <button
        onClick={() => onPageChange(pagination.total_pages)}
        disabled={currentPage === pagination.total_pages}
        className="p-1.5 sm:p-2 rounded-lg text-cyan-300 hover:text-cyan-500 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        <ChevronsRight className="w-3 h-3 sm:w-5 sm:h-5" />
      </button>
    </div>
  );
};

export default PaginationControls;
