import { model } from '../model.js';
import {
  saveStoryOffline,
  getAllOfflineStories,
  clearOfflineStories,
  saveStoryDetailOffline,
  getOfflineStoryDetailById
} from '../db.js';

const showLoading = () => {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.style.display = 'flex';
};

const hideLoading = () => {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.style.display = 'none';
};

let isFormHandlerInitialized = false;

async function syncOfflineStories() {
  const offlineStories = await getAllOfflineStories();
  if (!offlineStories.length) return;

  for (const story of offlineStories) {
    try {
      if (!story.description || !story.photo || !story.lat || !story.lon) {
        console.warn('Lewati story offline yang datanya tidak lengkap:', story);
        continue;
      }

      const photoBlob = story.photo;

      const photoFile = new File([photoBlob], 'offline-photo.jpg', {
        type: photoBlob.type || 'image/jpeg'
      });

      await model.createStory(story.description, photoFile, story.lat, story.lon);
    } catch (e) {
      console.error('Gagal sinkronisasi cerita offline:', e);
    }
  }

  await clearOfflineStories();
}

export const storyPresenter = {
  async createStory(description, photo, lat, lon) {
    return await model.createStory(description, photo, lat, lon);
  },

  async getAllStories() {
    try {
      const res = await fetch('https://story-api.dicoding.dev/v1/stories', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      return data.listStory;
    } catch (err) {
      console.warn('Offline mode: Fetch from IndexedDB', err);
      return await getAllOfflineStories();
    }
  },

  async getStoryDetail(id) {
    try {
      const res = await fetch(`https://story-api.dicoding.dev/v1/stories/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();

      if (data?.story?.id) {
        await saveStoryDetailOffline(data.story);
      }

      return data.story;
    } catch (e) {
      console.warn('Offline mode: mengambil detail dari cache untuk id:', id);
      return await getOfflineStoryDetailById(id);
    }
  },

  initStoryFormHandler() {
    if (isFormHandlerInitialized) return;
    isFormHandlerInitialized = true;

    document.addEventListener('submit', async (e) => {
      if (e.target.matches('#addStoryForm')) {
        e.preventDefault();

        const description = e.target.description.value.trim();
        const photo = e.target.photo.files[0];
        const lat = parseFloat(e.target.lat.value);
        const lon = parseFloat(e.target.lon.value);

        if (!description || !photo || isNaN(lat) || isNaN(lon)) {
          alert('Deskripsi, foto, dan lokasi wajib diisi.');
          return;
        }

        showLoading();

        try {
          if (!navigator.onLine) {
            await saveStoryOffline({ description, photo, lat, lon });
            alert('Kamu sedang offline. Cerita disimpan dan akan dikirim saat online.');
          } else {
            await model.createStory(description, photo, lat, lon);
            alert('Cerita berhasil ditambahkan!');
            window.location.hash = '/';
          }
        } catch (err) {
          console.error('Submit error:', err);
          alert('Gagal menyimpan cerita.');
        } finally {
          hideLoading();
        }
      }
    });

    window.addEventListener('online', () => {
      console.log('Koneksi kembali! Sinkronisasi cerita offline...');
      syncOfflineStories();
    });
  }
};
