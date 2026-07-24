import React, { useState } from 'react';
import { UploadCloud, File, Link as LinkIcon, QrCode, Mail } from 'lucide-react';

const Dropzone = () => {
  const [activeTab, setActiveTab] = useState('eml');

  const tabs = [
    { id: 'eml', label: '.EML File', icon: Mail },
    { id: 'pdf', label: 'PDF Document', icon: File },
    { id: 'url', label: 'Suspicious URL', icon: LinkIcon },
    { id: 'qr', label: 'QR Code', icon: QrCode },
  ];

  return (
    <div className="bg-[#151B2C] border border-[#242F47] rounded-xl overflow-hidden shadow-lg">
      <div className="border-b border-[#242F47] px-6 py-4 flex items-center justify-between bg-[#0B0F19]/50">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-blue-500" />
          Artifact Investigation Dropzone
        </h2>
      </div>

      <div className="p-6">
        {/* Interactive Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.3)]'
                    : 'bg-[#0B0F19] text-slate-400 border border-[#242F47] hover:border-blue-500/50 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Drop Area */}
        <div className="relative group cursor-pointer">
          <div className="absolute inset-0 bg-blue-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-12 flex flex-col items-center justify-center transition-colors duration-300 bg-[#0B0F19]/30">
            <div className="w-16 h-16 rounded-full bg-blue-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <UploadCloud className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-slate-200 mb-2 text-center">
              Drag & drop suspicious artifact to initiate instant AI investigation
            </h3>
            <p className="text-sm text-slate-500 mb-6 text-center max-w-md">
              Securely analyze files, links, or text for malware, phishing attempts, and advanced persistent threats.
            </p>
            <button className="bg-[#151B2C] border border-[#242F47] hover:border-blue-500 text-slate-200 px-6 py-2 rounded-md text-sm font-medium transition-colors">
              Browse Local File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dropzone;
