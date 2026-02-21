import type { Bus } from './BusCard';
import { type SortField, type SortDir, renderBusTable } from './BusTable';
import { renderParkingMap } from './ParkingMap';
import { generatePdfReport } from './PdfReport';
import { dbGet, dbSet } from '../utils/storage';

const SESSION_KEY = 'bus-organizer-session';

export class BusManager {
    private buses: Bus[] = [];
    private undoStack: Bus[] = [];
    private listContainer: HTMLDivElement;
    private mapContainer: HTMLDivElement;
    private sortField: SortField = 'lineNumber';
    private sortDir: SortDir = 'asc';
    private searchQuery: string = '';
    private onChangeCallbacks: (() => void)[] = [];

    constructor(listContainerId: string, mapContainerId: string) {
        const el = document.getElementById(listContainerId);
        if (!el) throw new Error(`Container with id ${listContainerId} not found`);
        this.listContainer = el as HTMLDivElement;

        const mapEl = document.getElementById(mapContainerId);
        if (!mapEl) throw new Error(`Map container with id ${mapContainerId} not found`);
        this.mapContainer = mapEl as HTMLDivElement;

        this.render();
    }

    /** Initialize from IndexedDB. Call once after constructor. */
    async initFromDB() {
        await this.restoreSession();
        this.render();
    }

    onChange(cb: () => void) {
        this.onChangeCallbacks.push(cb);
    }

    rebind(listContainerId: string, mapContainerId: string) {
        const el = document.getElementById(listContainerId);
        if (el) this.listContainer = el as HTMLDivElement;
        const mapEl = document.getElementById(mapContainerId);
        if (mapEl) this.mapContainer = mapEl as HTMLDivElement;
        this.onChangeCallbacks = [];
        this.render();
    }

    private notifyChange() {
        this.onChangeCallbacks.forEach(cb => cb());
    }

    getBuses(): Bus[] {
        return [...this.buses];
    }

    loadBuses(buses: Bus[]) {
        this.buses = buses.map(b => ({ ...b, notes: b.notes || '' }));
        this.saveSession();
        this.render();
    }

    addBus() {
        const newBus: Bus = {
            id: crypto.randomUUID(),
            lineNumber: '',
            plateNumber: '',
            platformNumber: '',
            destination: '',
            arrived: false,
            notes: '',
        };
        this.buses.push(newBus);
        this.saveSession();
        this.render();
    }

    removeBus(id: string) {
        const bus = this.buses.find(b => b.id === id);
        if (bus) this.undoStack.push({ ...bus });
        this.buses = this.buses.filter(b => b.id !== id);
        this.saveSession();
        this.render();
        this.notifyChange();
    }

    undoDelete(): boolean {
        const bus = this.undoStack.pop();
        if (!bus) return false;
        this.buses.push(bus);
        this.saveSession();
        this.render();
        return true;
    }

    get hasUndo(): boolean {
        return this.undoStack.length > 0;
    }

    updateBus(id: string, field: keyof Bus, value: string | boolean) {
        const bus = this.buses.find(b => b.id === id);
        if (bus) {
            (bus as any)[field] = value;
            this.saveSession();
            if (field === 'platformNumber' || field === 'lineNumber' || field === 'destination' || field === 'arrived') {
                this.renderMap();
            }
        }
    }

    moveBus(busId: string, newPlatform: number, newPosition: number) {
        const bus = this.buses.find(b => b.id === busId);
        if (!bus) return;

        bus.platformNumber = String(newPlatform);
        this.buses = this.buses.filter(b => b.id !== busId);

        const targetPlatformBuses = this.buses.filter(
            b => parseInt(b.platformNumber, 10) === newPlatform
        );

        if (newPosition >= targetPlatformBuses.length) {
            if (targetPlatformBuses.length > 0) {
                const lastBus = targetPlatformBuses[targetPlatformBuses.length - 1];
                const lastIdx = this.buses.indexOf(lastBus);
                this.buses.splice(lastIdx + 1, 0, bus);
            } else {
                this.buses.push(bus);
            }
        } else {
            const targetBus = targetPlatformBuses[newPosition];
            const targetIdx = this.buses.indexOf(targetBus);
            this.buses.splice(targetIdx, 0, bus);
        }

        this.saveSession();
        this.render();
    }

    // Bulk actions
    markAllArrived() {
        this.buses.forEach(b => b.arrived = true);
        this.saveSession();
        this.render();
    }

    clearAllArrivals() {
        this.buses.forEach(b => b.arrived = false);
        this.saveSession();
        this.render();
    }

    setSearch(query: string) {
        this.searchQuery = query.toLowerCase();
        this.render();
    }

    toggleSort(field: SortField) {
        if (this.sortField === field) {
            this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortDir = 'asc';
        }
        this.render();
    }

    private getFilteredBuses(): Bus[] {
        if (!this.searchQuery) return this.buses;
        return this.buses.filter(b =>
            b.lineNumber.toLowerCase().includes(this.searchQuery) ||
            b.plateNumber.toLowerCase().includes(this.searchQuery) ||
            b.destination.toLowerCase().includes(this.searchQuery) ||
            b.platformNumber.toLowerCase().includes(this.searchQuery) ||
            b.notes.toLowerCase().includes(this.searchQuery)
        );
    }

    private getSortedBuses(): Bus[] {
        const filtered = this.getFilteredBuses();
        const sorted = [...filtered];
        sorted.sort((a, b) => {
            let aVal: string | boolean = a[this.sortField];
            let bVal: string | boolean = b[this.sortField];

            if (this.sortField === 'arrived') {
                return this.sortDir === 'asc'
                    ? (aVal === bVal ? 0 : aVal ? 1 : -1)
                    : (aVal === bVal ? 0 : aVal ? -1 : 1);
            }

            aVal = (aVal as string).toLowerCase();
            bVal = (bVal as string).toLowerCase();

            const aNum = parseFloat(aVal);
            const bNum = parseFloat(bVal);
            if (!isNaN(aNum) && !isNaN(bNum)) {
                return this.sortDir === 'asc' ? aNum - bNum : bNum - aNum;
            }

            const cmp = aVal.localeCompare(bVal);
            return this.sortDir === 'asc' ? cmp : -cmp;
        });
        return sorted;
    }

    async downloadReport() {
        await generatePdfReport(this.buses);
    }

    // Export/Import for sharing
    exportJSON(): string {
        return JSON.stringify({ buses: this.buses, exportedAt: new Date().toISOString() }, null, 2);
    }

    importJSON(json: string) {
        try {
            const data = JSON.parse(json);
            if (data.buses && Array.isArray(data.buses)) {
                this.loadBuses(data.buses);
            }
        } catch { /* ignore bad JSON */ }
    }

    // Auto-save to IndexedDB (fire-and-forget)
    private saveSession() {
        dbSet(SESSION_KEY, this.buses).catch(() => { /* quota full */ });
    }

    private async restoreSession() {
        try {
            const parsed = await dbGet<Bus[]>(SESSION_KEY);
            if (parsed && Array.isArray(parsed)) {
                this.buses = parsed.map(b => ({ ...b, notes: b.notes || '' }));
            }
        } catch { /* corrupt data */ }
    }

    render() {
        this.listContainer.innerHTML = '';
        const table = renderBusTable(
            this.getSortedBuses(),
            this.sortField,
            this.sortDir,
            (field) => this.toggleSort(field),
            (id, field, value) => this.updateBus(id, field, value),
            (id) => this.removeBus(id),
        );
        this.listContainer.appendChild(table);

        this.renderMap();
        this.notifyChange();
    }

    private renderMap() {
        this.mapContainer.innerHTML = '';
        const map = renderParkingMap(this.buses, (busId, newPlatform, newPos) => {
            this.moveBus(busId, newPlatform, newPos);
        });
        this.mapContainer.appendChild(map);
    }
}
