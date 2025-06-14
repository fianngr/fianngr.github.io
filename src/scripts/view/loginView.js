import { authPresenter } from '../presenter/authPresenter.js';

export const LoginView = () => {
  setTimeout(() => {
    const form = document.getElementById('loginForm');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = e.target.email.value.trim();
      const password = e.target.password.value.trim();

      if (!email || !password) {
        alert('Email dan password tidak boleh kosong.');
        return;
      }

      const overlay = document.getElementById('loadingOverlay');
      if (overlay) overlay.style.display = 'flex';

      try {
        await authPresenter.login(email, password);
        alert('Login Berhasil');
        window.location.hash = '/';
      } catch (error) {
        alert('Login gagal: ' + error.message);
      } finally {
        if (overlay) overlay.style.display = 'none';
      }
    });
  }, 0);

  return `
    <div class="centered-container">
      <form id="loginForm">
        <h2 style="text-align:center;">Login</h2>
        <label>Email</label>
        <input type="email" name="email" required>

        <label>Password</label>
        <input type="password" name="password" required>

        <button type="submit">Login</button>
        <p style="text-align:center;">Don't have an account? <a href="#/register">Register</a></p>
      </form>
    </div>
  `;
};
