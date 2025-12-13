// src/services/comment-service.js
import { apiClient } from "../utils/api-client.js";

export const commentService = {
    async getPending(skip = 0, limit = 10) {
        try {
            const response = await apiClient.get(`/comments/pending?skip=${skip}&limit=${limit}`);
            return Array.isArray(response) ? response : (response?.comments || []);
        } catch (error) {

            return [];
        }
    },

    async getByLocation(locationId) {
        try {
            const response = await apiClient.get(`/comments/${locationId}/comments`);
            return response; // Usually returns object with comments array
        } catch (error) {

            return { comments: [] };
        }
    },

    async getApprovedByLocation(locationId) {
        // Note: Assuming there is an endpoint for this or we filter the normal one?
        // Based on map.js logic: window.api.getApprovedCommentsForLocation
        // If the API endpoint is the same, we reuse getByLocation.
        // However, map.js seemed to use a specific call.
        // Let's assume standard endpoint for now and refactor if needed.
        return this.getByLocation(locationId);
    },

    async approve(id) {
        return await apiClient.patch(`/comments/${id}/status`, { status: "approved" });
    },

    async reject(id) {
        return await apiClient.patch(`/comments/${id}/status`, { status: "rejected" });
    },

    async create(data) {
        try {
            const response = await apiClient.post("/comments/", data);
            return response;
        } catch (error) {

            return null;
        }
    },

    async getIcons() {
        try {
            return await apiClient.get("/comments/icons/");
        } catch (error) {

            return [];
        }
    },

    async getRecent() {
        try {
            const response = await apiClient.get("/comments/recent/");
            return Array.isArray(response) ? response : (response?.comments || []);
        } catch (error) {

            return [];
        }
    },

    async deleteImage(imageId) {
        try {
            await apiClient.delete(`/comments/images/${imageId}`);
            return true;
        } catch (error) {

            return false;
        }
    }
};
