const API_BASE = 'https://story-api.dicoding.dev/v1';

export const api = {
    async register({ name, email, password }) {
        const res = await fetch(`https://story-api.dicoding.dev/v1/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        console.log('Register response:', data);

        if (!res.ok) throw new Error(data.message || 'Register failed');
    },
    async login({ email, password }) {
        const res = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        return data.loginResult;
    },
    async addStory({ description, photo, lat, lon }) {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('description', description);
        formData.append('photo', photo);
        formData.append('lat', lat);
        formData.append('lon', lon);
        const res = await fetch(`${API_BASE}/stories`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });
        return await res.json();
    },
    async fetchStories() {
        const res = await fetch(`${API_BASE}/stories`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await res.json();
        return data.listStory;
    },
    async getStoryDetail(id) {
        const res = await fetch(`${API_BASE}/stories/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await res.json();
        return data.story;
    },
};
