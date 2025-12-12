// src/mapa/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

let locationsData = [];

export async function getAllLocations() {
    try {
        const url = `${API_BASE_URL}/locations/`;
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            locationsData = data.locations || [];
            return locationsData;
        } else {
            throw new Error("Erro ao fazer requisição: " + response.status);
        }
    } catch (error) {
        console.error("Erro na requisição getAllLocations:", error);
        return [];
    }
}

export async function getLocations(skip = 0, limit = 20) {
    try {
        const params = new URLSearchParams();
        params.append("skip", skip);
        params.append("limit", limit);
        const url = `${API_BASE_URL}/locations/?${params}`;
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            return data.locations || [];
        } else {
            throw new Error("Erro ao fazer requisição: " + response.status);
        }
    } catch (error) {
        console.error("Erro na requisição getLocations:", error);
        return [];
    }
}

export async function getAccessibilityItems() {
    try {
        const url = `${API_BASE_URL}/locations/accessibility-items/`;
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            return data.accessibility_items || [];
        } else {
            throw new Error("Erro ao fazer requisição: " + response.status);
        }
    } catch (error) {
        console.error("Erro na requisição getAccessibilityItems:", error);
        return [];
    }
}

export async function getLocationById(locationId) {
    try {
        // Tenta pelo cache de locationsData (se já carregado)
        if (locationsData && locationsData.length > 0) {
            const found = locationsData.find((l) => l.id == locationId);
            if (found) return found;
        }

        // Caso não esteja no cache, buscar lista (limit maior)
        const all = await getLocations(0, 100);
        return all.find((l) => l.id == locationId) || null;
    } catch (error) {
        console.error("Erro ao buscar localização getLocationById:", error);
        return null;
    }
}

export async function getAccessibilityItemById(itemId) {
    try {
        const url = `${API_BASE_URL}/locations/accessibility-items/${itemId}`;
        const response = await fetch(url);
        if (response.ok) {
            return await response.json();
        } else {
            throw new Error(
                "Erro ao buscar item de acessibilidade: " + response.status
            );
        }
    } catch (error) {
        console.error("Erro na requisição getAccessibilityItemById:", error);
        return null;
    }
}

export async function postComment(commentData) {
    try {
        const formData = new FormData();
        formData.append('user_name', commentData.user_name);
        formData.append('rating', commentData.rating);
        formData.append('comment', commentData.comment);
        formData.append('location_id', commentData.location_id);
        formData.append('status', commentData.status);

        // Enviar imagens
        if (commentData.images && Array.isArray(commentData.images)) {
            commentData.images.forEach((file) => {
                formData.append("images", file);
            });
        } else if (commentData.images) {
            formData.append("images", commentData.images);
        }

        const token = sessionStorage.getItem('authToken');
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/comments`, {
            method: "POST",
            body: formData,
            headers: headers,
        });

        if (!response.ok) {
            throw new Error("Erro ao enviar comentário");
        }

        return await response.json();
    } catch (error) {
        console.error("Erro postComment:", error);
        return null;
    }
}

// Buscar comentários pendentes (admin)
export async function getPendingComments() {
    try {
        const response = await fetch(`${API_BASE_URL}/comments/pending`);
        if (!response.ok) throw new Error("Erro ao buscar pendentes");
        return await response.json();
    } catch (error) {
        console.error("Erro getPendingComments:", error);
        return [];
    }
}

// Aprovar comentário
export async function approveComment(commentId) {
    try {
        const response = await fetch(`${API_BASE_URL}/comments/${commentId}/approve`, {
            method: "PUT",
        });
        return response.ok;
    } catch (error) {
        console.error("Erro approveComment:", error);
        return false;
    }
}

// Rejeitar comentário
export async function rejectComment(commentId) {
    try {
        const response = await fetch(`${API_BASE_URL}/comments/${commentId}/reject`, {
            method: "PUT",
        });
        return response.ok;
    } catch (error) {
        console.error("Erro rejectComment:", error);
        return false;
    }
}

// Buscar SOMENTE comentários aprovados de um local
export async function getApprovedCommentsForLocation(locationId) {
    try {
        const token = sessionStorage.getItem('authToken');
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/comments/${locationId}/comments`, {
            headers: headers
        });

        if (!response.ok) throw new Error("Erro buscar comentários aprovados");

        const data = await response.json();

        return data.comments || [];
    } catch (error) {
        console.error("Erro getApprovedCommentsForLocation:", error);
        return [];
    }
}

// Buscar TODOS os comentários de um local (pendente, aprovado, rejeitado)
export async function getCommentsByLocationId(locationId) {
    try {
        const token = sessionStorage.getItem('authToken');
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/comments/${locationId}/comments`, {
            headers: headers
        });
        if (!response.ok) throw new Error("Erro ao buscar comentários");
        const data = await response.json();
        return data.comments || [];
    } catch (error) {
        console.error("Erro getCommentsByLocationId:", error);
        return [];
    }
}

// Buscar comentários recentes para página inicial
export async function fetchRecentComments() {
    try {
        const token = sessionStorage.getItem('authToken');
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/comments/recent`, {
            headers: headers
        });
        if (!response.ok) throw new Error("Erro ao buscar comentários recentes");
        const data = await response.json();
        return data.comments || [];
    } catch (error) {
        console.error("Erro fetchRecentComments:", error);
        return [];
    }
}

// Postar um pin de acessibilidade
export async function postAccessibilityPin(pinData) {
    try {
        const token = sessionStorage.getItem('authToken');
        const headers = {
            "Content-Type": "application/json",
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/locations/accessibility-pins`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(pinData),
        });

        if (!response.ok) {
            throw new Error("Erro ao postar pin de acessibilidade");
        }

        return await response.json();
    } catch (error) {
        console.error("Erro postAccessibilityPin:", error);
        return null;
    }
}

// Buscar pins de acessibilidade para um local
export async function getAccessibilityPinsForLocation(locationId) {
    try {
        const token = sessionStorage.getItem('authToken');
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/locations/${locationId}/accessibility-pins`, {
            headers: headers
        });
        if (!response.ok) throw new Error("Erro ao buscar pins de acessibilidade");
        const data = await response.json();
        return data.accessibility_pins || [];
    } catch (error) {
        console.error("Erro getAccessibilityPinsForLocation:", error);
        return [];
    }
}

// Export global para compatibilidade
window.api = {
    getAllLocations,
    getLocations,
    getAccessibilityItems,
    getLocationById,
    getAccessibilityItemById,
    postComment,
    getPendingComments,
    approveComment,
    rejectComment,
    getApprovedCommentsForLocation,
    getCommentsByLocationId,
    fetchRecentComments,
};
