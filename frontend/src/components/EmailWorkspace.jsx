import React, { useState, useRef } from 'react';
import { UploadCloud, Info, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function EmailWorkspace({ setReportData, setIsInvestigating, targetLanguage = 'English' }) {
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
    
    if (targetLanguage !== 'English') {
      formData.append('target_language', targetLanguage);
    }

    try {
      setIsSubmitting(true);
      if (setIsInvestigating) setIsInvestigating(true);

      const response = await fetch(`${API_BASE_URL}/api/investigate/email`, {
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
    <div className="w-full">
      {/* File Upload Zone */}
      <div 
        className={`w-full border-2 border-dashed border-cyan-500/20 hover:border-cyan-500/40 bg-zinc-950/70 backdrop-blur-md shadow-xl shadow-cyan-950/30 rounded-xl p-4 md:p-8 flex flex-col items-center justify-center transition-colors duration-300 ${!isSubmitting ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
        onClick={handleDropzoneClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {emailFile ? (
          <div className="text-cyan-400 font-mono text-center flex flex-col items-center">
            <p className="text-base md:text-lg font-bold">File Selected</p>
            <p className="text-xs md:text-sm mt-1 md:mt-2 truncate max-w-[200px]">{emailFile.name}</p>
          </div>
        ) : (
          <div className="text-center text-slate-400 flex flex-col items-center">
            <UploadCloud className="text-cyan-500 w-8 h-8 md:w-10 md:h-10 mb-2 md:mb-3" />
            <span className="text-xs md:text-sm text-slate-300 font-medium block">Submit Original Email Artifact</span>
            <span className="text-[10px] md:text-xs font-mono text-slate-500 mt-1 md:mt-2 block">
              [ Drag & Drop or Click to Browse ]
            </span>
            <span className="text-[9px] md:text-[10px] text-slate-500 mt-0.5 md:mt-1 font-mono block">Supports: .eml, .msg</span>
          </div>
        )}
        
        <input 
          type="file" 
          accept=".eml, .msg, application/vnd.ms-outlook" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileUpload}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex flex-wrap justify-center gap-2 md:gap-4 mt-2.5 md:mt-4 text-[9px] sm:text-[10px] md:text-xs font-mono text-cyan-500/70">
        <span className="flex items-center"><CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1"/> Header Authentication</span>
        <span className="flex items-center"><CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1"/> URL Correlation</span>
        <span className="flex items-center"><CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1"/> AI Threat Analysis</span>
      </div>

      {/* The Divider */}
      <div className="flex items-center w-full my-3 md:my-6 opacity-50">
        <div className="flex-grow border-t border-slate-800"></div>
        <span className="px-3 md:px-4 text-[9px] md:text-[10px] font-mono text-slate-600 tracking-widest">OR</span>
        <div className="flex-grow border-t border-slate-800"></div>
      </div>

      {/* Text Area */}
      <textarea
        className={`w-full h-24 md:h-40 bg-zinc-950/70 backdrop-blur-md border border-cyan-500/20 hover:border-cyan-500/40 transition-colors duration-300 shadow-xl shadow-cyan-950/30 rounded-xl p-2.5 md:p-4 text-zinc-300 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 resize-none font-sans text-xs md:text-sm leading-relaxed placeholder-slate-600 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        placeholder={`Example format:\nFrom: Support <admin@security.com>\nSubject: Urgent Account Review\n\nDear User, your account is locked.\nClick here to verify: https://suspicious-link.com`}
        value={emailText}
        onChange={handleTextChange}
        disabled={isSubmitting}
      />
      
      {/* Educational Microcopy */}
      <div className="flex items-start mt-2 md:mt-3 space-x-1.5 md:space-x-2 text-slate-400 text-[10px] md:text-xs font-mono">
        <Info className="w-3.5 h-3.5 md:w-4 md:h-4 text-cyan-500/70 flex-shrink-0 mt-0.5" />
        <p>For maximum accuracy, upload original .eml or .msg. Pasted text skips header authentication.</p>
      </div>

      {/* The Action Button */}
      <button
        className={`w-full py-2.5 md:py-4 mt-3 md:mt-8 font-mono text-xs md:text-sm tracking-[0.2em] md:tracking-widest rounded-xl transition-all duration-300 cursor-pointer ${(!emailFile && !emailText.trim()) || isSubmitting ? 'bg-slate-900/50 border border-slate-800 text-slate-600 cursor-not-allowed' : 'bg-cyan-950/40 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-900/60 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]'}`}
        disabled={(!emailFile && !emailText.trim()) || isSubmitting}
        onClick={handleInvestigate}
      >
        {isSubmitting ? 'INVESTIGATING...' : 'BEGIN INVESTIGATION'}
      </button>
    </div>
  );
}
