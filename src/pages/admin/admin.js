// Função para carregar comentários com validação
async function loadAndDisplayComments() {
  const tokenValidation = await authApi.checkToken();

  if (tokenValidation.valid) {
    loadPendingComments();
  } else {
    console.log("Token inválido, não carregando comentários");
  }
}

async function loadPendingComments() {
  const container = document.getElementById("reviews-list");
  container.innerHTML = "<p>Carregando comentários...</p>";

  const comments = await adminApi.getPendingComments();

  console.log("Comentários pendentes:", comments);

  if (comments.comments.length === 0) {
    container.innerHTML = "<p>Nenhum comentário pendente ✨</p>";
    return;
  }

  container.innerHTML = "";

  comments.comments.forEach((comment) => {
    const card = document.createElement("div");
    card.className = "comment-card-admin";

    // Verificar se o comentário tem imagens
    const photosButton = comment.images
  ? `<button class="photos-btn" onclick="viewPhotos(${comment.id}, '${comment.images}')">Fotos</button>`
  : "";

    card.innerHTML = `
      <div class="top-info">
        <strong>${comment.user_name}</strong> — ⭐ ${comment.rating}
      </div>

      <p class="comment-text">${comment.comment}</p>

      <!-- A imagem inicialmente estará oculta -->
      <div id="comment-images-${comment.id}" class="comment-images" style="display: none;">
        <img src="${comment.images}" class="comment-img">
      </div>

      <div class="actions">
        <button class="approve-btn" onclick="approve(${
          comment.id
        })">Aprovar</button>
        <button class="reject-btn" onclick="reject(${
          comment.id
        })">Rejeitar</button>
        ${photosButton} <!-- Botão de Fotos condicional -->
      </div>
    `;

    container.appendChild(card);
  });
}

async function approve(id) {
  await adminApi.approveComment(id);
  loadPendingComments();
}

async function reject(id) {
  await adminApi.rejectComment(id);
  loadPendingComments();
}

function viewPhotos(commentId, images) {
  // Atualiza o conteúdo do modal com as imagens dos comentários
  const swiperWrapper = document.querySelector('.swiper-wrapper');
  swiperWrapper.innerHTML = ''; // Limpa o swiper antes de adicionar as novas imagens

  // Certifique-se de que 'images' é um array de URLs (se for string, converta em array)
  const imageUrls = Array.isArray(images) ? images : images.split(',');

  // Adiciona cada imagem ao swiper
  if (imageUrls.length > 0) {
    imageUrls.forEach(url => {
      const swiperSlide = document.createElement('div');
      swiperSlide.classList.add('swiper-slide');

      const imgElement = document.createElement('img');
      imgElement.src = url;
      imgElement.alt = `Imagem do comentário`;

      swiperSlide.appendChild(imgElement);
      swiperWrapper.appendChild(swiperSlide);
    });
  } else {
    // Caso não haja imagens, exibe uma mensagem
    swiperWrapper.innerHTML = `
      <div class="swiper-slide">
        <div class="project-img">
          <p>Sem imagens disponíveis</p>
        </div>
      </div>`;
  }

  // Exibe o modal
  const imageModal = document.getElementById("imageModal");
  imageModal.style.display = "flex"; // Exibe o modal

  // Recarregar o carrossel do Swiper
  if (window.swiperInstance) {
    window.swiperInstance.destroy(); // Destrói a instância anterior do Swiper
  }
  window.swiperInstance = new Swiper(".swiper", {
    loop: true, // Habilita o loop no swiper
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    autoplay: false,
    touchStartPreventDefault: true, // Impede o comportamento de arraste
    allowTouchMove: true, // Permite o movimento de deslizar dentro do swiper
  });
}

// Evento de fechar o modal globalmente
document.getElementById("closeModal").addEventListener("click", function () {
  const imageModal = document.getElementById("imageModal");
  imageModal.style.display = "none"; // Esconde o modal

  // Destrói a instância do Swiper para evitar o arraste após o fechamento do modal
  if (window.swiperInstance) {
    window.swiperInstance.destroy(true, true); // Destrói a instância do swiper
  }
});