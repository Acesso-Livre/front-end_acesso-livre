// src/auth/api.js
// Ambiente: Nem sempre `import.meta.env` está definido quando a página
// é aberta diretamente no navegador sem bundler (Vite). Usamos um
// fallback seguro para evitar exceções que interrompam a execução do
// módulo e impeçam os handlers de UI de serem registrados.
// Detecta `import.meta.env.VITE_API_BASE_URL` quando disponível (em módulos)
// e usa `window.__API_BASE_URL__` como fallback. Evitamos referências
// inválidas a `import` que causariam SyntaxError.
const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL)
    ? import.meta.env.VITE_API_BASE_URL
    : (window.__API_BASE_URL__ || '');

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
        errorDetails = { message: response.statusText || "Falha na comunicação com o servidor." };
    }

    // Prioriza a mensagem do corpo, depois o status HTTP
    return {
        message: errorDetails.message || errorDetails.detail || `Erro ${response.status}: Falha na solicitação.`,
        status: response.status
    };
}

export const authApi = {
    // Autenticar Usuário
    async login(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/admins/login`, {
                method: "POST",
                body: JSON.stringify({ email, password }),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const errInfo = await getErrorMessage(response);
                const err = new Error(errInfo.message);
                // Marcar status e se é erro de usuário (4xx)
                err.status = errInfo.status || response.status;
                err.isUserError = err.status >= 400 && err.status < 500;
                throw err;
            }

            const data = await response.json();

            // Armazenar corretamente o access_token
            if (data.access_token) {
                sessionStorage.setItem("authToken", data.access_token);
            }

            return data;
        } catch (err) {
            console.error("Erro ao fazer login:", err);
            // É melhor relançar o erro para que o componente possa tratar a falha
            throw err;
        }
    },

    // Validar se o token é válido
    async checkToken() {
        try {
            const token = sessionStorage.getItem("authToken");

            if (!token) {
                return { valid: false };
            }

            const response = await fetch(`${API_BASE_URL}/admins/check-token`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
            });

            if (!response.ok) {
                // Em caso de falha na validação (token expirado/inválido), 
                // limpamos o token e indicamos que é inválido.
                sessionStorage.removeItem("authToken");
                return { valid: false };
            }

            const data = await response.json();
            return data;
        } catch (err) {
            console.error("Erro ao validar token:", err);
            // Relançar um erro aqui não é ideal, pois a função retorna {valid: false}
            return { valid: false };
        }
    },

    // Solicitar recuperação de senha (FUNÇÃO CORRIGIDA)
    async forgotPassword(email) {
        try {
            const response = await fetch(`${API_BASE_URL}/admins/forgot-password`, {
                method: "POST",
                body: JSON.stringify({ email }),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            // --- Tratamento de Erro Robusto (Aprimorado) ---
            if (!response.ok) {
                const errInfo = await getErrorMessage(response);
                const err = new Error(errInfo.message);
                err.status = errInfo.status || response.status;
                err.isUserError = err.status >= 400 && err.status < 500;
                throw err;
            }
            // --- Fim do Tratamento de Erro Robusto ---

            // Retorna a resposta (geralmente uma mensagem de sucesso)
            return await response.json();

        } catch (err) {
            console.error("Erro no authApi.forgotPassword:", err);
            // Relançar o erro é essencial para que a UI saiba o que exibir
            throw err;
        }
    }
};

// Export global para compatibilidade
window.authApi = authApi;