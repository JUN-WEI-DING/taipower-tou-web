/* Hook for file upload with CSV parsing */

import { useState } from "react";
import { uploadApi, getErrorMessage } from "../api/client";
import type { UsageData } from "../api/types";

interface UseFileUploadOptions {
  onSuccess?: (parsedData: UsageData) => void;
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const { onSuccess } = options;
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      const result = await uploadApi.uploadCSV(file);

      if (!result.validation.valid) {
        setError(result.validation.errors.join(", "));
        return null;
      }

      // Show warnings if any
      if (result.validation.warnings.length > 0) {
        console.warn("CSV warnings:", result.validation.warnings);
      }

      setProgress(100);

      const usageData: UsageData = {
        format: "list",
        data: result.parsed.data,
        start: result.parsed.start,
        freq: result.parsed.freq,
      };

      if (onSuccess) {
        onSuccess(usageData);
      }

      return {
        usageData,
        statistics: result.parsed.statistics,
        dateRange: result.parsed.date_range,
      };
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      return null;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return {
    uploadFile,
    isUploading,
    progress,
    error,
    clearError: () => setError(null),
  };
}
