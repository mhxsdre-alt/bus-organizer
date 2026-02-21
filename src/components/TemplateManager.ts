import type { Bus } from './BusCard';
import { t } from '../utils/i18n';
import { dbGet, dbSet } from '../utils/storage';

export interface Template {
    id: string;
    name: string;
    dayOfWeek: string;
    buses: Bus[];
    createdAt: string;
}

const STORAGE_KEY = 'bus-organizer-templates';

export class TemplateStore {
    static async getAll(): Promise<Template[]> {
        try {
            const data = await dbGet<Template[]>(STORAGE_KEY);
            return data ?? [];
        } catch {
            return [];
        }
    }

    static async save(template: Template): Promise<void> {
        const all = await this.getAll();
        const idx = all.findIndex(t => t.id === template.id);
        if (idx >= 0) {
            all[idx] = template;
        } else {
            all.push(template);
        }
        await dbSet(STORAGE_KEY, all);
    }

    static async remove(id: string): Promise<void> {
        const all = (await this.getAll()).filter(t => t.id !== id);
        await dbSet(STORAGE_KEY, all);
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

    async function rebuild() {
        const templates = await TemplateStore.getAll();

        panel.innerHTML = `
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

        panel.querySelector('#confirm-save-btn')?.addEventListener('click', async () => {
            const nameInput = panel.querySelector('#tpl-name') as HTMLInputElement;
            const daySelect = panel.querySelector('#tpl-day') as HTMLSelectElement;
            const name = nameInput.value.trim();
            if (!name) {
                nameInput.style.borderColor = '#ef4444';
                return;
            }

            const buses = getCurrentBuses();
            const cleanBuses = buses.map(b => ({
                ...b,
                id: crypto.randomUUID(),
                arrived: false,
            }));

            const template: Template = {
                id: crypto.randomUUID(),
                name,
                dayOfWeek: daySelect.value,
                buses: cleanBuses,
                createdAt: new Date().toISOString(),
            };

            await TemplateStore.save(template);
            rebuild();
        });

        // Wire load/delete buttons via delegation
        panel.querySelector('#template-list')?.addEventListener('click', async (e) => {
            const target = e.target as HTMLElement;

            const loadBtn = target.closest('.tpl-load-btn') as HTMLElement | null;
            if (loadBtn) {
                const id = loadBtn.dataset.id!;
                const allTemplates = await TemplateStore.getAll();
                const template = allTemplates.find(t => t.id === id);
                if (template) {
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
                await TemplateStore.remove(id);
                rebuild();
            }
        });
    }

    return panel;
}

function groupByDay(templates: Template[]): string {
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
