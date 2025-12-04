// src/main.js - Entry point para página inicial
import { fetchRecentComments } from './mapa/api.js';

// Carregar componentes dinamicamente
async function loadComponent(name, position = "body-end") {
    try {
        // --- HTML ---
        const htmlResponse = await fetch(`./components/${name}/${name}.html`);
        if (!htmlResponse.ok) throw new Error(`Erro ao carregar ${name}.html`);
        const html = await htmlResponse.text();

        const wrapper = document.createElement("div");
        wrapper.innerHTML = html.trim();

        const element = wrapper.firstElementChild;

        // --- CSS ---
        const cssLink = document.createElement("link");
        cssLink.rel = "stylesheet";
        cssLink.href = `./components/${name}/${name}.css`;
        document.head.appendChild(cssLink);

        // --- Inserir no DOM ---
        if (position === "body-start") document.body.prepend(element);
        else if (position === "body-end") document.body.append(element);
        else document.querySelector(position)?.append(element);

        // --- JS ---
        const jsPath = `./components/${name}/${name}.js`;
        const jsExists = await fetch(jsPath).then(r => r.ok).catch(() => false);
        if (jsExists) {
            const script = document.createElement("script");
            script.src = jsPath;
            script.onload = () => console.log(`${name} JS carregado`);
            document.body.appendChild(script);
        }

        console.log(`${name} carregado com sucesso`);
    } catch (err) {
        console.error(err);
    }
}

// Renderizar comentários recentes
async function renderRecentComments() {
    const container = document.getElementById("page-comentarios-section");
    if (!container) return;

    try {
        const comments = await fetchRecentComments();

        if (!comments || comments.length === 0) {
            container.innerHTML = "<p>Nenhuma avaliação recente.</p>";
            return;
        }

        container.innerHTML = comments.map(comment => {
            const locationName = comment.location_name || "Local desconhecido";
            const rating = comment.location_rating || 0;
            const userName = comment.user_name || "Anônimo";
            const description = comment.description || comment.comment || "";

            return `
      <a href="#">
        <div class="comentario-usuario">
          <div class="title">
            <div class="comentario-local">${locationName}</div>
            <div class="comentario-nota">Nota: ${parseFloat(rating).toFixed(2)}/5</div>
          </div>
          <div class="text">
            <div class="comentario-nome">${userName}</div>
            <div class="comentario-texto">${description.substring(0, 100)}${description.length > 100 ? '...' : ''}</div>
          </div>
        </div>
      </a>
    `;
        }).join('');
    } catch (error) {
        console.error("Erro ao carregar comentários:", error);
        container.innerHTML = "<p>Erro ao carregar avaliações.</p>";
    }
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
    loadComponent("header", "body-start");
    loadComponent("footer", "body-end");
    renderRecentComments();
});
