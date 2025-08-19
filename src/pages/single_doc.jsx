import { useNavigate, useParams } from "react-router-dom";
import React, { useState, useEffect } from "react";
import {
  MoveLeft,
  CircleX,
  Calendar,
  FileText,
  ExternalLink,
  Download,
  Eye,
  FileSliders,
} from "lucide-react";

const SingleDoc = () => {
  const { collection, doc_id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiUrl = window?.configs?.apiUrl ? window.configs.apiUrl : "/";
    const fetchCollectionIndividualData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Make fetch request using the collection name
        const response = await fetch(
          `${apiUrl}/documents/${collection}/${doc_id}`
        );

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

    if (collection && doc_id) {
      fetchCollectionIndividualData();
    }
  }, [collection, doc_id]); // Refetch when collection & document id parameter changes

  const goBack = () => {
    navigate(`/${collection}`);
  };

  const extractYear = (collection) => {
    const yearMatch = collection.match(/(\d{4})/);
    return yearMatch ? yearMatch[1] : null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown Date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDownload = () => {
    if (data?.download_url) {
      window.open(data.download_url, "_blank");
    }
  };

  const handleViewInDrive = () => {
    if (data?.gdrive_file_url) {
      window.open(data.gdrive_file_url, "_blank");
    }
  };

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
          Gazette #{data?.document_id || doc_id}
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-500 mb-6">
          <div className="flex items-center gap-1 mt-2 md:mt-0 lg:mt-0">
            <Calendar className="w-4 h-4" />
            {formatDate(data?.document_date)}
          </div>
          <div className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            {data?.document_type || "Unknown Type"}
          </div>
        </div>
        <div className="">
          {data?.reasoning && data.reasoning !== "NOT-FOUND" ? (
            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {data.reasoning}
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                No analysis available for this document.
              </p>
            </div>
          )}

          {/* Document Links Section */}
          {(data?.file_path || data?.download_url || data?.source) && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Quick Actions
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {data?.file_path && (
                  <a
                    href={data.file_path !== "N/A" ? data.file_path : undefined}
                    target={data.file_path !== "N/A" ? "_blank" : undefined}
                    rel={
                      data.file_path !== "N/A"
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className={`inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors 
      ${
        data.download_url !== "N/A"
          ? "text-blue-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
          : "text-gray-400 bg-gray-100 cursor-not-allowed"
      }`}
                    onClick={(e) => {
                      if (data.download_url === "N/A") {
                        e.preventDefault(); // block navigation
                      }
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in LDF Archive
                  </a>
                )}
                {data?.source && (
                  <a
                    href={data.source !== "N/A" ? data.source : undefined}
                    target={data.source !== "N/A" ? "_blank" : undefined}
                    rel={
                      data.source !== "N/A" ? "noopener noreferrer" : undefined
                    }
                    className={`inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors 
      ${
        data.source !== "N/A"
          ? "text-purple-600 hover:text-purple-700 hover:bg-purple-50 cursor-pointer"
          : "text-gray-400 bg-gray-100 cursor-not-allowed"
      }`}
                    onClick={(e) => {
                      if (data.source === "N/A") {
                        e.preventDefault(); // block navigation
                      }
                    }}
                  >
                    <FileSliders className="w-4 h-4" />
                    Source
                  </a>
                )}
                {data?.download_url && (
                  <a
                    href={
                      data.download_url !== "N/A"
                        ? data.download_url
                        : undefined
                    }
                    target={data.download_url !== "N/A" ? "_blank" : undefined}
                    rel={
                      data.download_url !== "N/A"
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className={`inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors 
            ${
              data.download_url !== "N/A"
                ? "text-gray-600 hover:text-gray-700 hover:bg-gray-50 cursor-pointer"
                : "text-gray-400 bg-gray-100 cursor-not-allowed"
            }`}
                    onClick={(e) => {
                      if (data.download_url === "N/A") {
                        e.preventDefault(); // block navigation
                      }
                    }}
                  >
                    <Download className="w-4 h-4" />
                    Download File
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleDoc;
