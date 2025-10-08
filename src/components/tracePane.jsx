import { useEffect } from "react";
import { X } from "lucide-react";

const TracePane = ({ documentId, onClose }) => {
  useEffect(() => {
    // Prevent body scroll when pane is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <>
      {/* Sliding Pane */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-3/5 bg-white shadow-2xl z-50 animate-slideIn overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Document Trace
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-600 hover:cursor-pointer transition-colors duration-200"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Document ID
            </h3>
            <p className="text-base text-gray-900 font-mono bg-gray-50 p-3 rounded-lg break-all">
              {documentId}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Trace Information
              </h3>
              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <p className="text-sm text-gray-900">Active</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Last Modified</p>
                  <p className="text-sm text-gray-900">2025-10-08</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Version</p>
                  <p className="text-sm text-gray-900">1.0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default TracePane;
