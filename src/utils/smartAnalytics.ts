import { getAllLogs, type DayLog } from '../components/History';
import { t } from './i18n';

// ======================================================
// AUTO-FILL SUGGESTIONS
// ======================================================

interface LineSuggestion {
    platform: string;
    destination: string;
    confidence: number; // 0-1
}

/**
 * Given a line number, return the most common platform and destination
 * based on historical log data + current session data.
 */
export function getSuggestionsForLine(lineNumber: string, sessionBuses?: { lineNumber: string; platformNumber: string; destination: string }[]): LineSuggestion | null {
    if (!lineNumber.trim()) return null;

    const platformCounts: Record<string, number> = {};
    const destCounts: Record<string, number> = {};
    let totalOccurrences = 0;

    // Mine historical logs
    const logs = getAllLogs();
    for (const log of logs) {
        for (const bus of log.buses) {
            if (bus.lineNumber === lineNumber) {
                totalOccurrences++;
                if (bus.platformNumber) platformCounts[bus.platformNumber] = (platformCounts[bus.platformNumber] || 0) + 1;
                if (bus.destination) destCounts[bus.destination] = (destCounts[bus.destination] || 0) + 1;
            }
        }
    }

    // Also mine current session buses (weighted less)
    if (sessionBuses) {
        for (const bus of sessionBuses) {
            if (bus.lineNumber === lineNumber) {
                if (bus.platformNumber) platformCounts[bus.platformNumber] = (platformCounts[bus.platformNumber] || 0) + 0.5;
                if (bus.destination) destCounts[bus.destination] = (destCounts[bus.destination] || 0) + 0.5;
            }
        }
    }

    if (totalOccurrences === 0) return null;

    const topPlatform = Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0];
    const topDest = Object.entries(destCounts).sort((a, b) => b[1] - a[1])[0];

    return {
        platform: topPlatform?.[0] || '',
        destination: topDest?.[0] || '',
        confidence: Math.min(totalOccurrences / 5, 1), // >=5 occurrences = full confidence
    };
}

// ======================================================
// ANOMALY DETECTION
// ======================================================

export interface Anomaly {
    type: 'low_arrival' | 'high_platform' | 'missing_fields' | 'unusual_volume';
    severity: 'info' | 'warning' | 'alert';
    message: string;
}

/**
 * Detect anomalies in current session compared to historical averages.
 */
export function detectAnomalies(
    currentBuses: { lineNumber: string; plateNumber: string; platformNumber: string; destination: string; arrived: boolean }[],
): Anomaly[] {
    const anomalies: Anomaly[] = [];
    const logs = getAllLogs();

    if (currentBuses.length === 0) return anomalies;

    // --- Data Completeness Check ---
    const missingPlatform = currentBuses.filter(b => !b.platformNumber).length;
    const missingDest = currentBuses.filter(b => !b.destination).length;
    if (missingPlatform > 0) {
        anomalies.push({
            type: 'missing_fields',
            severity: 'info',
            message: t('anomaly.missingPlatform').replace('{n}', String(missingPlatform)),
        });
    }
    if (missingDest > 0) {
        anomalies.push({
            type: 'missing_fields',
            severity: 'info',
            message: t('anomaly.missingDest').replace('{n}', String(missingDest)),
        });
    }

    // --- Platform Overload ---
    const platformLoad: Record<string, number> = {};
    currentBuses.forEach(b => {
        if (b.platformNumber) platformLoad[b.platformNumber] = (platformLoad[b.platformNumber] || 0) + 1;
    });
    for (const [platform, count] of Object.entries(platformLoad)) {
        if (count >= 6) {
            anomalies.push({
                type: 'high_platform',
                severity: 'alert',
                message: t('anomaly.platformOverload').replace('{p}', platform).replace('{n}', String(count)),
            });
        } else if (count >= 4) {
            anomalies.push({
                type: 'high_platform',
                severity: 'warning',
                message: t('anomaly.platformBusy').replace('{p}', platform).replace('{n}', String(count)),
            });
        }
    }

    if (logs.length < 3) return anomalies; // Need enough history

    // --- Arrival Rate Anomaly ---
    const arrivedCount = currentBuses.filter(b => b.arrived).length;
    const currentRate = currentBuses.length > 0 ? (arrivedCount / currentBuses.length) * 100 : 0;
    const historicalRates = logs.map(l => l.totalCount > 0 ? (l.arrivedCount / l.totalCount) * 100 : 0);
    const avgRate = historicalRates.reduce((a, b) => a + b, 0) / historicalRates.length;

    if (currentRate > 0 && currentRate < avgRate * 0.7) {
        anomalies.push({
            type: 'low_arrival',
            severity: 'warning',
            message: t('anomaly.lowArrival')
                .replace('{current}', String(Math.round(currentRate)))
                .replace('{avg}', String(Math.round(avgRate))),
        });
    }

    // --- Unusual Volume ---
    const avgVolume = logs.reduce((s, l) => s + l.totalCount, 0) / logs.length;
    if (currentBuses.length > avgVolume * 1.5 && currentBuses.length > 5) {
        anomalies.push({
            type: 'unusual_volume',
            severity: 'info',
            message: t('anomaly.highVolume')
                .replace('{current}', String(currentBuses.length))
                .replace('{avg}', String(Math.round(avgVolume))),
        });
    } else if (currentBuses.length < avgVolume * 0.5 && currentBuses.length > 0 && avgVolume > 3) {
        anomalies.push({
            type: 'unusual_volume',
            severity: 'info',
            message: t('anomaly.lowVolume')
                .replace('{current}', String(currentBuses.length))
                .replace('{avg}', String(Math.round(avgVolume))),
        });
    }

    return anomalies;
}

// ======================================================
// TREND FORECASTING
// ======================================================

export interface Forecast {
    predictedArrivalRate: number;
    predictedVolume: number;
    trend: 'improving' | 'declining' | 'stable';
    trendPct: number;
}

/**
 * Simple moving average forecast from historical logs.
 */
export function getForecast(): Forecast | null {
    const logs = getAllLogs();
    if (logs.length < 3) return null;

    const recent = logs.slice(0, Math.min(7, logs.length));
    const rates = recent.map(l => l.totalCount > 0 ? (l.arrivedCount / l.totalCount) * 100 : 0);
    const volumes = recent.map(l => l.totalCount);

    // Weighted moving average (recent days count more)
    let rateSum = 0, volSum = 0, weightSum = 0;
    rates.forEach((r, i) => {
        const weight = rates.length - i; // newer = higher weight
        rateSum += r * weight;
        volSum += volumes[i] * weight;
        weightSum += weight;
    });

    const predictedRate = Math.round(rateSum / weightSum);
    const predictedVol = Math.round(volSum / weightSum);

    // Trend: compare first half vs second half
    const mid = Math.floor(rates.length / 2);
    const firstHalf = rates.slice(mid);
    const secondHalf = rates.slice(0, mid);
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / (firstHalf.length || 1);
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / (secondHalf.length || 1);
    const diff = avgSecond - avgFirst;
    const trendPct = Math.round(diff);

    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (diff > 3) trend = 'improving';
    else if (diff < -3) trend = 'declining';

    return { predictedArrivalRate: predictedRate, predictedVolume: predictedVol, trend, trendPct };
}

// ======================================================
// NATURAL LANGUAGE REPORTS
// ======================================================

/**
 * Generate a human-readable summary of analytics data.
 */
export function generateNLReport(): string {
    const logs = getAllLogs();

    if (logs.length === 0) {
        return t('nlr.noData');
    }

    const parts: string[] = [];

    // Overall stats
    const totalBuses = logs.reduce((s, l) => s + l.totalCount, 0);
    const totalArrived = logs.reduce((s, l) => s + l.arrivedCount, 0);
    const overallRate = totalBuses > 0 ? Math.round((totalArrived / totalBuses) * 100) : 0;

    parts.push(t('nlr.overall')
        .replace('{days}', String(logs.length))
        .replace('{buses}', String(totalBuses))
        .replace('{rate}', String(overallRate)));

    // Week comparison
    if (logs.length >= 7) {
        const thisWeek = logs.slice(0, 7);
        const lastWeek = logs.slice(7, 14);

        const thisRate = getArrivalRate(thisWeek);
        const lastRate = lastWeek.length >= 3 ? getArrivalRate(lastWeek) : null;

        if (lastRate !== null) {
            const diff = thisRate - lastRate;
            if (diff > 0) {
                parts.push(t('nlr.weekBetter').replace('{pct}', String(Math.abs(Math.round(diff)))));
            } else if (diff < -2) {
                parts.push(t('nlr.weekWorse').replace('{pct}', String(Math.abs(Math.round(diff)))));
            } else {
                parts.push(t('nlr.weekSame'));
            }
        }
    }

    // Busiest platform
    const platformCounts: Record<string, number> = {};
    logs.forEach(l => l.buses.forEach(b => {
        if (b.platformNumber) platformCounts[b.platformNumber] = (platformCounts[b.platformNumber] || 0) + 1;
    }));
    const topPlatform = Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0];
    if (topPlatform) {
        parts.push(t('nlr.busiestPlatform').replace('{p}', topPlatform[0]).replace('{n}', String(topPlatform[1])));
    }

    // Most reliable line (highest arrival rate)
    const lineStats: Record<string, { arrived: number; total: number }> = {};
    logs.forEach(l => l.buses.forEach(b => {
        if (b.lineNumber) {
            if (!lineStats[b.lineNumber]) lineStats[b.lineNumber] = { arrived: 0, total: 0 };
            lineStats[b.lineNumber].total++;
            if (b.arrived) lineStats[b.lineNumber].arrived++;
        }
    }));

    const lineEntries = Object.entries(lineStats).filter(([, s]) => s.total >= 3);
    if (lineEntries.length > 0) {
        const best = lineEntries.sort((a, b) => (b[1].arrived / b[1].total) - (a[1].arrived / a[1].total))[0];
        const bestRate = Math.round((best[1].arrived / best[1].total) * 100);
        parts.push(t('nlr.bestLine').replace('{line}', best[0]).replace('{rate}', String(bestRate)));

        const worst = lineEntries.sort((a, b) => (a[1].arrived / a[1].total) - (b[1].arrived / b[1].total))[0];
        const worstRate = Math.round((worst[1].arrived / worst[1].total) * 100);
        if (worstRate < 80) {
            parts.push(t('nlr.worstLine').replace('{line}', worst[0]).replace('{rate}', String(worstRate)));
        }
    }

    // Forecast
    const forecast = getForecast();
    if (forecast) {
        if (forecast.trend === 'improving') {
            parts.push(t('nlr.trendUp').replace('{pct}', String(Math.abs(forecast.trendPct))));
        } else if (forecast.trend === 'declining') {
            parts.push(t('nlr.trendDown').replace('{pct}', String(Math.abs(forecast.trendPct))));
        } else {
            parts.push(t('nlr.trendStable'));
        }
        parts.push(t('nlr.forecast').replace('{rate}', String(forecast.predictedArrivalRate)));
    }

    return parts.join(' ');
}

function getArrivalRate(logs: DayLog[]): number {
    const total = logs.reduce((s, l) => s + l.totalCount, 0);
    const arrived = logs.reduce((s, l) => s + l.arrivedCount, 0);
    return total > 0 ? (arrived / total) * 100 : 0;
}

// ======================================================
// RENDER: Forecast + NLR + Anomalies panel for Dashboard
// ======================================================

export function renderSmartInsights(
    currentBuses: { lineNumber: string; plateNumber: string; platformNumber: string; destination: string; arrived: boolean }[],
): string {
    const anomalies = detectAnomalies(currentBuses);
    const forecast = getForecast();
    const nlReport = generateNLReport();
    const logs = getAllLogs();

    if (logs.length === 0 && anomalies.length === 0) return '';

    let html = `<div class="smart-insights">`;
    html += `<h3 class="chart-title">🧠 ${t('smart.title')}</h3>`;

    // NL Report
    if (nlReport && logs.length > 0) {
        html += `<div class="smart-report">${nlReport}</div>`;
    }

    // Forecast card
    if (forecast) {
        const trendIcon = forecast.trend === 'improving' ? '📈' : forecast.trend === 'declining' ? '📉' : '➡️';
        const trendClass = forecast.trend === 'improving' ? 'trend-up' : forecast.trend === 'declining' ? 'trend-down' : 'trend-stable';
        html += `
      <div class="forecast-card">
        <div class="forecast-header">${trendIcon} ${t('smart.forecast')}</div>
        <div class="forecast-body">
          <span class="forecast-rate">${forecast.predictedArrivalRate}%</span>
          <span class="forecast-label">${t('smart.predictedRate')}</span>
          <span class="forecast-trend ${trendClass}">
            ${forecast.trend === 'improving' ? '↑' : forecast.trend === 'declining' ? '↓' : '→'}
            ${Math.abs(forecast.trendPct)}% ${t('smart.trendLabel.' + forecast.trend)}
          </span>
        </div>
      </div>
    `;
    }

    // Anomalies
    if (anomalies.length > 0) {
        html += `<div class="anomaly-list">`;
        for (const a of anomalies) {
            const icon = a.severity === 'alert' ? '🔴' : a.severity === 'warning' ? '🟡' : '🔵';
            html += `<div class="anomaly-item anomaly-${a.severity}">${icon} ${a.message}</div>`;
        }
        html += `</div>`;
    }

    html += `</div>`;
    return html;
}
