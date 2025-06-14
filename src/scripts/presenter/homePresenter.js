import { getAllOfflineStoryDetails } from '../db.js';

export const homePresenter = {
  async getAllStories() {
    if (!navigator.onLine) {
      console.warn('Offline mode: hanya menampilkan story yang dibookmark.');
      const { getAllOfflineStoryDetails } = await import('../db.js');
      return await getAllOfflineStoryDetails() || [];
    }

    try {
      const res = await fetch('https://story-api.dicoding.dev/v1/stories', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      return data.listStory;
    } catch (err) {
      console.error('Gagal fetch stories online:', err);
      return [];
    }
  },

  async isBookmarked(id) {
    const { getOfflineStoryDetailById } = await import('../db.js');
    const story = await getOfflineStoryDetailById(id);
    return !!story;
  },

  async toggleBookmark(story) {
    const {
      getOfflineStoryDetailById,
      deleteOfflineStoryDetail,
      saveStoryDetailOffline
    } = await import('../db.js');

    const existing = await getOfflineStoryDetailById(story.id);
    if (existing) {
      await deleteOfflineStoryDetail(story.id);
      return false;
    } else {
      await saveStoryDetailOffline(story);
      return true;
    }
  },

  bindEvents(stories) {
    setTimeout(() => {
      document.getElementById('add-story')?.addEventListener('click', () => {
        window.location.hash = '/add-story';
      });

      document.getElementById('saved-stories')?.addEventListener('click', () => {
        window.location.hash = '/story-tersimpan';
      });

      document.getElementById('logout')?.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.hash = '/login';
      });

      document.querySelectorAll('.bookmark-button').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          const story = stories.find(s => s.id == id);
          if (!story) return;

          try {
            const isBookmarked = await homePresenter.toggleBookmark(story);
            btn.textContent = isBookmarked ? '🔖 Buang' : '🔖 Simpan';
            alert(isBookmarked ? 'Story disimpan offline!' : 'Story dibuang dari offline.');
          } catch (err) {
            console.error('Gagal toggle bookmark:', err);
            alert('Terjadi kesalahan saat menyimpan/buang bookmark.');
          }
        });
      });
    }, 0);
  },

  renderStoryMaps(stories) {
    setTimeout(() => {
      stories.forEach((story, index) => {
        const lat = story.lat;
        const lon = story.lon;
        if (!lat || !lon) return;

        const mapContainer = document.getElementById(`map-${story.id || `offline-${index}`}`);
        if (!mapContainer || mapContainer._leaflet_id) return;

        const map = L.map(mapContainer).setView([lat, lon], 15);
        L.tileLayer('https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=7BXPo4DtwET5hku94tQR', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        const imageSrc = story.photoUrl
          ?? (story.photo instanceof File
            ? URL.createObjectURL(story.photo)
            : (typeof story.photo === 'string' && story.photo.startsWith('data:image/')
              ? story.photo : ''));

        L.marker([lat, lon])
          .addTo(map)
          .bindPopup(`
            <div style="font-size: 11px; max-width: 150px; padding: 5px; line-height: 1.3;">
              <strong>${story.description}</strong><br>
              ${imageSrc ? `<img src="${imageSrc}" alt="Foto cerita" style="width: 100%; height: auto; border-radius: 4px; margin-top: 4px;">` : ''}
              <span style="color: #555;">${lat}, ${lon}</span>
            </div>
          `)
          .openPopup();
      });
    }, 0);
  },

  bindPushToggle() {
    setTimeout(() => {
      const toggleBtn = document.getElementById('push-toggle');
      if (!toggleBtn) return;

      const updateLabel = async () => {
        try {
          const { checkSubscription } = await import('../notification.js');
          const subscribed = await checkSubscription();
          toggleBtn.textContent = subscribed ? '🔕 Unsubscribe' : '🔔 Subscribe';
        } catch (err) {
          console.error('Gagal memuat status notifikasi:', err);
          toggleBtn.textContent = '🔔 Subscribe';
        }
      };

      updateLabel();

      toggleBtn.addEventListener('click', async () => {
        const {
          checkSubscription,
          subscribeUser,
          unsubscribeUser
        } = await import('../notification.js');

        try {
          const isSubscribed = await checkSubscription();
          if (isSubscribed) {
            await unsubscribeUser();
            alert('Berhasil unsubscribe notifikasi.');
          } else {
            await subscribeUser();
            alert('Berhasil subscribe notifikasi.');
          }
        } catch (err) {
          console.error('Gagal toggle notifikasi:', err);
          alert('Terjadi kesalahan saat toggle notifikasi.');
        }

        updateLabel();
      });
    }, 0);
  }
};
