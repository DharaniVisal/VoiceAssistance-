import { useState, useEffect, useCallback } from 'react';
import { ScreenId, SidebarMode } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import  VoiceAssistantPage  from './pages/VoiceAssistantPage';
import { TransportPage } from './pages/TransportPage';
import { NavigationPage } from './pages/NavigationPage';
import { AuthPage } from './pages/AuthPage';
import { SecurityPage } from './pages/SecurityPage';
import { SecurityLogsPage } from './pages/SecurityLogsPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { AboutPage } from './pages/AboutPage';

const VALID_SCREENS: ScreenId[] = [
  'dashboard',
  'voice-assistant',
  'transport',
  'navigation',
  'auth',
  'security',
  'security-logs',
  'architecture',
  'about',
];

export default function App() {
  const getInitialScreen = (): ScreenId => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '') as ScreenId;
      if (VALID_SCREENS.includes(hash)) {
        return hash;
      }
    }
    return 'dashboard';
  };

  const [currentScreen, setCurrentScreen] = useState<ScreenId>(getInitialScreen);
  const [navigationHistory, setNavigationHistory] = useState<ScreenId[]>([getInitialScreen()]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-12');
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('expanded');
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  // Sync state with browser hash (direct route access, browser back/forward, page reload)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as ScreenId;
      if (VALID_SCREENS.includes(hash)) {
        setCurrentScreen(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = useCallback((screen: ScreenId) => {
    setCurrentScreen(screen);
    setNavigationHistory((prev) => (prev[prev.length - 1] === screen ? prev : [...prev, screen]));
    if (typeof window !== 'undefined') {
      window.location.hash = screen;
    }
  }, []);

  const handleBack = useCallback(() => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop(); // Remove current screen
      const previousScreen = newHistory[newHistory.length - 1];
      setNavigationHistory(newHistory);
      setCurrentScreen(previousScreen);
      if (typeof window !== 'undefined') {
        window.location.hash = previousScreen;
      }
    } else {
      handleNavigate('dashboard');
    }
  }, [navigationHistory, handleNavigate]);

  const getScreenTitle = (screen: ScreenId) => {
    switch (screen) {
      case 'dashboard':
        return { title: 'Dashboard', subtitle: 'Coimbatore Offline Transit Assistance' };
      case 'voice-assistant':
        return { title: 'Voice Assistant', subtitle: '7-Stage Audio Pipeline & Intent Engine' };
      case 'transport':
        return { title: 'Transport & Routes', subtitle: 'Coimbatore Bus Network Timetable' };
      case 'navigation':
        return { title: 'Map & Navigation', subtitle: 'Simulated Offline Route Trajectory & Waypoints' };
      case 'auth':
        return { title: 'Authentication', subtitle: 'Operator Biometric Profile & Verification' };
      case 'security':
        return { title: 'Security Center', subtitle: 'Defensive Anti-Spoofing & Replay Mitigation' };
      case 'security-logs':
        return { title: 'Security Logs', subtitle: 'Tamper-Evident Audit Trail & Activity Records' };
      case 'architecture':
        return { title: 'Architecture', subtitle: 'Local Python & On-Device Pipeline Blueprint' };
      case 'about':
        return { title: 'About Project', subtitle: 'System Scope, Specifications & Disclaimers' };
      default:
        return { title: 'TransitVoice', subtitle: 'Coimbatore Transit' };
    }
  };

  const { title, subtitle } = getScreenTitle(currentScreen);

  // Dynamic layout offset for responsive sidebar
  const mainOffsetClass =
    sidebarMode === 'expanded'
      ? 'md:ml-64'
      : sidebarMode === 'collapsed'
      ? 'md:ml-[72px]'
      : 'md:ml-0';

  return (
    <div className="flex min-h-screen bg-[#0b1321] text-[#dbe2f7] antialiased">
      {/* Responsive Sidebar (Requirement 2) */}
      <Sidebar
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        sidebarMode={sidebarMode}
        onSetSidebarMode={setSidebarMode}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area - Automatically expands into available space */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ${mainOffsetClass}`}>
        <Header
          title={title}
          subtitle={subtitle}
          currentScreen={currentScreen}
          canGoBack={currentScreen !== 'dashboard'}
          onGoBack={handleBack}
          onNavigate={handleNavigate}
          onOpenVoice={() => handleNavigate('voice-assistant')}
          onOpenMobileSidebar={() => setIsMobileOpen(true)}
          sidebarMode={sidebarMode}
          onToggleSidebarMode={setSidebarMode}
        />

        <main className="flex-1 px-4 sm:px-8 py-4 max-w-[1360px] mx-auto w-full">
          <div key={currentScreen} className="animate-fadeIn w-full">
            {currentScreen === 'dashboard' && (
              <DashboardPage
                onNavigate={handleNavigate}
                onSetSelectedRoute={(routeId) => setSelectedRouteId(routeId)}
              />
            )}

            {currentScreen === 'voice-assistant' && (
              <VoiceAssistantPage onNavigate={handleNavigate} />
            )}

            {currentScreen === 'transport' && (
              <TransportPage
                onNavigate={handleNavigate}
                onSelectRoute={(routeId) => {
                  setSelectedRouteId(routeId);
                }}
              />
            )}

            {currentScreen === 'navigation' && (
              <NavigationPage
                onNavigate={handleNavigate}
                selectedRouteId={selectedRouteId}
              />
            )}

            {currentScreen === 'auth' && (
              <AuthPage onNavigate={handleNavigate} />
            )}

            {currentScreen === 'security' && (
              <SecurityPage onNavigate={handleNavigate} />
            )}

            {currentScreen === 'security-logs' && (
              <SecurityLogsPage onNavigate={handleNavigate} />
            )}

            {currentScreen === 'architecture' && (
              <ArchitecturePage onNavigate={handleNavigate} />
            )}

            {currentScreen === 'about' && (
              <AboutPage onNavigate={handleNavigate} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

