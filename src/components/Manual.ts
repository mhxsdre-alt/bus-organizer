import { t } from '../utils/i18n';

export function renderManual(): HTMLDivElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'manual-panel';

  wrapper.innerHTML = `
    <h2 class="section-title">${t('manual.title')}</h2>

    <div class="manual-section install-highlight">
      <h3 class="manual-heading">${t('manual.installTitle')}</h3>
      <p class="manual-intro">${t('manual.installIntro')}</p>

      <div class="install-platform">
        <div class="install-card">
          <div class="install-icon">🤖</div>
          <h4>${t('manual.android')}</h4>
          <ol class="manual-list">${t('manual.androidSteps')}</ol>
        </div>
        <div class="install-card">
          <div class="install-icon">🍎</div>
          <h4>${t('manual.ios')}</h4>
          <ol class="manual-list">${t('manual.iosSteps')}</ol>
        </div>
        <div class="install-card">
          <div class="install-icon">💻</div>
          <h4>${t('manual.pc')}</h4>
          <ol class="manual-list">${t('manual.pcSteps')}</ol>
        </div>
      </div>
      <div class="install-note">${t('manual.installTip')}</div>
    </div>

    <div class="manual-section">
      <h3 class="manual-heading">${t('manual.gettingStarted')}</h3>
      <ol class="manual-list">${t('manual.gettingStartedList')}</ol>
    </div>
    <div class="manual-section">
      <h3 class="manual-heading">${t('manual.arrival')}</h3>
      <ul class="manual-list">${t('manual.arrivalList')}</ul>
    </div>
    <div class="manual-section">
      <h3 class="manual-heading">${t('manual.map')}</h3>
      <ul class="manual-list">${t('manual.mapList')}</ul>
    </div>
    <div class="manual-section">
      <h3 class="manual-heading">${t('manual.templates')}</h3>
      <ul class="manual-list">${t('manual.templatesList')}</ul>
    </div>
    <div class="manual-section">
      <h3 class="manual-heading">${t('manual.reports')}</h3>
      <ul class="manual-list">${t('manual.reportsList')}</ul>
    </div>
    <div class="manual-section">
      <h3 class="manual-heading">${t('manual.analytics')}</h3>
      <ul class="manual-list">${t('manual.analyticsList')}</ul>
    </div>
    <div class="manual-section">
      <h3 class="manual-heading">${t('manual.smart')}</h3>
      <ul class="manual-list">${t('manual.smartList')}</ul>
    </div>
    <div class="manual-section">
      <h3 class="manual-heading">${t('manual.quickRef')}</h3>
      <ul class="manual-list">${t('manual.quickRefList')}</ul>
    </div>
  `;

  return wrapper;
}
