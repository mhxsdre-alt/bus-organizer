/**
 * IndexedDB storage wrapper for Bus Organizer.
 * Provides a simple key-value API on top of IndexedDB,
 * with automatic migration from localStorage on first use.
 */

const DB_NAME = 'bus-organizer-db';
const DB_VERSION = 1;
const STORE_NAME = 'appdata';

// Legacy localStorage keys to migrate
const LEGACY_KEYS = [
    'bus-organizer-session',
    'bus-organizer-templates',
    'bus-organizer-logs',
];

let db: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
            const database = req.result;
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME);
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

/** Read a value from IndexedDB */
export function dbGet<T>(key: string): Promise<T | null> {
    return new Promise((resolve, reject) => {
        if (!db) { resolve(null); return; }
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => reject(req.error);
    });
}

/** Write a value to IndexedDB */
export function dbSet<T>(key: string, value: T): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!db) { resolve(); return; }
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(value, key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

/** Delete a key from IndexedDB */
export function dbDelete(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!db) { resolve(); return; }
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

/** Clear all data from IndexedDB and localStorage app keys */
export async function dbClearAll(): Promise<void> {
    if (db) {
        await new Promise<void>((resolve, reject) => {
            const tx = db!.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const req = store.clear();
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    }
    // Also clear localStorage app keys
    LEGACY_KEYS.forEach(k => localStorage.removeItem(k));
    // Clear UI preferences too
    localStorage.removeItem('bus-theme');
    localStorage.removeItem('bus-lang');
    ['map-body', 'tpl-body', 'qr-body', 'history-body', 'dash-body'].forEach(id => {
        localStorage.removeItem(`collapse-${id}`);
    });
}

/** Get all data as a plain object (for backup) */
export async function dbGetAll(): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
        if (!db) { resolve({}); return; }
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const result: Record<string, unknown> = {};
        const req = store.openCursor();
        req.onsuccess = () => {
            const cursor = req.result;
            if (cursor) {
                result[cursor.key as string] = cursor.value;
                cursor.continue();
            } else {
                resolve(result);
            }
        };
        req.onerror = () => reject(req.error);
    });
}

/**
 * Initialize the database and migrate any existing localStorage data.
 * Call this once before the app starts.
 */
export async function initStorage(): Promise<void> {
    try {
        db = await openDB();
    } catch {
        // IndexedDB unavailable (e.g. private browsing on old Safari)
        // App will fall back to reading/writing nothing — localStorage
        // data already in components still works as a last resort.
        console.warn('IndexedDB unavailable, storage features may be limited.');
        return;
    }

    // Auto-migrate from localStorage if data exists there but not in IDB
    for (const key of LEGACY_KEYS) {
        const existing = await dbGet(key);
        if (existing == null) {
            const raw = localStorage.getItem(key);
            if (raw) {
                try {
                    const parsed = JSON.parse(raw);
                    await dbSet(key, parsed);
                    localStorage.removeItem(key); // Clean up after migration
                } catch { /* ignore corrupt data */ }
            }
        }
    }
}
