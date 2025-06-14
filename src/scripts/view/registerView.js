import { authPresenter } from '../presenter/authPresenter.js';

export const RegisterView = () => {
  setTimeout(() => {
    const form = document.getElementById('registerForm');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = e.target.name.value.trim();
      const email = e.target.email.value.trim();
      const password = e.target.password.value.trim();

      if (!name || !email || !password) {
        alert('Semua field wajib diisi.');
        return;
      }

      if (password.length < 8) {
        alert('Password minimal 8 karakter.');
        return;
      }

      const overlay = document.getElementById('loadingOverlay');
      if (overlay) overlay.style.display = 'flex';

      try {
        await authPresenter.register(name, email, password);
        alert('Registrasi berhasil! Silakan login.');
        window.location.hash = '/login';
      } catch (error) {
        alert('Registrasi gagal: ' + error.message);
      } finally {
        if (overlay) overlay.style.display = 'none';
      }
    });
  }, 0);

  return `
    <div class="centered-container">
      <form id="registerForm">
        <h2 style="text-align:center;">Register</h2>
        <label>Name</label>
        <input type="text" name="name" required>

        <label>Email</label>
        <input type="email" name="email" required>

        <label>Password</label>
        <input type="password" name="password" required>

        <button type="submit">Register</button>
        <p style="text-align:center;">Already have an account? <a href="#/login">Login</a></p>
      </form>
    </div>
  `;
};
