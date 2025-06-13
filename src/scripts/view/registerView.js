export const RegisterView = () => {
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
