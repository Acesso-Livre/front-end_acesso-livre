// src/services/location-service.js
import { apiClient } from "../utils/api-client.js";

export const locationService = {
    _allLocationsPromise: null,

    async getAll() {
        if (this._allLocationsPromise) {
            return this._allLocationsPromise;
        }

        try {
            this._allLocationsPromise = (async () => {
                const response = await apiClient.get("/locations/");
                // Handle both direct array or object with locations property
                return Array.isArray(response) ? response : (response?.locations || []);
            })();

            const result = await this._allLocationsPromise;
            return result;
        } catch (error) {
            console.error(error);
            return [];
        } finally {
            // Limpar cache após um curto período ou imediatamente após sucesso se não quisermos cache persistente
            // Aqui vamos manter por 5 segundos para evitar floods, mas permitir refresh
            setTimeout(() => { this._allLocationsPromise = null; }, 5000);
        }
    },

    async getById(id) {
        try {
            return await apiClient.get(`/locations/${id}`);
        } catch (error) {

            return null;
        }
    },

    async create(data) {
        try {
            return await apiClient.post("/locations/", data);
        } catch (error) {

            throw error;
        }
    },

    async update(id, data) {
        try {
            return await apiClient.patch(`/locations/${id}`, data);
        } catch (error) {

            throw error;
        }
    },

    async delete(id) {
        try {
            return await apiClient.delete(`/locations/${id}`);
        } catch (error) {

            throw error;
        }
    },

    async getAccessibilityItems() {
        try {
            return await apiClient.get("/locations/accessibility-items/");
        } catch (error) {

            return [];
        }
    },

    async createAccessibilityItem(data) {
        try {
            return await apiClient.post("/locations/accessibility-items/", data);
        } catch (error) {

            throw error;
        }
    }
};
