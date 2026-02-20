import './style.css'
import { BusManager } from './components/BusManager'
import { renderTemplatePanel } from './components/TemplateManager'
import { saveDayLog, renderHistory } from './components/History'
import { renderDashboard } from './components/Dashboard'
import { renderQrPanel, handleCheckInFromUrl } from './components/QrPanel'
import { renderManual } from './components/Manual'
import { t, getLang, setLang, onLangChange } from './utils/i18n'

// ===== Theme =====
const savedTheme = localStorage.getItem('bus-theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('bus-theme', next);
  const icon = document.getElementById('theme-icon');
  if (icon) icon.textContent = next === 'dark' ? '☀️' : '🌙';
}

// ===== Notification Sound =====
function playCheckInSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.value = 0.15;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch { /* no audio support */ }
}

// ===== Confirm Helper =====
function showConfirm(message: string, onConfirm: () => void) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card">
      <p class="modal-msg">${message}</p>
      <div class="modal-actions">
        <button class="btn btn-sm modal-confirm">${t('confirm.yes')}</button>
        <button class="btn btn-sm btn-secondary modal-cancel">${t('confirm.cancel')}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('modal-visible'));
  overlay.querySelector('.modal-confirm')!.addEventListener('click', () => {
    onConfirm();
    overlay.classList.remove('modal-visible');
    setTimeout(() => overlay.remove(), 200);
  });
  overlay.querySelector('.modal-cancel')!.addEventListener('click', () => {
    overlay.classList.remove('modal-visible');
    setTimeout(() => overlay.remove(), 200);
  });
}

// ===== Toast =====
function showToast(msg: string) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const div = document.createElement('div');
  div.className = 'toast';
  div.textContent = msg;
  document.body.appendChild(div);
  requestAnimationFrame(() => div.classList.add('toast-show'));
  setTimeout(() => { div.classList.remove('toast-show'); setTimeout(() => div.remove(), 300); }, 3000);
}

// ===== Collapsible Helper =====
function makeCollapsible(id: string) {
  const header = document.querySelector(`[data-collapse="${id}"]`);
  const body = document.getElementById(id);
  if (!header || !body) return;
  const saved = localStorage.getItem(`collapse-${id}`);
  if (saved === 'true') {
    body.classList.add('collapsed');
    header.classList.add('section-collapsed');
  }
  header.addEventListener('click', () => {
    body.classList.toggle('collapsed');
    localStorage.setItem(`collapse-${id}`, body.classList.contains('collapsed').toString());
    header.classList.toggle('section-collapsed', body.classList.contains('collapsed'));
  });
}

// ===== Manager (persists across rebuilds) =====
let manager: BusManager | null = null;

// ===== Build the entire UI =====
function buildApp() {
  const app = document.querySelector<HTMLDivElement>('#app')!;
  const themeNow = document.documentElement.getAttribute('data-theme') || 'dark';
  const lang = getLang();

  app.innerHTML = `
    <div class="header">
      <div class="header-row">
        <h1>${t('app.title')}</h1>
        <div class="header-btns">
          <button id="lang-toggle" class="icon-btn" title="Switch language">
            <span>${lang === 'en' ? 'עב' : 'EN'}</span>
          </button>
          <button id="theme-toggle" class="icon-btn" title="Toggle theme">
            <span id="theme-icon">${themeNow === 'dark' ? '☀️' : '🌙'}</span>
          </button>
        </div>
      </div>
      <p>${t('app.subtitle')}</p>
    </div>

    <nav class="tab-bar" id="tab-bar">
      <button class="tab-btn active" data-tab="main">${t('tab.dashboard')}</button>
      <button class="tab-btn" data-tab="analytics">${t('tab.analytics')}</button>
      <button class="tab-btn" data-tab="manual">${t('tab.manual')}</button>
    </nav>

    <!-- TAB: Main -->
    <div class="tab-content active" id="tab-main">
      <div class="toolbar">
        <input type="text" id="search-input" class="search-input" placeholder="${t('search.placeholder')}">
      </div>

      <div class="controls">
        <button id="add-bus-btn" class="btn">
          <span style="margin-right:0.5rem;font-size:1.2em">+</span> ${t('btn.addBus').replace('+ ', '')}
        </button>
        <button id="download-btn" class="btn btn-secondary">${t('btn.pdfReport')}</button>
        <button id="save-log-btn" class="btn btn-secondary">${t('btn.saveLog')}</button>
        <button id="mark-all-btn" class="btn btn-secondary">${t('btn.markAll')}</button>
        <button id="clear-all-btn" class="btn btn-secondary">${t('btn.clearAll')}</button>
        <button id="undo-btn" class="btn btn-secondary" disabled>${t('btn.undo')}</button>
      </div>

      <div class="controls-row">
        <button id="export-btn" class="btn btn-sm btn-secondary">${t('btn.exportJson')}</button>
        <label class="btn btn-sm btn-secondary import-label">${t('btn.importJson')}
          <input type="file" id="import-input" accept=".json" style="display:none">
        </label>
        <button id="backup-btn" class="btn btn-sm btn-secondary">${t('btn.backup')}</button>
        <label class="btn btn-sm btn-secondary import-label">${t('btn.restore')}
          <input type="file" id="restore-input" accept=".json" style="display:none">
        </label>
      </div>

      <div id="bus-list"></div>

      <h2 class="section-title section-collapsible" data-collapse="map-body">${t('map.title')}</h2>
      <div id="map-body"><div id="parking-map-container"></div></div>

      <h2 class="section-title section-collapsible" data-collapse="tpl-body">${t('tpl.title')}</h2>
      <div id="tpl-body"><div id="template-container"></div></div>

      <h2 class="section-title section-collapsible" data-collapse="qr-body">${t('qr.title')}</h2>
      <div id="qr-body"><div id="qr-container"></div></div>
    </div>

    <!-- TAB: Analytics -->
    <div class="tab-content" id="tab-analytics">
      <h2 class="section-title section-collapsible" data-collapse="history-body">${t('hist.title')}</h2>
      <div id="history-body"><div id="history-container"></div></div>

      <h2 class="section-title section-collapsible" data-collapse="dash-body">${t('dash.title')}</h2>
      <div id="dash-body"><div id="dashboard-container"></div></div>
    </div>

    <!-- TAB: Manual -->
    <div class="tab-content" id="tab-manual">
      <div id="manual-container"></div>
    </div>
  `;

  // ===== Tabs =====
  const tabBtns = app.querySelectorAll('.tab-btn');
  const tabContents = app.querySelectorAll('.tab-content');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = (btn as HTMLElement).dataset.tab!;
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${tab}`)?.classList.add('active');
    });
  });

  // Theme toggle
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

  // Language toggle
  document.getElementById('lang-toggle')?.addEventListener('click', () => {
    setLang(getLang() === 'en' ? 'he' : 'en');
  });

  // ===== Init or Re-bind Bus Manager =====
  if (!manager) {
    manager = new BusManager('bus-list', 'parking-map-container');
  } else {
    manager.rebind('bus-list', 'parking-map-container');
  }
  const m = manager; // non-null alias for closures

  // Undo
  const undoBtn = document.getElementById('undo-btn') as HTMLButtonElement;
  function refreshUndo() { undoBtn.disabled = !m.hasUndo; }

  document.getElementById('add-bus-btn')?.addEventListener('click', () => m.addBus());
  document.getElementById('download-btn')?.addEventListener('click', () => m.downloadReport());

  document.getElementById('save-log-btn')?.addEventListener('click', () => {
    saveDayLog(m.getBuses());
    refreshPanels();
    showToast(t('toast.logSaved'));
  });

  document.getElementById('mark-all-btn')?.addEventListener('click', () => {
    showConfirm(t('confirm.markAll'), () => m.markAllArrived());
  });
  document.getElementById('clear-all-btn')?.addEventListener('click', () => {
    showConfirm(t('confirm.clearAll'), () => m.clearAllArrivals());
  });

  undoBtn.addEventListener('click', () => { m.undoDelete(); refreshUndo(); });
  m.onChange(() => refreshUndo());

  document.getElementById('search-input')?.addEventListener('input', (e) => {
    m.setSearch((e.target as HTMLInputElement).value);
  });

  // Export JSON
  document.getElementById('export-btn')?.addEventListener('click', () => {
    const data = m.exportJSON();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bus-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Import JSON
  document.getElementById('import-input')?.addEventListener('change', (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => m.importJSON(reader.result as string);
    reader.readAsText(file);
  });

  // Full Backup
  document.getElementById('backup-btn')?.addEventListener('click', () => {
    const backup = {
      version: 1,
      session: JSON.parse(localStorage.getItem('bus-organizer-session') || '[]'),
      templates: JSON.parse(localStorage.getItem('bus-organizer-templates') || '[]'),
      logs: JSON.parse(localStorage.getItem('bus-organizer-logs') || '[]'),
      theme: localStorage.getItem('bus-theme') || 'dark',
      lang: getLang(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bus-organizer-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(t('toast.backupDone'));
  });

  // Restore Backup
  document.getElementById('restore-input')?.addEventListener('change', (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    showConfirm(t('confirm.restore'), () => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string);
          if (data.session) localStorage.setItem('bus-organizer-session', JSON.stringify(data.session));
          if (data.templates) localStorage.setItem('bus-organizer-templates', JSON.stringify(data.templates));
          if (data.logs) localStorage.setItem('bus-organizer-logs', JSON.stringify(data.logs));
          if (data.theme) localStorage.setItem('bus-theme', data.theme);
          if (data.lang) localStorage.setItem('bus-lang', data.lang);
          showToast(t('toast.restored'));
          setTimeout(() => window.location.reload(), 1000);
        } catch {
          showToast(t('toast.badFile'));
        }
      };
      reader.readAsText(file);
    });
  });

  // Template Panel
  const tplContainer = document.getElementById('template-container')!;
  tplContainer.appendChild(renderTemplatePanel(
    (buses) => m.loadBuses(buses),
    () => m.getBuses(),
  ));

  // QR Panel
  const qrContainer = document.getElementById('qr-container')!;
  const qrPanel = renderQrPanel(
    () => m.getBuses(),
    (busId) => { m.updateBus(busId, 'arrived', true); m.render(); playCheckInSound(); },
  );
  qrContainer.appendChild(qrPanel);

  // History
  const historyContainer = document.getElementById('history-container')!;
  const historyPanel = renderHistory(() => refreshPanels());
  historyContainer.appendChild(historyPanel);

  // Dashboard
  const dashContainer = document.getElementById('dashboard-container')!;
  const dashPanel = renderDashboard();
  dashContainer.appendChild(dashPanel);

  // Manual
  const manualContainer = document.getElementById('manual-container')!;
  manualContainer.appendChild(renderManual());

  function refreshPanels() {
    (dashPanel as any)?._rebuild?.();
  }

  // QR check-in from URL
  handleCheckInFromUrl(
    () => m.getBuses(),
    (busId) => { m.updateBus(busId, 'arrived', true); m.render(); playCheckInSound(); },
  );

  m.onChange(() => {
    (qrPanel as any)?._rebuild?.();
  });

  // Collapsible sections
  makeCollapsible('map-body');
  makeCollapsible('tpl-body');
  makeCollapsible('qr-body');
  makeCollapsible('history-body');
  makeCollapsible('dash-body');
}

// Initial build
buildApp();

// Rebuild on language change
onLangChange(() => buildApp());

// ===== PWA Install Prompt =====
let deferredPrompt: any = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallBanner();
});

function showInstallBanner() {
  if (document.getElementById('install-banner')) return;
  const banner = document.createElement('div');
  banner.id = 'install-banner';
  banner.className = 'install-banner';
  banner.innerHTML = `
    <div class="install-banner-content">
      <span class="install-banner-icon">📲</span>
      <div class="install-banner-text">
        <strong>${t('install.title')}</strong>
        <span>${t('install.desc')}</span>
      </div>
      <button id="install-accept" class="btn btn-sm">${t('install.btn')}</button>
      <button id="install-dismiss" class="icon-btn install-close">✕</button>
    </div>
  `;
  document.body.appendChild(banner);
  requestAnimationFrame(() => banner.classList.add('install-banner-show'));

  document.getElementById('install-accept')?.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') {
        showToast(t('toast.installed'));
      }
      deferredPrompt = null;
    }
    banner.remove();
  });

  document.getElementById('install-dismiss')?.addEventListener('click', () => {
    banner.remove();
  });
}

// iOS install hint
if (/iPhone|iPad|iPod/.test(navigator.userAgent) && !(window.navigator as any).standalone) {
  const iosBanner = document.createElement('div');
  iosBanner.className = 'install-banner';
  iosBanner.id = 'ios-install-banner';
  iosBanner.innerHTML = `
    <div class="install-banner-content">
      <span class="install-banner-icon">🍎</span>
      <div class="install-banner-text">
        <strong>${t('install.iosTitle')}</strong>
        <span>${t('install.iosDesc')}</span>
      </div>
      <button id="ios-dismiss" class="icon-btn install-close">✕</button>
    </div>
  `;
  document.body.appendChild(iosBanner);
  requestAnimationFrame(() => iosBanner.classList.add('install-banner-show'));
  document.getElementById('ios-dismiss')?.addEventListener('click', () => iosBanner.remove());
}
