import React, { useState, useRef } from "react";
import { Upload, FileImage, ShieldAlert, CheckCircle, RefreshCw, X } from "lucide-react";

export default function QrWorkspace({ onResult, setEyeStatus, setIsInvestigating, setInvestigationState }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setError(null);
    } else {
      setError("Please select a valid image file (.png, .jpg, .jpeg).");
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
    e.target.value = null; // Reset so re-selecting same file works
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoading) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (isLoading) return;
    setFile(null);
    setPreviewUrl(null);
    setError(null);
  };

  const handleInvestigate = async () => {
    if (!file) return;
    setIsLoading(true);
    if (setIsInvestigating) setIsInvestigating(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/api/investigate/qr", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "QR code analysis failed.");
      }

      const data = await response.json();

      // Hand over to parent. Do NOT reset state or setIsInvestigating(false) here,
      // as the parent's master timing lock will handle the visual transition.
      if (onResult) {
        onResult(data);
      }
    } catch (err) {
      console.error("Investigation failed:", err);
      setError(err.message || "An unexpected error occurred.");
      setIsLoading(false);
      if (setIsInvestigating) setIsInvestigating(false);
      if (typeof setInvestigationState === "function") setInvestigationState("error");
    }
    // No finally block to reset `isLoading` on success,
    // ensuring the UI stays in its "File Selected" disabled state until unmounted.
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-[fadeIn_0.5s_ease-in-out] transition-opacity duration-700 ease-in-out opacity-100">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept="image/png, image/jpeg, image/jpg"
        className="sr-only"
        disabled={isLoading}
      />

      {/* Drop / Select Card */}
      <div
        onClick={() => {
          if (!isLoading) fileInputRef.current?.click();
        }}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={handleDrop}
        className={`cursor-pointer border-2 border-dashed border-zinc-800 hover:border-cyan-500/50 bg-zinc-950/50 rounded-2xl p-8 text-center transition-all duration-200 ${
          isLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {!file ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-zinc-900 rounded-full text-cyan-400 border border-zinc-800">
              <Upload className="w-8 h-8"/>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-200">Upload QR Artifact</h3>
              <p className="text-sm text-zinc-500 mt-1">
                Drag & drop your QR image here, or browse from computer
              </p>
            </div>

            {/* BUTTON 1: BROWSE FILE */}
            <button
              type="button"
              disabled={isLoading}
              onClick={(e) => {
                e.stopPropagation();
                if (!isLoading) fileInputRef.current?.click();
              }}
              className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-cyan-400 font-medium text-sm rounded-lg border border-cyan-500/30 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileImage className="w-4 h-4"/>
              <span>Browse File</span>
            </button>
            <span className="text-xs text-zinc-600">Supported: PNG, JPG, JPEG</span>
          </div>
        ) : (
          /* File Selected Preview State */
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              <img
                src={previewUrl}
                alt="QR Preview"
                className="w-32 h-32 object-contain rounded-lg border border-zinc-700 bg-zinc-900 p-2"
              />
              <button
                type="button"
                disabled={isLoading}
                onClick={handleClear}
                className="absolute -top-2 -right-2 p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Remove file"
              >
                <X className="w-4 h-4"/>
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm font-medium text-zinc-200 truncate max-w-xs">{file.name}</p>
              <p className="text-xs text-zinc-500">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-red-400 text-sm flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 shrink-0"/>
          <span>{error}</span>
        </div>
      )}

      {/* BUTTON 2: BEGIN INVESTIGATION */}
      <button
        type="button"
        disabled={!file || isLoading}
        onClick={handleInvestigate}
        className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center space-x-2 ${
          !file || isLoading
            ? "bg-zinc-800/50 text-zinc-600 border border-zinc-800 cursor-not-allowed"
            : "bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold shadow-lg shadow-cyan-500/20 active:scale-[0.99]"
        }`}
      >
        {isLoading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin"/>
            <span>Analyzing QR Payload...</span>
          </>
        ) : (
          <span>BEGIN INVESTIGATION</span>
        )}
      </button>
    </div>
  );
}
