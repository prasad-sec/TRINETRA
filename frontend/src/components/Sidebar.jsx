import React from 'react';
import { LayoutDashboard, ShieldAlert, FileText, Database, Settings, Activity } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, active: true },
    { name: 'Investigations', icon: ShieldAlert, active: false },
    { name: 'Threat Reports', icon: FileText, active: false },
    { name: 'Threat Intelligence', icon: Database, active: false },
    { name: 'Settings', icon: Settings, active: false },
  ];

  return (
    <aside className="w-64 h-screen bg-[#151B2C] border-r border-[#242F47] flex flex-col">
      {/* Header */}
      <div className="h-16 flex items-center px-6 border-b border-[#242F47]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-[0_0_10px_rgba(37,99,235,0.5)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <span className="text-slate-100 font-bold tracking-wider uppercase text-lg">TRINETRA Core</span>
        </div>
      </div>

      {/* Main CTA */}
      <div className="p-4">
        <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-md flex items-center justify-center gap-2 transition-colors duration-200 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
          <span className="text-xl leading-none">+</span>
          New Investigation
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-4 py-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors duration-200 text-sm font-medium ${
                item.active 
                  ? 'bg-blue-600/10 text-blue-500 border border-blue-600/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-4 border-t border-[#242F47]">
        <div className="flex items-center gap-2 px-3 py-2 bg-[#0B0F19] rounded-md border border-[#242F47]">
          <Activity className="w-4 h-4 text-emerald-500" />
          <span className="text-xs text-slate-400 font-medium">Local AI Engine:</span>
          <span className="text-xs text-emerald-500 font-semibold ml-auto">Online</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
