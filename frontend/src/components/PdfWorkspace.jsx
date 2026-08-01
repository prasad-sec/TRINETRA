import React, { useState, useRef } from 'react';

export default function PdfWorkspace({ onAnalysisComplete, setEyeStatus, setIsInvestigating }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
      setError('Please select a valid PDF document.');
      return;
    }
    setError(null);
    setFile(selectedFile);
  };

  const uploadPdf = async (pdfFile) => {
    setIsLoading(true);
    if (setIsInvestigating) setIsInvestigating(true);

    const formData = new FormData();
    formData.append('file', pdfFile);

    try {
      // NOTE: Make sure the URL matches your backend endpoint
      const response = await fetch('http://localhost:8000/api/investigate/pdf', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze PDF file.');
      }
      
      const data = await response.json();

      // Hand over to parent. Do NOT reset state or setIsInvestigating(false) here,
      // as the parent's master timing lock will handle the visual transition.
      if (onAnalysisComplete) {
        onAnalysisComplete(data);
      }
    } catch (err) {
      console.error("Investigation failed:", err);
      setError(err.message || 'Failed to analyze PDF file.');
      setIsLoading(false); // Only reset on error
      if (setIsInvestigating) setIsInvestigating(false);
      if (typeof setInvestigationState === 'function') setInvestigationState('error');
    }
    // No finally block to reset `isLoading` on success, 
    // ensuring the UI stays in its "File Selected" disabled state until unmounted.
  };

  const handleBrowseClick = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevents parent dropzone from blocking the click
    if (fileInputRef.current && !isLoading) {
      fileInputRef.current.value = null; // Reset value
      fileInputRef.current.click();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isLoading) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 animate-[fadeIn_0.5s_ease-in-out] transition-opacity duration-700 ease-in-out opacity-100">
      {/* Hidden File Input - MUST stay mounted */}
      <input
        type="file"
        ref={fileInputRef}
        accept="application/pdf,.pdf"
        className="hidden"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
        disabled={isLoading}
      />

      <div className="flex flex-col space-y-6">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={!file && !isLoading ? handleBrowseClick : undefined}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 ${
            isDragging 
              ? 'border-cyan-400 bg-cyan-950/20 scale-[1.01]' 
              : 'border-slate-700 bg-slate-900/40'
          } ${!file && !isLoading ? 'cursor-pointer hover:border-slate-500' : ''} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {file ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-4 bg-cyan-900/40 rounded-full text-cyan-400">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-slate-200">{file.name}</p>
                <p className="text-sm text-cyan-500 mt-1">{formatSize(file.size)}</p>
              </div>
              <div className="flex space-x-3 mt-4">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Remove File
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleBrowseClick}
                  className="px-4 py-2 border border-slate-600 hover:border-slate-400 text-slate-300 font-medium rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Change
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
              <div className="p-4 bg-slate-800/80 rounded-full text-cyan-400">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-slate-200">Drag & Drop suspicious PDF document</p>
                <p className="text-sm text-slate-400 mt-1">or click anywhere in this box to select a file</p>
              </div>
              <button
                type="button"
                onClick={handleBrowseClick}
                disabled={isLoading}
                className="pointer-events-auto px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Browse Files
              </button>
            </div>
          )}
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        </div>

        {/* Action Button */}
        <button
          className={`w-full py-4 mt-8 font-mono tracking-widest rounded-xl transition-all duration-300 ${
            !file || isLoading 
              ? 'bg-slate-900/50 border border-slate-800 text-slate-600 cursor-not-allowed' 
              : 'bg-cyan-950/40 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-900/60 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]'
          }`}
          disabled={!file || isLoading}
          onClick={() => uploadPdf(file)}
        >
          {isLoading ? 'INVESTIGATING...' : 'BEGIN INVESTIGATION'}
        </button>
      </div>
    </div>
  );
}
