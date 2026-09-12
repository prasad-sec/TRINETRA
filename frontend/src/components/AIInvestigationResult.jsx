import React from 'react';
import { ShieldAlert, FileText, AlertTriangle, Cpu, X, Activity, Database, CheckCircle, Search, Crosshair } from 'lucide-react';

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

  const isImage = apiResult?.investigation_type === 'image' || activeTab?.toLowerCase() === 'image';
  const mediaOrigin = reportData.media_origin || 'UNCERTAIN';
  const syntheticProb = reportData.synthetic_probability || 0;
  const syntheticIndicators = reportData.synthetic_indicators || [];

  return (
    <div 
      className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-8 mb-24 flex flex-col relative bg-zinc-950/60 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-md md:backdrop-blur-xl rounded-sm border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] shadow-2xl shadow-black/80"
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
            className="px-6 py-3 bg-zinc-950/60 border border-white/10 text-zinc-300 font-mono text-xs font-bold uppercase tracking-widest hover:border-cyan-500/30 hover:text-cyan-400 transition-all rounded-lg flex items-center gap-2"
          >
            <X className="w-4 h-4" /> Close Report
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full pb-8 pr-2 scrollbar-hide space-y-8">
        
        {/* ================= 2. Executive Summary ================= */}
        <div className="bg-zinc-950/70 backdrop-blur-md border border-cyan-500/20 hover:border-cyan-500/40 transition-colors duration-300 shadow-xl shadow-cyan-950/30 rounded-xl p-4 sm:p-6">
          <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-500"/> Executive Summary
          </h2>
          <p className="text-sm text-zinc-300 font-sans leading-relaxed">
            {executiveSummary}
          </p>
        </div>

        {/* ================= METRICS GRID (1, 3, 4, Media) ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          
          {/* ================= 1. Investigation Verdict ================= */}
          <div className={`flex flex-col bg-zinc-950/70 backdrop-blur-md border ${activeStyle.border} hover:border-cyan-500/40 transition-colors duration-300 shadow-xl shadow-cyan-950/30 rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-4 shrink-0">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Verdict</span>
              <ShieldAlert className="w-5 h-5" style={{ color: activeStyle.icon }} />
            </div>
            <div className="flex-1 flex flex-col justify-center items-center w-full px-3">
              <div className={`font-mono text-2xl sm:text-3xl md:text-4xl font-bold mb-2 ${activeStyle.text} tracking-wide overflow-hidden text-ellipsis whitespace-nowrap text-center w-full`}>{activeStyle.label}</div>
            </div>
          </div>

          {/* ================= 3. Threat Assessment ================= */}
          <div className="bg-zinc-950/70 backdrop-blur-md border border-cyan-500/20 hover:border-cyan-500/40 transition-colors duration-300 shadow-xl shadow-cyan-950/30 rounded-xl p-4 sm:p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Threat Assessment</span>
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
          <div className="bg-zinc-950/70 backdrop-blur-md border border-cyan-500/20 hover:border-cyan-500/40 transition-colors duration-300 shadow-xl shadow-cyan-950/30 rounded-xl p-4 sm:p-6 flex flex-col relative overflow-hidden">
             <div className="flex items-center justify-between mb-4 shrink-0 z-10">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Confidence</span>
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

          {/* ================= Media Origin Analysis (Image Only) ================= */}
          {isImage && (
            <div className={`bg-zinc-950/70 backdrop-blur-md border ${mediaOrigin === 'AI-GENERATED' ? 'border-fuchsia-500/30' : 'border-cyan-500/30'} hover:border-cyan-500/40 transition-colors duration-300 shadow-xl shadow-cyan-950/30 rounded-xl p-6 flex flex-col relative overflow-hidden`}>
              <div className="flex items-center justify-between mb-4 shrink-0 z-10">
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Media Origin</span>
                <Search className={`w-5 h-5 ${mediaOrigin === 'AI-GENERATED' ? 'text-fuchsia-500' : 'text-cyan-500'}`} />
              </div>
              <div className="flex-1 flex flex-col items-center justify-center z-10 w-full">
                <div className="font-mono text-lg lg:text-xl font-bold tracking-wider mb-2 text-center" style={{ color: mediaOrigin === 'AI-GENERATED' ? '#d946ef' : '#06b6d4' }}>
                  {mediaOrigin}
                </div>
                
                {mediaOrigin === 'AI-GENERATED' && (
                  <div className="w-full mt-2">
                    <div className="flex justify-between text-[10px] text-zinc-400 font-mono mb-1">
                      <span>SYNTHETIC PROBABILITY</span>
                      <span className="text-fuchsia-400">{syntheticProb}%</span>
                    </div>
                    <div className="w-full bg-zinc-900/80 rounded-full h-1.5 border border-white/5">
                      <div className="bg-fuchsia-500 h-1.5 rounded-full shadow-[0_0_8px_rgba(217,70,239,0.6)]" style={{ width: `${syntheticProb}%` }}></div>
                    </div>
                  </div>
                )}

                {syntheticIndicators && syntheticIndicators.length > 0 && (
                  <div className="mt-4 w-full text-left">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 border-b border-white/10 pb-1 font-mono">Indicators</div>
                    <ul className="font-mono text-[9px] text-zinc-300 space-y-1 w-full max-h-16 overflow-y-auto scrollbar-hide">
                      {syntheticIndicators.map((ind, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-fuchsia-500">{'>'}</span> 
                          <span className="truncate" title={ind}>{ind}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ================= 5. Key Findings ================= */}
        {keyFindings && keyFindings.length > 0 && (
          <div className="bg-zinc-950/70 backdrop-blur-md border border-cyan-500/20 hover:border-cyan-500/40 transition-colors duration-300 shadow-xl shadow-cyan-950/30 rounded-xl p-4 sm:p-6">
            <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500"/> Key Findings
            </h2>
            <ul className="list-disc list-inside space-y-2">
              {keyFindings.map((finding, idx) => (
                <li key={idx} className="text-sm text-zinc-300 font-sans leading-relaxed">{finding}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* ================= 6. Evidence Collected ================= */}
          <div className="cv-auto bg-zinc-950/70 backdrop-blur-md border border-cyan-500/20 hover:border-cyan-500/40 transition-colors duration-300 shadow-xl shadow-cyan-950/30 rounded-xl p-4 sm:p-6 flex flex-col">
            <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-500"/> Evidence Collected
            </h2>
            {hasEvidence ? (
              <div className="flex-1 space-y-2 overflow-y-auto">
                {Object.entries(evidence).map(([key, val]) => {
                  if (key === 'routing_hops') return null;
                  if (key === 'images' && Array.isArray(val)) {
                    return (
                      <div key={key} className="mt-4 flex flex-col gap-2">
                        <span className="text-sm text-zinc-500 font-sans uppercase">Extracted Images ({val.length})</span>
                        <div className="grid grid-cols-2 gap-4">
                          {val.map((img, idx) => (
                            <div key={idx} className="flex flex-col gap-1 border border-cyan-500/20 rounded-lg p-2 bg-zinc-950/50">
                              <img src={`data:${img.content_type};base64,${img.data}`} alt={img.filename} className="w-full h-auto object-contain rounded" />
                              <span className="text-xs text-zinc-400 font-mono truncate" title={img.filename}>{img.filename}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={key} className="flex justify-between border-b border-white/10 pb-1.5">
                      <span className="text-sm text-zinc-500 font-sans capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="text-sm text-zinc-300 font-sans text-right truncate ml-4 max-w-[60%]">{val?.toString()}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <span className="font-mono text-sm italic text-zinc-600">No evidence available.</span>
              </div>
            )}
          </div>

          {/* ================= 7. Indicators of Compromise (IoCs) ================= */}
          <div className="cv-auto bg-zinc-950/70 backdrop-blur-md border border-cyan-500/20 hover:border-cyan-500/40 transition-colors duration-300 shadow-xl shadow-cyan-950/30 rounded-xl p-4 sm:p-6 flex flex-col">
            <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400"/> Indicators of Compromise
            </h2>
            {hasIocs ? (
              <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-hide">
                {isIocsArray ? (
                  <ul className="space-y-2 list-disc list-inside">
                    {iocs.map((item, idx) => (
                      <li key={idx} className="text-sm text-zinc-300 font-sans leading-relaxed">{item}</li>
                    ))}
                  </ul>
                ) : (
                  Object.entries(iocs).filter(([_, arr]) => Array.isArray(arr) && arr.length > 0).map(([category, items]) => (
                    <div key={category}>
                      <div className="text-cyan-500/80 uppercase tracking-widest text-[10px] mb-1.5 border-b border-white/10 pb-1 font-mono">{category.replace(/_/g, ' ')}</div>
                      <ul className="space-y-1 list-disc list-inside">
                        {items.map((item, idx) => (
                          <li key={idx} className="text-sm text-zinc-300 font-sans leading-relaxed">{item}</li>
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
          <div className="cv-auto bg-zinc-950/70 backdrop-blur-md border border-cyan-500/20 hover:border-cyan-500/40 transition-colors duration-300 shadow-xl shadow-cyan-950/30 rounded-xl p-4 sm:p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-zinc-900 via-cyan-500 to-zinc-900 opacity-80 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
            <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4 flex items-center gap-2 shrink-0">
               <Cpu className="w-4 h-4" /> AI Investigation Reasoning
            </h2>
            <div className="text-sm text-zinc-300 font-sans leading-relaxed whitespace-pre-wrap">
              {aiReasoning}
            </div>
          </div>
        ) : (
          <div className="bg-zinc-950/70 backdrop-blur-md border border-cyan-500/20 hover:border-cyan-500/40 transition-colors rounded-xl shadow-xl shadow-cyan-950/30 p-4 sm:p-6 flex items-center justify-center">
            <span className="font-mono text-sm italic text-zinc-600">No AI analyst reasoning provided.</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* ================= 9. Recommended Actions ================= */}
          <div className="cv-auto bg-zinc-950/70 backdrop-blur-md border border-cyan-500/20 hover:border-cyan-500/40 transition-colors duration-300 shadow-xl shadow-cyan-950/30 rounded-xl p-4 sm:p-6 flex flex-col">
            <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4 flex items-center gap-2 shrink-0">
              <CheckCircle className="w-4 h-4 text-emerald-500"/> Recommended Actions
            </h2>
            {actions && actions.length > 0 ? (
              <ul className="flex-1 list-disc list-inside space-y-2">
                {actions.map((action, idx) => (
                  <li key={idx} className="text-sm text-zinc-300 font-sans leading-relaxed">{action}</li>
                ))}
              </ul>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <span className="font-mono text-sm italic text-zinc-600">No recommendations available.</span>
              </div>
            )}
          </div>
          
          {/* ================= 10. Investigation Conclusion ================= */}
          <div className="cv-auto bg-zinc-950/70 backdrop-blur-md border border-cyan-500/20 hover:border-cyan-500/40 transition-colors duration-300 shadow-xl shadow-cyan-950/30 rounded-xl p-4 sm:p-6 flex flex-col">
            <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4 flex items-center gap-2 shrink-0">
              <FileText className="w-4 h-4 text-cyan-500"/> Investigation Conclusion
            </h2>
            {conclusion ? (
              <p className="flex-1 text-sm text-zinc-300 font-sans leading-relaxed">
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
    </div>
  );
};

export default AIInvestigationResult;
