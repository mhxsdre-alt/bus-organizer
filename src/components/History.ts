import type { Bus } from './BusCard';
import { t, getLang } from '../utils/i18n';

export interface DayLog {
  id: string;
  date: string;
  buses: Bus[];
  arrivedCount: number;
  totalCount: number;
}

const LOG_KEY = 'bus-organizer-logs';

export function saveDayLog(buses: Bus[]) {
  if (buses.length === 0) return;
  const logs = getAllLogs();
  const log: DayLog = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    buses: buses.map(b => ({ ...b })),
    arrivedCount: buses.filter(b => b.arrived).length,
    totalCount: buses.length,
  };
  logs.unshift(log); // newest first
  if (logs.length > 30) logs.length = 30; // keep last 30
  localStorage.setItem(LOG_KEY, JSON.stringify(logs));
}

export function getAllLogs(): DayLog[] {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function deleteLog(id: string) {
  const logs = getAllLogs().filter(l => l.id !== id);
  localStorage.setItem(LOG_KEY, JSON.stringify(logs));
}

export function renderHistory(onRefresh: () => void): HTMLDivElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'history-panel';

  rebuild();

  function rebuild() {
    const logs = getAllLogs();
    wrapper.innerHTML = `
      ${logs.length === 0 ? `<p class="template-empty">${t('hist.empty')}</p>` : ''}
      <div class="history-list">
        ${logs.map(log => {
      const d = new Date(log.date);
      const locale = getLang() === 'he' ? 'he-IL' : 'en-GB';
      const dateStr = d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
      const timeStr = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
      const pct = log.totalCount > 0 ? Math.round((log.arrivedCount / log.totalCount) * 100) : 0;
      return `
            <div class="history-item">
              <div class="history-info">
                <span class="history-date">${dateStr} — ${timeStr}</span>
                <span class="history-stats">${log.arrivedCount}/${log.totalCount} ${t('hist.arrived')} (${pct}%)</span>
              </div>
              <div class="history-bar-wrap">
                <div class="history-bar" style="width:${pct}%"></div>
              </div>
              <button class="tpl-delete-btn history-del-btn" data-id="${log.id}" title="Delete">✕</button>
            </div>
          `;
    }).join('')}
      </div>
    `;

    wrapper.querySelectorAll('.history-del-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = (btn as HTMLElement).dataset.id!;
        deleteLog(id);
        rebuild();
        onRefresh();
      });
    });
  }

  return wrapper;
}
