document.getElementById("login-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("admin-email").value;
  const password = document.getElementById("admin-password").value;
  const errorElement = document.getElementById("login-error");

  errorElement.style.display = "none";

  const response = await authApi.login(email, password);

  if (response && response.access_token) {

    // Login OK → redireciona para admin
    window.location.href = "../admin/index.html";

  } else {
    errorElement.style.display = "block";
    errorElement.textContent = "Usuário ou senha incorreta.";
  }
});