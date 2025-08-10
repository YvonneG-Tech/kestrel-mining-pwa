"use client";
import { useState, useRef } from "react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
  label?: string;
  className?: string;
}

export default function FileUpload({
  onFileSelect,
  accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx",
  maxSize = 5 * 1024 * 1024, // 5MB default
  label = "Upload Document",
  className = "",
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`;
    }

    const allowedTypes = accept.split(",").map((type) => type.trim());
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      return `File type not allowed. Accepted types: ${accept}`;
    }

    return null;
  };

  const handleFile = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setUploadedFile(file);
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setUploadedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={`file-upload ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="d-none"
      />

      {uploadedFile ? (
        <div className="card">
          <div className="card-body">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <div className="avatar avatar-sm me-3 bg-primary text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                    <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                  </svg>
                </div>
                <div>
                  <div className="fw-bold">{uploadedFile.name}</div>
                  <div className="text-muted small">
                    {formatFileSize(uploadedFile.size)}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={handleRemove}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`card file-drop-zone ${
            isDragOver ? "border-primary bg-light" : "border-secondary"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          style={{ cursor: "pointer", minHeight: "120px" }}
        >
          <div className="card-body d-flex flex-column align-items-center justify-content-center text-center">
            <div className="avatar avatar-lg mb-3 bg-secondary text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                <path d="M12 11v6" />
                <path d="M9.5 13.5l2.5 -2.5l2.5 2.5" />
              </svg>
            </div>
            <h4 className="mb-1">{label}</h4>
            <p className="text-muted mb-1">
              Drag and drop files here, or click to browse
            </p>
            <small className="text-muted">
              Accepted formats: {accept} (Max: {Math.round(maxSize / 1024 / 1024)}MB)
            </small>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger mt-3" role="alert">
          <div className="d-flex">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon alert-icon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <circle cx="12" cy="12" r="9" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>{error}</div>
          </div>
        </div>
      )}
    </div>
  );
}