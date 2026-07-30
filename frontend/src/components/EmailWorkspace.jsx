import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Info, CheckCircle } from 'lucide-react';

export default function EmailWorkspace({ setReportData, setEyeStatus, setIsInvestigating }) {
  const [emailFile, setEmailFile] = useState(null);
  const [emailText, setEmailText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleInvestigate = async (e) => {
    if (e) e.preventDefault();
    if (!emailFile && !emailText.trim()) return;

    // 1. Prepare Payload
    const formData = new FormData();
    if (emailFile) {
      formData.append('type', 'upload');
      formData.append('file', emailFile);
    } else {
      formData.append('type', 'text');
      formData.append('content', emailText);
    }

    try {
      setIsSubmitting(true);
      if (setIsInvestigating) setIsInvestigating(true);

      const response = await fetch('http://localhost:8000/api/investigate/email', {
        method: 'POST',
        body: formData, 
      });

      if (!response.ok) {
        throw new Error(`Backend returned status ${response.status}`);
      }

      const data = await response.json();

      // Hand over to parent. Do NOT reset state or setIsInvestigating(false) here,
      // as the parent's master timing lock will handle the visual transition.
      if (setReportData) setReportData(data);

    } catch (error) {
      console.error("Investigation API Error:", error);
      if (setIsInvestigating) setIsInvestigating(false); // Only toggle off on error
      alert("Failed to connect to the TRINETRA analysis engine. Ensure the backend is running.");
      setIsSubmitting(false); // Reset submit state on error
    }
    // No finally block to reset `isSubmitting` on success, 
    // ensuring the UI stays in its "File Selected" disabled state until unmounted.
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setEmailFile(e.target.files[0]);
      setEmailText('');
    }
  };

  const handleTextChange = (e) => {
    setEmailText(e.target.value);
    setEmailFile(null);
  };

  const handleDropzoneClick = () => {
    if (!isSubmitting) fileInputRef.current?.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const fileName = droppedFile.name.toLowerCase();
      if (fileName.endsWith('.eml') || fileName.endsWith('.msg')) {
        setEmailFile(droppedFile);
        setEmailText('');
      } else {
        alert('Please upload a .eml or .msg file.');
      }
    }
  };

  // Render ONLY the staging UI
  return (
    <div className="w-full animate-[fadeIn_0.5s_ease-in-out] transition-opacity duration-700 ease-in-out opacity-100">
      {/* File Upload Zone */}
      <div 
        className={`w-full border-2 border-dashed border-slate-700/50 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-900/30 transition-colors ${!isSubmitting ? 'hover:bg-slate-800/50 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
        onClick={handleDropzoneClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {emailFile ? (
          <div className="text-cyan-400 font-mono text-center flex flex-col items-center">
            <p className="text-lg font-bold">File Selected</p>
            <p className="text-sm mt-2 truncate max-w-[200px]">{emailFile.name}</p>
          </div>
        ) : (
          <div className="text-center text-slate-400 flex flex-col items-center">
            <UploadCloud className="text-cyan-500 w-10 h-10 mb-3" />
            <span className="text-slate-300 font-medium block">Submit Original Email Artifact</span>
            <span className="text-xs font-mono text-slate-500 mt-2 block">
              [ Drag & Drop or Click to Browse ]
            </span>
            <span className="text-[10px] text-slate-500 mt-1 font-mono block">Supports: .eml, .msg</span>
          </div>
        )}
        
        <input 
          type="file" 
          accept=".eml,.msg" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileUpload}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex flex-wrap justify-center gap-4 mt-4 text-[10px] sm:text-xs font-mono text-cyan-500/70">
        <span className="flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> Header Authentication</span>
        <span className="flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> URL Correlation</span>
        <span className="flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> AI Threat Analysis</span>
      </div>

      {/* The Divider */}
      <div className="flex items-center w-full my-6 opacity-50">
        <div className="flex-grow border-t border-slate-800"></div>
        <span className="px-4 text-[10px] font-mono text-slate-600 tracking-widest">OR</span>
        <div className="flex-grow border-t border-slate-800"></div>
      </div>

      {/* Text Area */}
      <textarea
        className={`w-full h-40 bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-slate-300 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 resize-none font-mono text-sm placeholder-slate-600 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        placeholder={`Example format:\nFrom: Support <admin@security.com>\nSubject: Urgent Account Review\n\nDear User, your account is locked.\nClick here to verify: https://suspicious-link.com`}
        value={emailText}
        onChange={handleTextChange}
        disabled={isSubmitting}
      />
      
      {/* Educational Microcopy */}
      <div className="flex items-start mt-3 space-x-2 text-slate-400 text-xs font-mono">
        <Info className="w-4 h-4 text-cyan-500/70 flex-shrink-0" />
        <p>For maximum accuracy, upload the original .eml or .msg file. Pasted email content will skip header authentication analysis.</p>
      </div>

      {/* The Action Button */}
      <button
        className={`w-full py-4 mt-8 font-mono tracking-widest rounded-xl transition-all duration-300 ${(!emailFile && !emailText.trim()) || isSubmitting ? 'bg-slate-900/50 border border-slate-800 text-slate-600 cursor-not-allowed' : 'bg-cyan-950/40 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-900/60 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]'}`}
        disabled={(!emailFile && !emailText.trim()) || isSubmitting}
        onClick={handleInvestigate}
      >
        {isSubmitting ? 'INVESTIGATING...' : 'BEGIN INVESTIGATION'}
      </button>
    </div>
  );
}
