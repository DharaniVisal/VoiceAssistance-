import React from 'react';
import { ScreenId, SidebarMode } from '../types';
import { AppLogo } from './AppLogo';

interface SidebarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  sidebarMode: SidebarMode;
  onSetSidebarMode: (mode: SidebarMode) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const USER_AVATAR_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCsOiYUSLo1ljKaTNgF_ir5REBPDWSZCe6Uqpa75revkN9eOx475PEz4YuUx1zyypQHl6p8Q41xc6qsGzxxrbGE3BrLBZjRxdI9x62c0nmSSfwbexj0WvInP0pChKPSQch6lXRqzJgXI4q7CUPNW5OmgL46V8XqKJIlxDhVZEDGDJGp2W_oEmaVOFxrSIA4Hsc6QhV5NhtySVoesf9JU80zwAC_Dnl5Qv8d3GQ-cydMFpx-NfMyec5TFg';

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onNavigate,
  sidebarMode,
  onSetSidebarMode,
  isMobileOpen,
  onCloseMobile,
}) => {
  const navItems: { id: ScreenId; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'home' },
    { id: 'voice-assistant', label: 'Voice Assistant', icon: 'mic' },
    { id: 'transport', label: 'Transport & Routes', icon: 'directions_bus' },
    { id: 'navigation', label: 'Map & Navigation', icon: 'explore' },
    { id: 'auth', label: 'Authentication', icon: 'fingerprint' },
    { id: 'security', label: 'Security Center', icon: 'shield' },
    { id: 'security-logs', label: 'Security Logs', icon: 'history' },
    { id: 'architecture', label: 'Architecture', icon: 'account_tree' },
    { id: 'about', label: 'About Project', icon: 'info' },
  ];

  const handleItemClick = (screen: ScreenId) => {
    onNavigate(screen);
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  const isCollapsed = sidebarMode === 'collapsed';
  const isHidden = sidebarMode === 'hidden';

  // Desktop sidebar classes
  const desktopWidthClass = isCollapsed ? 'w-[72px]' : 'w-64';

  return (
    <>
      {/* MOBILE DRAWER BACKDROP & OVERLAY */}
      {isMobileOpen && (
        <div
          id="mobile-sidebar-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* MOBILE DRAWER */}
      <aside
        id="mobile-sidebar-drawer"
        className={`fixed top-0 bottom-0 left-0 w-72 bg-[#0b1321] border-r border-[#424752] z-50 flex flex-col py-6 px-4 md:hidden transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#2d3544]">
          <AppLogo
            variant="full"
            size="md"
            onClick={() => {
              handleItemClick('dashboard');
            }}
          />
          <button
            id="close-mobile-drawer-btn"
            onClick={onCloseMobile}
            className="p-2 rounded-lg text-[#c3c6d4] hover:text-[#dbe2f7] hover:bg-[#18202e] cursor-pointer"
            aria-label="Close navigation menu"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <ul className="flex flex-col gap-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <li key={item.id}>
                <button
                  id={`mobile-nav-${item.id}`}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-[14px] font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'text-[#aec6ff] border-l-2 border-[#aec6ff] bg-[#5d8ef1]/20 font-bold'
                      : 'text-[#c3c6d4] hover:text-[#dbe2f7] hover:bg-[#141c2a]'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[22px]"
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* User Info & Close */}
        <div className="pt-4 border-t border-[#2d3544] mt-auto">
          <div className="flex items-center gap-3 px-2 py-1">
            <img
              src={USER_AVATAR_URL}
              alt="Alex Mercer"
              className="w-8 h-8 rounded-full border border-[#424752]"
              referrerPolicy="no-referrer"
            />
            <div className="overflow-hidden">
              <p className="text-[12px] font-bold text-[#dbe2f7] truncate">Alex Mercer</p>
              <p className="text-[10px] text-[#c3c6d4] truncate">Clearance Level 3</p>
            </div>
          </div>
        </div>
      </aside>

      {/* DESKTOP SIDEBAR */}
      {!isHidden && (
        <aside
          id="desktop-sidebar"
          className={`hidden md:flex flex-col h-screen fixed left-0 top-0 py-6 border-r border-[#424752] bg-[#0b1321] z-40 select-none transition-all duration-200 ${desktopWidthClass}`}
        >
          {/* Brand Header */}
          <div className={`mb-6 ${isCollapsed ? 'px-3 text-center flex justify-center' : 'px-6'}`}>
            <AppLogo
              variant={isCollapsed ? 'icon' : 'full'}
              size={isCollapsed ? 'md' : 'md'}
              onClick={() => onNavigate('dashboard')}
            />
          </div>

          {/* Navigation Items */}
          <ul className={`flex flex-col gap-1 w-full flex-grow overflow-y-auto ${isCollapsed ? 'px-2' : 'px-3'}`}>
            {navItems.map((item) => {
              const isActive = currentScreen === item.id;
              return (
                <li key={item.id} className="relative group">
                  <button
                    id={`nav-item-${item.id}`}
                    onClick={() => handleItemClick(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 rounded-lg text-left text-[13px] font-semibold transition-all cursor-pointer ${
                      isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'
                    } ${
                      isActive
                        ? 'text-[#aec6ff] border-l-2 border-[#aec6ff] bg-[#5d8ef1]/15 font-bold shadow-[0_0_12px_rgba(93,142,241,0.15)]'
                        : 'text-[#c3c6d4] hover:text-[#dbe2f7] hover:bg-[#141c2a]'
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                    >
                      {item.icon}
                    </span>
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </button>

                  {/* Collapsed Tooltip */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded bg-[#18202e] text-[#dbe2f7] text-[12px] font-medium border border-[#424752] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50">
                      {item.label}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Mode controls & Operator profile */}
          <div className="mt-auto pt-3 border-t border-[#424752]/60 px-3 flex flex-col gap-2">
            {/* Collapse/Expand Toggle button */}
            <button
              id="sidebar-collapse-toggle-btn"
              onClick={() => onSetSidebarMode(isCollapsed ? 'expanded' : 'collapsed')}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="flex items-center justify-center p-2 rounded-lg bg-[#141c2a] hover:bg-[#222a39] border border-[#424752] text-[#c3c6d4] hover:text-[#aec6ff] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isCollapsed ? 'chevron_right' : 'chevron_left'}
              </span>
              {!isCollapsed && (
                <span className="ml-2 text-[12px] font-semibold">Collapse Sidebar</span>
              )}
            </button>

            {/* Optional Hide Sidebar for maximum screen area on desktop */}
            {!isCollapsed && (
              <button
                id="sidebar-hide-btn"
                onClick={() => onSetSidebarMode('hidden')}
                title="Hide sidebar completely for full workspace view"
                className="flex items-center justify-center py-1 rounded text-[#8d909e] hover:text-[#aec6ff] text-[11px] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px] mr-1">visibility_off</span>
                <span>Hide Sidebar (Full Width)</span>
              </button>
            )}

            {/* User Profile */}
            <button
              onClick={() => onNavigate('auth')}
              title={isCollapsed ? 'Alex Mercer (Admin Level 3)' : undefined}
              className={`flex items-center gap-3 p-2 rounded-lg hover:bg-[#141c2a] transition-all cursor-pointer text-left ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <img
                src={USER_AVATAR_URL}
                alt="Alex Mercer Avatar"
                className="w-8 h-8 rounded-full object-cover border border-[#424752]"
                referrerPolicy="no-referrer"
              />
              {!isCollapsed && (
                <div className="overflow-hidden">
                  <p className="text-[12px] font-semibold text-[#dbe2f7] leading-tight truncate">
                    Alex Mercer
                  </p>
                  <p className="text-[10px] text-[#c3c6d4] opacity-70 truncate">
                    Clearance L3
                  </p>
                </div>
              )}
            </button>
          </div>
        </aside>
      )}
    </>
  );
};
