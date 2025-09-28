import React, { useState, useRef, useCallback } from "react";
import { Button } from "../ui/button";

interface UploadedFile {
  file: File;
  preview: string;
  size: string;
}

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function UploadCV() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError("Vui lòng chỉ tải lên file PDF hoặc DOCX");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Kích thước file phải nhỏ hơn 10MB");
      return false;
    }

    return true;
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    setError(null);

    if (validateFile(file)) {
      const uploadedFile: UploadedFile = {
        file,
        preview: file.name,
        size: formatFileSize(file.size),
      };
      setUploadedFile(uploadedFile);
      setUploadComplete(false);
    }
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadComplete(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;

    setUploading(true);
    setError(null);

    try {
      // Tạm thời simulate upload process
      // TODO: Tích hợp với API thật
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setUploadComplete(true);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Upload thất bại. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  const goBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          onClick={goBack}
          className="mb-8 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 text-sm transform transition-transform duration-300 ease-out hover:scale-105 shadow-lg hover:shadow-2xl"
        >
          ← Quay lại
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Tải lên CV của bạn
          </h1>
          <p className="text-gray-600 text-base max-w-2xl mx-auto">
            Chia sẻ hồ sơ của bạn với các nhà tuyển dụng. Chúng tôi hỗ trợ file
            PDF và DOCX có kích thước tối đa 10MB.
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Upload Area */}
          <div className="p-8">
            {!uploadedFile ? (
              <div
                className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer ${
                  dragActive
                    ? "border-blue-500 bg-blue-50 scale-105"
                    : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={openFileDialog}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileInput}
                  className="hidden"
                />

                <div className="flex flex-col items-center">
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors ${
                      dragActive ? "bg-blue-200" : "bg-gray-100"
                    }`}
                  >
                    <svg
                      className={`w-10 h-10 ${
                        dragActive ? "text-blue-600" : "text-gray-400"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {dragActive
                      ? "Thả file của bạn vào đây"
                      : "Nhấp để tải lên hoặc kéo thả file"}
                  </h3>

                  <p className="text-gray-500 mb-4 text-sm">
                    Chỉ chấp nhận file PDF hoặc DOCX, tối đa 10MB
                  </p>

                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      PDF
                    </span>
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      DOCX
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* File Preview */}
                <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      {uploadedFile.preview}
                    </h4>
                    <p className="text-xs text-gray-500">{uploadedFile.size}</p>
                  </div>
                  <Button
                    onClick={removeFile}
                    className="ml-4 p-2 text-gray-400 hover:text-red-500 transition-colors bg-transparent shadow-none hover:bg-red-50"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </Button>
                </div>

                {/* Upload Status */}
                {uploadComplete && (
                  <div className="flex items-center p-4 bg-green-50 rounded-xl">
                    <svg
                      className="w-6 h-6 text-green-500 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <h4 className="text-sm font-semibold text-green-900">
                        Tải lên thành công!
                      </h4>
                      <p className="text-xs text-green-700">
                        CV của bạn đã được tải lên thành công.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 flex items-center p-4 bg-red-50 rounded-xl">
                <svg
                  className="w-6 h-6 text-red-500 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-red-900">
                    Lỗi tải lên
                  </h4>
                  <p className="text-xs text-red-700">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {uploadedFile && (
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleUpload}
                  disabled={uploading || uploadComplete}
                  className={`flex-1 flex items-center justify-center px-6 py-3 text-sm font-medium transform transition-transform duration-300 ease-out hover:scale-105 shadow-lg hover:shadow-2xl ${
                    uploadComplete
                      ? "bg-green-100 text-green-700 cursor-default hover:scale-100"
                      : uploading
                      ? "bg-blue-400 text-white cursor-not-allowed hover:scale-100"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Đang tải lên...
                    </>
                  ) : uploadComplete ? (
                    <>
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Đã tải lên thành công
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      Tải lên CV
                    </>
                  )}
                </Button>

                <Button
                  onClick={removeFile}
                  className="px-6 py-3 border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transform transition-all duration-300 ease-out hover:scale-105 shadow-lg hover:shadow-2xl text-sm font-medium"
                >
                  Chọn file khác
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            File của bạn sẽ được xử lý an toàn và lưu trữ với mã hóa.
          </p>
        </div>
      </div>
    </div>
  );
}
