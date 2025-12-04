// ==========================
// PROTEÇÃO DE ROTA
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  const token = sessionStorage.getItem("authToken");

  if (!token) {
    console.warn("Sem token → redirecionando ao login");
    window.location.href = "../auth/index.html";
    return;
  }

  loadPendingComments();
});

// ==========================
// BOTÃO DE LOGOUT
// ==========================
document.getElementById("logout-btn").addEventListener("click", () => {
  sessionStorage.removeItem("authToken");
  window.location.href = "../auth/index.html";
});

// ==========================
// BUSCAR COMENTÁRIOS PENDENTES
// ==========================
async function loadPendingComments() {
  const container = document.getElementById("reviews-list");
  container.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div></div>';

  const result = await adminApi.getPendingComments();
  console.log("API retornou:", result);

  const list = Array.isArray(result.comments) ? result.comments : [];

  if (list.length === 0) {
    container.innerHTML = "<p>Nenhum comentário pendente ✨</p>";
    return;
  }

  container.innerHTML = "";

  list.forEach((comment) => {
    const card = document.createElement("div");
    card.className = "comment-card-admin";

    const images = comment.images || "";
    const hasImages = images.length > 0;

    card.innerHTML = `
      <div class="top-info">
        <strong>${comment.user_name ?? "Usuário"}</strong> — ${comment.rating ?? ""} ⭐
      </div>

      <p class="comment-text">${comment.comment}</p>

      <div class="actions">
        <button class="btn-approve" onclick="approve(${comment.id})">Aprovar</button>
        <button class="btn-reject" onclick="reject(${comment.id})">Rejeitar</button>
        ${hasImages ? `<button class="btn-photos" onclick="viewPhotos('${images}')">Fotos</button>` : ""}
      </div>
    `;

    container.appendChild(card);
  });
}

// ==========================
// APROVAR / REJEITAR
// ==========================
async function approve(id) {
  await adminApi.approveComment(id);
  loadPendingComments();
}

async function reject(id) {
  await adminApi.rejectComment(id);
  loadPendingComments();
}

// ==========================
// MODAL DE FOTOS COM SWIPER
// ==========================
function viewPhotos(images) {
  const modal = document.getElementById("photoModal");
  const swiperWrapper = document.getElementById("swiperWrapper");

  // Mostrar modal com spinner
  swiperWrapper.innerHTML = '<div class="loading-container" id="loadingSpinner-foto"><div class="loading-spinner"></div></div>';
  modal.style.display = "flex";

  const imageArray = Array.isArray(images) ? images : images.split(",");

  // Simular carregamento
  setTimeout(() => {
    // Limpar spinner e adicionar fotos
    swiperWrapper.innerHTML = "";

    imageArray.forEach((url) => {
      const slide = document.createElement("div");
      slide.className = "swiper-slide";
      slide.innerHTML = `<img src="${url}" alt=""/>`;
      swiperWrapper.appendChild(slide);
    });

    // Destruir instância anterior (se existir) para evitar bug
    if (window.swiperInstance) {
      window.swiperInstance.destroy(true, true);
    }

    // Criar Swiper
    window.swiperInstance = new Swiper(".swiper", {
      loop: true,
      pagination: {
        el: ".swiper-pagination",
        clickable: true
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev"
      }
    });
  }, 1000); // 1 segundo
}

// Fechar modal
document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("photoModal").style.display = "none";

  if (window.swiperInstance) {
    window.swiperInstance.destroy(true, true);
    window.swiperInstance = null;
  }
});