// src/auth/main.js - Entry point para página de login
import "./api.js";
import "./forgot-password.js";
// Importa o handler global de erros (cria modal e listeners)
import "../../utils/error-handler.js";

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

    try {
      const response = await authApi.login(email, password);

      if (response && response.access_token) {
        // Login OK → redireciona para admin
        window.location.href = "/pages/admin/index.html";
        return;
      }

      // Caso raro: sem token retornado
      errorElement.textContent = "Email ou senha incorreta";
      errorElement.style.display = "block";
    } catch (err) {
      // Se for erro de usuário (ex.: 401/400), mostrar mensagem simples
      if (err && err.isUserError) {
        errorElement.textContent = "Email ou senha incorreta";
        errorElement.style.display = "block";
        return;
      }

      // Erro de sistema: delegar ao modal global (se disponível)
      if (window.mostrarErroParaUsuario) {
        window.mostrarErroParaUsuario('Ops, algo deu errado ao tentar entrar.', err);
      } else {

      }
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
