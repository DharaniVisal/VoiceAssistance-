import React from 'react';
import { ScreenId, SidebarMode } from '../types';
import { CyberMicIcon } from './CyberMicIcon';

interface HeaderProps {
  title: string;
  subtitle?: string;
  currentScreen?: ScreenId;
  canGoBack?: boolean;
  onGoBack?: () => void;
  onNavigate?: (screen: ScreenId) => void;
  onOpenVoice?: () => void;
  onOpenMobileSidebar: () => void;
  sidebarMode: SidebarMode;
  onToggleSidebarMode: (mode: SidebarMode) => void;
}

const PROFILE_PHOTO_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCoDGynf40Pr9OyaP3finhnrun4nYI0Ge3bxD9tHBsfl8VFXgyGzYAjUZdVTAPCqdRWCiASFJtu-N4_fklsyhEM8efoV4W9rJF0NFdDbMgBZr-ZHjCJx6qUo5jsLTTAxg76WtL83aDof6u9Vm7C_DjZUG8u1Yr7ljBdVebQ38_bkzBHYf5_s4kAh8mBuasrs8OLC2tMB_pcybQQcTT1T_DqTxKAcC7I3-h-XPAaYejKWQYakz_vAOca1g';

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  currentScreen = 'dashboard',
  canGoBack = false,
  onGoBack,
  onNavigate,
  onOpenVoice,
  onOpenMobileSidebar,
  sidebarMode,
  onToggleSidebarMode,
}) => {
  return (
    <header
      id="top-header"
      className="flex justify-between items-center px-4 sm:px-8 w-full sticky top-0 z-30 bg-[#0b1321]/95 backdrop-blur-md border-b border-[#424752] h-16"
    >
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Mobile Hamburger Button */}
        <button
          id="mobile-menu-trigger"
          onClick={onOpenMobileSidebar}
          aria-label="Open navigation menu"
          className="p-2 rounded-lg bg-[#18202e] hover:bg-[#222a39] border border-[#2d3544] text-[#aec6ff] md:hidden cursor-pointer"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        {/* Back Navigation Button */}
        {canGoBack && onGoBack && (
          <button
            id="header-back-button"
            onClick={onGoBack}
            title="Navigate to previous screen"
            className="flex items-center gap-1 p-1.5 px-2.5 rounded-lg bg-[#18202e] hover:bg-[#222a39] border border-[#2d3544] text-[#c3c6d4] hover:text-[#aec6ff] text-[12px] font-semibold transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span className="hidden sm:inline">Back</span>
          </button>
        )}

        {/* Desktop Sidebar Visibility / Mode Switcher */}
        <div className="hidden md:flex items-center bg-[#141c2a] border border-[#2d3544] rounded-lg p-0.5">
          <button
            id="sidebar-mode-expanded-btn"
            onClick={() => onToggleSidebarMode('expanded')}
            title="Expanded Sidebar (Icons + Labels)"
            className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
              sidebarMode === 'expanded'
                ? 'bg-[#aec6ff] text-[#00275e]'
                : 'text-[#8d909e] hover:text-[#dbe2f7]'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">view_sidebar</span>
            <span className="hidden lg:inline">Expanded</span>
          </button>

          <button
            id="sidebar-mode-collapsed-btn"
            onClick={() => onToggleSidebarMode('collapsed')}
            title="Collapsed Sidebar (Icons Only)"
            className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
              sidebarMode === 'collapsed'
                ? 'bg-[#aec6ff] text-[#00275e]'
                : 'text-[#8d909e] hover:text-[#dbe2f7]'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">dock_to_right</span>
            <span className="hidden lg:inline">Icons</span>
          </button>

          <button
            id="sidebar-mode-hidden-btn"
            onClick={() => onToggleSidebarMode(sidebarMode === 'hidden' ? 'expanded' : 'hidden')}
            title={sidebarMode === 'hidden' ? 'Show Sidebar' : 'Hide Sidebar (Full Width)'}
            className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
              sidebarMode === 'hidden'
                ? 'bg-[#aec6ff] text-[#00275e]'
                : 'text-[#8d909e] hover:text-[#dbe2f7]'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">
              {sidebarMode === 'hidden' ? 'visibility_off' : 'visibility'}
            </span>
            <span className="hidden lg:inline">{sidebarMode === 'hidden' ? 'Hidden' : 'Hide'}</span>
          </button>
        </div>

        <div>
          <h2 className="font-headline-md text-[16px] sm:text-[19px] text-[#dbe2f7] font-semibold leading-tight truncate max-w-[180px] sm:max-w-none">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[11px] sm:text-[12px] text-[#c3c6d4] opacity-80 hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Offline Readiness Pill */}
        <button
          onClick={() => onNavigate && onNavigate('architecture')}
          title="Click to inspect offline architecture blueprint"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10b981]/15 hover:bg-[#10b981]/25 border border-[#10b981]/30 text-[11px] sm:text-[12px] text-[#10b981] font-medium transition-colors cursor-pointer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
          <span>100% Offline Ready</span>
        </button>

        {/* Region Tag */}
        <button
          onClick={() => onNavigate && onNavigate('about')}
          title="Click to view Coimbatore transit scope"
          className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18202e] hover:bg-[#222a39] border border-[#2d3544] text-[12px] text-[#aec6ff] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">location_on</span>
          <span>Coimbatore Transit</span>
        </button>

        {onOpenVoice && (
          <button
            id="header-quick-mic"
            onClick={onOpenVoice}
            title="Open Voice Assistant Console"
            className="p-2 rounded-full bg-[#18202e] hover:bg-[#222a39] border border-[#2d3544] text-[#aec6ff] hover:text-[#38bdf8] hover:border-[#38bdf8]/40 transition-all cursor-pointer hover:shadow-[0_0_12px_rgba(56,189,248,0.3)] active:scale-95 flex items-center justify-center"
          >
            <CyberMicIcon size={18} accentColor="#38bdf8" />
          </button>
        )}

        {/* Operator Profile Button */}
        <button
          id="header-profile-btn"
          onClick={() => onNavigate && onNavigate('auth')}
          title="Operator Profile: Alex Mercer (Click to inspect biometrics)"
          className={`w-8 h-8 rounded-full overflow-hidden border transition-all cursor-pointer shrink-0 ${
            currentScreen === 'auth'
              ? 'border-[#aec6ff] ring-2 ring-[#aec6ff]/40 shadow-[0_0_8px_rgba(174,198,255,0.4)]'
              : 'border-[#424752] hover:border-[#aec6ff]'
          }`}
        >
          <img
            src={PROFILE_PHOTO_URL}
            alt="Operator Alex Mercer"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </button>
      </div>
    </header>
  );
};

