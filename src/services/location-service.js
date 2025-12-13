// src/services/location-service.js
import { apiClient } from "../utils/api-client.js";

export const locationService = {
    async getAll() {
        try {
            const response = await apiClient.get("/locations/");
            // Handle both direct array or object with locations property
            return Array.isArray(response) ? response : (response?.locations || []);
        } catch (error) {
            console.error("Erro ao buscar locais:", error);
            return [];
        }
    },

    async getById(id) {
        try {
            return await apiClient.get(`/locations/${id}`);
        } catch (error) {
            console.error(`Erro ao buscar local ${id}:`, error);
            return null;
        }
    },

    async create(data) {
        try {
            return await apiClient.post("/locations/", data);
        } catch (error) {
            console.error("Erro ao criar local:", error);
            throw error;
        }
    },

    async update(id, data) {
        try {
            return await apiClient.patch(`/locations/${id}`, data);
        } catch (error) {
            console.error(`Erro ao atualizar local ${id}:`, error);
            throw error;
        }
    },

    async delete(id) {
        try {
            return await apiClient.delete(`/locations/${id}`);
        } catch (error) {
            console.error(`Erro ao deletar local ${id}:`, error);
            throw error;
        }
    },

    async getAccessibilityItems() {
        try {
            return await apiClient.get("/locations/accessibility-items/");
        } catch (error) {
            console.error("Erro ao buscar itens de acessibilidade:", error);
            return [];
        }
    },

    async createAccessibilityItem(data) {
        try {
            return await apiClient.post("/locations/accessibility-items/", data);
        } catch (error) {
            console.error("Erro ao criar item de acessibilidade:", error);
            throw error;
        }
    }
};
