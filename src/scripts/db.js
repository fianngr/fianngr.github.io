const DB_NAME = 'story-app';
const DB_VERSION = 3;
const STORE_SUBMIT = 'offline-submissions';
const STORE_DETAIL = 'story-details';

const dbPromise = indexedDB.open(DB_NAME, DB_VERSION);

dbPromise.onupgradeneeded = function (event) {
  const db = event.target.result;

  if (db.objectStoreNames.contains(STORE_SUBMIT)) {
    db.deleteObjectStore(STORE_SUBMIT);
  }
  db.createObjectStore(STORE_SUBMIT, { autoIncrement: true });

  if (!db.objectStoreNames.contains(STORE_DETAIL)) {
    db.createObjectStore(STORE_DETAIL, { keyPath: 'id' });
  }
};

// ===== Offline Submissions =====

export function saveStoryOffline(story) {
  if (!story.description || !story.photo || !story.lat || !story.lon) {
    console.warn('Story tidak valid, tidak disimpan:', story);
    return Promise.resolve(); 
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(STORE_SUBMIT, 'readwrite');
      tx.objectStore(STORE_SUBMIT).put(story);
      tx.oncomplete = resolve;
      tx.onerror = reject;
    };
    request.onerror = reject;
  });
}

export function getAllOfflineStories() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(STORE_SUBMIT, 'readonly');
      const getAll = tx.objectStore(STORE_SUBMIT).getAll();
      getAll.onsuccess = () => resolve(getAll.result);
      getAll.onerror = reject;
    };
    request.onerror = reject;
  });
}
export function getAllOfflineStoryDetails() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(STORE_DETAIL, 'readonly');
      const getAll = tx.objectStore(STORE_DETAIL).getAll();
      getAll.onsuccess = () => resolve(getAll.result);
      getAll.onerror = reject;
    };
    request.onerror = reject;
  });
}

export function clearOfflineStories() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(STORE_SUBMIT, 'readwrite');
      const clear = tx.objectStore(STORE_SUBMIT).clear();
      clear.onsuccess = resolve;
      clear.onerror = reject;
    };
    request.onerror = reject;
  });
}

// ===== Detail Cache for Offline View =====

export function saveStoryDetailOffline(story) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(STORE_DETAIL, 'readwrite');
      tx.objectStore(STORE_DETAIL).put(story);
      tx.oncomplete = resolve;
      tx.onerror = reject;
    };
    request.onerror = reject;
  });
}

export function getOfflineStoryDetailById(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(STORE_DETAIL, 'readonly');
      const get = tx.objectStore(STORE_DETAIL).get(id);
      get.onsuccess = () => resolve(get.result);
      get.onerror = reject;
    };
    request.onerror = reject;
  });
}

export function deleteOfflineStoryDetail(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(STORE_DETAIL, 'readwrite');
      const del = tx.objectStore(STORE_DETAIL).delete(id);
      del.onsuccess = resolve;
      del.onerror = reject;
    };
    request.onerror = reject;
  });
}
