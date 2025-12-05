document.addEventListener("DOMContentLoaded", function () {

  const forgotPasswordLink = document.getElementById("forgot-password-link");
  const forgotPasswordModal = document.getElementById("forgotPasswordModal");
  const closeForgotPasswordModal = document.getElementById("close-forgot-modal");

  // ABRIR MODAL
  function openForgotPasswordModal() {
    forgotPasswordModal.style.display = "flex";
    document.body.style.overflow = "hidden"; 
  }

  // FECHAR MODAL
  function closeForgotPassword() {
    forgotPasswordModal.style.display = "none";
    document.body.style.overflow = "auto";
  }

  // Botão "Esqueceu a senha?"
  forgotPasswordLink.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  openForgotPasswordModal();
});

  // Botão X dentro do modal
  closeForgotPasswordModal.addEventListener("click", function () {
    closeForgotPassword();
  });

});