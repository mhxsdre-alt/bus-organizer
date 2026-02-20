import type { Bus } from './BusCard';
import { t } from '../utils/i18n';

export interface Template {
    id: string;
    name: string;
    dayOfWeek: string;
    buses: Bus[];
    createdAt: string;
}

const STORAGE_KEY = 'bus-organizer-templates';

export class TemplateStore {
    static getAll(): Template[] {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    static save(template: Template): void {
        const all = this.getAll();
        // Overwrite if same id exists
        const idx = all.findIndex(t => t.id === template.id);
        if (idx >= 0) {
            all[idx] = template;
        } else {
            all.push(template);
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    }

    static remove(id: string): void {
        const all = this.getAll().filter(t => t.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    }
}

const DAYS_KEYS = ['day.allDays', 'day.sunday', 'day.monday', 'day.tuesday', 'day.wednesday', 'day.thursday', 'day.friday', 'day.saturday'];

export function renderTemplatePanel(
    onLoad: (buses: Bus[]) => void,
    getCurrentBuses: () => Bus[],
): HTMLDivElement {
    const panel = document.createElement('div');
    panel.className = 'template-panel';
    panel.id = 'template-panel';

    rebuild();

    function rebuild() {
        const templates = TemplateStore.getAll();

        panel.innerHTML = `
      <h2 class="section-title">${t('tpl.title')}</h2>
      <div class="template-actions">
        <button id="save-template-btn" class="btn btn-sm">${t('tpl.save')}</button>
      </div>
      <div id="save-form" class="save-form hidden">
        <input id="tpl-name" type="text" class="tpl-input" placeholder="${t('tpl.namePlace')}">
        <select id="tpl-day" class="tpl-select">
          <option value="">${t('tpl.anyDay')}</option>
          ${DAYS_KEYS.map(k => `<option value="${t(k)}">${t(k)}</option>`).join('')}
        </select>
        <div class="save-form-actions">
          <button id="confirm-save-btn" class="btn btn-sm">${t('tpl.save.btn')}</button>
          <button id="cancel-save-btn" class="btn btn-sm btn-secondary">${t('tpl.cancel')}</button>
        </div>
      </div>
      <div class="template-list" id="template-list">
        ${templates.length === 0 ? `<p class="template-empty">${t('tpl.empty')}</p>` : ''}
        ${groupByDay(templates)}
      </div>
    `;

        // Wire save button
        panel.querySelector('#save-template-btn')?.addEventListener('click', () => {
            panel.querySelector('#save-form')?.classList.remove('hidden');
        });

        panel.querySelector('#cancel-save-btn')?.addEventListener('click', () => {
            panel.querySelector('#save-form')?.classList.add('hidden');
        });

        panel.querySelector('#confirm-save-btn')?.addEventListener('click', () => {
            const nameInput = panel.querySelector('#tpl-name') as HTMLInputElement;
            const daySelect = panel.querySelector('#tpl-day') as HTMLSelectElement;
            const name = nameInput.value.trim();
            if (!name) {
                nameInput.style.borderColor = '#ef4444';
                return;
            }

            const buses = getCurrentBuses();
            // Strip arrived status when saving template
            const cleanBuses = buses.map(b => ({
                ...b,
                id: crypto.randomUUID(), // Fresh IDs for template
                arrived: false,
            }));

            const template: Template = {
                id: crypto.randomUUID(),
                name,
                dayOfWeek: daySelect.value,
                buses: cleanBuses,
                createdAt: new Date().toISOString(),
            };

            TemplateStore.save(template);
            rebuild();
        });

        // Wire load/delete buttons via delegation
        panel.querySelector('#template-list')?.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;

            const loadBtn = target.closest('.tpl-load-btn') as HTMLElement | null;
            if (loadBtn) {
                const id = loadBtn.dataset.id!;
                const template = TemplateStore.getAll().find(t => t.id === id);
                if (template) {
                    // Give fresh IDs and reset arrival
                    const freshBuses = template.buses.map(b => ({
                        ...b,
                        id: crypto.randomUUID(),
                        arrived: false,
                    }));
                    onLoad(freshBuses);
                }
            }

            const delBtn = target.closest('.tpl-delete-btn') as HTMLElement | null;
            if (delBtn) {
                const id = delBtn.dataset.id!;
                TemplateStore.remove(id);
                rebuild();
            }
        });
    }

    return panel;
}

function groupByDay(templates: Template[]): string {
    // Group by day
    const groups: Record<string, Template[]> = {};
    templates.forEach(tpl => {
        const key = tpl.dayOfWeek || t('tpl.anyDay');
        if (!groups[key]) groups[key] = [];
        groups[key].push(tpl);
    });

    let html = '';
    for (const [day, tpls] of Object.entries(groups)) {
        html += `<div class="tpl-group">`;
        html += `<div class="tpl-day-label">${day}</div>`;
        tpls.forEach(tpl => {
            const busCount = tpl.buses.length;
            html += `
        <div class="tpl-item">
          <div class="tpl-info">
            <span class="tpl-item-name">${escapeHtml(tpl.name)}</span>
            <span class="tpl-item-count">${busCount} ${busCount !== 1 ? t('tpl.buses') : t('tpl.bus')}</span>
          </div>
          <div class="tpl-item-actions">
            <button class="tpl-load-btn" data-id="${tpl.id}" title="Load">${t('tpl.load')}</button>
            <button class="tpl-delete-btn" data-id="${tpl.id}" title="Delete">✕</button>
          </div>
        </div>
      `;
        });
        html += `</div>`;
    }
    return html;
}

function escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
