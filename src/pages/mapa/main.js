// src/mapa/main.js - Entry point para página do mapa
import './api.js';
import './map.js';
// Importa handler global de erros
import '../../utils/error-handler.js';

// Test functions para desenvolvimento
window.testGetLocations = async function (skip = 0, limit = 10) {
    console.log(`Testing getLocations with skip=${skip}, limit=${limit}`);
    const result = await window.api.getLocations(skip, limit);
    console.log('Result:', result);
    return result;
};

window.logAllPins = async function () {
    const items = await window.api.getAccessibilityItems();
    console.log('Accessibility Items:', items);
};

window.testGetAccessibilityItems = async function () {
    console.log('Testing getAccessibilityItems');
    const result = await window.api.getAccessibilityItems();
    console.log('Result:', result);
    return result;
};

document.getElementById("closeInfoModal").addEventListener("click", () => {
    document.getElementById("infoModal").style.display = "none";
});