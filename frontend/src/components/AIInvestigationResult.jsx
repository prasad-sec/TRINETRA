import React from 'react';
import { ShieldAlert, FileText, AlertTriangle, Cpu, X, Server, Activity, Database, CheckCircle, Search, Crosshair } from 'lucide-react';
import { motion } from 'framer-motion';

const AIInvestigationResult = ({ onReset, activeTab, apiResult, artifactName: providedArtifactName }) => {
  const reportData = apiResult || {};

  // -- BASE DATA --
  const urlTarget = reportData.url || reportData.suspicious_domain || providedArtifactName || (activeTab === 'URL' ? 'Unknown URL' : 'Unknown Artifact');
  const threatScore = reportData.threat_score || reportData.threatScore || 0;
  let threatVerdict = reportData.threat_verdict || reportData.threatVerdict || reportData.severity || 'CRITICAL';
  
  if (threatScore <= 20 && threatVerdict !== 'SAFE') {
    threatVerdict = 'SAFE';
  }

  const severityColors = {
    CRITICAL: { border: 'border-rose-500/50', bg: 'bg-rose-500/10', text: 'text-rose-500', icon: '#f43f5e', label: 'MALICIOUS' },
    MALICIOUS: { border: 'border-rose-500/50', bg: 'bg-rose-500/10', text: 'text-rose-500', icon: '#f43f5e', label: 'MALICIOUS' },
    WARNING: { border: 'border-amber-500/50', bg: 'bg-amber-500/10', text: 'text-amber-500', icon: '#f59e0b', label: 'SUSPICIOUS' },
    SUSPICIOUS: { border: 'border-amber-500/50', bg: 'bg-amber-500/10', text: 'text-amber-500', icon: '#f59e0b', label: 'SUSPICIOUS' },
    SAFE: { border: 'border-emerald-500/50', bg: 'bg-emerald-500/10', text: 'text-emerald-500', icon: '#10b981', label: 'SAFE' },
    UNKNOWN: { border: 'border-slate-500/50', bg: 'bg-slate-500/10', text: 'text-slate-500', icon: '#64748b', label: 'UNKNOWN' }
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
  let aiConfidence = reportData.ai_confidence || reportData.aiConfidence || 96;
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
  const iocs = reportData.indicators_of_compromise || reportData.iocs || {};
  const hasIocs = Object.keys(iocs).some(key => Array.isArray(iocs[key]) && iocs[key].length > 0);

  // -- 8. AI Analyst Reasoning --
  const aiReasoning = reportData.ai_analyst_reasoning || reportData.ai_reasoning || reportData.aiReasoning || null;

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
      className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-8 mb-24 flex flex-col relative bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-800 pb-6 mb-8 shrink-0 gap-4">
        <div>
          <h1 className="font-sans text-2xl font-bold text-slate-100 tracking-wide uppercase">Digital Investigation Report</h1>
          <p className="font-mono text-sm text-slate-400 mt-2 break-all">{urlTarget}</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={onReset}
            className="px-6 py-3 bg-slate-800/50 border border-slate-700 text-slate-300 font-sans text-xs font-bold uppercase tracking-widest hover:bg-slate-700/50 transition-colors rounded-lg flex items-center gap-2"
          >
            <X className="w-4 h-4" /> Close Report
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full pb-8 pr-2 scrollbar-hide space-y-8">
        
        {/* ================= 2. Executive Summary ================= */}
        <div className="bg-slate-800/20 border border-slate-800/50 rounded-xl p-6">
          <h2 className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-500"/> Executive Summary
          </h2>
          <p className="font-sans text-sm md:text-base text-slate-300 leading-relaxed">
            {executiveSummary}
          </p>
        </div>

        {/* ================= METRICS GRID (1, 3, 4) ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          
          {/* ================= 1. Investigation Verdict ================= */}
          <div className={`md:col-span-1 flex flex-col border ${activeStyle.border} ${activeStyle.bg} rounded-xl p-6 transition-all hover:bg-opacity-20`}>
            <div className="flex items-center justify-between mb-4 shrink-0">
              <span className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Verdict</span>
              <ShieldAlert className="w-5 h-5" style={{ color: activeStyle.icon }} />
            </div>
            <div className="flex-1 flex flex-col justify-center items-center">
              <div className={`font-sans text-4xl lg:text-5xl font-bold mb-2 ${activeStyle.text} tracking-tight`}>{activeStyle.label}</div>
            </div>
          </div>

          {/* ================= 3. Threat Assessment ================= */}
          <div className="md:col-span-1 bg-slate-800/20 border border-slate-800/50 rounded-xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <span className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Threat Assessment</span>
              <Crosshair className="w-5 h-5 text-slate-500" />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-mono text-5xl font-bold text-slate-200">{threatScore}</span>
                <span className="font-mono text-sm text-slate-500">/ 100</span>
              </div>
              <div className="font-sans text-sm font-semibold uppercase tracking-widest text-slate-400">{riskLevel}</div>
            </div>
          </div>
          
          {/* ================= 4. Classification Confidence ================= */}
          <div className="md:col-span-1 bg-slate-800/20 border border-slate-800/50 rounded-xl p-6 flex flex-col relative overflow-hidden">
             <div className="flex items-center justify-between mb-4 shrink-0 z-10">
              <span className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Confidence</span>
              <Search className="w-5 h-5 text-slate-500" />
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
                <span className="font-mono text-lg font-bold text-blue-400">{aiConfidence}%</span>
              </div>
              <span className="font-sans text-[10px] uppercase tracking-widest text-blue-400 mb-2">{getConfidenceLabel(aiConfidence)}</span>
              {confidenceExplanation && (
                <p className="text-[10px] text-slate-500 text-center leading-tight">
                  {confidenceExplanation}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ================= 5. Key Findings ================= */}
        {keyFindings && keyFindings.length > 0 && (
          <div className="bg-slate-800/20 border border-slate-800/50 rounded-xl p-6">
            <h3 className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500"/> Key Findings
            </h3>
            <ul className="list-disc list-inside font-sans text-sm text-slate-300 space-y-2">
              {keyFindings.map((finding, idx) => (
                <li key={idx} className="leading-relaxed">{finding}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* ================= 6. Evidence Collected ================= */}
          <div className="bg-slate-800/20 border border-slate-800/50 rounded-xl p-6 flex flex-col">
            <h3 className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-400"/> Evidence Collected
            </h3>
            {hasEvidence ? (
              <div className="flex-1 font-mono text-xs text-slate-300 space-y-2 overflow-y-auto">
                {Object.entries(evidence).map(([key, val]) => (
                  <div key={key} className="flex justify-between border-b border-slate-800/50 pb-1">
                    <span className="text-slate-500 capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="text-right truncate ml-4 max-w-[60%]">{val?.toString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <span className="font-sans text-sm italic text-slate-600">No evidence available.</span>
              </div>
            )}
          </div>

          {/* ================= 7. Indicators of Compromise (IoCs) ================= */}
          <div className="bg-slate-800/20 border border-slate-800/50 rounded-xl p-6 flex flex-col">
            <h3 className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400"/> Indicators of Compromise
            </h3>
            {hasIocs ? (
              <div className="flex-1 font-mono text-xs text-slate-300 space-y-4 overflow-y-auto pr-2 scrollbar-hide">
                {Object.entries(iocs).filter(([_, arr]) => Array.isArray(arr) && arr.length > 0).map(([category, items]) => (
                  <div key={category}>
                    <div className="text-slate-500 uppercase tracking-widest text-[10px] mb-1 border-b border-slate-800 pb-1">{category.replace(/_/g, ' ')}</div>
                    <ul className="space-y-1">
                      {items.map((item, idx) => (
                        <li key={idx} className="truncate">{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <span className="font-sans text-sm italic text-slate-600">No indicators of compromise were identified.</span>
              </div>
            )}
          </div>
        </div>

        {/* ================= 8. AI Analyst Reasoning ================= */}
        {aiReasoning ? (
          <div className="bg-[#05070A] border border-blue-900/30 rounded-xl p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-900 via-blue-500 to-blue-900 opacity-20"></div>
            <h3 className="font-sans text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 shrink-0">
               <Cpu className="w-4 h-4" /> AI Investigation Reasoning
            </h3>
            <div className="font-mono text-sm text-blue-100/70 leading-relaxed md:leading-loose whitespace-pre-wrap">
              {aiReasoning}
            </div>
          </div>
        ) : (
          <div className="bg-slate-800/20 border border-slate-800/50 rounded-xl p-6 flex items-center justify-center">
            <span className="font-sans text-sm italic text-slate-600">No AI analyst reasoning provided.</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* ================= 9. Recommended Actions ================= */}
          <div className="bg-slate-800/20 border border-slate-800/50 rounded-xl p-6 flex flex-col">
            <h3 className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2 shrink-0">
              <CheckCircle className="w-4 h-4 text-emerald-500"/> Recommended Actions
            </h3>
            {actions && actions.length > 0 ? (
              <ul className="flex-1 list-disc list-inside font-sans text-sm text-slate-300 space-y-2">
                {actions.map((action, idx) => (
                  <li key={idx} className="leading-relaxed">{action}</li>
                ))}
              </ul>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <span className="font-sans text-sm italic text-slate-600">No recommendations available.</span>
              </div>
            )}
          </div>
          
          {/* ================= 10. Investigation Conclusion ================= */}
          <div className="bg-slate-800/20 border border-slate-800/50 rounded-xl p-6 flex flex-col">
            <h3 className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2 shrink-0">
              <FileText className="w-4 h-4 text-slate-400"/> Investigation Conclusion
            </h3>
            {conclusion ? (
              <p className="flex-1 font-sans text-sm md:text-base text-slate-300 leading-relaxed">
                {conclusion}
              </p>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <span className="font-sans text-sm italic text-slate-600">No conclusion available.</span>
              </div>
            )}
          </div>
        </div>



      </div>
    </motion.div>
  );
};

export default AIInvestigationResult;
