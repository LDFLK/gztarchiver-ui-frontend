import { BarChart3 } from "lucide-react";

const ErrorCard = ({error}) => (
  <div className="bg-white border border-gray-100 rounded-lg p-4 sm:p-6 w-full sm:flex-1">
    <div className="flex flex-col items-center text-center space-y-3">
      <div>
        <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
      </div>
      <h3 className="text-xs sm:text-sm font-light text-gray-400">
        No Stats Found
      </h3>
      <p className="text-xs font-light text-gray-400 max-w-xs">
        {error}
      </p>
    </div>
  </div>
);

export default ErrorCard;
