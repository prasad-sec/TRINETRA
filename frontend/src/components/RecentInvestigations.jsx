import React from 'react';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

const RecentInvestigations = () => {
  const investigations = [
    {
      id: 'INC-2023-8942',
      artifact: 'invoice_urgent.eml',
      type: 'Email',
      score: 94,
      verdict: 'Critical',
      timestamp: '2 mins ago',
    },
    {
      id: 'INC-2023-8941',
      artifact: 'update-service-bin.exe',
      type: 'Binary',
      score: 78,
      verdict: 'Warning',
      timestamp: '15 mins ago',
    },
    {
      id: 'INC-2023-8940',
      artifact: 'https://login-secure-auth.net',
      type: 'URL',
      score: 98,
      verdict: 'Critical',
      timestamp: '42 mins ago',
    },
    {
      id: 'INC-2023-8939',
      artifact: 'Q3_Financial_Report.pdf',
      type: 'Document',
      score: 12,
      verdict: 'Safe',
      timestamp: '1 hr ago',
    },
  ];

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20';
    if (score >= 40) return 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20';
    return 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20';
  };

  const getVerdictIcon = (verdict) => {
    if (verdict === 'Critical') return <ShieldAlert className="w-4 h-4 text-[#EF4444]" />;
    if (verdict === 'Warning') return <Shield className="w-4 h-4 text-[#F59E0B]" />;
    return <ShieldCheck className="w-4 h-4 text-[#10B981]" />;
  };

  return (
    <div className="bg-[#151B2C] border border-[#242F47] rounded-xl overflow-hidden shadow-lg mt-6">
      <div className="border-b border-[#242F47] px-6 py-4 flex items-center justify-between bg-[#0B0F19]/50">
        <h2 className="text-lg font-semibold text-slate-100">Recent Investigations</h2>
        <button className="text-sm text-blue-500 hover:text-blue-400 font-medium">View All</button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0B0F19]/30 border-b border-[#242F47] text-xs uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4 font-medium">Incident ID</th>
              <th className="px-6 py-4 font-medium">Artifact Name</th>
              <th className="px-6 py-4 font-medium">Threat Score</th>
              <th className="px-6 py-4 font-medium">AI Verdict</th>
              <th className="px-6 py-4 font-medium">Timestamp</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#242F47]">
            {investigations.map((inv, idx) => (
              <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-slate-300 font-mono">{inv.id}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-200">{inv.artifact}</span>
                    <span className="text-xs text-slate-500">{inv.type}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded border text-xs font-bold ${getScoreColor(inv.score)}`}>
                    {inv.score}/100
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getVerdictIcon(inv.verdict)}
                    <span className="text-sm text-slate-300">{inv.verdict}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                  {inv.timestamp}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button className="text-sm text-blue-500 hover:text-blue-400 hover:underline font-medium transition-all">
                    View Report
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentInvestigations;
