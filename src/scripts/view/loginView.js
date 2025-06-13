export const LoginView = () => {
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
