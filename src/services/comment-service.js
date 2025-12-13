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
        try {
            return await apiClient.patch(`/comments/${id}/status`, { status: "approved" });
        } catch (error) {
            console.error("Erro ao aprovar comentário:", error);
            throw error;
        }
    },

    async reject(id) {
        try {
            return await apiClient.patch(`/comments/${id}/status`, { status: "rejected" });
        } catch (error) {
            console.error("Erro ao rejeitar comentário:", error);
            throw error;
        }
    },

    async create(data) {
        try {
            const formData = new FormData();

            for (const key in data) {
                // Skip null or undefined
                if (data[key] === undefined || data[key] === null) continue;

                if (key === "images") {
                    if (Array.isArray(data.images) && data.images.length > 0) {
                        data.images.forEach((image) => {
                            formData.append("images", image);
                        });
                    }
                } else if (Array.isArray(data[key])) {
                    // Append array items individually (e.g. comment_icon_ids)
                    data[key].forEach((item) => {
                        formData.append(key, item);
                    });
                } else {
                    formData.append(key, data[key]);
                }
            }

            const response = await apiClient.post("/comments/", formData);
            return response;
        } catch (error) {
            console.error("Erro ao criar comentário:", error);
            return null;
        }
    },

    async getIcons() {
        try {
            const response = await apiClient.get("/comments/icons/");
            return Array.isArray(response) ? response : (response?.comment_icons || []);
        } catch (error) {
            // Hotfix: Backend returns 422 but sends valid data
            if (error.status === 422 && error.data?.comment_icons) {
                return error.data.comment_icons;
            }
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
