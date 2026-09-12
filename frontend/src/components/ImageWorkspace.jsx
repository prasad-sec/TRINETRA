import React, { useState, useRef } from "react";
import { Upload, FileImage, ShieldAlert, RefreshCw, X } from "lucide-react";
import { API_BASE_URL } from "../config/api";

export default function ImageWorkspace({ onResult, setIsInvestigating, setInvestigationState, targetLanguage = 'English' }) {
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
        e.target.value = null;
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
        if (targetLanguage !== 'English') {
            formData.append("target_language", targetLanguage);
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/investigate/image`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.detail || "Image analysis failed.");
            }

            const data = await response.json();

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
    };

    return (
        <div className="max-w-xl mx-auto space-y-3 md:space-y-6">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleInputChange}
                accept="image/png, image/jpeg, image/jpg"
                className="sr-only"
                disabled={isLoading}
            />

            <div
                onClick={() => {
                    if (!isLoading) fileInputRef.current?.click();
                }}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={handleDrop}
                className={`cursor-pointer border-2 border-dashed border-cyan-500/20 hover:border-cyan-500/40 bg-zinc-950/70 backdrop-blur-md shadow-xl shadow-cyan-950/30 rounded-xl p-4 sm:p-6 md:p-8 text-center transition-all duration-300 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
            >
                {!file ? (
                    <div className="flex flex-col items-center space-y-2 md:space-y-4">
                        <div className="p-2.5 md:p-4 bg-zinc-950/70 backdrop-blur-md rounded-full text-cyan-400 border border-cyan-500/20">
                            <Upload className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-zinc-200">Upload Suspicious Image</h3>
                            <p className="text-xs md:text-sm text-zinc-500 mt-0.5 md:mt-1">
                                Drag & drop a screenshot of a fake SMS, email, or scam photo
                            </p>
                        </div>

                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!isLoading) fileInputRef.current?.click();
                            }}
                            className="px-3.5 py-2 md:px-5 md:py-2.5 bg-zinc-800 hover:bg-zinc-700 text-cyan-400 font-medium text-xs md:text-sm rounded-lg border border-cyan-500/30 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FileImage className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span>Browse Image</span>
                        </button>
                        <span className="text-[10px] md:text-xs text-zinc-600">Supported: PNG, JPG, JPEG</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center space-y-2 md:space-y-4">
                        <div className="relative group">
                            <img
                                src={previewUrl}
                                alt="Upload Preview"
                                className="w-24 h-24 md:w-32 md:h-32 object-contain rounded-xl border border-cyan-500/20 bg-zinc-950/70 backdrop-blur-md shadow-xl shadow-cyan-950/30 p-2"
                            />
                            <button
                                type="button"
                                disabled={isLoading}
                                onClick={handleClear}
                                className="absolute -top-2 -right-2 p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Remove file"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="text-center">
                            <p className="text-xs md:text-sm font-medium text-zinc-200 truncate max-w-xs">{file.name}</p>
                            <p className="text-[10px] md:text-xs text-zinc-500">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="p-2.5 md:p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-red-400 text-xs md:text-sm flex items-center space-x-2">
                    <ShieldAlert className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <button
                type="button"
                disabled={!file || isLoading}
                onClick={handleInvestigate}
                className={`w-full py-2.5 md:py-3.5 rounded-xl font-semibold text-xs md:text-sm transition-all flex items-center justify-center space-x-2 cursor-pointer ${!file || isLoading
                        ? "bg-zinc-800/50 text-zinc-600 border border-zinc-800 cursor-not-allowed"
                        : "bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold shadow-lg shadow-cyan-500/20 active:scale-[0.99]"
                    }`}
            >
                {isLoading ? (
                    <>
                        <RefreshCw className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" />
                        <span>Analyzing Image...</span>
                    </>
                ) : (
                    <span>BEGIN INVESTIGATION</span>
                )}
            </button>
        </div>
    );
}