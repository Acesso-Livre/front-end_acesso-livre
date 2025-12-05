// src/auth/main.js - Entry point para página de login
import './api.js';

document.getElementById("login-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("admin-email").value;
    const password = document.getElementById("admin-password").value;
    const errorElement = document.getElementById("login-error");

    errorElement.style.display = "none";

    const response = await window.authApi.login(email, password);

    if (response && response.access_token) {
        // Login OK → redireciona para admin
        window.location.href = "/admin/";
    } else {
        errorElement.style.display = "block";
        errorElement.textContent = "Usuário ou senha incorreta.";
    }
});

// Forgot password modal
const forgotLink = document.getElementById("forgot-password-link");
const forgotModal = document.getElementById("forgotPasswordModal");
const closeModal = document.getElementById("back-to-login");

if (forgotLink && forgotModal) {
    forgotLink.addEventListener("click", () => {
        forgotModal.style.display = "flex";
    });
}

if (closeModal && forgotModal) {
    closeModal.addEventListener("click", () => {
        forgotModal.style.display = "none";
    });
}

// Forgot password form
const forgotForm = document.getElementById("forgot-password-form");
if (forgotForm) {
    forgotForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("forgot-email").value;
        const errorEl = document.getElementById("forgot-error");
        const successEl = document.getElementById("forgot-success");

        errorEl.style.display = "none";
        successEl.style.display = "none";

        // TODO: Implementar chamada de API para recuperação de senha
        successEl.style.display = "block";
    });
}
