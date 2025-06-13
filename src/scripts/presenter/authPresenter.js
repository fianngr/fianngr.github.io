import { model } from '../model.js';
import { routeHandler } from '../router.js';

const showLoading = () => {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'flex';
};

const hideLoading = () => {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'none';
};

export const initAuthPresenter = () => {
    document.addEventListener('submit', async (e) => {
        if (e.target.matches('#loginForm')) {
            e.preventDefault();
            const email = e.target.email.value.trim();
            const password = e.target.password.value.trim();

            if (!email || !password) {
                alert('Email dan password tidak boleh kosong.');
                return;
            }

            try {
                showLoading(); 
                const user = await model.loginUser(email, password);
                localStorage.setItem('token', user.token);
                alert('Login Berhasil');
                window.location.hash = '/';
            } catch (error) {
                alert('Login gagal: ' + error.message);
            } finally {
                hideLoading(); 
            }
        }

        if (e.target.matches('#registerForm')) {
            e.preventDefault();
            const name = e.target.name.value.trim();
            const email = e.target.email.value.trim();
            const password = e.target.password.value.trim();

            if (!name || !email || !password) {
                alert('Semua field wajib diisi.');
                return;
            }

            if (password.length < 8) {
                alert('Password must be at least 8 characters long.');
                return;
            }

            try {
                showLoading(); 
                await model.registerUser(name, email, password);
                alert('Registrasi berhasil! Silakan login.');
                window.location.hash = '/login';
            } catch (error) {
                alert('Registrasi gagal: ' + error.message);
            } finally {
                hideLoading(); 
            }
        }
    });

};
