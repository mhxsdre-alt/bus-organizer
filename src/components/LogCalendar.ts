import { getAllLogs, deleteLog, type DayLog } from './History';
import { t, getLang } from '../utils/i18n';

/**
 * Renders a calendar-based log viewer with month and week views.
 */
export function renderLogCalendar(onRefresh: () => void): HTMLDivElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'log-calendar';

    let currentDate = new Date();
    let viewMode: 'month' | 'week' = 'month';

    rebuild();

    async function rebuild() {
        const logs = await getAllLogs();
        const logsByDate = groupLogsByDate(logs);

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const locale = getLang() === 'he' ? 'he-IL' : 'en-US';
        const monthName = currentDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' });

        let calendarHtml = '';
        if (viewMode === 'month') {
            calendarHtml = buildMonthView(year, month, logsByDate, locale);
        } else {
            calendarHtml = buildWeekView(currentDate, logsByDate, locale);
        }

        wrapper.innerHTML = `
      <div class="cal-header">
        <div class="cal-nav-row">
          <button class="btn btn-sm btn-secondary cal-nav-btn" id="cal-prev">◀</button>
          <span class="cal-title">${monthName}</span>
          <button class="btn btn-sm btn-secondary cal-nav-btn" id="cal-next">▶</button>
        </div>
        <button class="btn btn-sm btn-secondary cal-view-btn" id="cal-view-toggle">
          ${viewMode === 'month' ? t('log.weekView') : t('log.monthView')}
        </button>
      </div>
      ${calendarHtml}
      <div class="cal-detail" id="cal-detail"></div>
    `;

        // Navigation
        wrapper.querySelector('#cal-prev')?.addEventListener('click', () => {
            if (viewMode === 'month') {
                currentDate.setMonth(currentDate.getMonth() - 1);
            } else {
                currentDate.setDate(currentDate.getDate() - 7);
            }
            rebuild();
        });

        wrapper.querySelector('#cal-next')?.addEventListener('click', () => {
            if (viewMode === 'month') {
                currentDate.setMonth(currentDate.getMonth() + 1);
            } else {
                currentDate.setDate(currentDate.getDate() + 7);
            }
            rebuild();
        });

        wrapper.querySelector('#cal-view-toggle')?.addEventListener('click', () => {
            viewMode = viewMode === 'month' ? 'week' : 'month';
            rebuild();
        });

        // Day click
        wrapper.querySelectorAll('.cal-day[data-date]').forEach(el => {
            el.addEventListener('click', () => {
                const dateKey = (el as HTMLElement).dataset.date!;
                const dayLogs = logsByDate[dateKey] || [];
                showDayDetail(dateKey, dayLogs);
            });
        });
    }

    function showDayDetail(_dateStr: string, dayLogs: DayLog[]) {
        const detail = wrapper.querySelector('#cal-detail') as HTMLDivElement;
        if (!detail) return;

        if (dayLogs.length === 0) {
            detail.innerHTML = `<p class="template-empty">${t('log.noLogs')}</p>`;
            return;
        }

        const locale = getLang() === 'he' ? 'he-IL' : 'en-GB';
        detail.innerHTML = dayLogs.map(log => {
            const d = new Date(log.date);
            const timeStr = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
            const pct = log.totalCount > 0 ? Math.round((log.arrivedCount / log.totalCount) * 100) : 0;
            const pctClass = pct >= 80 ? 'cal-pct-high' : pct >= 50 ? 'cal-pct-mid' : 'cal-pct-low';
            return `
        <div class="cal-log-item">
          <div class="cal-log-info">
            <span class="cal-log-time">${timeStr}</span>
            <span class="cal-log-stats">${log.totalCount} ${t('tpl.buses')} · <span class="${pctClass}">${log.arrivedCount}/${log.totalCount} ${t('hist.arrived')} (${pct}%)</span></span>
          </div>
          <button class="tpl-delete-btn cal-log-del" data-id="${log.id}" title="Delete">✕</button>
        </div>
      `;
        }).join('');

        detail.querySelectorAll('.cal-log-del').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = (btn as HTMLElement).dataset.id!;
                await deleteLog(id);
                onRefresh();
                rebuild();
            });
        });
    }

    (wrapper as any)._rebuild = rebuild;
    return wrapper;
}

// ===== Helpers =====

function groupLogsByDate(logs: DayLog[]): Record<string, DayLog[]> {
    const map: Record<string, DayLog[]> = {};
    for (const log of logs) {
        const key = log.date.slice(0, 10); // YYYY-MM-DD
        if (!map[key]) map[key] = [];
        map[key].push(log);
    }
    return map;
}

function getArrivalPct(dayLogs: DayLog[]): number {
    const total = dayLogs.reduce((s, l) => s + l.totalCount, 0);
    const arrived = dayLogs.reduce((s, l) => s + l.arrivedCount, 0);
    return total > 0 ? Math.round((arrived / total) * 100) : -1;
}

function pctDotClass(pct: number): string {
    if (pct < 0) return '';
    if (pct >= 80) return 'cal-dot-high';
    if (pct >= 50) return 'cal-dot-mid';
    return 'cal-dot-low';
}

function buildMonthView(year: number, month: number, logsByDate: Record<string, DayLog[]>, locale: string): string {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDow = firstDay.getDay(); // 0=Sun
    const totalDays = lastDay.getDate();
    const today = new Date().toISOString().slice(0, 10);

    // Day names header
    const dayNames = Array.from({ length: 7 }, (_, i) => {
        const shifted = new Date(2024, 0, 7); // Jan 7 2024 is a Sunday
        shifted.setDate(shifted.getDate() + i);
        return shifted.toLocaleDateString(locale, { weekday: 'short' });
    });

    let html = `<div class="cal-grid cal-month">`;
    html += dayNames.map(d => `<div class="cal-day-name">${d}</div>`).join('');

    // Empty cells before first day
    for (let i = 0; i < startDow; i++) {
        html += `<div class="cal-day cal-empty"></div>`;
    }

    for (let day = 1; day <= totalDays; day++) {
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayLogs = logsByDate[dateKey] || [];
        const pct = getArrivalPct(dayLogs);
        const dotClass = pctDotClass(pct);
        const isToday = dateKey === today;
        const hasLogs = dayLogs.length > 0;

        html += `
      <div class="cal-day ${isToday ? 'cal-today' : ''} ${hasLogs ? 'cal-has-log' : ''}" data-date="${dateKey}">
        <span class="cal-day-num">${day}</span>
        ${hasLogs ? `<span class="cal-dot ${dotClass}"></span>` : ''}
      </div>
    `;
    }

    html += `</div>`;
    return html;
}

function buildWeekView(centerDate: Date, logsByDate: Record<string, DayLog[]>, locale: string): string {
    // Find start of week (Sunday)
    const start = new Date(centerDate);
    start.setDate(start.getDate() - start.getDay());
    const today = new Date().toISOString().slice(0, 10);

    let html = `<div class="cal-grid cal-week">`;

    for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const dateKey = d.toISOString().slice(0, 10);
        const dayLogs = logsByDate[dateKey] || [];
        const pct = getArrivalPct(dayLogs);
        const dotClass = pctDotClass(pct);
        const isToday = dateKey === today;
        const hasLogs = dayLogs.length > 0;
        const dayName = d.toLocaleDateString(locale, { weekday: 'short' });
        const dayNum = d.getDate();
        const busCount = dayLogs.reduce((s, l) => s + l.totalCount, 0);

        html += `
      <div class="cal-day cal-week-day ${isToday ? 'cal-today' : ''} ${hasLogs ? 'cal-has-log' : ''}" data-date="${dateKey}">
        <span class="cal-week-label">${dayName}</span>
        <span class="cal-day-num">${dayNum}</span>
        ${hasLogs ? `
          <span class="cal-dot ${dotClass}"></span>
          <span class="cal-week-stat">${busCount} 🚌 ${pct}%</span>
        ` : ''}
      </div>
    `;
    }

    html += `</div>`;
    return html;
}
