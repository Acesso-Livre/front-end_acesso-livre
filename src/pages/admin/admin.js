document.addEventListener("DOMContentLoaded", loadPendingComments);

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

  comments.comments.forEach(comment => {
    const card = document.createElement("div");
    card.className = "comment-card-admin";

    card.innerHTML = `
      <div class="top-info">
        <strong>${comment.user_name}</strong> — ⭐ ${comment.rating}
      </div>

      <p class="comment-text">${comment.comment}</p>

      ${comment.images && comment.images.length > 0 ? comment.images.map(url => `<img src="${url}" class="comment-img">`).join('') : ""}

      <div class="actions">
        <button class="approve-btn" onclick="approve(${comment.id})">Aprovar</button>
        <button class="reject-btn" onclick="reject(${comment.id})">Rejeitar</button>
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