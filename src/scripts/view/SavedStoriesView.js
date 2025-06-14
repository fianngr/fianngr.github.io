import { storyPresenter } from '../presenter/storyPresenter.js';

export const SavedStoriesView = async () => {
  const stories = await storyPresenter.getSavedStories() || [];

  const html = `
    <h2 class="fade-in">Story Tersimpan</h2>
    <div class="home-buttons fade-in">
        <button id="home-button" class="fade-in">Kembali ke Home</button>
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
                    <button class="bookmark-button" data-id="${story.id}">🗑 Buang</button>
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
    const homeButton = document.getElementById('home-button');
    if (homeButton) {
      homeButton.addEventListener('click', () => {
        window.location.hash = '/';
      });
    }

    document.querySelectorAll('.bookmark-button').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = btn.dataset.id;
        const story = stories.find(s => s.id == id);
        if (!story) return;

        try {
          const isBookmarked = await storyPresenter.toggleBookmark(story);
          btn.textContent = isBookmarked ? 'Buang' : 'Simpan';
          alert('Story dibuang dari penyimpanan offline.');
          window.location.reload();
        } catch (err) {
          console.error('Gagal hapus bookmark:', err);
          alert('Terjadi kesalahan saat membuang bookmark.');
        }
      });
    });
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
