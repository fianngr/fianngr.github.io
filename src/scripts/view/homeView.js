import { homePresenter } from '../presenter/homePresenter.js';

export const HomeView = async () => {
  const stories = await homePresenter.getAllStories() || [];

  
  const bookmarkStatuses = await Promise.all(
    stories.map(story => story.id ? homePresenter.isBookmarked(story.id) : false)
  );

  let storiesHtml = '';
  stories.forEach((story, index) => {
    const imageSrc = story.photoUrl
      ?? (story.photo instanceof File
        ? URL.createObjectURL(story.photo)
        : (typeof story.photo === 'string' && story.photo.startsWith('data:image/')
          ? story.photo
          : 'https://via.placeholder.com/300x200?text=No+Image'));

    const createdAt = story.createdAt
      ? new Date(story.createdAt).toLocaleDateString()
      : 'Offline Story';

    const mapId = `map-${story.id || `offline-${index}`}`;

    let bookmarkButtonHtml = '<span style="color:#888;">(Offline story)</span>';
    if (story.id) {
      const bookmarked = bookmarkStatuses[index];
      const label = bookmarked ? '🔖 Buang' : '🔖 Simpan';
      bookmarkButtonHtml = `
        <a href="#/story/${story.id}">See Details</a>
        <button class="bookmark-button" data-id="${story.id}">
          ${label}
        </button>
      `;
    }

    storiesHtml += `
      <div class="story-item fade-in">
        <img src="${imageSrc}" alt="Foto cerita: ${story.description}">
        <p>${story.description}</p>
        <p><strong>Location:</strong> ${story.lat || '-'}, ${story.lon || '-'}</p>
        <p><strong>Created At:</strong> ${createdAt}</p>
        <div id="${mapId}" class="story-map" style="height: 300px;"></div>
        ${bookmarkButtonHtml}
      </div>
    `;
  });

  const html = `
    <h2 class="fade-in home-header">
      <span>Home Page</span>
      <button id="push-toggle" class="push-toggle-button">🔔 Subscribe</button>
    </h2>
    <div class="home-buttons fade-in">
      <button id="add-story" class="fade-in">Tambah Data</button>
      <button id="saved-stories" class="fade-in">Story Tersimpan</button>
      <button id="logout" class="fade-in">Logout</button>
    </div>
    <div id="stories-list" class="fade-in">${storiesHtml}</div>
  `;

  const container = document.getElementById('home-container');
  if (container) {
    container.innerHTML = html;
  }

  
    setTimeout(() => {
      document.getElementById('add-story')?.addEventListener('click', () => {
        window.location.hash = '/add-story';
      });

      document.getElementById('saved-stories')?.addEventListener('click', () => {
        window.location.hash = '/story-tersimpan';
      });

      document.getElementById('logout')?.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.hash = '/login';
      });

      document.querySelectorAll('.bookmark-button').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          const story = stories.find(s => s.id == id);
          if (!story) return;

          try {
            const isBookmarked = await homePresenter.toggleBookmark(story);
            btn.textContent = isBookmarked ? '🔖 Buang' : '🔖 Simpan';
            alert(isBookmarked ? 'Story disimpan offline!' : 'Story dibuang dari offline.');
          } catch (err) {
            console.error('Gagal toggle bookmark:', err);
            alert('Terjadi kesalahan saat menyimpan/buang bookmark.');
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

  homePresenter.bindPushToggle(); 

  return html;
};
