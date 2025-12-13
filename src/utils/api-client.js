// src/utils/api-client.js
// src/utils/api-client.js
const API_BASE_URL = import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_BASE_URL;

class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    getHeaders() {
        const headers = {
            "Content-Type": "application/json",
        };
        const token = sessionStorage.getItem("authToken");
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
        return headers;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            console.log(`DEBUG: [${options.method || 'GET'}] ${endpoint} -> Status: ${response.status}`);

            if (response.status === 401 || response.status === 403) {
                sessionStorage.removeItem("authToken");
                // Only redirect if not already on auth page
                if (!window.location.pathname.includes('/auth/')) {
                    alert("Sessão expirada. Faça login novamente.");
                    window.location.href = "/pages/auth/";
                }
                throw new Error("Token expirado");
            }

            // Handle empty responses (like 204 No Content, or 200 with empty body)
            if (response.status === 204 || response.headers.get("content-length") === "0") {
                return null;
            }

            // Try to parse JSON safely
            let data;
            const contentType = response.headers.get("content-type");
            const text = await response.text();

            try {
                if (text && contentType && contentType.includes("application/json")) {
                    data = JSON.parse(text);
                } else {
                    data = text ? { message: text } : null;
                }
            } catch (e) {
                console.warn("Failed to parse response JSON:", e);
                data = { message: text };
            }

            // If response was OK but we have no data, that's fine (null).
            if (response.ok && data === undefined) data = null;

            if (!response.ok) {
                const error = new Error(data?.message || response.statusText || "Erro na requisição");
                error.data = data;
                error.status = response.status;
                throw error;
            }

            return data;
        } catch (error) {
            console.error(`API Request Error [${options.method || 'GET'} ${endpoint}]:`, error);
            // DEBUG: Log full details
            console.log("DEBUG: Request URL:", url);
            console.log("DEBUG: Request Method:", options.method || 'GET');
            if (error.status) console.log("DEBUG: Response Status:", error.status);
            if (error.data) console.log("DEBUG: Response Data:", error.data);
            throw error;
        }
    }

    get(endpoint) {
        return this.request(endpoint, { method: "GET" });
    }

    post(endpoint, body) {
        return this.request(endpoint, {
            method: "POST",
            body: JSON.stringify(body),
        });
    }

    patch(endpoint, body) {
        return this.request(endpoint, {
            method: "PATCH",
            body: JSON.stringify(body),
        });
    }

    delete(endpoint) {
        return this.request(endpoint, { method: "DELETE" });
    }
}

export const apiClient = new ApiClient(API_BASE_URL);
