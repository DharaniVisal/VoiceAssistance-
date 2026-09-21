import { ActivityLogItem, SecurityLogStatus } from '../types';
import { INITIAL_ACTIVITY_LOGS } from '../data/mockActivityLogs';

const LOG_STORAGE_KEY = 'transitvoice_activity_logs_v1';

class LogService {
  private getInitialLogs(): ActivityLogItem[] {
    return INITIAL_ACTIVITY_LOGS;
  }

  getLogs(): ActivityLogItem[] {
    if (typeof window === 'undefined') return this.getInitialLogs();
    try {
      const stored = localStorage.getItem(LOG_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    const initial = this.getInitialLogs();
    this.saveLogs(initial);
    return initial;
  }

  saveLogs(logs: ActivityLogItem[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs));
    } catch {
      // ignore
    }
  }

  addLog(entry: {
    event: string;
    status: SecurityLogStatus;
    description: string;
    type?: ActivityLogItem['type'];
    category?: ActivityLogItem['category'];
  }): ActivityLogItem {
    const current = this.getLogs();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];

    const newItem: ActivityLogItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: `${timeStr} • ${dateStr}`,
      event: entry.event,
      status: entry.status,
      description: entry.description,
      type: entry.type || 'Voice Command',
      category: entry.category || 'Direct Input',
      securityBadgeColor:
        entry.status === 'Success' ? '#10b981' : entry.status === 'Warning' ? '#f59e0b' : '#ef4444',
    };

    const updated = [newItem, ...current];
    this.saveLogs(updated);
    return newItem;
  }

  clearLogs(): void {
    this.saveLogs([]);
  }

  resetToDefaults(): void {
    this.saveLogs(this.getInitialLogs());
  }
}

export const logService = new LogService();
