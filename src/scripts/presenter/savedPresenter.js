import { getAllOfflineStoryDetails} from '../db.js';


export const savedPresenter = {
  async getSavedStories() {
    return await getAllOfflineStoryDetails();
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
};
