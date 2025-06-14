import { detailPresenter } from '../presenter/detailPresenter.js';

export const DetailView = async (id) => {
    const story = await detailPresenter.getStoryDetail(id) || {};

    const description = story.description ?? 'Tidak tersedia';
    const lat = (story.lat !== undefined && !isNaN(parseFloat(story.lat))) ? parseFloat(story.lat) : null;
    const lon = (story.lon !== undefined && !isNaN(parseFloat(story.lon))) ? parseFloat(story.lon) : null;

    let photoUrl = story.photoUrl;
    if (!photoUrl && story.photo instanceof Blob) {
        photoUrl = URL.createObjectURL(story.photo);
    }
    if (!photoUrl) {
        photoUrl = '/assets/images/fallback.png';
    }

    const html = `
        <div class="detail-container">
            <h2>Story Detail</h2>
            <div class="story-detail">
                <img class="story-img" src="${photoUrl}" alt="Story photo" />
                <div class="story-info">
                    <p>${description}</p>
                    <p><strong>Location:</strong> Latitude: ${lat ?? '-'}, Longitude: ${lon ?? '-'}</p>
                </div>
                <div id="story-map" class="story-map" style="height: 300px;"></div>
                <a href="#/" class="back-btn">← Back to Home</a>
            </div>
        </div>
    `;

    setTimeout(() => {
        const mapContainer = document.getElementById('story-map');

        if (!mapContainer || mapContainer._leaflet_id || lat === null || lon === null) {
            console.warn('[DetailView] Map tidak dirender karena koordinat tidak valid:', lat, lon);
            return;
        }

        const map = L.map(mapContainer).setView([lat, lon], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        }).addTo(map);

        L.marker([lat, lon]).addTo(map)
            .bindPopup('<b>Your Story Location</b>')
            .openPopup();
    }, 100);

    return html;
};
