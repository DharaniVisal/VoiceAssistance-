import React, { useState } from 'react';
import { ScreenId, BusRoute } from '../types';
import { COIMBATORE_BUS_ROUTES, COIMBATORE_STOPS } from '../data/coimbatoreData';

interface TransportPageProps {
  onNavigate: (screen: ScreenId) => void;
  onSelectRoute?: (routeId: string) => void;
}

export const TransportPage: React.FC<TransportPageProps> = ({ onNavigate, onSelectRoute }) => {
  const [sourceSearch, setSourceSearch] = useState('');
  const [destSearch, setDestSearch] = useState('');
  const [routeNumberSearch, setRouteNumberSearch] = useState('');
  const [filterTag, setFilterTag] = useState<'ALL' | 'FASTEST' | 'EXPRESS' | 'HIGH_FREQ'>('ALL');
  const [selectedRouteDetail, setSelectedRouteDetail] = useState<BusRoute | null>(null);

  // Filter routes based on search criteria
  const filteredRoutes = COIMBATORE_BUS_ROUTES.filter((r) => {
    const s = sourceSearch.trim().toLowerCase();
    const d = destSearch.trim().toLowerCase();
    const num = routeNumberSearch.trim().toLowerCase();

    const matchesSource =
      !s ||
      r.origin.toLowerCase().includes(s) ||
      r.stops.some((stop) => stop.toLowerCase().includes(s));

    const matchesDest =
      !d ||
      r.destination.toLowerCase().includes(d) ||
      r.stops.some((stop) => stop.toLowerCase().includes(d));

    const matchesNum =
      !num ||
      r.routeNumber.toLowerCase().includes(num) ||
      r.name.toLowerCase().includes(num);

    let matchesTag = true;
    if (filterTag === 'FASTEST') matchesTag = r.badge === 'Fastest';
    if (filterTag === 'EXPRESS') matchesTag = r.type === 'Express';
    if (filterTag === 'HIGH_FREQ') matchesTag = r.badge === 'High Frequency' || r.frequencyMinutes <= 10;

    return matchesSource && matchesDest && matchesNum && matchesTag;
  });

  const handleNavigateToRoute = (route: BusRoute) => {
    if (onSelectRoute) {
      onSelectRoute(route.id);
    }
    onNavigate('navigation');
  };

  return (
    <div id="transport-page" className="max-w-6xl mx-auto py-6 flex flex-col gap-6">
      {/* Header & Notice Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-[28px] sm:text-[32px] font-bold text-[#dbe2f7]">
            Coimbatore Transit Routes
          </h2>
          <p className="text-[14px] text-[#c3c6d4] mt-0.5">
            Offline local timetable, route directory, and stop sequences for Coimbatore TNSTC buses.
          </p>
        </div>

        {/* DEMO DATA — NOT REAL-TIME NOTICE (Requirement 7) */}
        <div className="px-3.5 py-1.5 rounded-lg bg-[#f59e0b]/15 border border-[#f59e0b]/30 text-[#f59e0b] text-[12px] font-mono font-bold flex items-center gap-2 self-start sm:self-auto">
          <span className="material-symbols-outlined text-[16px]">info</span>
          <span>DEMO DATA — NOT REAL-TIME</span>
        </div>
      </div>

      {/* Multi-criteria Search & Filters (Requirement 7) */}
      <div className="bg-[#18202e] rounded-xl p-5 ghost-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Source Search */}
          <div>
            <label className="block text-[11px] font-bold text-[#c3c6d4] uppercase tracking-wider mb-1.5">
              Source / Origin Stop
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#8d909e] text-[18px]">
                my_location
              </span>
              <input
                id="search-source-input"
                type="text"
                value={sourceSearch}
                onChange={(e) => setSourceSearch(e.target.value)}
                placeholder="e.g. Gandhipuram, Railway Station..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0b1321] border border-[#424752] text-[#dbe2f7] text-[13px] focus:outline-none focus:border-[#aec6ff]"
              />
            </div>
          </div>

          {/* Destination Search */}
          <div>
            <label className="block text-[11px] font-bold text-[#c3c6d4] uppercase tracking-wider mb-1.5">
              Destination Stop
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#8d909e] text-[18px]">
                location_on
              </span>
              <input
                id="search-dest-input"
                type="text"
                value={destSearch}
                onChange={(e) => setDestSearch(e.target.value)}
                placeholder="e.g. Saravanampatti, Tech Park..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0b1321] border border-[#424752] text-[#dbe2f7] text-[13px] focus:outline-none focus:border-[#aec6ff]"
              />
            </div>
          </div>

          {/* Route Number Search */}
          <div>
            <label className="block text-[11px] font-bold text-[#c3c6d4] uppercase tracking-wider mb-1.5">
              Route Number / Name
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#8d909e] text-[18px]">
                tag
              </span>
              <input
                id="search-route-num-input"
                type="text"
                value={routeNumberSearch}
                onChange={(e) => setRouteNumberSearch(e.target.value)}
                placeholder="e.g. 12, 11A, 44, Express..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0b1321] border border-[#424752] text-[#dbe2f7] text-[13px] focus:outline-none focus:border-[#aec6ff]"
              />
            </div>
          </div>
        </div>

        {/* Quick Filter Tags & Reset */}
        <div className="mt-4 pt-3 border-t border-[#2d3544] flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterTag('ALL')}
              className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                filterTag === 'ALL'
                  ? 'bg-[#aec6ff] text-[#00275e]'
                  : 'bg-[#141c2a] text-[#c3c6d4] hover:bg-[#222a39]'
              }`}
            >
              All Routes ({COIMBATORE_BUS_ROUTES.length})
            </button>
            <button
              onClick={() => setFilterTag('FASTEST')}
              className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                filterTag === 'FASTEST'
                  ? 'bg-[#aec6ff] text-[#00275e]'
                  : 'bg-[#141c2a] text-[#c3c6d4] hover:bg-[#222a39]'
              }`}
            >
              Fastest Corridors
            </button>
            <button
              onClick={() => setFilterTag('HIGH_FREQ')}
              className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                filterTag === 'HIGH_FREQ'
                  ? 'bg-[#aec6ff] text-[#00275e]'
                  : 'bg-[#141c2a] text-[#c3c6d4] hover:bg-[#222a39]'
              }`}
            >
              High Frequency (≤10m)
            </button>
            <button
              onClick={() => setFilterTag('EXPRESS')}
              className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                filterTag === 'EXPRESS'
                  ? 'bg-[#aec6ff] text-[#00275e]'
                  : 'bg-[#141c2a] text-[#c3c6d4] hover:bg-[#222a39]'
              }`}
            >
              Express Lines
            </button>
          </div>

          {(sourceSearch || destSearch || routeNumberSearch || filterTag !== 'ALL') && (
            <button
              onClick={() => {
                setSourceSearch('');
                setDestSearch('');
                setRouteNumberSearch('');
                setFilterTag('ALL');
              }}
              className="text-[12px] text-[#aec6ff] hover:underline cursor-pointer flex items-center gap-1 font-semibold"
            >
              <span className="material-symbols-outlined text-[14px]">refresh</span>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Routes List Grid (Requirement 7: At least 10 routes with all required fields) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRoutes.map((route) => (
          <div
            key={route.id}
            className="bg-[#18202e] rounded-xl p-5 ghost-border hover:border-[#aec6ff]/50 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Card Header: Route Number & Badge */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-[#5d8ef1]/20 border border-[#5d8ef1]/40 text-[#aec6ff] font-bold text-[13px]">
                    {route.routeNumber}
                  </span>
                  <span className="text-[12px] text-[#c3c6d4] font-medium">{route.type}</span>
                </div>
                {route.badge && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30">
                    {route.badge}
                  </span>
                )}
              </div>

              {/* Route Name */}
              <h3 className="font-headline-md text-[17px] font-bold text-[#dbe2f7] mb-2">
                {route.name}
              </h3>

              {/* Source & Destination */}
              <div className="flex items-center gap-2 text-[13px] text-[#dbe2f7] mb-3 bg-[#141c2a] p-2.5 rounded-lg border border-[#2d3544]">
                <span className="material-symbols-outlined text-[#10b981] text-[18px]">trip_origin</span>
                <span className="font-semibold truncate">{route.origin}</span>
                <span className="material-symbols-outlined text-[#8d909e] text-[16px]">arrow_forward</span>
                <span className="material-symbols-outlined text-[#ef4444] text-[18px]">location_on</span>
                <span className="font-semibold truncate">{route.destination}</span>
              </div>

              {/* Stops Preview */}
              <div className="mb-3">
                <p className="text-[11px] font-bold text-[#c3c6d4] uppercase tracking-wider mb-1">
                  Stops ({route.stops.length}):
                </p>
                <div className="flex flex-wrap gap-1">
                  {route.stops.map((stop, sIdx) => (
                    <span
                      key={sIdx}
                      className="text-[11px] px-2 py-0.5 rounded bg-[#0b1321] text-[#c3c6d4] border border-[#2d3544]"
                    >
                      {stop}
                    </span>
                  ))}
                </div>
              </div>

              {/* Timings, Frequency, Fare & Travel Time Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#2d3544] text-[11px]">
                <div>
                  <span className="text-[#8d909e] block">First / Last</span>
                  <span className="font-semibold text-[#dbe2f7]">
                    {route.firstTiming} - {route.lastTiming}
                  </span>
                </div>
                <div>
                  <span className="text-[#8d909e] block">Frequency</span>
                  <span className="font-semibold text-[#aec6ff]">
                    Every {route.frequencyMinutes}m
                  </span>
                </div>
                <div>
                  <span className="text-[#8d909e] block">Est. Time</span>
                  <span className="font-semibold text-[#dbe2f7]">
                    {route.durationMinutes} mins
                  </span>
                </div>
                <div>
                  <span className="text-[#8d909e] block">Fare</span>
                  <span className="font-bold text-[#10b981]">{route.fare}</span>
                </div>
              </div>
            </div>

            {/* Actions: View detailed stops & Navigate */}
            <div className="mt-4 pt-3 border-t border-[#2d3544] flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedRouteDetail(route)}
                className="text-[12px] text-[#aec6ff] hover:text-[#dbe2f7] font-semibold py-1.5 px-2.5 rounded hover:bg-[#141c2a] cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">list</span>
                Detailed Stop Schedule
              </button>

              <button
                onClick={() => handleNavigateToRoute(route)}
                className="text-[12px] bg-[#5d8ef1]/20 hover:bg-[#5d8ef1]/30 border border-[#5d8ef1]/40 text-[#aec6ff] font-bold py-1.5 px-3 rounded-lg cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">explore</span>
                Navigate Route
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredRoutes.length === 0 && (
        <div className="bg-[#18202e] rounded-xl p-12 text-center ghost-border">
          <span className="material-symbols-outlined text-[48px] text-[#8d909e] mb-2">
            search_off
          </span>
          <h3 className="text-[18px] font-bold text-[#dbe2f7]">No matching routes found</h3>
          <p className="text-[13px] text-[#c3c6d4] mt-1 max-w-md mx-auto">
            No local buses matched your query. Try searching for "Gandhipuram", "RS Puram", or "Central".
          </p>
        </div>
      )}

      {/* Detailed Route Modal View (Requirement 7) */}
      {selectedRouteDetail && (
        <div
          id="detailed-route-modal"
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedRouteDetail(null)}
        >
          <div
            className="bg-[#18202e] border border-[#424752] rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#2d3544]">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-[#5d8ef1]/20 text-[#aec6ff] text-[12px] font-bold">
                  {selectedRouteDetail.routeNumber}
                </span>
                <h3 className="font-headline-md text-[18px] font-bold text-[#dbe2f7] mt-1">
                  {selectedRouteDetail.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRouteDetail(null)}
                className="p-1 rounded-lg text-[#8d909e] hover:text-[#dbe2f7] hover:bg-[#141c2a] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {/* Modal Body: Complete sequence of stops */}
            <div className="py-4 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-2 text-[12px] bg-[#141c2a] p-3 rounded-lg border border-[#2d3544]">
                <div>
                  <span className="text-[#8d909e] block">Operating Hours:</span>
                  <span className="font-semibold text-[#dbe2f7]">
                    {selectedRouteDetail.firstTiming} - {selectedRouteDetail.lastTiming}
                  </span>
                </div>
                <div>
                  <span className="text-[#8d909e] block">Frequency:</span>
                  <span className="font-semibold text-[#aec6ff]">
                    Every {selectedRouteDetail.frequencyMinutes} minutes
                  </span>
                </div>
                <div>
                  <span className="text-[#8d909e] block">Standard Fare:</span>
                  <span className="font-bold text-[#10b981]">{selectedRouteDetail.fare}</span>
                </div>
                <div>
                  <span className="text-[#8d909e] block">Estimated Duration:</span>
                  <span className="font-semibold text-[#dbe2f7]">
                    {selectedRouteDetail.durationMinutes} minutes
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-[12px] font-bold text-[#c3c6d4] uppercase tracking-wider mb-2">
                  Complete Stop Sequence ({selectedRouteDetail.stops.length} Stops):
                </h4>
                <div className="relative pl-6 space-y-3">
                  <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-[#424752]"></div>
                  {selectedRouteDetail.stops.map((stop, idx) => {
                    const isFirst = idx === 0;
                    const isLast = idx === selectedRouteDetail.stops.length - 1;
                    return (
                      <div key={idx} className="relative flex items-center justify-between text-[13px]">
                        <div
                          className={`absolute -left-6 w-3 h-3 rounded-full border-2 ${
                            isFirst
                              ? 'bg-[#10b981] border-[#dbe2f7]'
                              : isLast
                              ? 'bg-[#ef4444] border-[#dbe2f7]'
                              : 'bg-[#5d8ef1] border-[#0b1321]'
                          }`}
                        />
                        <span className={`font-medium ${isFirst || isLast ? 'text-[#aec6ff] font-bold' : 'text-[#dbe2f7]'}`}>
                          {stop}
                        </span>
                        <span className="text-[11px] text-[#8d909e]">
                          {isFirst ? 'Origin' : isLast ? 'Terminal' : `Stop #${idx + 1}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-[#2d3544] flex gap-3">
              <button
                onClick={() => setSelectedRouteDetail(null)}
                className="flex-1 py-2 px-3 rounded-lg bg-[#141c2a] hover:bg-[#222a39] text-[#c3c6d4] font-semibold text-[13px] cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const target = selectedRouteDetail;
                  setSelectedRouteDetail(null);
                  handleNavigateToRoute(target);
                }}
                className="flex-1 py-2 px-3 rounded-lg bg-[#aec6ff] hover:bg-[#5d8ef1] text-[#00275e] font-bold text-[13px] cursor-pointer text-center"
              >
                Open in Live Navigation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
