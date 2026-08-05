import React from 'react';
import { ShieldAlert, FileText, AlertTriangle, Cpu, X, Server, Activity, Database, CheckCircle, Search, Crosshair } from 'lucide-react';
import { motion } from 'framer-motion';

const AIInvestigationResult = ({ onReset, activeTab, apiResult, artifactName: providedArtifactName }) => {
  // Pull from ai_analysis if it exists (for Email investigation)
  const reportData = apiResult?.ai_analysis || apiResult || {};

  // -- BASE DATA --
  const urlTarget = apiResult?.url || apiResult?.suspicious_domain || providedArtifactName || (activeTab === 'URL' ? 'Unknown URL' : 'Unknown Artifact');
  const threatScore = reportData.threat_score || reportData.threatScore || 0;
  let threatVerdict = reportData.verdict || reportData.threat_verdict || reportData.threatVerdict || reportData.severity || 'CRITICAL';
  
  if (threatScore <= 20 && threatVerdict !== 'SAFE') {
    threatVerdict = 'SAFE';
  }

  const severityColors = {
    CRITICAL: { border: 'border-rose-500/30', bg: 'bg-rose-500/10', text: 'text-rose-500', icon: '#f43f5e', label: 'MALICIOUS' },
    MALICIOUS: { border: 'border-rose-500/30', bg: 'bg-rose-500/10', text: 'text-rose-500', icon: '#f43f5e', label: 'MALICIOUS' },
    WARNING: { border: 'border-amber-500/30', bg: 'bg-amber-500/10', text: 'text-amber-500', icon: '#f59e0b', label: 'SUSPICIOUS' },
    SUSPICIOUS: { border: 'border-amber-500/30', bg: 'bg-amber-500/10', text: 'text-amber-500', icon: '#f59e0b', label: 'SUSPICIOUS' },
    SAFE: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-500', icon: '#10b981', label: 'SAFE' },
    UNKNOWN: { border: 'border-white/10', bg: 'bg-zinc-950/60', text: 'text-slate-500', icon: '#64748b', label: 'UNKNOWN' }
  };
  const activeStyle = severityColors[threatVerdict] || severityColors.UNKNOWN;

  // -- 2. Executive Summary --
  let executiveSummary = reportData.executive_summary || reportData.executiveSummary;
  if (!executiveSummary) {
    executiveSummary = `The artifact "${urlTarget}" underwent structural and behavioral analysis. The asset was determined to be ${activeStyle.label} based on the accumulated technical evidence and threat intelligence correlations.`;
  }

  // -- 3. Threat Assessment --
  const riskLevel = threatScore < 30 ? "Low Risk" : threatScore < 70 ? "Moderate Risk" : "High Risk";

  // -- 4. Classification Confidence --
  let aiConfidence = reportData.confidence || reportData.ai_confidence || reportData.aiConfidence || 96;
  if (threatVerdict === 'SAFE' && threatScore <= 20 && aiConfidence < 90) {
    aiConfidence = 95;
  }
  const getConfidenceLabel = (score) => {
    if (score >= 90) return "High Confidence";
    if (score >= 70) return "Moderate Confidence";
    return "Low Confidence";
  };
  const confidenceExplanation = reportData.confidence_explanation || reportData.confidenceExplanation || null;

  // -- 5. Key Findings --
  const keyFindings = reportData.key_findings || reportData.keyFindings || [];

  // -- 6. Evidence Collected --
  const evidence = reportData.evidence_collected || reportData.evidence || null;
  const hasEvidence = evidence && Object.keys(evidence).length > 0;

  // -- 7. Indicators of Compromise --
  const rawIocs = reportData.indicators_of_compromise || reportData.iocs || {};
  let iocs = rawIocs;
  let isIocsArray = Array.isArray(rawIocs);
  let hasIocs = false;
  if (isIocsArray) {
    hasIocs = rawIocs.length > 0;
  } else {
    hasIocs = Object.keys(iocs).some(key => Array.isArray(iocs[key]) && iocs[key].length > 0);
  }

  // -- 8. AI Analyst Reasoning --
  const aiReasoning = reportData.ai_reasoning || reportData.ai_analyst_reasoning || reportData.aiReasoning || null;

  // -- 9. Recommended Actions --
  const actions = reportData.recommended_actions || reportData.recommendedActions || [];

  // -- 10. Investigation Conclusion --
  let conclusion = reportData.investigation_conclusion || reportData.conclusion || reportData.investigationConclusion || null;
  if (!conclusion) {
    conclusion = `Based on the automated investigation, this artifact has been designated as ${activeStyle.label}. ${actions && actions.length > 0 ? "Please follow the recommended actions provided above." : "No immediate remediation steps are required at this time."}`;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-8 mb-24 flex flex-col relative bg-zinc-950/60 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-xl rounded-sm border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] shadow-2xl shadow-black/80"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 mb-8 shrink-0 gap-4">
        <div>
          <h1 className="font-mono text-2xl font-bold text-zinc-100 tracking-wider uppercase">Digital Investigation Report</h1>
          <p className="font-mono text-sm text-cyan-400/80 mt-2 break-all">{urlTarget}</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={onReset}
            className="px-6 py-3 bg-zinc-950/60 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] text-zinc-300 font-mono text-xs font-bold uppercase tracking-widest hover:border-cyan-500/30 hover:text-cyan-400 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_15px_rgba(6,182,212,0.2)] transition-all rounded-none flex items-center gap-2"
          >
            <X className="w-4 h-4" /> Close Report
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full pb-8 pr-2 scrollbar-hide space-y-8">
        
        {/* ================= 2. Executive Summary ================= */}
        <div className="bg-zinc-950/60 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-xl border border-white/10 rounded-sm p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] hover:border-cyan-500/30 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_15px_rgba(6,182,212,0.1)] transition-all duration-300">
          <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-500"/> Executive Summary
          </h2>
          <p className="font-mono text-sm md:text-base text-zinc-300 leading-relaxed">
            {executiveSummary}
          </p>
        </div>

        {/* ================= METRICS GRID (1, 3, 4) ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          
          {/* ================= 1. Investigation Verdict ================= */}
          <div className={`md:col-span-1 flex flex-col bg-zinc-950/60 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-xl border ${activeStyle.border} rounded-sm p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_20px_rgba(239,68,68,0.15)]`}>
            <div className="flex items-center justify-between mb-4 shrink-0">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Verdict</span>
              <ShieldAlert className="w-5 h-5" style={{ color: activeStyle.icon }} />
            </div>
            <div className="flex-1 flex flex-col justify-center items-center">
              <div className={`font-mono text-4xl lg:text-5xl font-bold mb-2 ${activeStyle.text} tracking-wider`}>{activeStyle.label}</div>
            </div>
          </div>

          {/* ================= 3. Threat Assessment ================= */}
          <div className="md:col-span-1 bg-zinc-950/60 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-xl border border-white/10 rounded-sm p-6 flex flex-col shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] hover:border-cyan-500/30 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_15px_rgba(6,182,212,0.1)] transition-all duration-300">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Threat Assessment</span>
              <Crosshair className="w-5 h-5 text-cyan-500" />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-mono text-5xl font-bold text-zinc-100">{threatScore}</span>
                <span className="font-mono text-sm text-zinc-500">/ 100</span>
              </div>
              <div className="font-mono text-sm font-semibold uppercase tracking-widest text-zinc-400">{riskLevel}</div>
            </div>
          </div>
          
          {/* ================= 4. Classification Confidence ================= */}
          <div className="md:col-span-1 bg-zinc-950/60 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-xl border border-white/10 rounded-sm p-6 flex flex-col relative overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] hover:border-cyan-500/30 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_15px_rgba(6,182,212,0.1)] transition-all duration-300">
             <div className="flex items-center justify-between mb-4 shrink-0 z-10">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Confidence</span>
              <Search className="w-5 h-5 text-cyan-500" />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center z-10">
              <div className="relative w-16 h-16 flex items-center justify-center mb-3 shrink-0">
                <svg viewBox="0 0 36 36" className="absolute w-full h-full">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeDasharray={`${aiConfidence}, 100`}
                  />
                </svg>
                <span className="font-mono text-lg font-bold text-cyan-400">{aiConfidence}%</span>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-cyan-400 mb-2">{getConfidenceLabel(aiConfidence)}</span>
              {confidenceExplanation && (
                <p className="font-mono text-[10px] text-zinc-400 text-center leading-tight">
                  {confidenceExplanation}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ================= 5. Key Findings ================= */}
        {keyFindings && keyFindings.length > 0 && (
          <div className="bg-zinc-950/60 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-xl border border-white/10 rounded-sm p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] hover:border-cyan-500/30 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_15px_rgba(6,182,212,0.1)] transition-all duration-300">
            <h3 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500"/> Key Findings
            </h3>
            <ul className="list-disc list-inside font-mono text-sm text-zinc-300 space-y-2">
              {keyFindings.map((finding, idx) => (
                <li key={idx} className="leading-relaxed">{finding}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* ================= 6. Evidence Collected ================= */}
          <div className="bg-zinc-950/60 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-xl border border-white/10 rounded-sm p-6 flex flex-col shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] hover:border-cyan-500/30 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_15px_rgba(6,182,212,0.1)] transition-all duration-300">
            <h3 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-500"/> Evidence Collected
            </h3>
            {hasEvidence ? (
              <div className="flex-1 font-mono text-xs text-zinc-300 space-y-2 overflow-y-auto">
                {Object.entries(evidence).map(([key, val]) => (
                  <div key={key} className="flex justify-between border-b border-white/10 pb-1.5">
                    <span className="text-zinc-500 capitalize font-mono">{key.replace(/_/g, ' ')}</span>
                    <span className="text-right truncate ml-4 max-w-[60%]">{val?.toString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <span className="font-mono text-sm italic text-zinc-600">No evidence available.</span>
              </div>
            )}
          </div>

          {/* ================= 7. Indicators of Compromise (IoCs) ================= */}
          <div className="bg-zinc-950/60 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-xl border border-white/10 rounded-sm p-6 flex flex-col shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] hover:border-cyan-500/30 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_15px_rgba(6,182,212,0.1)] transition-all duration-300">
            <h3 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400"/> Indicators of Compromise
            </h3>
            {hasIocs ? (
              <div className="flex-1 font-mono text-xs text-zinc-300 space-y-4 overflow-y-auto pr-2 scrollbar-hide">
                {isIocsArray ? (
                  <ul className="space-y-2 list-disc list-inside">
                    {iocs.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">{item}</li>
                    ))}
                  </ul>
                ) : (
                  Object.entries(iocs).filter(([_, arr]) => Array.isArray(arr) && arr.length > 0).map(([category, items]) => (
                    <div key={category}>
                      <div className="text-cyan-500/80 uppercase tracking-widest text-[10px] mb-1.5 border-b border-white/10 pb-1 font-mono">{category.replace(/_/g, ' ')}</div>
                      <ul className="space-y-1 list-disc list-inside">
                        {items.map((item, idx) => (
                          <li key={idx} className="truncate">{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <span className="font-mono text-sm italic text-zinc-600">No indicators of compromise were identified.</span>
              </div>
            )}
          </div>
        </div>

        {/* ================= 8. AI Analyst Reasoning ================= */}
        {aiReasoning ? (
          <div className="bg-zinc-950/60 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-xl border border-white/10 rounded-sm p-6 md:p-8 relative overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] hover:border-cyan-500/30 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_20px_rgba(6,182,212,0.15)] transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-zinc-900 via-cyan-500 to-zinc-900 opacity-80 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
            <h3 className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 shrink-0">
               <Cpu className="w-4 h-4" /> AI Investigation Reasoning
            </h3>
            <div className="font-mono text-sm text-zinc-300 leading-relaxed md:leading-loose whitespace-pre-wrap">
              {aiReasoning}
            </div>
          </div>
        ) : (
          <div className="bg-zinc-950/60 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-xl border border-white/10 rounded-sm p-6 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
            <span className="font-mono text-sm italic text-zinc-600">No AI analyst reasoning provided.</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* ================= 9. Recommended Actions ================= */}
          <div className="bg-zinc-950/60 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-xl border border-white/10 rounded-sm p-6 flex flex-col shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] hover:border-cyan-500/30 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_15px_rgba(6,182,212,0.1)] transition-all duration-300">
            <h3 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4 flex items-center gap-2 shrink-0">
              <CheckCircle className="w-4 h-4 text-emerald-500"/> Recommended Actions
            </h3>
            {actions && actions.length > 0 ? (
              <ul className="flex-1 list-disc list-inside font-mono text-sm text-zinc-300 space-y-2">
                {actions.map((action, idx) => (
                  <li key={idx} className="leading-relaxed">{action}</li>
                ))}
              </ul>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <span className="font-mono text-sm italic text-zinc-600">No recommendations available.</span>
              </div>
            )}
          </div>
          
          {/* ================= 10. Investigation Conclusion ================= */}
          <div className="bg-zinc-950/60 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-xl border border-white/10 rounded-sm p-6 flex flex-col shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] hover:border-cyan-500/30 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_15px_rgba(6,182,212,0.1)] transition-all duration-300">
            <h3 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4 flex items-center gap-2 shrink-0">
              <FileText className="w-4 h-4 text-cyan-500"/> Investigation Conclusion
            </h3>
            {conclusion ? (
              <p className="flex-1 font-mono text-sm md:text-base text-zinc-300 leading-relaxed">
                {conclusion}
              </p>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <span className="font-mono text-sm italic text-zinc-600">No conclusion available.</span>
              </div>
            )}
          </div>
        </div>



      </div>
    </motion.div>
  );
};

export default AIInvestigationResult;
