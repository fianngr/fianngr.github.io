import { saveStoryDetailOffline, getOfflineStoryDetailById } from '../db.js';

export const storyDetailPresenter = {
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
      console.warn('Offline mode: mengambil detail dari cache');
      return await getOfflineStoryDetailById(id);
    }
  }
};
