import type { Bus } from './BusCard';
import { getRouteColor } from '../utils/colors';
import { t } from '../utils/i18n';
import { getSuggestionsForLine } from '../utils/smartAnalytics';

export type SortField = 'lineNumber' | 'plateNumber' | 'platformNumber' | 'destination' | 'arrived';
export type SortDir = 'asc' | 'desc';

export function renderBusTable(
  buses: Bus[],
  sortField: SortField,
  sortDir: SortDir,
  onSort: (field: SortField) => void,
  onUpdate: (id: string, field: keyof Bus, value: string | boolean) => void,
  onDelete: (id: string) => void,
): HTMLDivElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'table-wrapper';

  if (buses.length === 0) {
    wrapper.innerHTML = `<p class="empty-state">${t('table.empty')}</p>`;
    return wrapper;
  }

  const arrow = (field: SortField) => {
    if (sortField !== field) return '<span class="sort-icon">⇅</span>';
    return sortDir === 'asc'
      ? '<span class="sort-icon active">↑</span>'
      : '<span class="sort-icon active">↓</span>';
  };

  const table = document.createElement('table');
  table.className = 'bus-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th style="width:8px"></th>
        <th class="sortable" data-sort="lineNumber">${t('col.line')} ${arrow('lineNumber')}</th>
        <th class="sortable" data-sort="plateNumber">${t('col.plate')} ${arrow('plateNumber')}</th>
        <th class="sortable" data-sort="platformNumber">${t('col.platform')} ${arrow('platformNumber')}</th>
        <th class="sortable" data-sort="destination">${t('col.destination')} ${arrow('destination')}</th>
        <th>${t('col.notes')}</th>
        <th class="sortable" data-sort="arrived">${t('col.arrived')} ${arrow('arrived')}</th>
        <th>${t('col.actions')}</th>
      </tr>
    </thead>
  `;

  const tbody = document.createElement('tbody');

  buses.forEach(bus => {
    const tr = document.createElement('tr');
    tr.className = bus.arrived ? 'row-arrived' : '';
    tr.id = `row-${bus.id}`;

    // Route color indicator
    const tdColor = document.createElement('td');
    tdColor.className = 'td-color';
    const color = getRouteColor(bus.lineNumber);
    tdColor.innerHTML = `<div class="route-dot" style="background:${color}"></div>`;
    tr.appendChild(tdColor);

    // Line
    const tdLine = document.createElement('td');
    tdLine.innerHTML = `<input type="number" class="cell-input" value="${bus.lineNumber}" data-id="${bus.id}" data-field="lineNumber" placeholder="—">`;
    tr.appendChild(tdLine);

    // Plate
    const tdPlate = document.createElement('td');
    tdPlate.innerHTML = `<input type="text" class="cell-input" value="${bus.plateNumber}" data-id="${bus.id}" data-field="plateNumber" placeholder="—">`;
    tr.appendChild(tdPlate);

    // Platform
    const tdPlatform = document.createElement('td');
    tdPlatform.innerHTML = `<input type="number" class="cell-input cell-narrow" value="${bus.platformNumber}" data-id="${bus.id}" data-field="platformNumber" placeholder="1-9" min="1" max="9">`;
    tr.appendChild(tdPlatform);

    // Destination
    const tdDest = document.createElement('td');
    tdDest.innerHTML = `<input type="text" class="cell-input" value="${bus.destination}" data-id="${bus.id}" data-field="destination" placeholder="—">`;
    tr.appendChild(tdDest);

    // Notes
    const tdNotes = document.createElement('td');
    tdNotes.innerHTML = `<input type="text" class="cell-input cell-notes" value="${bus.notes || ''}" data-id="${bus.id}" data-field="notes" placeholder="${t('notes.placeholder')}">`;
    tr.appendChild(tdNotes);

    // Arrived
    const tdArrived = document.createElement('td');
    tdArrived.className = 'td-center';
    tdArrived.innerHTML = `
      <label class="table-toggle">
        <input type="checkbox" class="arrival-cb" data-id="${bus.id}" ${bus.arrived ? 'checked' : ''}>
        <span class="table-toggle-slider"></span>
      </label>
    `;
    tr.appendChild(tdArrived);

    // Delete
    const tdActions = document.createElement('td');
    tdActions.className = 'td-center';
    tdActions.innerHTML = `
      <button class="table-delete-btn" data-id="${bus.id}" title="Remove">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      </button>
    `;
    tr.appendChild(tdActions);

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  wrapper.appendChild(table);

  // Event delegation
  wrapper.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    if (target.classList.contains('cell-input')) {
      const id = target.dataset.id!;
      const field = target.dataset.field as keyof Bus;
      onUpdate(id, field, target.value);

      // Auto-fill suggestion when line number changes
      if (field === 'lineNumber' && target.value.trim()) {
        const suggestion = getSuggestionsForLine(target.value.trim(), buses);
        const row = target.closest('tr');
        // Remove any existing suggestion chip
        document.querySelector('.suggestion-chip')?.remove();

        if (suggestion && (suggestion.platform || suggestion.destination)) {
          const chip = document.createElement('div');
          chip.className = 'suggestion-chip';
          const parts: string[] = [];
          if (suggestion.platform) parts.push(`${t('col.platform')}: ${suggestion.platform}`);
          if (suggestion.destination) parts.push(`${t('col.destination')}: ${suggestion.destination}`);
          chip.innerHTML = `<span class="chip-text">💡 ${parts.join(' · ')}</span><button class="chip-apply" title="${t('smart.suggestApply')}">${t('smart.suggestApply')}</button>`;
          chip.querySelector('.chip-apply')?.addEventListener('click', () => {
            if (suggestion.platform) {
              const platInput = row?.querySelector('[data-field="platformNumber"]') as HTMLInputElement;
              if (platInput && !platInput.value) { platInput.value = suggestion.platform; onUpdate(id, 'platformNumber', suggestion.platform); }
            }
            if (suggestion.destination) {
              const destInput = row?.querySelector('[data-field="destination"]') as HTMLInputElement;
              if (destInput && !destInput.value) { destInput.value = suggestion.destination; onUpdate(id, 'destination', suggestion.destination); }
            }
            chip.remove();
          });
          // Position below the input, attached to body so it's never clipped
          document.body.appendChild(chip);
          const rect = target.getBoundingClientRect();
          chip.style.top = `${rect.bottom + window.scrollY + 4}px`;
          chip.style.left = `${rect.left + window.scrollX}px`;
          // Auto-dismiss after 8s
          setTimeout(() => chip.remove(), 8000);
        }
      }
    }
  });

  wrapper.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    if (target.classList.contains('arrival-cb')) {
      const id = target.dataset.id!;
      onUpdate(id, 'arrived', target.checked);
      const row = target.closest('tr');
      row?.classList.toggle('row-arrived', target.checked);
    }
  });

  wrapper.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    const th = target.closest('.sortable') as HTMLElement;
    if (th) {
      onSort(th.dataset.sort as SortField);
      return;
    }

    const btn = target.closest('.table-delete-btn') as HTMLElement;
    if (btn) {
      const id = btn.dataset.id!;
      const row = document.getElementById(`row-${id}`);
      if (row) {
        row.style.opacity = '0';
        row.style.transform = 'translateX(20px)';
        setTimeout(() => onDelete(id), 250);
      }
    }
  });

  return wrapper;
}
