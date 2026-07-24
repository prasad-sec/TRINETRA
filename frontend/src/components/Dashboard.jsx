import React from 'react';
import { Target, AlertTriangle, ShieldCheck, FileSearch } from 'lucide-react';
import Dropzone from './Dropzone';
import RecentInvestigations from './RecentInvestigations';

const StatCard = ({ title, value, icon: Icon, trend, trendLabel, colorClass }) => (
  <div className="bg-[#151B2C] border border-[#242F47] rounded-xl p-5 shadow-lg flex flex-col relative overflow-hidden">
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-xl ${colorClass}`}></div>
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 rounded-lg bg-[#0B0F19] border border-[#242F47]">
        <Icon className="w-5 h-5 text-slate-300" />
      </div>
      {trend && (
        <span className={`text-xs font-medium px-2 py-1 rounded bg-white/5 border border-white/10 ${trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend}
        </span>
      )}
    </div>
    <h3 className="text-3xl font-bold text-slate-100 mb-1">{value}</h3>
    <div className="flex items-center justify-between mt-auto">
      <p className="text-sm text-slate-400 font-medium">{title}</p>
      {trendLabel && <span className="text-xs text-slate-500">{trendLabel}</span>}
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <main className="flex-1 overflow-y-auto bg-[#0B0F19] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Active Workspace</h1>
          <p className="text-slate-400 mt-1 text-sm">Real-time threat analysis and incident response.</p>
        </div>

        {/* Top Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard 
            title="Total Investigations" 
            value="1,248" 
            icon={FileSearch} 
            trend="+12%" 
            trendLabel="vs last week"
            colorClass="bg-blue-500"
          />
          <StatCard 
            title="Critical Threats" 
            value="42" 
            icon={AlertTriangle} 
            trend="+3" 
            trendLabel="new today"
            colorClass="bg-[#EF4444]"
          />
          <StatCard 
            title="Medium Threats" 
            value="156" 
            icon={Target} 
            colorClass="bg-[#F59E0B]"
          />
          <StatCard 
            title="Safe Artifacts" 
            value="1,050" 
            icon={ShieldCheck} 
            trend="84%" 
            trendLabel="overall safety rate"
            colorClass="bg-[#10B981]"
          />
        </div>

        {/* Main Content Area */}
        <div className="mt-8">
          <Dropzone />
          <RecentInvestigations />
        </div>

      </div>
    </main>
  );
};

export default Dashboard;
