import { t, getLang } from '../utils/i18n';
import { dbGet, dbSet } from '../utils/storage';

export interface Complaint {
  id: string;
  date: string;
  lineNumber: string;
  plateNumber: string;
  driverDescription: string;
  complaintType: string;
  details: string;
  photo?: string; // base64 data URL (JPEG, resized)
}

const STORAGE_KEY = 'bus-organizer-complaints';

export async function getAllComplaints(): Promise<Complaint[]> {
  try {
    const data = await dbGet<Complaint[]>(STORAGE_KEY);
    return data ?? [];
  } catch { return []; }
}

export async function saveComplaint(complaint: Complaint): Promise<void> {
  const all = await getAllComplaints();
  all.unshift(complaint);
  await dbSet(STORAGE_KEY, all);
}

export async function deleteComplaint(id: string): Promise<void> {
  const all = (await getAllComplaints()).filter(c => c.id !== id);
  await dbSet(STORAGE_KEY, all);
}

/**
 * Resize an image file to max 1200px wide, JPEG quality 0.85.
 * Returns a base64 data URL.
 */
function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const MAX_W = 1200;
        const MAX_H = 1200;
        let w = img.width;
        let h = img.height;
        if (w > MAX_W) { h = Math.round(h * MAX_W / w); w = MAX_W; }
        if (h > MAX_H) { w = Math.round(w * MAX_H / h); h = MAX_H; }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const COMPLAINT_TYPES = [
  'complaint.type.rude',
  'complaint.type.unsafe',
  'complaint.type.schedule',
  'complaint.type.refusing',
  'complaint.type.other',
];

export function renderComplaintsPanel(): HTMLDivElement {
  const panel = document.createElement('div');
  panel.className = 'complaints-panel';
  panel.id = 'complaints-panel';

  let pendingPhoto: string | null = null;

  rebuild();

  async function rebuild() {
    const complaints = await getAllComplaints();
    const locale = getLang() === 'he' ? 'he-IL' : 'en-GB';
    pendingPhoto = null;

    panel.innerHTML = `
      <div class="complaint-form" id="complaint-form">
        <div class="complaint-form-grid">
          <input type="text" id="comp-line" class="cell-input" placeholder="${t('complaint.linePlaceholder')}">
          <input type="text" id="comp-plate" class="cell-input" placeholder="${t('complaint.platePlaceholder')}">
          <input type="text" id="comp-driver" class="cell-input" placeholder="${t('complaint.driverPlaceholder')}">
          <select id="comp-type" class="tpl-select">
            <option value="">${t('complaint.selectType')}</option>
            ${COMPLAINT_TYPES.map(k => `<option value="${t(k)}">${t(k)}</option>`).join('')}
          </select>
        </div>
        <textarea id="comp-details" class="cell-input complaint-textarea" rows="3" placeholder="${t('complaint.detailsPlaceholder')}"></textarea>
        <div class="complaint-photo-row">
          <label class="btn btn-sm btn-secondary complaint-photo-btn" id="comp-photo-label">
            📷 ${t('complaint.addPhoto')}
            <input type="file" id="comp-photo" accept="image/*" capture="environment" style="display:none">
          </label>
          <span class="complaint-photo-name" id="comp-photo-name"></span>
          <div class="complaint-photo-preview" id="comp-photo-preview"></div>
        </div>
        <button id="comp-submit" class="btn btn-sm" style="background:linear-gradient(135deg,#ef4444,#dc2626);margin-top:0.5rem;">${t('complaint.submit')}</button>
      </div>

      <div class="complaint-list" id="complaint-list">
        ${complaints.length === 0 ? `<p class="template-empty">${t('complaint.empty')}</p>` : ''}
        ${complaints.map(c => {
      const d = new Date(c.date);
      const dateStr = d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
      const timeStr = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
      return `
            <div class="complaint-card">
              <div class="complaint-card-header">
                <span class="complaint-card-date">${dateStr} ${timeStr}</span>
                <span class="complaint-card-type">${c.complaintType}</span>
                <button class="tpl-delete-btn comp-del-btn" data-id="${c.id}" title="Delete">✕</button>
              </div>
              <div class="complaint-card-body">
                ${c.lineNumber ? `<span class="complaint-tag">${t('col.line')}: ${c.lineNumber}</span>` : ''}
                ${c.plateNumber ? `<span class="complaint-tag">${t('col.plate')}: ${c.plateNumber}</span>` : ''}
                ${c.driverDescription ? `<span class="complaint-tag">👤 ${c.driverDescription}</span>` : ''}
              </div>
              ${c.details ? `<p class="complaint-card-details">${escapeHtml(c.details)}</p>` : ''}
              ${c.photo ? `<img class="complaint-card-photo" src="${c.photo}" alt="Complaint photo" loading="lazy">` : ''}
            </div>
          `;
    }).join('')}
      </div>
    `;

    // Photo input
    const photoInput = panel.querySelector('#comp-photo') as HTMLInputElement;
    photoInput?.addEventListener('change', async () => {
      const file = photoInput.files?.[0];
      if (!file) return;
      try {
        pendingPhoto = await resizeImage(file);
        const nameEl = panel.querySelector('#comp-photo-name') as HTMLSpanElement;
        const previewEl = panel.querySelector('#comp-photo-preview') as HTMLDivElement;
        nameEl.textContent = `✓ ${file.name}`;
        previewEl.innerHTML = `<img src="${pendingPhoto}" class="complaint-preview-img" alt="Preview">`;
      } catch {
        pendingPhoto = null;
      }
    });

    // Submit
    panel.querySelector('#comp-submit')?.addEventListener('click', async () => {
      const line = (panel.querySelector('#comp-line') as HTMLInputElement).value.trim();
      const plate = (panel.querySelector('#comp-plate') as HTMLInputElement).value.trim();
      const driver = (panel.querySelector('#comp-driver') as HTMLInputElement).value.trim();
      const type = (panel.querySelector('#comp-type') as HTMLSelectElement).value;
      const details = (panel.querySelector('#comp-details') as HTMLTextAreaElement).value.trim();

      if (!type) {
        (panel.querySelector('#comp-type') as HTMLSelectElement).style.borderColor = '#ef4444';
        return;
      }

      const complaint: Complaint = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        lineNumber: line,
        plateNumber: plate,
        driverDescription: driver,
        complaintType: type,
        details,
        photo: pendingPhoto || undefined,
      };

      await saveComplaint(complaint);
      rebuild();
    });

    // Delete
    panel.querySelectorAll('.comp-del-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = (btn as HTMLElement).dataset.id!;
        await deleteComplaint(id);
        rebuild();
      });
    });

    // Photo click to enlarge
    panel.querySelectorAll('.complaint-card-photo').forEach(img => {
      img.addEventListener('click', () => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `<img src="${(img as HTMLImageElement).src}" class="complaint-photo-fullscreen">`;
        overlay.addEventListener('click', () => {
          overlay.classList.remove('modal-visible');
          setTimeout(() => overlay.remove(), 200);
        });
        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('modal-visible'));
      });
    });
  }

  return panel;
}

function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
