// src/utils/location-utils.js

export const LOCATION_TYPES = {
    ESTACIONAMENTO: "estacionamento",
    BLOCO: "bloco",
    QUADRA_AREIA: "quadra_areia",
    QUADRA: "quadra",
    CAMPO: "campo",
    CANTINA: "cantina",
    BIBLIOTECA: "biblioteca",
    AUDITORIO: "auditorio",
    CORES: "cores",
    ENTRADA: "entrada",
    DEFAULT: "default"
};

const COLOR_MAP = {
    [LOCATION_TYPES.ESTACIONAMENTO]: "#FF0000",
    [LOCATION_TYPES.BLOCO]: "#00FF00",
    [LOCATION_TYPES.CAMPO]: "#0000FF",
    [LOCATION_TYPES.QUADRA]: "#FFFF00",
    [LOCATION_TYPES.QUADRA_AREIA]: "#FFA500",
    [LOCATION_TYPES.BIBLIOTECA]: "#800080",
    [LOCATION_TYPES.CANTINA]: "#00FFFF",
    [LOCATION_TYPES.AUDITORIO]: "#FFC0CB",
    [LOCATION_TYPES.CORES]: "#808080",
    [LOCATION_TYPES.ENTRADA]: "#000000",
    [LOCATION_TYPES.DEFAULT]: "#000000",
};

/**
 * Detect location type based on name.
 * @param {string} name 
 * @returns {string} One of LOCATION_TYPES
 */
export function detectTypeFromName(name) {
    if (!name) return LOCATION_TYPES.DEFAULT;
    const n = name.toLowerCase();

    if (n.includes("estacionamento")) return LOCATION_TYPES.ESTACIONAMENTO;
    if (n.includes("bloco")) return LOCATION_TYPES.BLOCO;
    if (n.includes("quadra de areia")) return LOCATION_TYPES.QUADRA_AREIA;
    if (n.includes("quadra")) return LOCATION_TYPES.QUADRA;
    if (n.includes("campo")) return LOCATION_TYPES.CAMPO;
    if (n.includes("cantina")) return LOCATION_TYPES.CANTINA;
    if (n.includes("biblioteca")) return LOCATION_TYPES.BIBLIOTECA;
    if (n.includes("audit")) return LOCATION_TYPES.AUDITORIO;
    if (n.includes("cores")) return LOCATION_TYPES.CORES;
    if (n.includes("entrada")) return LOCATION_TYPES.ENTRADA;

    return LOCATION_TYPES.DEFAULT;
}

/**
 * Get color for a specific location type.
 * @param {string} type 
 * @returns {string} Hex color code
 */
export function getColorForType(type) {
    return COLOR_MAP[type] || COLOR_MAP[LOCATION_TYPES.DEFAULT];
}
