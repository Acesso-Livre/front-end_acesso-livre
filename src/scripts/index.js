// ===== CARREGAR COMENTÁRIOS RECENTES =====
async function loadRecentComments() {
  try {
    const section = document.getElementById("page-comentarios-section");
    if (!section) return;

    // Mostrar loader
    section.innerHTML = `
      <div class="loader-container">
        <span class="loader"></span>
      </div>
    `;

    const comments = await window.api.fetchRecentComments();

    // Limpar loader
    section.innerHTML = "";

    // Se não houver comentários, exibir mensagem
    if (!comments || comments.length === 0) {
      const msg = document.createElement("p");
      msg.style.cssText =
        "text-align: center; color: #999; padding: 20px; width: 100%;";
      msg.textContent = "Nenhum comentário recente disponível";
      section.appendChild(msg);
      return;
    }

    // Renderizar cada comentário como um card
    comments.forEach((comment) => {
      const locationName = comment.location_name || "Local desconhecido";
      const rating = comment.location_rating || 0;
      const userName = comment.user_name || "Anônimo";
      const description = comment.description || "";

      // Criar estrutura HTML do card
      const link = document.createElement("a");
      link.href =
        "#" +
        locationName
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .replace(/\s+/g, "-");

      const card = document.createElement("div");
      card.className = "comentario-usuario";

      const titleDiv = document.createElement("div");
      titleDiv.className = "title";

      const localDiv = document.createElement("div");
      localDiv.className = "comentario-local";
      localDiv.textContent = locationName;

      const notaDiv = document.createElement("div");
      notaDiv.className = "comentario-nota";
      notaDiv.textContent = `Nota: ${parseFloat(rating).toFixed(2)}/5`;

      const textDiv = document.createElement("div");
      textDiv.className = "text";

      const nomeDiv = document.createElement("div");
      nomeDiv.className = "comentario-nome";
      nomeDiv.textContent = userName;

      const textoDiv = document.createElement("div");
      textoDiv.className = "comentario-texto";
      textoDiv.textContent =
        description.substring(0, 100) + (description.length > 100 ? "..." : "");

      // Montar estrutura
      titleDiv.appendChild(localDiv);
      titleDiv.appendChild(notaDiv);
      textDiv.appendChild(nomeDiv);
      textDiv.appendChild(textoDiv);
      card.appendChild(titleDiv);
      card.appendChild(textDiv);
      link.appendChild(card);

      section.appendChild(link);
    });
  } catch (error) {
    console.error("Erro ao carregar comentários recentes:", error);
    const section = document.getElementById("page-comentarios-section");
    if (section) {
      const msg = document.createElement("p");
      msg.style.cssText =
        "text-align: center; color: #999; padding: 20px; width: 100%;";
      msg.textContent = "Erro ao carregar comentários";
      section.appendChild(msg);
    }
  }
}

// ===== INICIALIZAR QUANDO DOM ESTÁ PRONTO =====
document.addEventListener("DOMContentLoaded", function () {
  const btn = document.querySelector(".explorar-mapa-btn");
  if (btn) {
    btn.addEventListener("click", function (event) {
      // marca que o usuário veio do botão 'Explorar mapa' — mapa deve abrir (sem modal)
      try {
        sessionStorage.setItem("enterFromExplore", "1");
      } catch (e) {
        /* ignore */
      }
      btn.classList.add("animar");
      setTimeout(() => btn.classList.remove("animar"), 350);
      // navegação segue normalmente (anchor)
    });
  }

  // Carregar comentários recentes
  loadRecentComments();
});
