import { api } from './api.js';

export const model = {
    async registerUser(name, email, password) {
        return await api.register({ name, email, password });
    },
    async loginUser(email, password) {
        return await api.login({ email, password });
    },
    async createStory(description, photo, lat, lon) {
        return await api.addStory({ description, photo, lat, lon });
    },
    async getAllStories() {
        return await api.fetchStories();
    },
    async getStoryDetail(id) {
        return await api.getStoryDetail(id);
    },
};