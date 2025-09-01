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

export default SkeletonCard;