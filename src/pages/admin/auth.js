document.addEventListener("DOMContentLoaded", async function () {
  const authToken = sessionStorage.getItem("authToken");

  if (authToken) {
    // Validar o token antes de exibir o dashboard
    const tokenValidation = await authApi.checkToken();

    if (tokenValidation.valid) {
      // Token válido, exibir dashboard
      const loginSection = document.getElementById("login-section");
      const dashboard = document.getElementById("admin-dashboard");

      if (loginSection && dashboard) {
        loginSection.style.display = "none";
        dashboard.style.display = "block";
        // Carregar comentários quando já está logado
        await loadPendingComments();
      } else {
        console.error("Elementos não encontrados!");
      }
    } else {
      // Token inválido ou expirado, remover e voltar ao login
      sessionStorage.removeItem("authToken");
      document.getElementById("login-section").style.display = "block";
      document.getElementById("admin-dashboard").style.display = "none";
      document.getElementById("login-error").style.display = "block";
      document.getElementById("login-error").textContent =
        "Sua sessão expirou. Faça login novamente.";
    }
  } else {
    // Sem token, exibir login
    document.getElementById("login-section").style.display = "block";
    document.getElementById("admin-dashboard").style.display = "none";
  }
});

document
  .getElementById("login-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("admin-email").value;
    const password = document.getElementById("admin-password").value;
    const errorElement = document.getElementById("login-error");

    // Limpar mensagem de erro anterior
    errorElement.style.display = "none";
    errorElement.textContent = "Usuário ou senha incorreta. Tente novamente.";

    const response = await authApi.login(email, password);

    if (response && response.access_token) {
      // Token válido, redirecionar para dashboard
      const loginSection = document.getElementById("login-section");
      const dashboard = document.getElementById("admin-dashboard");

      if (loginSection && dashboard) {
        loginSection.style.display = "none";
        dashboard.style.display = "block";
      } else {
        console.error("ERRO: Elementos não encontrados!");
      }

      // Limpar campos do formulário
      document.getElementById("admin-email").value = "";
      document.getElementById("admin-password").value = "";
      document.getElementById("forgot-email").value = "";

      // Carregar comentários após login bem-sucedido
      await loadPendingComments();
    } else {
      // Erro no login
      errorElement.style.display = "block";
    }
  });

document.getElementById("logout-btn").addEventListener("click", function () {
  sessionStorage.removeItem("authToken");

  document.getElementById("login-section").style.display = "block";
  document.getElementById("admin-dashboard").style.display = "none";
});
