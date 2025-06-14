import { model } from '../model.js';
import { saveStoryOffline, clearOfflineStories, getAllOfflineStories } from '../db.js';

export const addStoryPresenter = {
  async createStory({ description, photo, lat, lon }) {
    if (!navigator.onLine) {
      await saveStoryOffline({ description, photo, lat, lon });
      return { offline: true };
    } else {
      await model.createStory(description, photo, lat, lon);
      return { offline: false };
    }
  },

  async syncOfflineStories() {
    const offlineStories = await getAllOfflineStories();
    for (const story of offlineStories) {
      try {
        if (!story.description || (!story.photo && !story.photoUrl)) continue;

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
  },

  initStoryFormHandler() {
    document.addEventListener('submit', async (e) => {
      if (!e.target.matches('#addStoryForm')) return;

      e.preventDefault();
      const description = e.target.description.value.trim();
      const photo = e.target.photo.files[0];
      const lat = parseFloat(e.target.lat.value);
      const lon = parseFloat(e.target.lon.value);

      if (!description || !photo || isNaN(lat) || isNaN(lon)) {
        alert('Deskripsi, foto, dan lokasi wajib diisi.');
        return;
      }

      try {
        const result = await this.createStory({ description, photo, lat, lon });
        if (result.offline) {
          alert('Kamu sedang offline. Cerita disimpan dan akan dikirim saat online.');
        } else {
          alert('Cerita berhasil ditambahkan!');
          window.location.hash = '/';
        }
      } catch (err) {
        console.error('Submit error:', err);
        alert('Gagal menyimpan cerita.');
      }
    });

    window.addEventListener('online', () => {
      console.log('Koneksi kembali! Sinkronisasi cerita offline...');
      this.syncOfflineStories();
    });
  }
};
