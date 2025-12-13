// src/utils/image-utils.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Resolve an image object or string to a full URL.
 * @param {string|object} image - The image string (URL) or object ({id, url}).
 * @returns {string|null} The full URL or null if invalid.
 */
export function resolveImageUrl(image) {
    if (!image) return null;

    // If it's already a string, assume it's a URL
    if (typeof image === 'string') {
        return image.trim();
    }

    // If object has explicit URL
    if (image.url) {
        return image.url;
    }

    // If object has ID, construct URL
    if (image.id) {
        return `${API_BASE_URL}/images/${image.id}`;
    }

    return null;
}

/**
 * Filter and resolve a list of images.
 * @param {Array|string} imagesData - Array of images or comma-separated string.
 * @returns {Array<string>} Array of valid image URLs.
 */
export function resolveImageList(imagesData) {
    let images = [];

    if (Array.isArray(imagesData)) {
        images = imagesData;
    } else if (typeof imagesData === 'string' && imagesData.trim()) {
        try {
            // Try parsing JSON first
            const parsed = JSON.parse(imagesData);
            if (Array.isArray(parsed)) images = parsed;
            else images = imagesData.split(',');
        } catch (e) {
            images = imagesData.split(',');
        }
    }

    return images
        .map(resolveImageUrl)
        .filter(url => url !== null && url !== '');
}
