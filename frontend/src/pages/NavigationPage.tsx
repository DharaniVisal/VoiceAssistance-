import React, { useState, useMemo, useEffect } from 'react';
import { ScreenId, TravelMode } from '../types';
import { COIMBATORE_BUS_ROUTES, COIMBATORE_STOPS } from '../data/coimbatoreData';
import { navigationService } from '../services/navigationService';

interface NavigationPageProps {
  onNavigate: (screen: ScreenId) => void;
  selectedRouteId?: string;
}

export const NavigationPage: React.FC<NavigationPageProps> = ({ onNavigate, selectedRouteId }) => {
  const [activeRouteId, setActiveRouteId] = useState<string>(selectedRouteId || 'route-12');
  const [travelMode, setTravelMode] = useState<TravelMode>('bus');
  const [activeWaypointIndex, setActiveWaypointIndex] = useState<number>(1);

  // Map view controls (Zoom & Pan)
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreenMap, setIsFullscreenMap] = useState<boolean>(false);

  // Layer toggles
  const [showLandmarks, setShowLandmarks] = useState<boolean>(true);
  const [showWaterAndParks, setShowWaterAndParks] = useState<boolean>(true);
  const [showRoadGrid, setShowRoadGrid] = useState<boolean>(true);

  // Synchronize route when navigated from Transport timetable
  useEffect(() => {
    if (selectedRouteId) {
      setActiveRouteId(selectedRouteId);
      setActiveWaypointIndex(1);
    }
  }, [selectedRouteId]);

  // Find active route
  const currentRoute = useMemo(() => {
    return COIMBATORE_BUS_ROUTES.find((r) => r.id === activeRouteId) || COIMBATORE_BUS_ROUTES[0];
  }, [activeRouteId]);

  // Calculate ETA and distance based on selected mode
  const { etaMinutes, distanceKm, speedKmh } = useMemo(() => {
    return navigationService.calculateETA(currentRoute.origin, currentRoute.destination, travelMode);
  }, [currentRoute, travelMode]);

  // Compute arrival clock time
  const estimatedArrivalTime = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + etaMinutes);
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [etaMinutes]);

  // Additional mode stats
  const modeStats = useMemo(() => {
    switch (travelMode) {
      case 'bus':
        return { label: 'Transit Corridor', fare: currentRoute.fare, ecoScore: 'High Efficiency', detail: `${currentRoute.frequencyMinutes}m frequency` };
      case 'car':
        return { label: 'Arterial Driving', fare: `~₹${Math.round(distanceKm * 10)} fuel`, ecoScore: 'Standard', detail: 'Direct highway route' };
      case 'bike':
        return { label: 'Two-Wheeler Agile', fare: `~₹${Math.round(distanceKm * 4)} fuel`, ecoScore: 'Efficient', detail: 'Avoids heavy congestion' };
      case 'walk':
        return { label: 'Pedestrian Sidewalks', fare: 'Free (₹0)', ecoScore: 'Zero Carbon', detail: `~${Math.round(distanceKm * 65)} kcal burned` };
    }
  }, [travelMode, currentRoute, distanceKm]);

  // Map stops for the current route to coordinates
  const routeWaypoints = useMemo(() => {
    return currentRoute.stops.map((stopName, idx) => {
      const foundStop = COIMBATORE_STOPS.find(
        (s) =>
          s.name.toLowerCase().includes(stopName.toLowerCase()) ||
          stopName.toLowerCase().includes(s.name.toLowerCase())
      );
      if (foundStop) {
        return {
          name: stopName,
          x: foundStop.coordinates.x,
          y: foundStop.coordinates.y,
          index: idx,
          landmark: foundStop.landmark,
        };
      }
      // Accurate fallback interpolation along Coimbatore east-west / north-south axis
      const startX = 380;
      const startY = 350;
      const endX = 620;
      const endY = 260;
      const ratio = idx / Math.max(1, currentRoute.stops.length - 1);
      return {
        name: stopName,
        x: Math.round(startX + (endX - startX) * ratio),
        y: Math.round(startY + (endY - startY) * ratio + (idx % 2 === 0 ? 15 : -15)),
        index: idx,
        landmark: 'Corridor Transit Node',
      };
    });
  }, [currentRoute]);

  // SVG path for active route
  const svgPathData = useMemo(() => {
    if (routeWaypoints.length < 2) return '';
    return routeWaypoints.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  }, [routeWaypoints]);

  // Map zoom and pan helpers
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(2.0, +(prev + 0.25).toFixed(2)));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(0.8, +(prev - 0.25).toFixed(2)));
  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };
  const handlePan = (dx: number, dy: number) => {
    setPanOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  // Base viewBox calculations with zoom and pan
  const baseBox = { minX: 120, minY: 90, width: 620, height: 530 };
  const currentViewBox = useMemo(() => {
    const scale = 1 / zoomLevel;
    const w = baseBox.width * scale;
    const h = baseBox.height * scale;
    // Center scaling around middle (430, 355)
    const centerX = 430 + panOffset.x;
    const centerY = 355 + panOffset.y;
    const x = centerX - w / 2;
    const y = centerY - h / 2;
    return `${x} ${y} ${w} ${h}`;
  }, [zoomLevel, panOffset]);

  const originPoint = routeWaypoints[0];
  const destPoint = routeWaypoints[routeWaypoints.length - 1];
  const activePoint = routeWaypoints[activeWaypointIndex] || originPoint;

  return (
    <div id="navigation-page" className="max-w-6xl mx-auto py-4 flex flex-col gap-5">
      {/* 1. Header & Clear Offline Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30">
              OFFLINE DIGITAL MAP
            </span>
            <span className="text-[11px] text-[#8d909e] font-medium hidden sm:inline">
              Coimbatore GIS Cartography
            </span>
          </div>
          <h2 className="font-headline-lg text-[26px] sm:text-[30px] font-bold text-[#dbe2f7] tracking-tight">
            Offline Transit Map & Navigation
          </h2>
          <p className="text-[13px] sm:text-[14px] text-[#c3c6d4]">
            Realistic on-device vector map of Coimbatore urban corridors with autonomous routing and simulated ETA.
          </p>
        </div>

        {/* Prominent Mandatory Offline Disclaimer */}
        <div className="px-3.5 py-2 rounded-xl bg-[#141c2a] border border-[#424752] flex items-center gap-2 self-start sm:self-auto shadow-md">
          <span className="material-symbols-outlined text-[18px] text-[#fbbf24]">info</span>
          <div className="text-left">
            <span className="text-[10px] font-mono font-bold text-[#fbbf24] block uppercase tracking-wider">
              DEMO ROUTE — NOT REAL-TIME
            </span>
            <span className="text-[11px] text-[#8d909e] block leading-tight">
              Simulated calculations • No live GPS or traffic
            </span>
          </div>
        </div>
      </div>

      {/* 2. Control Bar: Route Selector & Mode Switcher */}
      <div className="bg-[#18202e] rounded-xl p-3.5 sm:p-4 ghost-border flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
        {/* Route Selector Dropdown */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span className="text-[11px] font-bold text-[#aec6ff] uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">alt_route</span>
            Route:
          </span>
          <select
            id="nav-route-selector"
            value={activeRouteId}
            onChange={(e) => {
              setActiveRouteId(e.target.value);
              setActiveWaypointIndex(1);
            }}
            className="flex-1 max-w-md px-3 py-2 rounded-lg bg-[#0b1321] border border-[#424752] text-[#dbe2f7] text-[13px] font-semibold focus:outline-none focus:border-[#38bdf8] transition-colors truncate cursor-pointer"
          >
            {COIMBATORE_BUS_ROUTES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.routeNumber} — {r.name} ({r.origin} → {r.destination})
              </option>
            ))}
          </select>
        </div>

        {/* Travel Mode Switcher: Bus, Car, Bike, Walk */}
        <div className="flex items-center gap-1 bg-[#0b1321] p-1 rounded-xl border border-[#424752] overflow-x-auto self-start sm:self-auto">
          {(
            [
              { mode: 'bus', label: 'Bus', icon: 'directions_bus' },
              { mode: 'car', label: 'Car', icon: 'directions_car' },
              { mode: 'bike', label: 'Bike', icon: 'two_wheeler' },
              { mode: 'walk', label: 'Walk', icon: 'directions_walk' },
            ] as const
          ).map((item) => {
            const isSelected = travelMode === item.mode;
            return (
              <button
                key={item.mode}
                id={`travel-mode-${item.mode}`}
                onClick={() => setTravelMode(item.mode)}
                title={`Calculate offline route using ${item.label} mode`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#38bdf8] text-[#00275e] shadow-md shadow-[#38bdf8]/30 font-bold'
                    : 'text-[#c3c6d4] hover:text-[#dbe2f7] hover:bg-[#141c2a]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Stage: Realistic Vector Map Visualizer & Telemetry Panel */}
      <div className={`grid grid-cols-1 ${isFullscreenMap ? 'lg:grid-cols-1' : 'lg:grid-cols-12'} gap-5`}>
        {/* Map Canvas Container */}
        <div
          className={`${
            isFullscreenMap ? 'lg:col-span-12 h-[680px]' : 'lg:col-span-8 h-[540px]'
          } bg-[#0a101d] rounded-2xl border border-[#384358] overflow-hidden relative flex flex-col shadow-xl transition-all duration-300`}
        >
          {/* Top Left: Route Banner Overlay */}
          <div className="absolute top-3.5 left-3.5 z-20 bg-[#141c2a]/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#2d3a52] text-[12px] shadow-lg flex items-center gap-2.5 pointer-events-auto">
            <div className="w-7 h-7 rounded-lg bg-[#38bdf8]/20 border border-[#38bdf8]/40 flex items-center justify-center font-mono font-bold text-[#38bdf8] text-[12px]">
              {currentRoute.routeNumber}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#dbe2f7]">{currentRoute.origin}</span>
                <span className="material-symbols-outlined text-[14px] text-[#38bdf8]">arrow_forward</span>
                <span className="font-bold text-[#dbe2f7]">{currentRoute.destination}</span>
              </div>
              <p className="text-[10px] text-[#8d909e]">
                {currentRoute.stops.length} stops • {distanceKm} km • {modeStats.label}
              </p>
            </div>
          </div>

          {/* Top Right: Status & Map Layer Controls */}
          <div className="absolute top-3.5 right-3.5 z-20 flex flex-col items-end gap-2 pointer-events-auto">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-[#141c2a]/90 backdrop-blur-md border border-[#2d3a52] text-[10px] sm:text-[11px] text-[#10b981] font-semibold flex items-center gap-1.5 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
                <span>Local Vector Cache (100% Offline)</span>
              </span>
              <button
                onClick={() => setIsFullscreenMap((prev) => !prev)}
                title={isFullscreenMap ? 'Exit Full Width' : 'Expand Full Width'}
                className="p-1.5 rounded-lg bg-[#141c2a]/90 hover:bg-[#222a39] text-[#c3c6d4] hover:text-[#38bdf8] border border-[#2d3a52] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isFullscreenMap ? 'fullscreen_exit' : 'fullscreen'}
                </span>
              </button>
            </div>

            {/* Quick Layer Toggles */}
            <div className="hidden sm:flex items-center gap-1 bg-[#141c2a]/90 backdrop-blur-md p-1 rounded-lg border border-[#2d3a52] text-[10px] shadow-md">
              <button
                onClick={() => setShowLandmarks((prev) => !prev)}
                className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                  showLandmarks ? 'bg-[#38bdf8]/20 text-[#38bdf8]' : 'text-[#8d909e] hover:text-white'
                }`}
                title="Toggle Landmark Badges"
              >
                Landmarks
              </button>
              <button
                onClick={() => setShowWaterAndParks((prev) => !prev)}
                className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                  showWaterAndParks ? 'bg-[#10b981]/20 text-[#10b981]' : 'text-[#8d909e] hover:text-white'
                }`}
                title="Toggle Lakes & Green Reserves"
              >
                Lakes & Parks
              </button>
              <button
                onClick={() => setShowRoadGrid((prev) => !prev)}
                className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                  showRoadGrid ? 'bg-[#aec6ff]/20 text-[#aec6ff]' : 'text-[#8d909e] hover:text-white'
                }`}
                title="Toggle Street Grid"
              >
                Roads
              </button>
            </div>
          </div>

          {/* Floating Professional Map Controls (Zoom & Pan) */}
          <div className="absolute right-3.5 bottom-16 z-20 flex flex-col gap-1.5 bg-[#141c2a]/90 backdrop-blur-md p-1.5 rounded-xl border border-[#2d3a52] shadow-lg pointer-events-auto">
            <button
              onClick={handleZoomIn}
              title="Zoom In (+)"
              className="w-8 h-8 rounded-lg bg-[#1a2436] hover:bg-[#25334d] text-[#dbe2f7] hover:text-[#38bdf8] flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
            <div className="text-[9px] font-mono text-[#8d909e] text-center font-bold py-0.5 select-none">
              {Math.round(zoomLevel * 100)}%
            </div>
            <button
              onClick={handleZoomOut}
              title="Zoom Out (-)"
              className="w-8 h-8 rounded-lg bg-[#1a2436] hover:bg-[#25334d] text-[#dbe2f7] hover:text-[#38bdf8] flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">remove</span>
            </button>
            <div className="w-full h-px bg-[#2d3a52] my-0.5" />
            <button
              onClick={handleResetView}
              title="Center Active Route"
              className="w-8 h-8 rounded-lg bg-[#1a2436] hover:bg-[#25334d] text-[#dbe2f7] hover:text-[#38bdf8] flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">my_location</span>
            </button>
          </div>

          {/* Cartographic Compass Rose (North Arrow) */}
          <div
            className="absolute left-4 bottom-16 z-20 flex items-center gap-2 bg-[#141c2a]/85 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-[#2d3a52] text-[10px] text-[#8d909e] shadow-md select-none pointer-events-none"
            title="Coimbatore True North"
          >
            <div className="relative w-5 h-5 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] text-[#38bdf8] rotate-0">navigation</span>
            </div>
            <div className="flex flex-col font-mono text-[9px] leading-tight">
              <span className="font-bold text-[#dbe2f7]">NORTH</span>
              <span className="text-[#8d909e]">11.0168° N</span>
            </div>
          </div>

          {/* Scale Bar Overlay */}
          <div className="absolute left-4 bottom-4 z-20 flex items-center gap-1.5 text-[9px] font-mono text-[#8d909e] select-none pointer-events-none">
            <span className="w-12 h-1 bg-[#424752] border-x border-[#aec6ff]/70 inline-block"></span>
            <span>2.0 KM</span>
          </div>

          {/* 4. HIGH-FIDELITY VECTOR TRANSIT MAP CANVAS */}
          <div className="w-full h-full flex-1 relative cursor-grab active:cursor-grabbing overflow-hidden">
            <svg
              viewBox={currentViewBox}
              className="w-full h-full select-none"
              style={{
                background: 'radial-gradient(circle at 430px 350px, #101a2e 0%, #080e1a 100%)',
              }}
            >
              <defs>
                {/* Cartographic Grid */}
                <pattern id="carto-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#162033" strokeWidth="0.5" />
                </pattern>

                {/* Road hatchings */}
                <pattern id="rail-ties" width="8" height="4" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="8" y2="0" stroke="#5d8ef1" strokeWidth="1" strokeOpacity="0.4" />
                </pattern>

                {/* Route gradient and filters */}
                <linearGradient id="route-highlight-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="35%" stopColor="#38bdf8" />
                  <stop offset="80%" stopColor="#5d8ef1" />
                  <stop offset="100%" stopColor="#f43f5e" />
                </linearGradient>

                <filter id="route-glow-blur" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#38bdf8" floodOpacity="0.5" />
                </filter>
              </defs>

              {/* Background Cartographic Coordinate Grid */}
              <rect x="0" y="0" width="800" height="700" fill="url(#carto-grid)" />

              {/* ------------------------------------------------------------- */}
              {/* COIMBATORE WATER BODIES & NOYYAL RIVER CORRIDOR              */}
              {/* ------------------------------------------------------------- */}
              {showWaterAndParks && (
                <g id="water-bodies" className="transition-opacity duration-300">
                  {/* Noyyal River natural meander */}
                  <path
                    d="M 160 480 C 230 460 280 475 340 485 C 410 495 470 470 540 485 C 610 500 670 490 740 515"
                    fill="none"
                    stroke="#1e3a5f"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeOpacity="0.8"
                  />
                  <text x="640" y="505" fill="#2d5282" fontSize="7" fontStyle="italic" letterSpacing="1">
                    NOYYAL RIVER
                  </text>

                  {/* 1. Ukkadam Periyakulam (Big Tank) */}
                  <path
                    d="M 315 470 C 345 450 375 465 375 490 C 375 520 330 525 310 505 Z"
                    fill="#152e4d"
                    stroke="#1e4270"
                    strokeWidth="1.2"
                  />
                  <text x="325" y="495" fill="#38bdf8" fontSize="7" fontWeight="bold" opacity="0.85">
                    Ukkadam Lake
                  </text>

                  {/* 2. Valankulam Lake (Sungam / Trichy Road) */}
                  <path
                    d="M 390 380 C 430 370 450 395 440 425 C 410 435 385 415 390 380 Z"
                    fill="#152e4d"
                    stroke="#1e4270"
                    strokeWidth="1.2"
                  />
                  <text x="400" y="405" fill="#38bdf8" fontSize="7" fontWeight="bold" opacity="0.85">
                    Valankulam
                  </text>

                  {/* 3. Singanallur Lake & Wetlands */}
                  <path
                    d="M 545 430 C 585 415 605 440 595 470 C 555 475 535 455 545 430 Z"
                    fill="#152e4d"
                    stroke="#1e4270"
                    strokeWidth="1.2"
                  />
                  <text x="550" y="455" fill="#38bdf8" fontSize="7" fontWeight="bold" opacity="0.85">
                    Singanallur Lake
                  </text>

                  {/* 4. Kurichi Lake (Podanur / Eachanari link) */}
                  <path
                    d="M 340 550 C 375 540 385 565 375 590 C 345 595 330 575 340 550 Z"
                    fill="#152e4d"
                    stroke="#1e4270"
                    strokeWidth="1.2"
                  />
                  <text x="345" y="570" fill="#38bdf8" fontSize="6.5" fontWeight="bold" opacity="0.8">
                    Kurichi Lake
                  </text>
                </g>
              )}

              {/* ------------------------------------------------------------- */}
              {/* COIMBATORE PARKS & GREEN ACCENTS                              */}
              {/* ------------------------------------------------------------- */}
              {showWaterAndParks && (
                <g id="green-reserves" className="transition-opacity duration-300">
                  {/* Race Course Circular Promenade */}
                  <circle
                    cx="430"
                    cy="360"
                    r="22"
                    fill="#0f291e"
                    stroke="#1b4d38"
                    strokeWidth="1.2"
                    strokeDasharray="3 2"
                  />
                  <text x="415" y="362" fill="#34d399" fontSize="6.5" fontWeight="bold">
                    Race Course
                  </text>

                  {/* VOC Park & Stadium */}
                  <rect
                    x="425"
                    y="310"
                    width="24"
                    height="18"
                    rx="4"
                    fill="#0f291e"
                    stroke="#1b4d38"
                    strokeWidth="1"
                  />
                  <text x="430" y="322" fill="#34d399" fontSize="6" fontWeight="bold">
                    VOC Park
                  </text>

                  {/* Forest College & TNAU Botanical Grounds */}
                  <path
                    d="M 235 330 C 275 320 280 355 260 375 C 230 375 220 350 235 330 Z"
                    fill="#0f291e"
                    stroke="#1b4d38"
                    strokeWidth="1"
                  />
                  <text x="240" y="352" fill="#34d399" fontSize="6" fontWeight="bold">
                    TNAU Botanical
                  </text>

                  {/* Western Marudhamalai Foothills */}
                  <path
                    d="M 130 240 C 160 210 180 260 170 300 C 140 310 120 270 130 240 Z"
                    fill="#0f291e"
                    stroke="#1b4d38"
                    strokeWidth="1"
                    opacity="0.7"
                  />
                  <text x="135" y="270" fill="#34d399" fontSize="6" fontWeight="bold">
                    Marudhamalai Hills
                  </text>
                </g>
              )}

              {/* ------------------------------------------------------------- */}
              {/* RAILWAY NETWORK (Tracks from Central Junction)                */}
              {/* ------------------------------------------------------------- */}
              <g id="railway-network" opacity="0.6">
                <path
                  d="M 270 540 L 350 490 L 380 350 L 400 240 L 410 120"
                  fill="none"
                  stroke="#384358"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                />
                <path
                  d="M 380 350 L 460 370 L 550 390 L 670 410"
                  fill="none"
                  stroke="#384358"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                />
              </g>

              {/* ------------------------------------------------------------- */}
              {/* ROAD NETWORK & ARTERIAL HIGHWAYS (Coimbatore Road Hierarchy) */}
              {/* ------------------------------------------------------------- */}
              {showRoadGrid && (
                <g id="road-network">
                  {/* Secondary Streets & Urban Grid (Gandhipuram / RS Puram / Peelamedu) */}
                  <path
                    d="M 390 260 L 470 260 M 390 280 L 470 280 M 390 300 L 470 300 M 410 240 L 410 320 M 430 240 L 430 320 M 450 240 L 450 320"
                    stroke="#182338"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M 270 300 L 315 300 M 270 320 L 315 320 M 270 340 L 315 340 M 290 290 L 290 350 M 310 290 L 310 350"
                    stroke="#182338"
                    strokeWidth="1.2"
                  />

                  {/* 1. Avinashi Road NH-544 (Primary Highway Corridor to Airport & TIDEL) */}
                  <path
                    d="M 380 350 L 420 280 L 470 285 L 520 290 L 570 275 L 620 260 L 640 280 L 710 280"
                    fill="none"
                    stroke="#2a3854"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 380 350 L 420 280 L 470 285 L 520 290 L 570 275 L 620 260 L 640 280 L 710 280"
                    fill="none"
                    stroke="#3f4e6d"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* 2. Mettupalayam Road NH-181 (North Corridor via Saibaba Colony, Thudiyalur) */}
                  <path
                    d="M 380 350 L 330 210 L 320 130 L 310 70"
                    fill="none"
                    stroke="#2a3854"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 380 350 L 330 210 L 320 130 L 310 70"
                    fill="none"
                    stroke="#3f4e6d"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* 3. Trichy Road NH-81 (Central to Singanallur & Sulur) */}
                  <path
                    d="M 380 350 L 430 380 L 480 400 L 550 420 L 630 440 L 710 460"
                    fill="none"
                    stroke="#2a3854"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 380 350 L 430 380 L 480 400 L 550 420 L 630 440 L 710 460"
                    fill="none"
                    stroke="#3f4e6d"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* 4. Sathyamangalam Road NH-209 (Gandhipuram to Saravanampatti IT SEZ) */}
                  <path
                    d="M 420 280 L 440 220 L 490 150 L 530 90"
                    fill="none"
                    stroke="#2a3854"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 420 280 L 440 220 L 490 150 L 530 90"
                    fill="none"
                    stroke="#3f4e6d"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* 5. Pollachi Road NH-83 (Ukkadam to Eachanari) */}
                  <path
                    d="M 350 490 L 360 580 L 370 650"
                    fill="none"
                    stroke="#2a3854"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 350 490 L 360 580 L 370 650"
                    fill="none"
                    stroke="#3f4e6d"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* 6. Thondamuthur / Marudhamalai Road (RS Puram to Vadavalli) */}
                  <path
                    d="M 290 320 L 230 280 L 180 260"
                    fill="none"
                    stroke="#2a3854"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 290 320 L 230 280 L 180 260"
                    fill="none"
                    stroke="#3f4e6d"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* 7. Connecting Arterials (Cross Cut Rd, 100 Feet Rd, Sungam Bypass) */}
                  <path
                    d="M 350 490 L 380 350 L 420 280"
                    fill="none"
                    stroke="#33425f"
                    strokeWidth="3.5"
                  />
                  <path
                    d="M 350 490 L 430 380"
                    fill="none"
                    stroke="#33425f"
                    strokeWidth="3"
                    strokeDasharray="2 1"
                  />
                  <path
                    d="M 570 275 L 550 420"
                    fill="none"
                    stroke="#33425f"
                    strokeWidth="3"
                  />

                  {/* Road Typography Labels */}
                  <text x="500" y="275" fill="#64748b" fontSize="8" fontWeight="bold" letterSpacing="1">
                    AVINASHI ROAD (NH-544)
                  </text>
                  <text x="325" y="155" fill="#64748b" fontSize="8" fontWeight="bold" letterSpacing="1">
                    METTUPALAYAM RD (NH-181)
                  </text>
                  <text x="475" y="415" fill="#64748b" fontSize="8" fontWeight="bold" letterSpacing="1">
                    TRICHY ROAD (NH-81)
                  </text>
                  <text x="445" y="195" fill="#64748b" fontSize="7.5" fontWeight="bold" letterSpacing="1">
                    SATHY ROAD (NH-209)
                  </text>
                  <text x="365" y="545" fill="#64748b" fontSize="7.5" fontWeight="bold" letterSpacing="1">
                    POLLACHI RD
                  </text>
                </g>
              )}

              {/* ------------------------------------------------------------- */}
              {/* KEY COIMBATORE LANDMARK SYMBOLS & ICONS                       */}
              {/* ------------------------------------------------------------- */}
              {showLandmarks && (
                <g id="landmarks-layer" opacity="0.9">
                  {/* Airport Runway & Terminal Badge */}
                  <g>
                    {/* Runway line */}
                    <line x1="645" y1="260" x2="685" y2="245" stroke="#94a3b8" strokeWidth="4" strokeLinecap="square" />
                    <line x1="645" y1="260" x2="685" y2="245" stroke="#0f172a" strokeWidth="1" strokeDasharray="3 3" />
                    <rect x="635" y="270" width="46" height="14" rx="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="0.75" />
                    <text x="640" y="280" fill="#38bdf8" fontSize="6.5" fontWeight="bold">
                      ✈ CJB AIRPORT
                    </text>
                  </g>

                  {/* Railway Station Landmark */}
                  <g>
                    <rect x="355" y="338" width="48" height="14" rx="3" fill="#1e293b" stroke="#aec6ff" strokeWidth="0.75" />
                    <text x="360" y="348" fill="#aec6ff" fontSize="6.5" fontWeight="bold">
                      🚆 COVAI JUNCTION
                    </text>
                  </g>

                  {/* Gandhipuram Bus Stand */}
                  <g>
                    <rect x="405" y="255" width="48" height="13" rx="3" fill="#1e293b" stroke="#aec6ff" strokeWidth="0.75" />
                    <text x="410" y="264" fill="#aec6ff" fontSize="6" fontWeight="bold">
                      🚌 GANDHIPURAM
                    </text>
                  </g>

                  {/* TIDEL Park / ELCOT IT SEZ */}
                  <g>
                    <rect x="600" y="240" width="38" height="13" rx="3" fill="#1e293b" stroke="#10b981" strokeWidth="0.75" />
                    <text x="605" y="249" fill="#10b981" fontSize="6" fontWeight="bold">
                      🏢 TIDEL PARK
                    </text>
                  </g>

                  {/* Ukkadam Terminal */}
                  <g>
                    <rect x="330" y="475" width="42" height="13" rx="3" fill="#1e293b" stroke="#aec6ff" strokeWidth="0.75" />
                    <text x="335" y="484" fill="#aec6ff" fontSize="6" fontWeight="bold">
                      🚌 UKKADAM
                    </text>
                  </g>
                </g>
              )}

              {/* ------------------------------------------------------------- */}
              {/* ALL BACKGROUND STOPS (Unselected transit nodes)               */}
              {/* ------------------------------------------------------------- */}
              <g id="background-stops">
                {COIMBATORE_STOPS.map((st) => {
                  const isCurrentRouteStop = routeWaypoints.some(
                    (rw) =>
                      rw.name.toLowerCase().includes(st.name.toLowerCase()) ||
                      st.name.toLowerCase().includes(rw.name.toLowerCase())
                  );
                  if (isCurrentRouteStop) return null; // Rendered prominently below
                  return (
                    <g key={st.id} opacity="0.38">
                      <circle cx={st.coordinates.x} cy={st.coordinates.y} r="3" fill="#64748b" />
                      <text
                        x={st.coordinates.x + 5}
                        y={st.coordinates.y + 3}
                        fill="#94a3b8"
                        fontSize="8"
                        fontWeight="500"
                      >
                        {st.name}
                      </text>
                    </g>
                  );
                })}
              </g>

              {/* ------------------------------------------------------------- */}
              {/* ACTIVE ROUTE CORRIDOR (Highlighted Prominent Route Path)      */}
              {/* ------------------------------------------------------------- */}
              {svgPathData && (
                <g id="active-route-corridor">
                  {/* Ambient Glow Underlay */}
                  <path
                    d={svgPathData}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="10"
                    strokeOpacity="0.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* High-contrast Base Path */}
                  <path
                    d={svgPathData}
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Vibrant Foreground Route Line */}
                  <path
                    d={svgPathData}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Directional Flow Dashes (Animated) */}
                  <path
                    d={svgPathData}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="route-flow-line"
                  />
                </g>
              )}

              {/* ------------------------------------------------------------- */}
              {/* INTERMEDIATE ROUTE STOPS                                      */}
              {/* ------------------------------------------------------------- */}
              <g id="route-waypoints">
                {routeWaypoints.map((wp, idx) => {
                  const isOrigin = idx === 0;
                  const isDest = idx === routeWaypoints.length - 1;
                  const isCurrent = idx === activeWaypointIndex;
                  const isPassed = idx < activeWaypointIndex;

                  // Skip origin & destination here (rendered with custom pins below)
                  if (isOrigin || isDest) return null;

                  return (
                    <g
                      key={idx}
                      className="cursor-pointer group"
                      onClick={() => setActiveWaypointIndex(idx)}
                    >
                      {/* Node circle */}
                      <circle
                        cx={wp.x}
                        cy={wp.y}
                        r={isCurrent ? '7' : '5'}
                        fill={isCurrent ? '#38bdf8' : isPassed ? '#10b981' : '#1e293b'}
                        stroke={isCurrent ? '#ffffff' : '#38bdf8'}
                        strokeWidth={isCurrent ? '2' : '1.5'}
                      />
                      {/* Inner dot */}
                      <circle
                        cx={wp.x}
                        cy={wp.y}
                        r="2"
                        fill={isCurrent ? '#00275e' : '#ffffff'}
                      />

                      {/* Label with drop shadow */}
                      <text
                        x={wp.x + 8}
                        y={wp.y + 3}
                        fill={isCurrent ? '#ffffff' : '#dbe2f7'}
                        fontSize="9.5"
                        fontWeight={isCurrent ? 'bold' : '500'}
                        filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.9))"
                      >
                        {wp.name}
                      </text>
                    </g>
                  );
                })}
              </g>

              {/* ------------------------------------------------------------- */}
              {/* PROMINENT SOURCE & DESTINATION PINS                           */}
              {/* ------------------------------------------------------------- */}
              {originPoint && (
                <g
                  id="source-marker"
                  className="cursor-pointer"
                  onClick={() => setActiveWaypointIndex(0)}
                  filter="url(#route-glow-blur)"
                >
                  {/* Origin Radar Pulse */}
                  <circle
                    cx={originPoint.x}
                    cy={originPoint.y}
                    r="8"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    className="pin-radar-beacon"
                  />
                  {/* Emerald Green Origin Teardrop Pin */}
                  <path
                    d={`M ${originPoint.x} ${originPoint.y} C ${originPoint.x - 7} ${originPoint.y - 12} ${originPoint.x - 9} ${originPoint.y - 20} ${originPoint.x} ${originPoint.y - 24} C ${originPoint.x + 9} ${originPoint.y - 20} ${originPoint.x + 7} ${originPoint.y - 12} ${originPoint.x} ${originPoint.y} Z`}
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  <circle cx={originPoint.x} cy={originPoint.y - 15} r="3" fill="#ffffff" />
                  <circle cx={originPoint.x} cy={originPoint.y - 15} r="1.5" fill="#064e3b" />

                  {/* Origin Badge */}
                  <rect
                    x={originPoint.x - 22}
                    y={originPoint.y - 37}
                    width="44"
                    height="12"
                    rx="3"
                    fill="#064e3b"
                    stroke="#10b981"
                    strokeWidth="1"
                  />
                  <text
                    x={originPoint.x}
                    y={originPoint.y - 28}
                    fill="#ffffff"
                    fontSize="7"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    START
                  </text>
                  {/* Origin Name Label */}
                  <text
                    x={originPoint.x + 12}
                    y={originPoint.y + 4}
                    fill="#34d399"
                    fontSize="10"
                    fontWeight="bold"
                    filter="drop-shadow(0px 1px 3px rgba(0,0,0,0.9))"
                  >
                    {originPoint.name}
                  </text>
                </g>
              )}

              {destPoint && (
                <g
                  id="destination-marker"
                  className="cursor-pointer"
                  onClick={() => setActiveWaypointIndex(routeWaypoints.length - 1)}
                  filter="url(#route-glow-blur)"
                >
                  {/* Destination Radar Pulse */}
                  <circle
                    cx={destPoint.x}
                    cy={destPoint.y}
                    r="8"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="1.5"
                    className="pin-radar-beacon"
                  />
                  {/* Crimson Destination Teardrop Pin */}
                  <path
                    d={`M ${destPoint.x} ${destPoint.y} C ${destPoint.x - 7} ${destPoint.y - 12} ${destPoint.x - 9} ${destPoint.y - 20} ${destPoint.x} ${destPoint.y - 24} C ${destPoint.x + 9} ${destPoint.y - 20} ${destPoint.x + 7} ${destPoint.y - 12} ${destPoint.x} ${destPoint.y} Z`}
                    fill="#f43f5e"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  <circle cx={destPoint.x} cy={destPoint.y - 15} r="3" fill="#ffffff" />
                  <circle cx={destPoint.x} cy={destPoint.y - 15} r="1.5" fill="#881337" />

                  {/* Destination Badge */}
                  <rect
                    x={destPoint.x - 20}
                    y={destPoint.y - 37}
                    width="40"
                    height="12"
                    rx="3"
                    fill="#881337"
                    stroke="#f43f5e"
                    strokeWidth="1"
                  />
                  <text
                    x={destPoint.x}
                    y={destPoint.y - 28}
                    fill="#ffffff"
                    fontSize="7"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    FINISH
                  </text>
                  {/* Dest Name Label */}
                  <text
                    x={destPoint.x + 12}
                    y={destPoint.y + 4}
                    fill="#fda4af"
                    fontSize="10"
                    fontWeight="bold"
                    filter="drop-shadow(0px 1px 3px rgba(0,0,0,0.9))"
                  >
                    {destPoint.name}
                  </text>
                </g>
              )}

              {/* ------------------------------------------------------------- */}
              {/* CURRENT ACTIVE WAYPOINT TRANSIT POSITION INDICATOR            */}
              {/* ------------------------------------------------------------- */}
              {activePoint && (
                <g id="active-position-indicator" className="pointer-events-none">
                  <circle
                    cx={activePoint.x}
                    cy={activePoint.y}
                    r="14"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    className="pin-radar-beacon"
                  />
                  <circle cx={activePoint.x} cy={activePoint.y} r="8" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
                  <circle cx={activePoint.x} cy={activePoint.y} r="3" fill="#00275e" />
                </g>
              )}
            </svg>
          </div>

          {/* Map Footer Stepper & Progress Bar */}
          <div className="p-3 bg-[#111927] border-t border-[#2d3a52] flex items-center justify-between text-[12px] z-10">
            <div className="flex items-center gap-2">
              <span className="text-[#8d909e] text-[11px]">Selected Node:</span>
              <span className="font-bold text-[#38bdf8] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#38bdf8] inline-block animate-pulse"></span>
                <span>{activePoint.name}</span>
                <span className="text-[#8d909e] font-normal text-[11px]">
                  ({activeWaypointIndex + 1}/{routeWaypoints.length})
                </span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                disabled={activeWaypointIndex <= 0}
                onClick={() => setActiveWaypointIndex((prev) => Math.max(0, prev - 1))}
                className="px-2.5 py-1 rounded-lg bg-[#1a2538] hover:bg-[#25334d] disabled:opacity-40 text-[#c3c6d4] hover:text-white text-[11px] font-semibold cursor-pointer border border-[#2d3a52] transition-colors"
              >
                Previous Stop
              </button>
              <button
                disabled={activeWaypointIndex >= routeWaypoints.length - 1}
                onClick={() =>
                  setActiveWaypointIndex((prev) => Math.min(routeWaypoints.length - 1, prev + 1))
                }
                className="px-3 py-1 rounded-lg bg-[#38bdf8] hover:bg-[#67e8f9] disabled:opacity-40 text-[#00275e] text-[11px] font-bold cursor-pointer transition-colors shadow-sm"
              >
                Next Stop
              </button>
            </div>
          </div>
        </div>

        {/* Telemetry, ETA & Route Stops Panel */}
        {!isFullscreenMap && (
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Trip Metrics Card */}
            <div className="bg-[#18202e] rounded-xl p-4 sm:p-5 ghost-border shadow-md">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-headline-md text-[15px] font-bold text-[#dbe2f7] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#38bdf8]">speed</span>
                  <span>Trip Telemetry ({travelMode.toUpperCase()})</span>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#10b981]/20 text-[#10b981] font-bold">
                  SIMULATED
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-lg bg-[#141c2a] border border-[#2d3544]">
                  <span className="text-[10px] text-[#8d909e] uppercase tracking-wider block font-semibold">
                    Est. Travel Time
                  </span>
                  <span className="font-headline-md text-[20px] font-bold text-[#38bdf8]">
                    {etaMinutes} min
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#141c2a] border border-[#2d3544]">
                  <span className="text-[10px] text-[#8d909e] uppercase tracking-wider block font-semibold">
                    Arrival Clock
                  </span>
                  <span className="font-headline-md text-[20px] font-bold text-[#10b981]">
                    {estimatedArrivalTime}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#141c2a] border border-[#2d3544]">
                  <span className="text-[10px] text-[#8d909e] uppercase tracking-wider block font-semibold">
                    Total Distance
                  </span>
                  <span className="font-headline-md text-[18px] font-bold text-[#dbe2f7]">
                    {distanceKm} km
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#141c2a] border border-[#2d3544]">
                  <span className="text-[10px] text-[#8d909e] uppercase tracking-wider block font-semibold">
                    Simulated Speed
                  </span>
                  <span className="font-headline-md text-[18px] font-bold text-[#dbe2f7]">
                    {speedKmh} km/h
                  </span>
                </div>
              </div>

              {/* Mode Specific Stat Bar */}
              <div className="mt-3 pt-3 border-t border-[#2d3544] flex items-center justify-between text-[11px]">
                <span className="text-[#8d909e]">Efficiency / Cost:</span>
                <span className="font-semibold text-[#aec6ff]">
                  {modeStats.fare} • {modeStats.ecoScore}
                </span>
              </div>
            </div>

            {/* Sequential Route Stops List */}
            <div className="bg-[#18202e] rounded-xl p-4 sm:p-5 ghost-border flex-1 flex flex-col justify-between shadow-md">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[13px] font-bold text-[#dbe2f7] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#38bdf8] text-[18px]">route</span>
                    <span>Waypoints along {currentRoute.routeNumber}</span>
                  </h4>
                  <span className="text-[10px] text-[#8d909e] font-mono">
                    {currentRoute.stops.length} Nodes
                  </span>
                </div>

                <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                  {currentRoute.stops.map((stop, idx) => {
                    const isCurrent = idx === activeWaypointIndex;
                    const isPassed = idx < activeWaypointIndex;
                    const isOrigin = idx === 0;
                    const isDest = idx === currentRoute.stops.length - 1;

                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveWaypointIndex(idx)}
                        className={`p-2 rounded-lg text-[12px] flex items-center justify-between cursor-pointer transition-colors border ${
                          isCurrent
                            ? 'bg-[#38bdf8]/15 border-[#38bdf8] text-[#38bdf8] font-bold'
                            : isPassed
                            ? 'bg-[#141c2a] border-[#2d3544] text-[#8d909e]'
                            : 'bg-[#141c2a] border-[#2d3544] text-[#dbe2f7] hover:border-[#38bdf8]/40'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              isCurrent
                                ? 'bg-[#38bdf8] ring-2 ring-[#38bdf8]/40'
                                : isOrigin
                                ? 'bg-[#10b981]'
                                : isDest
                                ? 'bg-[#f43f5e]'
                                : isPassed
                                ? 'bg-[#10b981]/70'
                                : 'bg-[#64748b]'
                            }`}
                          />
                          <span className="truncate">{stop}</span>
                        </div>
                        <span className="text-[9.5px] text-[#8d909e] shrink-0 font-mono">
                          {isOrigin ? 'ORIGIN' : isDest ? 'DEST' : `#${idx + 1}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#2d3544] flex gap-2">
                <button
                  onClick={() => onNavigate('transport')}
                  className="flex-1 py-2 bg-[#141c2a] hover:bg-[#222a39] border border-[#2d3544] text-[#aec6ff] rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Bus Schedules</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
                <button
                  onClick={() => onNavigate('voice-assistant')}
                  className="px-3 py-2 bg-[#38bdf8]/20 hover:bg-[#38bdf8]/30 border border-[#38bdf8]/40 text-[#38bdf8] rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  title="Speak transit navigation command"
                >
                  <span className="material-symbols-outlined text-[14px]">mic</span>
                  <span>Voice Query</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
