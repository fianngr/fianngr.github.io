import { storyPresenter } from '../presenter/storyPresenter.js';

export const HomeView = async () => {
    const stories = await storyPresenter.getAllStories();

    const html = `
        <h2 class="fade-in">Home Page</h2>
        <div class="home-buttons fade-in">
            <button id="add-story" class="fade-in">Tambah Data</button>
            <button id="logout" class="fade-in">Logout</button>
        </div>
        <div id="stories-list" class="fade-in">
            ${stories.map((story, index) => {
                const imageSrc = story.photoUrl
                    ? story.photoUrl
                    : story.photo instanceof File
                        ? URL.createObjectURL(story.photo)
                        : typeof story.photo === 'string' && story.photo.startsWith('data:image/')
                            ? story.photo
                            : 'https://via.placeholder.com/300x200?text=No+Image';

                const createdAt = story.createdAt
                    ? new Date(story.createdAt).toLocaleDateString()
                    : 'Offline Story';

                const mapId = `map-${story.id || `offline-${index}`}`;

                return `
                    <div class="story-item fade-in">
                        <img src="${imageSrc}" alt="Foto cerita: ${story.description}">
                        <p>${story.description}</p>
                        <p><strong>Location:</strong> ${story.lat || '-'}, ${story.lon || '-'}</p>
                        <p><strong>Created At:</strong> ${createdAt}</p>
                        <div id="${mapId}" class="story-map" style="height: 300px;"></div>
                        ${story.id ? `<a href="#/story/${story.id}">See Details</a>` : '<span style="color:#888;">(Offline story)</span>'}
                    </div>
                `;
            }).join('')}
        </div>
    `;

    const container = document.getElementById('home-container');
    if (container) {
        container.innerHTML = html;
    }

    setTimeout(() => {
        const addStoryButton = document.getElementById('add-story');
        if (addStoryButton) {
            addStoryButton.addEventListener('click', () => {
                window.location.hash = '/add-story';
            });
        }

        const logoutButton = document.getElementById('logout');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                localStorage.removeItem('token');
                window.location.hash = '/login';
            });
        }
    }, 0);

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
                ? story.photoUrl
                : story.photo instanceof File
                    ? URL.createObjectURL(story.photo)
                    : typeof story.photo === 'string' && story.photo.startsWith('data:image/')
                        ? story.photo
                        : '';

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

    return html;
};
