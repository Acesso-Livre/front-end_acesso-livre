document.addEventListener("DOMContentLoaded", function () {

    // 1. Elementos de Controle do Modal (Abertura/Fechamento)
    const forgotPasswordLink = document.getElementById("forgot-password-link");
    const forgotPasswordModal = document.getElementById("forgotPasswordModal");
    const closeForgotPasswordModal = document.getElementById("back-to-login");

    // 2. Elementos do Formulário de Envio (Integração com API)
    const forgotPasswordForm = document.getElementById("forgot-password-form");
    const emailInput = document.getElementById("forgot-email");
    const errorMessage = document.getElementById("forgot-error");
    const successMessage = document.getElementById("forgot-success");

    // ABRIR MODAL
    function openForgotPasswordModal() {
        // Limpa feedback anterior ao abrir
        errorMessage.style.display = "none";
        successMessage.style.display = "none";
        forgotPasswordForm.style.display = "block"; // Garante que o formulário está visível
        emailInput.value = ''; // Limpa o campo

        forgotPasswordModal.style.display = "flex";
        document.body.style.overflow = "hidden";
    }

    // FECHAR MODAL
    function closeForgotPassword() {
        forgotPasswordModal.style.display = "none";
        document.body.style.overflow = "auto";
    }

    // --- EVENT LISTENERS DE UI ---

    // Botão "Esqueceu a senha?" (Abre Modal)
    forgotPasswordLink.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        openForgotPasswordModal();
    });

    // Botão de voltar (Fecha Modal)
    closeForgotPasswordModal.addEventListener("click", function () {
        closeForgotPassword();
    });

    // Botão de sair no cartão de sucesso (Fecha Modal)
    document.getElementById("exit-success").addEventListener("click", function () {
        closeForgotPassword();
    });


    // --- INTEGRAÇÃO DA API: ENVIO DO E-MAIL ---
    forgotPasswordForm.addEventListener("submit", async function (e) {
        e.preventDefault(); // CRÍTICO: Impede o envio padrão e recarga da página!

        // Limpa as mensagens de feedback para o novo envio
        errorMessage.style.display = "none";
        successMessage.style.display = "none";

        const email = emailInput.value.trim();

        try {
                // Debug: informar no console que o envio foi iniciado
                console.log("[forgot-password] enviando pedido para recuperar senha. email:", email);

                // A chamada à função de API robusta que você revisou
                const forgotResult = await authApi.forgotPassword(email);
                console.log("[forgot-password] resposta da API:", forgotResult);

            // Sucesso: Esconde o formulário e mostra a mensagem de sucesso
            forgotPasswordForm.style.display = "none";
            successMessage.textContent = "Instruções de recuperação enviadas! Verifique sua caixa de entrada.";
            successMessage.style.display = "block";


        } catch (error) {
            console.error("Erro ao tentar recuperar senha:", error);
            errorMessage.textContent = error.message;
            errorMessage.style.display = "block";

        }
    });

});