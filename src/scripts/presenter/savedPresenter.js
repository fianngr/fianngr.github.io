import { getAllOfflineStoryDetails} from '../db.js';


export const savedPresenter = {
  async getSavedStories() {
    return await getAllOfflineStoryDetails();
  },
};
