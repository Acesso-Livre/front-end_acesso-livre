document.addEventListener('DOMContentLoaded', function () {
  const authToken = sessionStorage.getItem('authToken');

  if (authToken) {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
  } else {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('admin-dashboard').style.display = 'none';
  }
});

document.getElementById('login-form').addEventListener('submit', async function (e) {
  e.preventDefault(); 

  const email = document.getElementById('admin-email').value;
  const password = document.getElementById('admin-password').value;

  const response = await authApi.login(email, password);

  if (response.access_token) {
    sessionStorage.setItem('authToken', response.access_token);

    document.getElementById('login-section').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
  } else {
    document.getElementById('login-error').style.display = 'block';
  }
});

document.getElementById('logout-btn').addEventListener('click', function () {
  sessionStorage.removeItem('authToken');

  document.getElementById('login-section').style.display = 'block';
  document.getElementById('admin-dashboard').style.display = 'none';
});
