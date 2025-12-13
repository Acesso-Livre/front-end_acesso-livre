// src/main.js - Entry point para página inicial
import "./components/footer/footer.css";
import footerHtml from "./components/footer/footer.html?raw";
import "./components/header/header.css";
import headerHtml from "./components/header/header.html?raw";
import { initHeader } from "./components/header/header.js";
import { fetchRecentComments } from "./pages/mapa/api.js";

// Carregar componentes dinamicamente
async function loadComponent(html, position = "body-end", componentName = "") {
  try {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html.trim();

    const element = wrapper.firstElementChild;

    // --- Inserir no DOM ---
    if (position === "body-start") document.body.prepend(element);
    else if (position === "body-end") document.body.append(element);
    else document.querySelector(position)?.append(element);

    console.log(`${componentName} carregado com sucesso`);
  } catch (err) {
    console.error(`Erro ao carregar ${componentName}:`, err);
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

    container.innerHTML = comments
      .map((comment) => {
        const locationName = comment.location_name || "Local desconhecido";
        const rating = comment.location_rating || 0;
        const userName = comment.user_name || "Anônimo";
        const description = comment.description || comment.comment || "";

        return `
        <div class="comentario-usuario">
          <div class="title">
            <div class="comentario-local">${locationName}</div>
            <div class="comentario-nota">Nota: ${parseFloat(rating).toFixed(
          2
        )}/5</div>
          </div>
          <div class="text">
            <div class="comentario-nome">${userName}</div>
            <div class="comentario-texto">${description.substring(0, 100)}${description.length > 100 ? "..." : ""
          }</div>
          </div>
        </div>
      </a>
    `;
      })
      .join("");
  } catch (error) {
    console.error("Erro ao carregar comentários:", error);
    container.innerHTML = "<p>Erro ao carregar avaliações.</p>";
  }
}

// Inicialização
document.addEventListener("DOMContentLoaded", async () => {
  await loadComponent(headerHtml, ".blue-block-main", "header");
  await loadComponent(footerHtml, "body-end", "footer");
  initHeader(); // Inicializa os event listeners dos modais após carregar os componentes
  renderRecentComments();
});
