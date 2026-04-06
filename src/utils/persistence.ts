/**
 * Go-Check Files Persistence Utility (IndexedDB)
 * 
 * Why IndexedDB? 
 * LocalStorage has a ~5MB limit, which is too small for multiple PDFs and high-res photos.
 * IndexedDB allows storing large amounts of binary data (Files/Blobs) directly in the browser.
 */

const DB_NAME = 'PassAI_Storage';
const STORE_NAME = 'user_files';
const DB_VERSION = 1;

interface StoredFile {
    id: string;
    file: File | Blob;
    fileName: string;
    timestamp: number;
}

const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

/**
 * Saves a file to IndexedDB
 */
export const saveFileLocal = async (id: string, file: File | Blob, fileName: string) => {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);

        const data: StoredFile = {
            id,
            file,
            fileName,
            timestamp: Date.now()
        };

        await new Promise<void>((resolve, reject) => {
            const request = store.put(data);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });

        console.log(`File ${fileName} saved to local IndexedDB`);
    } catch (error) {
        console.error('Error saving file to IndexedDB:', error);
    }
};

/**
 * Retrieves all saved files from IndexedDB
 */
export const getAllFilesLocal = async (): Promise<Record<string, { file: File | Blob, fileName: string, previewUrl: string }>> => {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);

        const results = await new Promise<StoredFile[]>((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        const filesMap: Record<string, { file: File | Blob, fileName: string, previewUrl: string }> = {};

        results.forEach(item => {
            filesMap[item.id] = {
                file: item.file,
                fileName: item.fileName,
                previewUrl: URL.createObjectURL(item.file)
            };
        });

        return filesMap;
    } catch (error) {
        console.error('Error reading files from IndexedDB:', error);
        return {};
    }
};

/**
 * Deletes a file from IndexedDB
 */
export const deleteFileLocal = async (id: string) => {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);

        await new Promise<void>((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Error deleting file from IndexedDB:', error);
    }
};

/**
 * Wipes completely the user_files store (used during logout to avoid cross-pollution)
 */
export const clearAllFilesLocal = async () => {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        
        await new Promise<void>((resolve, reject) => {
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
        console.log("IndexedDB wiped clean on logout.");
    } catch (error) {
        console.error('Error clearing IndexedDB:', error);
    }
};
