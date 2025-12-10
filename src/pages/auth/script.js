// src/auth/main.js - Entry point para página de login
import "./api.js";
import "./forgot-password.js";

// Verificar se houve reset de senha com sucesso
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("reset") === "success") {
    const successElement = document.getElementById("login-success");
    if (successElement) {
      successElement.style.display = "block";
      // Limpar a URL para não mostrar a mensagem se o usuário der refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }
});

document
  .getElementById("login-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("admin-email").value;
    const password = document.getElementById("admin-password").value;
    const errorElement = document.getElementById("login-error");

    errorElement.style.display = "none";

    const response = await authApi.login(email, password);

    if (response && response.access_token) {
      // Login OK → redireciona para admin
      window.location.href = "/pages/admin/index.html";
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

window.togglePassword = function (inputId, icon) {
  const input = document.getElementById(inputId);

  if (input.type === "password") {
    input.type = "text";
    icon.textContent = "visibility_off";
  } else {
    input.type = "password";
    icon.textContent = "visibility";
  }
};
