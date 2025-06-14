import {
  saveStoryOffline,
  getAllOfflineStories,
  clearOfflineStories
} from '../db.js';
import { model } from '../model.js';

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
      if (!story.description || (!story.photo && !story.photoUrl)) {
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
