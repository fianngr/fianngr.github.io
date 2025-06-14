import { getAllOfflineStoryDetails } from '../db.js';
import { model } from'../model.js'

export const homePresenter = {
  async getAllStories() {
    if (!navigator.onLine) {
      console.warn('Offline mode: hanya menampilkan story yang dibookmark.');
      return await getAllOfflineStoryDetails() || [];
    }

    try {
      return await model.getAllStories();
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
