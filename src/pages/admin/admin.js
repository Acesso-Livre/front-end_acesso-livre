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
  container.innerHTML = "<p>Carregando comentários...</p>";

  const result = await adminApi.getPendingComments();
  console.log("API retornou:", result);

  // Agora pegamos CORRETAMENTE a lista
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
        <strong>${comment.user_name ?? "Usuário"}</strong> — ⭐ ${comment.rating ?? ""}
      </div>

      <p class="comment-text">${comment.comment}</p>

      <div class="actions">
        <button class="approve-btn" onclick="approve(${comment.id})">Aprovar</button>
        <button class="reject-btn" onclick="reject(${comment.id})">Rejeitar</button>
        ${hasImages ? `<button class="photos-btn" onclick="viewPhotos(${comment.id}, '${images}')">Fotos</button>` : ""}
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
// MODAL DE FOTOS
// ==========================
function viewPhotos(commentId, images) {
  const swiperWrapper = document.querySelector(".swiper-wrapper");
  swiperWrapper.innerHTML = "";

  const imageArray = Array.isArray(images) ? images : images.split(",");

  imageArray.forEach((url) => {
    const slide = document.createElement("div");
    slide.className = "swiper-slide";
    slide.innerHTML = `<img src="${url}" alt="Imagem do comentário" />`;
    swiperWrapper.appendChild(slide);
  });

  document.getElementById("imageModal").style.display = "flex";

  if (window.swiperInstance) window.swiperInstance.destroy();

  window.swiperInstance = new Swiper(".swiper", {
    loop: true,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });
}

// Fechar modal
document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("imageModal").style.display = "none";
  if (window.swiperInstance) window.swiperInstance.destroy();
});