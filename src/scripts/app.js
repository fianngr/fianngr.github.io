import { routeHandler } from './router.js';
import { initAuthPresenter } from './presenter/authPresenter.js';
import { storyPresenter } from './presenter/storyPresenter.js';
import { registerSWAndPush } from './notification.js';
import '../styles/style.css';
import '../scripts/init-sw';


document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.hash = '/login';
    } else {
        window.location.hash = '/';

        if (location.hostname !== 'localhost' && location.protocol === 'https:') {
            registerSWAndPush(token);
        } else {
            console.warn('Push notification tidak dijalankan di localhost');
        }
    }

    routeHandler(); 
    initAuthPresenter();
    storyPresenter.initStoryFormHandler();
});


