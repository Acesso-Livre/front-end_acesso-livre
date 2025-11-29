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
      ? `<button class="photos-btn" onclick="togglePhotos(${comment.id})">Fotos</button>`
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

function togglePhotos(commentId) {
  const imagesContainer = document.getElementById(`comment-images-${commentId}`);

  // Alternar a visibilidade da imagem
  if (imagesContainer.style.display === "none") {
    imagesContainer.style.display = "block";
  } else {
    imagesContainer.style.display = "none";
  }
}

async function approve(id) {
  await adminApi.approveComment(id);
  loadPendingComments();
}

async function reject(id) {
  await adminApi.rejectComment(id);
  loadPendingComments();
}
function viewPhotos(commentId) {
  // Ação que será executada ao clicar no botão "Fotos"
  alert(`Visualizar fotos para o comentário com ID: ${commentId}`);
}