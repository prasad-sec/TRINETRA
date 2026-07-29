import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Info, CheckCircle } from 'lucide-react';

export default function EmailWorkspace({ setReportData, setEyeStatus, setIsInvestigating }) {
  const [emailFile, setEmailFile] = useState(null);
  const [emailText, setEmailText] = useState('');
  const [isInvestigatingLocal, setIsInvestigatingLocal] = useState(false);
  const [reportDataLocal, setReportDataLocal] = useState(null);
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
      // 3. Prevent Flash of Dummy Data
      if (setReportData) setReportData(null); 
      setReportDataLocal(null);

      // 2. Trigger Active UI States
      setIsInvestigatingLocal(true);
      if (setIsInvestigating) setIsInvestigating(true);
      if (setEyeStatus) setEyeStatus('investigating');

      // 3. Make the Live Network Call (Ensure port matches FastAPI, default 8000)
      const response = await fetch('http://localhost:8000/api/v1/investigate/email', {
        method: 'POST',
        body: formData, // Do NOT set Content-Type header; browser handles multipart boundary automatically
      });

      if (!response.ok) {
        throw new Error(`Backend returned status ${response.status}`);
      }

      // 4. Parse the Groq AI Response
      const data = await response.json();

      // 5. Update Report State
      if (setReportData) setReportData(data);
      setReportDataLocal(data);

      // 6. Update Dynamic Eye based on AI Verdict
      if (data.ai_analysis && data.ai_analysis.verdict && setEyeStatus) {
        setEyeStatus(data.ai_analysis.verdict.toLowerCase()); // e.g., 'safe', 'suspicious', 'malicious'
      } else if (setEyeStatus) {
        setEyeStatus('ready');
      }

    } catch (error) {
      console.error("Investigation API Error:", error);
      // Fallback UI state on failure
      if (setEyeStatus) setEyeStatus('ready');
      alert("Failed to connect to the TRINETRA analysis engine. Ensure the backend is running.");
    } finally {
      // 7. Remove loading state
      setIsInvestigatingLocal(false);
      if (setIsInvestigating) setIsInvestigating(false);
    }
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
    fileInputRef.current?.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
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

  // 1. If currently investigating, ONLY show the loading sequence
  if (isInvestigatingLocal) {
    return (
      <div className="w-full animate-[fadeIn_0.5s_ease-in-out] transition-opacity duration-700 ease-in-out opacity-100 flex flex-col items-center justify-center py-12">
        <h3 className="font-sans text-sm font-semibold tracking-widest text-cyan-400 uppercase mb-1">Investigation Active</h3>
        <p className="font-mono text-xs text-slate-500">Analyzing email signatures and behavior...</p>
      </div>
    );
  }

  // 2. If investigation is done and report data exists, ONLY show the report
  // (Parent InvestigationWorkspace actually handles the AIInvestigationResult, but this satisfies the structural requirement)
  if (reportDataLocal) {
    return (
      <div className="w-full animate-[fadeIn_0.5s_ease-in-out] transition-opacity duration-700 ease-in-out opacity-100 flex flex-col items-center justify-center py-12">
        <h3 className="font-sans text-sm font-semibold tracking-widest text-cyan-400 uppercase mb-1">Investigation Complete</h3>
        <p className="font-mono text-xs text-slate-500">Report data generated.</p>
      </div>
    );
  }

  // 3. Otherwise, show the default input workspace
  return (
    <div className="w-full animate-[fadeIn_0.5s_ease-in-out] transition-opacity duration-700 ease-in-out opacity-100">
      {/* File Upload Zone */}
      <div 
        className="w-full border-2 border-dashed border-slate-700/50 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-900/30 hover:bg-slate-800/50 transition-colors cursor-pointer"
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
        className="w-full h-40 bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-slate-300 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 resize-none font-mono text-sm placeholder-slate-600"
        placeholder={`Example format:\nFrom: Support <admin@security.com>\nSubject: Urgent Account Review\n\nDear User, your account is locked.\nClick here to verify: https://suspicious-link.com`}
        value={emailText}
        onChange={handleTextChange}
      />
      
      {/* Educational Microcopy */}
      <div className="flex items-start mt-3 space-x-2 text-slate-400 text-xs font-mono">
        <Info className="w-4 h-4 text-cyan-500/70 flex-shrink-0" />
        <p>For maximum accuracy, upload the original .eml or .msg file. Pasted email content will skip header authentication analysis.</p>
      </div>

      {/* The Action Button */}
      <button
        className={`w-full py-4 mt-8 font-mono tracking-widest rounded-xl transition-all duration-300 ${(!emailFile && !emailText.trim()) || isInvestigatingLocal ? 'bg-slate-900/50 border border-slate-800 text-slate-600 cursor-not-allowed' : 'bg-cyan-950/40 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-900/60 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]'}`}
        disabled={(!emailFile && !emailText.trim()) || isInvestigatingLocal}
        onClick={handleInvestigate}
      >
        {isInvestigatingLocal ? 'INVESTIGATING...' : 'BEGIN INVESTIGATION'}
      </button>
    </div>
  );
}
