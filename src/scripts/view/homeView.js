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

  
  homePresenter.bindEvents(stories);
  homePresenter.renderStoryMaps(stories);
  homePresenter.bindPushToggle(); 

  return html;
};
