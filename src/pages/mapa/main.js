// src/mapa/main.js - Entry point para página do mapa
import './map.js';
// Importa handler global de erros
import '../../utils/error-handler.js';

document.getElementById("closeInfoModal").addEventListener("click", () => {
    document.getElementById("infoModal").style.display = "none";
});