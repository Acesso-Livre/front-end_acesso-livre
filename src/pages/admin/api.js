// src/admin/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const adminApi = {
    // Buscar comentários pendentes
    async getPendingComments() {
        try {
            const response = await fetch(`${API_BASE_URL}/comments/pending?skip=0&limit=10`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + sessionStorage.getItem("authToken")
                },
            });
            if (!response.ok) throw new Error("Erro ao carregar comentários pendentes");
            return await response.json();
        } catch (err) {
            console.error(err);
            return [];
        }
    },

    // Aprovar comentário
    async approveComment(commentId) {
        try {
            const response = await fetch(`${API_BASE_URL}/comments/${commentId}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status: "approved" }),
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + sessionStorage.getItem("authToken")
                }
            });

            console.log("Resposta approveComment:", response);
            return await response.json();
        } catch (err) {
            console.error(err);
        }
    },

    // Rejeitar comentário
    async rejectComment(commentId) {
        try {
            const response = await fetch(`${API_BASE_URL}/comments/${commentId}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status: "rejected" }),
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + sessionStorage.getItem("authToken")
                },
            });

            return await response.json();
        } catch (err) {
            console.error(err);
        }
    },
};

// Export global para compatibilidade
window.adminApi = adminApi;
