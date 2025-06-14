import { routeHandler } from './router.js';
import { initAuthPresenter } from './presenter/authPresenter.js';
import { storyPresenter } from './presenter/storyPresenter.js';
import '../styles/style.css';
import '../scripts/init-sw'; 

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');

  if (!token) {
    window.location.hash = '/login';
  } else {
    window.location.hash = '/';
  }

  routeHandler(); 
  initAuthPresenter();
  storyPresenter.initStoryFormHandler();
});
