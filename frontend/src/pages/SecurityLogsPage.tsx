import React, { useState, useEffect } from 'react';
import { ScreenId, SecurityLogStatus, ActivityLogItem } from '../types';
import { logService } from '../services/logService';

interface SecurityLogsPageProps {
  onNavigate: (screen: ScreenId) => void;
}

export const SecurityLogsPage: React.FC<SecurityLogsPageProps> = () => {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [filter, setFilter] = useState<'All' | SecurityLogStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const refreshLogs = () => {
    setLogs(logService.getLogs());
  };

  useEffect(() => {
    refreshLogs();
  }, []);

  const handleClearLogs = () => {
    logService.clearLogs();
    refreshLogs();
  };

  const handleResetDefaults = () => {
    logService.resetToDefaults();
    refreshLogs();
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `transitvoice-audit-log-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filter === 'All' || log.status === filter;
    const matchesSearch =
      !searchQuery ||
      log.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: SecurityLogStatus) => {
    if (status === 'Success') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40">
          Success
        </span>
      );
    }
    if (status === 'Warning') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40">
          Warning
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/40">
        Blocked
      </span>
    );
  };

  return (
    <div id="security-logs-page" className="max-w-6xl mx-auto py-6 flex flex-col gap-6">
      {/* Header & Log Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-[28px] sm:text-[32px] font-bold text-[#dbe2f7]">
            Security & Activity Audit Trail
          </h2>
          <p className="text-[14px] text-[#c3c6d4] mt-0.5">
            Local persistent record of biometric evaluations, input validation events, and replay defenses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 rounded-lg bg-[#18202e] hover:bg-[#222a39] border border-[#424752] text-[#aec6ff] text-[12px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export JSON
          </button>
          <button
            onClick={handleClearLogs}
            className="px-3 py-1.5 rounded-lg bg-[#ef4444]/15 hover:bg-[#ef4444]/25 border border-[#ef4444]/30 text-[#ef4444] text-[12px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
            Clear Logs
          </button>
          <button
            onClick={handleResetDefaults}
            className="px-3 py-1.5 rounded-lg bg-[#141c2a] hover:bg-[#222a39] border border-[#2d3544] text-[#c3c6d4] text-[12px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            Reset Demo
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar (Requirement 13) */}
      <div className="bg-[#18202e] rounded-xl p-4 ghost-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter Buttons: All, Success, Warning, Blocked */}
        <div className="flex flex-wrap gap-2">
          {(['All', 'Success', 'Warning', 'Blocked'] as const).map((f) => {
            const isSelected = filter === f;
            const count = f === 'All' ? logs.length : logs.filter((l) => l.status === f).length;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#aec6ff] text-[#00275e] shadow-sm'
                    : 'bg-[#141c2a] text-[#c3c6d4] hover:bg-[#222a39]'
                }`}
              >
                <span>{f}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-[#00275e]/30' : 'bg-[#222a39]'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Text Search */}
        <div className="relative min-w-[240px]">
          <span className="material-symbols-outlined absolute left-3 top-2 text-[#8d909e] text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search event keywords..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#0b1321] border border-[#424752] text-[#dbe2f7] text-[12px] focus:outline-none focus:border-[#aec6ff]"
          />
        </div>
      </div>

      {/* Log List */}
      <div className="space-y-3">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="bg-[#18202e] rounded-xl p-4 ghost-border hover:border-[#aec6ff]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    log.status === 'Success'
                      ? 'bg-[#10b981]/15 text-[#10b981]'
                      : log.status === 'Warning'
                      ? 'bg-[#f59e0b]/15 text-[#f59e0b]'
                      : 'bg-[#ef4444]/15 text-[#ef4444]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {log.status === 'Success'
                      ? 'check_circle'
                      : log.status === 'Warning'
                      ? 'warning'
                      : 'block'}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-headline-md text-[15px] font-bold text-[#dbe2f7]">
                      {log.event}
                    </h4>
                    {getStatusBadge(log.status)}
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#141c2a] text-[#8d909e] border border-[#2d3544]">
                      {log.category}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#c3c6d4] mt-1 leading-relaxed">
                    {log.description}
                  </p>
                </div>
              </div>

              <div className="text-right sm:shrink-0 flex sm:flex-col justify-between items-end gap-1 text-[11px] text-[#8d909e] pt-2 sm:pt-0 border-t sm:border-t-0 border-[#2d3544]">
                <span className="font-mono">{log.timestamp}</span>
                <span className="font-mono text-[10px] opacity-70">Audit ID: {log.id.slice(0, 14)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-[#18202e] rounded-xl p-12 text-center ghost-border">
            <span className="material-symbols-outlined text-[48px] text-[#8d909e] mb-2">
              playlist_remove
            </span>
            <h3 className="text-[18px] font-bold text-[#dbe2f7]">No log records match filter</h3>
            <p className="text-[13px] text-[#c3c6d4] mt-1">
              Try changing the filter or trigger a voice command or security test to generate records.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
