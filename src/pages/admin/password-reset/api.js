// src/pages/admin/password-reset/api.js
// Ambiente: Nem sempre `import.meta.env` está definido quando a página
// é aberta diretamente no navegador sem bundler (Vite). Usamos um
// fallback seguro para evitar exceções que interrompam a execução do
// módulo e impeçam os handlers de UI de serem registrados.
// Detecta `import.meta.env.VITE_API_BASE_URL` quando disponível (em módulos)
// e usa `window.__API_BASE_URL__` como fallback. Evitamos referências
// inválidas a `import` que causariam SyntaxError.
const API_BASE_URL =
  typeof import.meta !== "undefined" &&
  import.meta &&
  import.meta.env &&
  import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL
    : window.__API_BASE_URL__ || "";

// --- FUNÇÃO AUXILIAR PARA TRATAMENTO DE ERRO ROBUSTO ---
/**
 * Tenta extrair uma mensagem de erro detalhada da resposta da API.
 * @param {Response} response Objeto Response do fetch.
 * @returns {Promise<string>} Mensagem de erro.
 */
async function getErrorMessage(response) {
  let errorDetails;
  try {
    // Tenta ler o corpo JSON da resposta de erro da API
    errorDetails = await response.json();
  } catch (e) {
    // Se a resposta de erro não for JSON (ex: erro de servidor 500 sem corpo)
    errorDetails = {
      message: response.statusText || "Falha na comunicação com o servidor.",
    };
  }

  // Prioriza a mensagem do corpo, depois o status HTTP
  return (
    errorDetails.message ||
    errorDetails.detail ||
    `Erro ${response.status}: Falha na solicitação.`
  );
}

export const passwordResetApi = {
  // Redefinir senha
  async resetPassword(email, newPassword, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/admins/password-reset`, {
        method: "POST",
        body: JSON.stringify({
          email: email,
          new_password: newPassword,
          token: token,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      // --- Tratamento de Erro Robusto ---
      if (!response.ok) {
        const errorMessage = await getErrorMessage(response);

        // Mensagens específicas para erros comuns
        if (response.status === 400) {
          if (errorMessage.includes("token") || errorMessage.includes("code")) {
            throw new Error(
              "Token de redefinição inválido ou expirado. Por favor, solicite um novo link de recuperação."
            );
          }
          if (errorMessage.includes("password")) {
            throw new Error(
              "A nova senha não atende aos requisitos de segurança."
            );
          }
          if (errorMessage.includes("email")) {
            throw new Error("Email inválido ou não encontrado.");
          }
        }

        if (response.status === 404) {
          throw new Error("Email não encontrado em nosso sistema.");
        }

        if (response.status === 410) {
          throw new Error(
            "Token de redefinição expirado. Por favor, solicite um novo link de recuperação."
          );
        }

        throw new Error(errorMessage);
      }
      // --- Fim do Tratamento de Erro Robusto ---

      // Retorna a resposta (geralmente uma mensagem de sucesso)
      return await response.json();
    } catch (err) {
      console.error("Erro no passwordResetApi.resetPassword:", err);

      // Se for um erro de rede ou conexão
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        throw new Error(
          "Não foi possível conectar ao servidor. Verifique sua conexão com a internet."
        );
      }

      // Relançar o erro é essencial para que a UI saiba o que exibir
      throw err;
    }
  },
};

// Export global para compatibilidade
window.passwordResetApi = passwordResetApi;
