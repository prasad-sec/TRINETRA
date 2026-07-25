import React, { useState } from 'react';
import { ShieldAlert, Crosshair, Fingerprint, FileText, Globe, AlertTriangle, Cpu, X } from 'lucide-react';
import { motion } from 'framer-motion';

const AIInvestigationResult = ({ onReset, activeTab, apiResult, artifactName: providedArtifactName }) => {
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Live API data or mock fallback
  const artifactName = providedArtifactName || (activeTab === 'URL' ? 'login.secure-sbi.net-update.com' : 'Invoice_Payment_Due.pdf');
  const threatScore = apiResult?.threat_score ?? 92;
  const severity = apiResult?.severity ?? (activeTab === 'URL' ? 'CRITICAL' : 'CRITICAL');
  const aiConfidence = apiResult?.ai_confidence ?? 96;
  const aiReasoning = apiResult?.ai_reasoning ?? 
    `This artifact exhibits strong indicators of a credential harvesting attack. The ${activeTab === 'URL' ? 'domain was registered within the last 48 hours and attempts to spoof a legitimate financial institution' : 'document contains embedded JavaScript designed to execute a payload upon opening'}. It shares structural similarities with known threat actor infrastructure.`;
  
  const iocs = apiResult?.iocs ?? {
    domains: ["auth-verification-sbi.net"],
    ips: ["192.168.105.44"],
    query_params: []
  };

  const threatType = apiResult?.threat_category || (activeTab === 'URL' ? 'PHISHING CAMPAIGN' : 'MALICIOUS PAYLOAD');
  
  const severityColor = severity === 'CRITICAL' ? '#FF0055' : severity === 'WARNING' ? '#F59E0B' : '#10B981';

  const severityStyles = {
    CRITICAL: {
      border: 'border-red-500/50',
      text: 'text-red-500',
      shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.5)]',
      icon: '#EF4444'
    },
    WARNING: {
      border: 'border-orange-500/50',
      text: 'text-orange-500',
      shadow: 'shadow-[0_0_15px_rgba(249,115,22,0.3)]',
      icon: '#F97316'
    },
    SAFE: {
      border: 'border-emerald-500/50',
      text: 'text-emerald-500',
      shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      icon: '#10B981'
    }
  };
  const activeSeverityStyle = severityStyles[severity] || severityStyles.CRITICAL;

  if (!isReportOpen) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 flex flex-col items-center justify-center p-8 w-full max-w-2xl mx-auto"
      >
        <div className="w-full bg-[#030712]/90 border border-[#FF0055]/30 rounded-xl p-8 shadow-[0_0_40px_rgba(255,0,85,0.1)] flex flex-col items-center text-center gap-6" style={{ borderColor: `${severityColor}40` }}>
          
          <div>
            <h2 className="font-sans text-xs font-bold tracking-[0.2em] text-slate-400 uppercase mb-4">Investigation Summary</h2>
            <div className="flex items-center justify-center gap-8 mb-6">
              <div className="flex flex-col items-center">
                <span className="font-mono text-sm text-slate-500 uppercase tracking-widest mb-1">Threat Score</span>
                <span className="font-mono text-5xl font-bold" style={{ color: severityColor, textShadow: `0 0 15px ${severityColor}` }}>{threatScore}<span className="text-xl opacity-50">/100</span></span>
              </div>
              <div className="h-12 w-px bg-white/10"></div>
              <div className="flex flex-col items-center">
                <span className="font-mono text-sm text-slate-500 uppercase tracking-widest mb-1">AI Confidence</span>
                <span className="font-mono text-5xl font-bold text-cyan-400 drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]">{aiConfidence}%</span>
              </div>
            </div>
          </div>

          <div className="w-full bg-[#05070A] border border-slate-800 rounded-lg p-5 text-left shadow-[inset_0_0_20px_rgba(0,240,255,0.02)]">
             <h3 className="font-mono text-[10px] text-cyan-500 uppercase tracking-widest mb-2 flex items-center gap-2">
               <AlertTriangle className="w-3 h-3" /> AI Reasoning
             </h3>
             <p className="font-sans text-sm text-slate-300 leading-relaxed">
               {aiReasoning}
             </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
            <button 
              onClick={() => setIsReportOpen(true)}
              className="px-8 py-3 bg-[#FF0055]/10 border border-[#FF0055]/50 text-[#FF0055] font-sans font-bold text-xs uppercase tracking-[0.2em] hover:bg-[#FF0055]/20 hover:shadow-[0_0_20px_rgba(255,0,85,0.3)] transition-all rounded"
              style={{ color: severityColor, borderColor: `${severityColor}80`, backgroundColor: `${severityColor}15` }}
            >
              Open Investigation Report
            </button>
            <button 
              onClick={onReset}
              className="px-8 py-3 border border-slate-700 text-slate-400 font-sans font-bold text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-colors rounded"
            >
              ← Initialize New Scan
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 w-full max-w-5xl mx-auto p-4 flex flex-col relative"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 shrink-0">
        <div>
          <h1 className="font-sans text-xl font-bold text-slate-100 tracking-wide">Investigation Report</h1>
          <p className="font-mono text-xs text-slate-500 mt-1">Artifact: {artifactName}</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsReportOpen(false)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 font-sans text-xs uppercase tracking-widest hover:bg-slate-700 transition-colors rounded flex items-center gap-2"
          >
            <X className="w-4 h-4" /> Close Report
          </button>
          <button 
            onClick={onReset}
            className="px-4 py-2 border border-slate-700 text-slate-300 font-sans text-xs uppercase tracking-widest hover:bg-white/[0.05] transition-colors rounded"
          >
            ← Initialize New Scan
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8 scrollbar-hide">
        {/* Left Panel: Factual Evidence & IoCs */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className={`bg-white/[0.02] border ${activeSeverityStyle.border} rounded-xl p-5 ${activeSeverityStyle.shadow}`}>
             <div className="flex items-center justify-between mb-4">
                <span className="font-sans text-xs uppercase tracking-widest text-slate-400">Threat Verdict</span>
                <ShieldAlert className="w-5 h-5" style={{ color: activeSeverityStyle.icon }} />
             </div>
             <div className={`font-mono text-4xl font-bold mb-1 ${activeSeverityStyle.text}`}>{severity}</div>
             <div className="font-mono text-xs text-slate-400 uppercase">CATEGORY: {threatType}</div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
             <h3 className="font-sans text-xs uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2"><Fingerprint className="w-4 h-4"/> Indicators of Compromise</h3>
             <ul className="flex flex-col gap-3">
               {(iocs.domains || []).map((domain, idx) => (
                 <li key={`domain-${idx}`} className="flex flex-col gap-1">
                   <span className="font-mono text-[10px] text-slate-500 uppercase">Suspicious Domain</span>
                   <span className="font-mono text-xs text-slate-200">{domain}</span>
                 </li>
               ))}
               {(iocs.ips || []).map((ip, idx) => (
                 <li key={`ip-${idx}`} className="flex flex-col gap-1">
                   <span className="font-mono text-[10px] text-slate-500 uppercase">IP Address</span>
                   <span className="font-mono text-xs text-slate-200">{ip}</span>
                 </li>
               ))}
               {(iocs.query_params || []).map((qp, idx) => (
                 <li key={`qp-${idx}`} className="flex flex-col gap-1">
                   <span className="font-mono text-[10px] text-slate-500 uppercase">Query Parameter</span>
                   <span className="font-mono text-xs text-slate-200 break-all">{qp}</span>
                 </li>
               ))}
               {activeTab !== 'URL' && (!iocs.domains || iocs.domains.length === 0) && (!iocs.ips || iocs.ips.length === 0) && (
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
               {(apiResult?.recommended_actions || [
                 "Monitor for unusual activity.",
                 "Ensure endpoint protection is updated."
               ]).map((action, idx) => (
                 <li key={idx}>{action}</li>
               ))}
             </ul>
          </div>
        </div>

        {/* Right Panel: AI Brain Explanation */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 flex items-center justify-around">
            <div className="text-center">
              <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-2">Threat Score</div>
              <div className="font-mono text-4xl font-bold" style={{ color: severityColor }}>{threatScore}/100</div>
            </div>
            <div className="h-16 w-px bg-white/10"></div>
            <div className="text-center">
              <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-2">AI Confidence</div>
              <div className="font-mono text-4xl font-bold text-cyan-400">{aiConfidence}%</div>
            </div>
          </div>

          <div className="flex-1 bg-[#05070A] border border-slate-800 rounded-xl p-6 shadow-[inset_0_0_20px_rgba(0,240,255,0.03)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-20"></div>
            <h3 className="font-mono text-xs text-cyan-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
               <Cpu className="w-4 h-4" /> AI Analyst Reasoning
            </h3>
            
            <div className="font-mono text-sm text-cyan-100/80 leading-loose space-y-4 whitespace-pre-wrap">
              {aiReasoning}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AIInvestigationResult;
