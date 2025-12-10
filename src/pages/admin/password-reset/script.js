// src/pages/admin/password-reset/script.js
import "./api.js";

document.addEventListener("DOMContentLoaded", function () {
  // Elementos do DOM
  const paramError = document.getElementById("param-error");
  const resetForm = document.getElementById("reset-form");
  const emailDisplay = document.getElementById("email-display");
  const newPasswordInput = document.getElementById("new-password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const resetError = document.getElementById("reset-error");
  const resetSuccess = document.getElementById("reset-success");
  const resetBtn = document.getElementById("reset-btn");
  const btnText = document.getElementById("btn-text");
  const btnLoading = document.getElementById("btn-loading");

  // Elementos de validação de senha
  const reqLength = document.getElementById("req-length");
  const reqUppercase = document.getElementById("req-uppercase");
  const reqLowercase = document.getElementById("req-lowercase");
  const reqNumber = document.getElementById("req-number");
  const reqSpecial = document.getElementById("req-special");

  // Obter parâmetros da URL
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get("email");
  const token = urlParams.get("code");

  // Validar parâmetros da URL
  function validateUrlParams() {
    if (!email || !token) {
      paramError.style.display = "block";
      resetForm.style.display = "none";
      return false;
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      paramError.style.display = "block";
      resetForm.style.display = "none";
      return false;
    }

    return true;
  }

  // Exibir email no formulário
  function displayEmail() {
    if (email) {
      emailDisplay.textContent = email;
    }
  }

  // Validar força da senha
  function validatePassword(password) {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    // Atualizar UI dos requisitos
    updateRequirementUI(reqLength, requirements.length);
    updateRequirementUI(reqUppercase, requirements.uppercase);
    updateRequirementUI(reqLowercase, requirements.lowercase);
    updateRequirementUI(reqNumber, requirements.number);
    updateRequirementUI(reqSpecial, requirements.special);

    // Retornar se todos os requisitos são atendidos
    return Object.values(requirements).every((req) => req);
  }

  // Atualizar UI de um requisito específico
  function updateRequirementUI(element, isValid) {
    if (isValid) {
      element.classList.add("valid");
    } else {
      element.classList.remove("valid");
    }
  }

  // Verificar se as senhas coincidem
  function passwordsMatch() {
    return newPasswordInput.value === confirmPasswordInput.value;
  }

  // Mostrar erro
  function showError(message) {
    resetError.textContent = message;
    resetError.style.display = "block";
    resetSuccess.style.display = "none";
  }

  // Mostrar sucesso
  function showSuccess() {
    resetSuccess.style.display = "block";
    resetError.style.display = "none";
  }

  // Limpar mensagens
  function clearMessages() {
    resetError.style.display = "none";
    resetSuccess.style.display = "none";
  }

  // Setar estado de loading do botão
  function setButtonLoading(loading) {
    if (loading) {
      resetBtn.classList.add("loading");
      resetBtn.disabled = true;
    } else {
      resetBtn.classList.remove("loading");
      resetBtn.disabled = false;
    }
  }

  // Event listener para validação em tempo real da senha
  newPasswordInput.addEventListener("input", function () {
    validatePassword(this.value);

    // Verificar se as senhas coincidem se o campo de confirmação já estiver preenchido
    if (confirmPasswordInput.value) {
      if (!passwordsMatch()) {
        showError("As senhas não coincidem.");
      } else {
        clearMessages();
      }
    }
  });

  // Event listener para validação de confirmação de senha
  confirmPasswordInput.addEventListener("input", function () {
    if (this.value && !passwordsMatch()) {
      showError("As senhas não coincidem.");
    } else {
      clearMessages();
    }
  });

  // Event listener para envio do formulário
  resetForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Validações
    if (!validatePassword(newPassword)) {
      showError("A senha não atende a todos os requisitos.");
      return;
    }

    if (!passwordsMatch()) {
      showError("As senhas não coincidem.");
      return;
    }

    clearMessages();
    setButtonLoading(true);

    try {
      console.log("[password-reset] Enviando requisição para redefinir senha");

      const result = await window.passwordResetApi.resetPassword(
        email,
        newPassword,
        token
      );
      console.log("[password-reset] Resposta da API:", result);

      showSuccess();

      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        window.location.href = "/pages/auth/?reset=success";
      }, 2000);
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      showError(
        error.message ||
          "Ocorreu um erro ao redefinir a senha. Tente novamente."
      );
    } finally {
      setButtonLoading(false);
    }
  });

  // Inicialização
  function initialize() {
    if (validateUrlParams()) {
      displayEmail();
      resetForm.style.display = "block";
      paramError.style.display = "none";
    }
  }

  // Função global para toggle de visibilidade da senha
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

  // Inicializar a página
  initialize();
});
