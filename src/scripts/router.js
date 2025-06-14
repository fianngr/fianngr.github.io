import { HomeView } from './view/homeView.js';
import { AddStoryView } from './view/addStoryView.js';
import { LoginView } from './view/loginView.js';
import { RegisterView } from './view/registerView.js';
import { DetailView } from './view/detailView.js';
import { SavedStoriesView } from './view/SavedStoriesView.js';

const routes = {
    '/': HomeView,
    '/add-story': AddStoryView,
    '/login': LoginView,
    '/register': RegisterView,
    '/story/:id': DetailView,
    '/story-tersimpan': SavedStoriesView,
};

export const routeHandler = async () => {
    const path = window.location.hash.slice(1) || '/';
    const idMatch = path.match(/^\/story\/(.+)$/);
    let view;

    if (idMatch) {
        view = await DetailView(idMatch[1]);
    } else {
        const render = routes[path] || HomeView;
        view = await render();
    }

    document.getElementById('app').innerHTML = view;
};

window.addEventListener('hashchange', routeHandler);
