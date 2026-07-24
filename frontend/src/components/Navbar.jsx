import React from 'react';
import { Search, Bell, User } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="h-16 bg-[#151B2C] border-b border-[#242F47] flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Global IOC Search */}
      <div className="flex-1 max-w-2xl relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Search IPs, Domains, Hashes, or Incident IDs..."
          className="w-full bg-[#0B0F19] border border-[#242F47] text-slate-100 text-sm rounded-md pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-500"
        />
        <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
          <div className="text-xs text-slate-500 border border-slate-700 rounded px-1.5 py-0.5">⌘K</div>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-6 ml-6">
        {/* Status Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-medium text-emerald-500">AI Core: Operational</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Notification */}
          <button className="relative p-2 text-slate-400 hover:text-slate-100 transition-colors rounded-full hover:bg-white/5">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#151B2C]"></span>
          </button>

          {/* User Avatar */}
          <div className="flex items-center gap-3 pl-4 border-l border-[#242F47]">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-medium text-slate-200">SOC Analyst</span>
              <span className="text-xs text-slate-500">Tier 3</span>
            </div>
            <button className="w-8 h-8 rounded-full bg-blue-900/50 border border-blue-500/30 flex items-center justify-center text-blue-400 hover:bg-blue-800/50 transition-colors">
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
