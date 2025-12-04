// src/auth/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

            if (!response.ok) throw new Error("Erro ao fazer login");

            const data = await response.json();

            // Armazenar corretamente o access_token
            if (data.access_token) {
                sessionStorage.setItem("authToken", data.access_token);
            }

            return data;
        } catch (err) {
            console.error(err);
            return [];
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
                return { valid: false };
            }

            const data = await response.json();
            return data;
        } catch (err) {
            console.error("Erro ao validar token:", err);
            return { valid: false };
        }
    },
};

// Export global para compatibilidade
window.authApi = authApi;
