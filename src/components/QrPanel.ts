import type { Bus } from './BusCard';
import QRCode from 'qrcode';
import { t } from '../utils/i18n';

export function renderQrPanel(
    getBuses: () => Bus[],
    _onCheckIn: (busId: string) => void,
): HTMLDivElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'qr-panel';

    rebuild();

    async function rebuild() {
        const buses = getBuses().filter(b => b.lineNumber);

        wrapper.innerHTML = `
      <p class="map-hint">${t('qr.hint')}</p>
      ${buses.length === 0 ? `<p class="template-empty">${t('qr.empty')}</p>` : ''}
      <div class="qr-grid" id="qr-grid"></div>
      <button class="btn btn-sm btn-secondary" id="print-qr-btn" style="margin-top:1rem;${buses.length === 0 ? 'display:none' : ''}">${t('qr.print')}</button>
    `;

        const grid = wrapper.querySelector('#qr-grid')!;

        for (const bus of buses) {
            const card = document.createElement('div');
            card.className = 'qr-card' + (bus.arrived ? ' qr-arrived' : '');

            const url = `${window.location.origin}${window.location.pathname}?checkin=${bus.id}`;
            try {
                const dataUrl = await QRCode.toDataURL(url, {
                    width: 120,
                    margin: 1,
                    color: { dark: '#101720', light: '#ffffff' },
                });
                card.innerHTML = `
          <img src="${dataUrl}" alt="QR" class="qr-img">
          <div class="qr-label">${t('col.line')} ${bus.lineNumber}</div>
          <div class="qr-sub">${bus.plateNumber || '—'} → ${bus.destination || '—'}</div>
          ${bus.arrived ? `<div class="qr-status">${t('qr.arrived')}</div>` : ''}
        `;
            } catch {
                card.innerHTML = `<div class="qr-label">${t('col.line')} ${bus.lineNumber}</div><div class="qr-sub">QR error</div>`;
            }

            grid.appendChild(card);
        }

        wrapper.querySelector('#print-qr-btn')?.addEventListener('click', () => {
            const printWin = window.open('', '_blank');
            if (!printWin) return;
            printWin.document.write(`
        <html><head><title>Bus QR Codes</title>
        <style>
          body { font-family: sans-serif; display: flex; flex-wrap: wrap; gap: 16px; padding: 16px; }
          .qr-card { border: 1px solid #ccc; border-radius: 8px; padding: 12px; text-align: center; width: 160px; }
          .qr-img { width: 120px; height: 120px; }
          .qr-label { font-weight: bold; margin-top: 6px; }
          .qr-sub { font-size: 12px; color: #666; }
        </style></head><body>
        ${grid.innerHTML}
        </body></html>
      `);
            printWin.document.close();
            printWin.focus();
            printWin.print();
        });
    }

    // Expose rebuild
    (wrapper as any)._rebuild = rebuild;
    return wrapper;
}

// Check URL for checkin param on load
export function handleCheckInFromUrl(
    getBuses: () => Bus[],
    onCheckIn: (busId: string) => void,
) {
    const params = new URLSearchParams(window.location.search);
    const busId = params.get('checkin');
    if (!busId) return;

    // Clean URL
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, '', cleanUrl);

    // Mark arrived
    const bus = getBuses().find(b => b.id === busId);
    if (bus) {
        onCheckIn(busId);
        showToast(`✓ ${t('col.line')} ${bus.lineNumber || busId} ${t('toast.checkedIn')}`);
    } else {
        showToast(t('toast.busNotFound'));
    }
}

function showToast(message: string) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('toast-show'));
    setTimeout(() => {
        toast.classList.remove('toast-show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
