/* CSV upload component with drag & drop */

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { uploadApi, getErrorMessage } from "../../api/client";
import type { UsageData } from "../../api/types";
import { WarningBanner } from "../ui/WarningBanner";

interface CSVUploaderProps {
  onDataLoaded: (data: UsageData) => void;
  onError?: (error: string) => void;
}

export function CSVUploader({ onDataLoaded, onError }: CSVUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [uploadResult, setUploadResult] = useState<{
    recordCount: number;
    statistics: { total_usage_kwh: number; average_hourly: number; peak_hourly: number };
    dateRange: { start: string; end: string };
  } | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsUploading(true);
      setWarnings([]);
      setUploadResult(null);

      try {
        const result = await uploadApi.uploadCSV(file);

        if (!result.validation.valid) {
          const errorMsg = result.validation.errors.join(", ");
          onError?.(errorMsg);
          return;
        }

        // Display warnings if any
        if (result.validation.warnings.length > 0) {
          setWarnings(result.validation.warnings);
        }

        // Build UsageData object from API response
        const usageData: UsageData = {
          format: "list",
          data: result.parsed.data,
          start: result.parsed.start,
          freq: result.parsed.freq,
        };

        // Store additional info for display
        setUploadResult({
          recordCount: result.parsed.record_count,
          statistics: result.parsed.statistics,
          dateRange: result.parsed.date_range,
        });

        onDataLoaded(usageData);
      } catch (error) {
        const message = getErrorMessage(error);
        onError?.(message);
      } finally {
        setIsUploading(false);
      }
    },
    [onDataLoaded, onError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
    disabled: isUploading,
  });

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      {/* Warning Banner */}
      <WarningBanner
        warnings={warnings}
        onDismiss={() => setWarnings([])}
      />

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isUploading
            ? "border-gray-300 bg-gray-50 cursor-not-allowed"
            : isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input {...getInputProps()} />
        <svg
          className="mx-auto h-12 w-12 text-gray-400 mb-4"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {isUploading ? (
          <p className="text-gray-600">上傳中...</p>
        ) : isDragActive ? (
          <p className="text-blue-600">放開檔案以開始上傳...</p>
        ) : (
          <div>
            <p className="text-gray-700 mb-2">拖曳 CSV 檔案至此，或點擊選取</p>
            <p className="text-sm text-gray-500">
              支援格式：CSV (需包含時間戳與用電度數欄位)
            </p>
          </div>
        )}
      </div>

      {/* Upload Result Summary */}
      {uploadResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg
              className="h-5 w-5 text-green-400 mt-0.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div className="ml-3 flex-1">
              <h4 className="text-sm font-medium text-green-800">
                已成功載入用電資料
              </h4>
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-green-700">
                <div>
                  <span className="font-medium">資料筆數:</span> {uploadResult.recordCount}
                </div>
                <div>
                  <span className="font-medium">總用電:</span> {uploadResult.statistics.total_usage_kwh} kWh
                </div>
                <div>
                  <span className="font-medium">平均每小時:</span> {uploadResult.statistics.average_hourly} kWh
                </div>
                <div>
                  <span className="font-medium">尖峰用電:</span> {uploadResult.statistics.peak_hourly} kWh
                </div>
                <div className="col-span-2">
                  <span className="font-medium">資料期間:</span> {formatDate(uploadResult.dateRange.start)} ~ {formatDate(uploadResult.dateRange.end)}
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
