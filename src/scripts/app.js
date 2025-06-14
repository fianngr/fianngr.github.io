import { routeHandler } from './router.js';
import { addStoryPresenter } from './presenter/addStoryPresenter.js';
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
  addStoryPresenter.initStoryFormHandler();
});
