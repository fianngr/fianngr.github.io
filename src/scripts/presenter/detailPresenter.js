import { model } from '../model.js';
import {
  saveStoryDetailOffline,
  getOfflineStoryDetailById
} from '../db.js';

export const detailPresenter = {
  async getStoryDetail(id) {
    try {
      const story = await model.getStoryDetail(id);

      if (data?.story?.id) {
        await saveStoryDetailOffline(data.story);
      }

      return data.story;
    } catch (e) {
      console.warn('[Offline Mode] Mengambil detail dari cache untuk id:', id);
      return await getOfflineStoryDetailById(id);
    }
  }
};
