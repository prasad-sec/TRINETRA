import React, { useState } from 'react';
import { ShieldAlert, Crosshair, Fingerprint, FileText, Globe, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const AIInvestigationResult = ({ onReset, activeTab }) => {
  const [showFullReport, setShowFullReport] = useState(false);

  // Mock data tailored slightly to the active tab to feel responsive
  const artifactName = activeTab === 'URL' ? 'login.secure-sbi.net-update.com' : 'Invoice_Payment_Due.pdf';
  const threatType = activeTab === 'URL' ? 'PHISHING CAMPAIGN' : 'MALICIOUS PAYLOAD';

  if (!showFullReport) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 flex flex-col items-center justify-center p-8 w-full max-w-2xl mx-auto"
      >
        <div className="w-full bg-[#030712]/90 border border-[#FF0055]/30 rounded-xl p-8 shadow-[0_0_40px_rgba(255,0,85,0.1)] flex flex-col items-center text-center gap-6">
          
          <div>
            <h2 className="font-sans text-xs font-bold tracking-[0.2em] text-slate-400 uppercase mb-4">Investigation Summary</h2>
            <div className="flex items-center justify-center gap-8 mb-6">
              <div className="flex flex-col items-center">
                <span className="font-mono text-sm text-slate-500 uppercase tracking-widest mb-1">Threat Score</span>
                <span className="font-mono text-5xl font-bold text-[#FF0055] drop-shadow-[0_0_15px_#FF0055]">92<span className="text-xl text-[#FF0055]/50">/100</span></span>
              </div>
              <div className="h-12 w-px bg-white/10"></div>
              <div className="flex flex-col items-center">
                <span className="font-mono text-sm text-slate-500 uppercase tracking-widest mb-1">AI Confidence</span>
                <span className="font-mono text-5xl font-bold text-cyan-400 drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]">96%</span>
              </div>
            </div>
          </div>

          <div className="w-full bg-[#05070A] border border-slate-800 rounded-lg p-5 text-left shadow-[inset_0_0_20px_rgba(0,240,255,0.02)]">
             <h3 className="font-mono text-[10px] text-cyan-500 uppercase tracking-widest mb-2 flex items-center gap-2">
               <AlertTriangle className="w-3 h-3" /> AI Reasoning
             </h3>
             <p className="font-sans text-sm text-slate-300 leading-relaxed">
               This artifact exhibits strong indicators of a credential harvesting attack. The {activeTab === 'URL' ? 'domain was registered within the last 48 hours and attempts to spoof a legitimate financial institution' : 'document contains embedded JavaScript designed to execute a payload upon opening'}. It shares structural similarities with known threat actor infrastructure.
             </p>
          </div>

          <button 
            onClick={() => setShowFullReport(true)}
            className="mt-4 px-8 py-3 bg-[#FF0055]/10 border border-[#FF0055]/50 text-[#FF0055] font-sans font-bold text-xs uppercase tracking-[0.2em] hover:bg-[#FF0055]/20 hover:shadow-[0_0_20px_rgba(255,0,85,0.3)] transition-all rounded"
          >
            Open Investigation Report
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 w-full max-w-5xl mx-auto p-4 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 shrink-0">
        <div>
          <h1 className="font-sans text-xl font-bold text-slate-100 tracking-wide">Investigation Report</h1>
          <p className="font-mono text-xs text-slate-500 mt-1">Artifact: {artifactName}</p>
        </div>
        <button 
          onClick={onReset}
          className="px-4 py-2 border border-slate-700 text-slate-300 font-sans text-xs uppercase tracking-widest hover:bg-white/[0.05] transition-colors rounded"
        >
          ← Initialize New Scan
        </button>
      </div>

      <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8 scrollbar-hide">
        {/* Left Panel: Factual Evidence & IoCs */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white/[0.02] border border-[#FF0055]/30 rounded-xl p-5 shadow-[0_0_15px_rgba(255,0,85,0.05)]">
             <div className="flex items-center justify-between mb-4">
                <span className="font-sans text-xs uppercase tracking-widest text-slate-400">Threat Verdict</span>
                <ShieldAlert className="w-5 h-5 text-[#FF0055]" />
             </div>
             <div className="font-mono text-4xl font-bold text-[#FF0055] mb-1">CRITICAL</div>
             <div className="font-mono text-xs text-slate-400">CATEGORY: {threatType}</div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
             <h3 className="font-sans text-xs uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2"><Fingerprint className="w-4 h-4"/> Indicators of Compromise</h3>
             <ul className="flex flex-col gap-3">
               <li className="flex flex-col gap-1">
                 <span className="font-mono text-[10px] text-slate-500 uppercase">Suspicious Domain</span>
                 <span className="font-mono text-xs text-slate-200">auth-verification-sbi.net</span>
               </li>
               <li className="flex flex-col gap-1">
                 <span className="font-mono text-[10px] text-slate-500 uppercase">IP Address</span>
                 <span className="font-mono text-xs text-slate-200">192.168.105.44</span>
               </li>
               {activeTab !== 'URL' && (
                 <li className="flex flex-col gap-1">
                   <span className="font-mono text-[10px] text-slate-500 uppercase">SHA-256 Hash</span>
                   <span className="font-mono text-xs text-slate-200 break-all">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span>
                 </li>
               )}
             </ul>
          </div>
          
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
             <h3 className="font-sans text-xs uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2"><FileText className="w-4 h-4"/> Recommended Actions</h3>
             <ul className="list-disc list-inside font-sans text-sm text-slate-300 space-y-2">
               <li>Block IP at the perimeter firewall.</li>
               <li>Add domain to DNS sinkhole.</li>
               <li>Initiate password reset for affected users.</li>
             </ul>
          </div>
        </div>

        {/* Right Panel: AI Brain Explanation */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 flex items-center justify-around">
            <div className="text-center">
              <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-2">Threat Score</div>
              <div className="font-mono text-4xl font-bold text-[#FF0055]">92/100</div>
            </div>
            <div className="h-16 w-px bg-white/10"></div>
            <div className="text-center">
              <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-2">AI Confidence</div>
              <div className="font-mono text-4xl font-bold text-cyan-400">96%</div>
            </div>
          </div>

          <div className="flex-1 bg-[#05070A] border border-slate-800 rounded-xl p-6 shadow-[inset_0_0_20px_rgba(0,240,255,0.03)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-20"></div>
            <h3 className="font-mono text-xs text-cyan-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
               <Cpu className="w-4 h-4" /> AI Analyst Reasoning
            </h3>
            
            <div className="font-mono text-sm text-cyan-100/80 leading-loose space-y-4">
              <p>
                [01] Initial artifact analysis reveals an attempt to mimic legitimate infrastructure. Structural analysis of the {activeTab === 'URL' ? 'HTML DOM' : 'document tree'} shows obfuscation techniques commonly associated with the APT-29 threat group.
              </p>
              <p>
                [02] The primary payload delivery mechanism relies on a zero-day exploit targeting the embedded viewer. Network heuristics indicate that upon execution, the artifact attempts to establish a reverse shell connection over port 443 to a known malicious C2 server located in Eastern Europe.
              </p>
              <p>
                [03] SSL certificate analysis on the destination domain shows it is self-signed and was generated exactly 4 hours prior to the investigation request, severely lowering the trust score and confirming the phishing/malware hypothesis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AIInvestigationResult;
