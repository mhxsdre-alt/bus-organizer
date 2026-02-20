import { getAllLogs } from './History';
import { t } from '../utils/i18n';

export function renderDashboard(): HTMLDivElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'dashboard-panel';
  wrapper.id = 'dashboard';

  rebuild();

  function rebuild() {
    const logs = getAllLogs();

    if (logs.length === 0) {
      wrapper.innerHTML = `
        <p class="template-empty">${t('dash.empty')}</p>
      `;
      return;
    }

    const totalBuses = logs.reduce((s, l) => s + l.totalCount, 0);
    const totalArrived = logs.reduce((s, l) => s + l.arrivedCount, 0);
    const arrivalRate = totalBuses > 0 ? Math.round((totalArrived / totalBuses) * 100) : 0;

    const platformCounts: Record<string, number> = {};
    logs.forEach(l => l.buses.forEach(b => {
      if (b.platformNumber) {
        platformCounts[b.platformNumber] = (platformCounts[b.platformNumber] || 0) + 1;
      }
    }));
    const busiestPlatform = Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0];

    const lineCounts: Record<string, number> = {};
    logs.forEach(l => l.buses.forEach(b => {
      if (b.lineNumber) {
        lineCounts[b.lineNumber] = (lineCounts[b.lineNumber] || 0) + 1;
      }
    }));
    const topLines = Object.entries(lineCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const lateCounts: Record<string, number> = {};
    logs.forEach(l => l.buses.filter(b => !b.arrived && b.lineNumber).forEach(b => {
      lateCounts[b.lineNumber] = (lateCounts[b.lineNumber] || 0) + 1;
    }));
    const topLate = Object.entries(lateCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const recentLogs = logs.slice(0, 7).reverse();
    const trendMax = Math.max(...recentLogs.map(l => l.totalCount), 1);

    const heatmapMax = Math.max(...Object.values(platformCounts), 1);

    wrapper.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${arrivalRate}%</div>
          <div class="stat-label">${t('dash.arrivalRate')}</div>
          <div class="stat-sub">${totalArrived}/${totalBuses} ${t('dash.across')} ${logs.length} ${t('dash.days')}</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">P${busiestPlatform ? busiestPlatform[0] : '—'}</div>
          <div class="stat-label">${t('dash.busiestPlatform')}</div>
          <div class="stat-sub">${busiestPlatform ? busiestPlatform[1] + ' ' + t('dash.busesTotal') : t('dash.noData')}</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${logs.length}</div>
          <div class="stat-label">${t('dash.daysLogged')}</div>
          <div class="stat-sub">${t('dash.last30')}</div>
        </div>
      </div>

      <h3 class="chart-title">${t('dash.trendTitle')}</h3>
      <div class="trend-chart">
        ${recentLogs.map(log => {
      const d = new Date(log.date);
      const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      const arrivedPct = log.totalCount > 0 ? Math.round((log.arrivedCount / log.totalCount) * 100) : 0;
      const totalPct = Math.round((log.totalCount / trendMax) * 100);
      return `
            <div class="trend-col">
              <div class="trend-bar-wrap">
                <div class="trend-bar trend-bar-total" style="height:${totalPct}%"></div>
                <div class="trend-bar trend-bar-arrived" style="height:${Math.round((log.arrivedCount / trendMax) * 100)}%"></div>
              </div>
              <div class="trend-label">${label}</div>
              <div class="trend-pct">${arrivedPct}%</div>
            </div>
          `;
    }).join('')}
      </div>
      <div class="trend-legend">
        <span class="legend-item"><span class="legend-dot" style="background:var(--accent)"></span> ${t('dash.total')}</span>
        <span class="legend-item"><span class="legend-dot" style="background:#22c55e"></span> ${t('dash.arrivedLabel')}</span>
      </div>

      <h3 class="chart-title">${t('dash.heatmap')}</h3>
      <div class="heatmap-grid">
        ${Array.from({ length: 9 }, (_, i) => {
      const p = String(i + 1);
      const count = platformCounts[p] || 0;
      const intensity = Math.round((count / heatmapMax) * 100);
      return `
            <div class="heatmap-cell" style="--heat:${intensity}%">
              <div class="heatmap-label">P${p}</div>
              <div class="heatmap-val">${count}</div>
            </div>
          `;
    }).join('')}
      </div>

      ${topLines.length > 0 ? `
      <h3 class="chart-title">${t('dash.topLines')}</h3>
      <div class="bar-chart">
        ${topLines.map(([line, count]) => {
      const max = topLines[0][1] as number;
      const pct = Math.round(((count as number) / (max as number)) * 100);
      return `
            <div class="bar-row">
              <span class="bar-label">${t('col.line')} ${line}</span>
              <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
              <span class="bar-val">${count}</span>
            </div>
          `;
    }).join('')}
      </div>
      ` : ''}

      ${topLate.length > 0 ? `
      <h3 class="chart-title">${t('dash.mostLate')}</h3>
      <div class="bar-chart">
        ${topLate.map(([line, count]) => {
      const max = topLate[0][1] as number;
      const pct = Math.round(((count as number) / (max as number)) * 100);
      return `
            <div class="bar-row">
              <span class="bar-label">${t('col.line')} ${line}</span>
              <div class="bar-track"><div class="bar-fill bar-fill-warn" style="width:${pct}%"></div></div>
              <span class="bar-val">${count}</span>
            </div>
          `;
    }).join('')}
      </div>
      ` : ''}
    `;
  }

  (wrapper as any)._rebuild = rebuild;
  return wrapper;
}
