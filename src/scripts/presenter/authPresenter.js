import { model } from '../model.js';

export const authPresenter = {
  async login(email, password) {
    const user = await model.loginUser(email, password);
    localStorage.setItem('token', user.token);
    return user;
  },

  async register(name, email, password) {
    await model.registerUser(name, email, password);
  }
};
