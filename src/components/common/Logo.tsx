/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const LogoIcon: React.FC<LogoProps> = ({ className = '', size = 48 }) => {
  return (
    <svg
      id="community-hero-logo-icon"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background container wrapper */}
      <circle cx="80" cy="80" r="76" fill="white" fillOpacity="0.95" stroke="#E2E8F0" strokeWidth="1" />
      
      {/* Saffron & Green arch (Tricolor circular arc) */}
      <path
        d="M 28,84 A 56,56 0 0,1 70,24"
        stroke="#FF9933"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 132,84 A 56,56 0 0,0 90,24"
        stroke="#138808"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />

      {/* Indian Ashoka Pillar Emblem Silhouette on top */}
      <g transform="translate(71, 10) scale(0.38)">
        <path
          d="M10,24 L14,24 L14,22 L10,22 Z M15,10 C15,6 20,3 24,3 C28,3 33,6 33,10 C33,14 30,17 24,19 C18,17 15,14 15,10 Z"
          fill="#1E293B"
        />
        <rect x="22" y="19" width="4" height="6" fill="#1E293B" />
        <rect x="18" y="25" width="12" height="3" rx="1" fill="#1E293B" />
      </g>

      {/* Left side houses & community trees silhouettes */}
      <g transform="translate(24, 60)" fill="#94A3B8" opacity="0.65">
        {/* Little House */}
        <path d="M12,4 L24,14 L24,24 L18,24 L18,18 L12,18 L12,24 L0,24 L0,14 Z" />
        {/* Tree */}
        <circle cx="-6" cy="14" r="6" />
        <rect x="-7.5" y="19" width="3" height="6" />
        {/* Human silhouettes */}
        <circle cx="-1" cy="22" r="3.5" />
        <path d="M-6,30 A 5,5 0 0,1 4,30 Z" />
        <circle cx="8" cy="22" r="3.5" />
        <path d="M3,30 A 5,5 0 0,1 13,30 Z" />
      </g>

      {/* Right side parliament/municipal dome silhouette */}
      <g transform="translate(110, 60)" fill="#94A3B8" opacity="0.65">
        {/* Dome */}
        <path d="M0,24 L30,24 L30,16 C30,12 25,8 15,8 C5,8 0,12 0,16 Z" />
        {/* Pillars */}
        <rect x="4" y="17" width="2" height="7" />
        <rect x="9" y="17" width="2" height="7" />
        <rect x="14" y="17" width="2" height="7" />
        <rect x="19" y="17" width="2" height="7" />
        <rect x="24" y="17" width="2" height="7" />
        {/* Flag pole on top */}
        <line x1="15" y1="8" x2="15" y2="1" stroke="#94A3B8" strokeWidth="1.5" />
        <path d="M15,1 L22,3.5 L15,6 Z" fill="#94A3B8" />
      </g>

      {/* Saffron & Green wave swooshes in the middle */}
      <path
        d="M 40,110 C 60,95 72,92 100,105 C 80,114 62,118 40,110"
        fill="#FF9933"
      />
      <path
        d="M 42,111 C 61,100 73,98 102,110 C 82,118 64,121 42,111"
        fill="#138808"
      />

      {/* Ashok Chakra in the middle of waves */}
      <circle cx="70" cy="106" r="6" stroke="#000080" strokeWidth="1.2" fill="white" />
      <circle cx="70" cy="106" r="1.5" fill="#000080" />
      <path d="M70,100 L70,112 M64,106 L76,106 M66,102 L74,110 M66,110 L74,102" stroke="#000080" strokeWidth="0.6" />

      {/* Centered Celebration Human Silhouette with raised arm (Empowerment) */}
      <path
        d="M74,51 C77.8,51 81,47.8 81,44 C81,40.2 77.8,37 74,37 C70.2,37 67,40.2 67,44 C67,47.8 70.2,51 74,51 Z M64.5,58 C62.5,58.8 61,61 61,63.5 L61,72.5 L65.5,72.5 L65.5,91 L73.5,91 L73.5,79 L76.5,79 L76.5,91 L84.5,91 L84.5,69 L88.5,56.5 C89.2,54.2 87.5,52 85,52 C83.5,52 82.2,53 81.5,54.5 L77.5,62.5 L73,62.5 L64.5,58 Z"
        fill="#0F172A"
      />

      {/* Raised arm path (celebration/resolution gesture) */}
      <path
        d="M 77,53 L 95,33 C 97,31 99,32 99,35 C 99,38 97,42 88,49 Z"
        fill="#0F172A"
      />

      {/* Govt Official bubble box inside */}
      <g transform="translate(86, 88)">
        <rect x="0" y="0" width="16" height="13" rx="3" fill="#0F172A" />
        <path d="M5,12 L8,15 L11,12 Z" fill="#0F172A" />
        {/* Small avatar inside */}
        <circle cx="8" cy="4.5" r="2" fill="white" />
        <path d="M4,10 C4,8 6,7.5 8,7.5 C10,7.5 12,8 12,10 Z" fill="white" />
      </g>
    </svg>
  );
};

export const FullLogo: React.FC<{ className?: string; size?: number; iconSize?: number; horizontal?: boolean; isDarkBg?: boolean }> = ({
  className = '',
  size = 48,
  iconSize = 36,
  horizontal = true,
  isDarkBg = false
}) => {
  if (horizontal) {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <LogoIcon size={iconSize} />
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1">
            <span className={`text-sm font-black tracking-wider uppercase leading-none ${isDarkBg ? 'text-white' : 'text-slate-800'}`}>COMMUNITY</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`text-[11px] font-black tracking-widest uppercase leading-none ${isDarkBg ? 'text-indigo-400' : 'text-indigo-600'}`}>HERO</span>
            
            {/* Elegant horizontal accent lines similar to wings */}
            <div className="flex items-center gap-0.5">
              <span className="w-1.5 h-0.5 bg-amber-500 rounded-full inline-block"></span>
              <span className="w-3 h-0.5 bg-indigo-600 rounded-full inline-block"></span>
              <span className="w-1.5 h-0.5 bg-emerald-500 rounded-full inline-block"></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vertical stacked layout for launch screens or large headers
  return (
    <div className={`flex flex-col items-center text-center space-y-3 ${className}`}>
      <LogoIcon size={size} />
      <div className="space-y-1">
        <h1 className={`text-xl font-black tracking-wider uppercase ${isDarkBg ? 'text-white' : 'text-slate-900'}`}>COMMUNITY</h1>
        <div className="flex items-center justify-center gap-2">
          <span className="w-4 h-0.5 bg-amber-500 rounded-full"></span>
          <h2 className={`text-lg font-black tracking-widest uppercase ${isDarkBg ? 'text-indigo-400' : 'text-indigo-600'}`}>HERO</h2>
          <span className="w-4 h-0.5 bg-emerald-500 rounded-full"></span>
        </div>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">AI-Powered Hyperlocal Civic Resolution Portal</p>
      </div>
    </div>
  );
};

export const RenderIssueMedia: React.FC<{ url: string; className?: string }> = ({ url, className = "w-full h-full object-cover" }) => {
  if (!url) return null;
  let mediaUrl = url;
  if (url.startsWith('[')) {
    try {
      const parsed = JSON.parse(url);
      if (Array.isArray(parsed) && parsed.length > 0) {
        mediaUrl = parsed[0];
      }
    } catch (e) {}
  }
  
  const isVideo = mediaUrl.startsWith('data:video') || 
                  mediaUrl.endsWith('.mp4') || 
                  mediaUrl.includes('video/') || 
                  (mediaUrl.startsWith('blob:') && mediaUrl.includes('video'));

  if (isVideo) {
    return <video src={mediaUrl} controls className={className} playsInline />;
  }
  return <img src={mediaUrl} alt="Civic Issue Proof" className={className} referrerPolicy="no-referrer" />;
};

