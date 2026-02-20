import type { Bus } from './BusCard';
import { getRouteColor } from '../utils/colors';
import { t } from '../utils/i18n';

const PLATFORM_COUNT = 9;
const CAPACITY_WARN = 4;
const CAPACITY_DANGER = 6;

type OnMoveBus = (busId: string, newPlatform: number, newPosition: number) => void;

export function renderParkingMap(buses: Bus[], onMoveBus: OnMoveBus): HTMLDivElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'parking-map-wrapper';
    wrapper.id = 'parking-map';

    wrapper.innerHTML = `
    <h2 class="section-title">${t('map.title')}</h2>
    <p class="map-hint">${t('map.hint')}</p>
  `;

    const grid = document.createElement('div');
    grid.className = 'parking-grid';

    const platforms: Map<number, Bus[]> = new Map();
    for (let i = 1; i <= PLATFORM_COUNT; i++) {
        platforms.set(i, []);
    }

    buses.forEach(bus => {
        const num = parseInt(bus.platformNumber, 10);
        if (num >= 1 && num <= PLATFORM_COUNT) {
            platforms.get(num)!.push(bus);
        }
    });

    for (let i = 1; i <= PLATFORM_COUNT; i++) {
        const col = document.createElement('div');
        col.className = 'platform-column';
        col.dataset.platform = String(i);

        const busesInPlatform = platforms.get(i)!;
        const count = busesInPlatform.length;

        // Header with capacity warning
        const header = document.createElement('div');
        header.className = 'platform-header';
        if (count >= CAPACITY_DANGER) {
            header.classList.add('platform-danger');
        } else if (count >= CAPACITY_WARN) {
            header.classList.add('platform-warn');
        }
        header.innerHTML = `P${i} <span class="platform-count">${count > 0 ? count : ''}</span>`;
        col.appendChild(header);

        const slots = document.createElement('div');
        slots.className = 'platform-slots';
        slots.dataset.platform = String(i);

        if (count >= CAPACITY_DANGER) {
            slots.classList.add('slots-danger');
        } else if (count >= CAPACITY_WARN) {
            slots.classList.add('slots-warn');
        }

        // Drop events
        slots.addEventListener('dragover', (e) => {
            e.preventDefault();
            slots.classList.add('drop-target');
        });
        slots.addEventListener('dragleave', () => {
            slots.classList.remove('drop-target');
        });
        slots.addEventListener('drop', (e) => {
            e.preventDefault();
            slots.classList.remove('drop-target');
            const busId = e.dataTransfer?.getData('text/plain');
            if (!busId) return;
            const children = Array.from(slots.querySelectorAll('.bus-slot'));
            let insertIdx = children.length;
            for (let ci = 0; ci < children.length; ci++) {
                const rect = children[ci].getBoundingClientRect();
                if (e.clientY < rect.top + rect.height / 2) { insertIdx = ci; break; }
            }
            onMoveBus(busId, i, insertIdx);
        });

        if (count === 0) {
            const empty = document.createElement('div');
            empty.className = 'platform-empty';
            empty.textContent = '—';
            slots.appendChild(empty);
        } else {
            busesInPlatform.forEach((bus, idx) => {
                const slot = document.createElement('div');
                slot.className = 'bus-slot' + (bus.arrived ? ' bus-slot-arrived' : '');
                slot.draggable = true;
                slot.dataset.busId = bus.id;

                const routeColor = getRouteColor(bus.lineNumber);
                slot.style.borderLeftColor = routeColor;
                slot.style.borderLeftWidth = '3px';

                slot.innerHTML = `
          <span class="bus-slot-line">${bus.lineNumber || '?'}</span>
          <span class="bus-slot-dest">${bus.destination || '—'}</span>
          <span class="bus-slot-pos">#${idx + 1}</span>
        `;

                slot.addEventListener('dragstart', (e) => {
                    e.dataTransfer?.setData('text/plain', bus.id);
                    slot.classList.add('dragging');
                    setTimeout(() => slot.style.opacity = '0.4', 0);
                });
                slot.addEventListener('dragend', () => {
                    slot.classList.remove('dragging');
                    slot.style.opacity = '1';
                });

                // Touch drag
                let touchClone: HTMLElement | null = null;

                slot.addEventListener('touchstart', (e) => {
                    const touch = e.touches[0];
                    touchClone = slot.cloneNode(true) as HTMLElement;
                    touchClone.classList.add('touch-ghost');
                    touchClone.style.width = slot.offsetWidth + 'px';
                    document.body.appendChild(touchClone);
                    positionGhost(touchClone, touch.clientX, touch.clientY);
                    slot.style.opacity = '0.3';
                }, { passive: true });

                slot.addEventListener('touchmove', (e) => {
                    e.preventDefault();
                    if (!touchClone) return;
                    const touch = e.touches[0];
                    positionGhost(touchClone, touch.clientX, touch.clientY);
                    document.querySelectorAll('.platform-slots').forEach(s => s.classList.remove('drop-target'));
                    const el = document.elementFromPoint(touch.clientX, touch.clientY);
                    const targetSlots = el?.closest('.platform-slots') as HTMLElement | null;
                    if (targetSlots) targetSlots.classList.add('drop-target');
                }, { passive: false });

                slot.addEventListener('touchend', (e) => {
                    if (touchClone) { touchClone.remove(); touchClone = null; }
                    slot.style.opacity = '1';
                    document.querySelectorAll('.platform-slots').forEach(s => s.classList.remove('drop-target'));
                    const touch = e.changedTouches[0];
                    const el = document.elementFromPoint(touch.clientX, touch.clientY);
                    const targetSlots = el?.closest('.platform-slots') as HTMLElement | null;
                    if (!targetSlots) return;
                    const targetPlatform = parseInt(targetSlots.dataset.platform || '0', 10);
                    if (targetPlatform < 1 || targetPlatform > PLATFORM_COUNT) return;
                    const children = Array.from(targetSlots.querySelectorAll('.bus-slot'));
                    let insertIdx = children.length;
                    for (let ci = 0; ci < children.length; ci++) {
                        const rect = children[ci].getBoundingClientRect();
                        if (touch.clientY < rect.top + rect.height / 2) { insertIdx = ci; break; }
                    }
                    onMoveBus(bus.id, targetPlatform, insertIdx);
                });

                slots.appendChild(slot);
            });
        }

        col.appendChild(slots);
        grid.appendChild(col);
    }

    wrapper.appendChild(grid);
    return wrapper;
}

function positionGhost(el: HTMLElement, x: number, y: number) {
    el.style.left = (x - el.offsetWidth / 2) + 'px';
    el.style.top = (y - el.offsetHeight / 2) + 'px';
}
