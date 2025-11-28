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

      // Build card HTML; if images exist render a "Fotos" button instead of images
      const hasImages = comment.images && comment.images.length && comment.images.length > 0;

      card.innerHTML = `
        <div class="top-info">
          <strong>${comment.user_name}</strong> — ⭐ ${comment.rating}
        </div>

        <p class="comment-text">${comment.comment}</p>

        ${hasImages ? '<button class="photos-btn btn" data-images-index="0">Fotos</button>' : ''}

        <div class="actions">
          <button class="approve-btn" onclick="approve(${comment.id})">Aprovar</button>
          <button class="reject-btn" onclick="reject(${comment.id})">Rejeitar</button>
        </div>
      `;

    // attach images data for modal access
    if (hasImages) {
      card.setAttribute('data-images', JSON.stringify(comment.images));
    }

    container.appendChild(card);
  });
}

  // PHOTO MODAL / CAROUSEL USING LEAFLET (CRS.Simple) FOR MULTIPLE IMAGES
  let photoModal = null;
  let photoMap = null;
  let photoOverlay = null;
  let currentPhotoIndex = 0;
  let currentPhotoList = [];

  function openPhotoModal(images) {
    currentPhotoList = images.slice();
    currentPhotoIndex = 0;

    const modal = document.getElementById('photoModal');
    const body = document.getElementById('photo-modal-body');
    const idx = document.getElementById('photoIndex');

    // clear previous
    body.innerHTML = '';
    idx.textContent = `${currentPhotoIndex + 1} / ${currentPhotoList.length}`;

    if (currentPhotoList.length === 1) {
      // show a centered img
      const img = document.createElement('img');
      img.src = currentPhotoList[0];
      img.alt = 'Foto do comentário';
      body.appendChild(img);
    } else {
      // create a map container and initialize Leaflet map with CRS.Simple
      const mapDiv = document.createElement('div');
      mapDiv.id = 'photo-modal-map';
      body.appendChild(mapDiv);

      // initialize map
      photoMap = L.map(mapDiv, {
        crs: L.CRS.Simple,
        minZoom: -5,
        maxZoom: 5,
        zoomControl: true,
      });

      // load first image as overlay
      loadImageOverlay(currentPhotoList[currentPhotoIndex]);
    }

    modal.style.display = 'block';
    photoModal = modal;
  }

  function loadImageOverlay(url) {
    if (!photoMap) return;

    // remove existing overlay
    if (photoOverlay) {
      try { photoMap.removeLayer(photoOverlay); } catch(e){}
      photoOverlay = null;
    }

    const img = new Image();
    img.onload = function() {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      // define bounds in simple CRS
      const bounds = [[0,0], [h, w]];

      photoOverlay = L.imageOverlay(url, bounds).addTo(photoMap);
      photoMap.setMaxBounds(bounds);
      photoMap.fitBounds(bounds);
    };
    img.onerror = function() { console.error('Erro ao carregar imagem', url); };
    img.src = url;
  }

  function closePhotoModal() {
    if (photoModal) photoModal.style.display = 'none';
    if (photoMap) {
      try { photoMap.remove(); } catch(e){}
      photoMap = null;
      photoOverlay = null;
    }
    currentPhotoList = [];
  }

  function showPrevPhoto() {
    if (!currentPhotoList.length) return;
    currentPhotoIndex = (currentPhotoIndex - 1 + currentPhotoList.length) % currentPhotoList.length;
    updatePhotoView();
  }

  function showNextPhoto() {
    if (!currentPhotoList.length) return;
    currentPhotoIndex = (currentPhotoIndex + 1) % currentPhotoList.length;
    updatePhotoView();
  }

  function updatePhotoView() {
    const idx = document.getElementById('photoIndex');
    idx.textContent = `${currentPhotoIndex + 1} / ${currentPhotoList.length}`;

    const body = document.getElementById('photo-modal-body');
    if (currentPhotoList.length === 1) return;
    // if using leaflet, change overlay
    if (photoMap) {
      loadImageOverlay(currentPhotoList[currentPhotoIndex]);
    }
  }

  // Delegated click for Fotos buttons (they carry images in closure via dataset index; we'll attach images array via DOM using a Map)
  const _commentImagesMap = new Map();

  document.addEventListener('click', (e) => {
    // Photos button
    if (e.target.matches('.photos-btn')) {
      const card = e.target.closest('.comment-card-admin');
      if (!card) return;
      // read images from admin API call by looking up the comment id if stored
      // we stored images array on dataset earlier when rendering
      const imagesJson = card.getAttribute('data-images');
      let images = [];
      if (imagesJson) {
        try { images = JSON.parse(imagesJson); } catch(e){ images = []; }
      }
      if (images.length) openPhotoModal(images);
    }

    if (e.target.id === 'photoModalClose') closePhotoModal();
    if (e.target.id === 'photoPrev') showPrevPhoto();
    if (e.target.id === 'photoNext') showNextPhoto();
  });

  // close modal when clicking outside content
  document.addEventListener('click', (e) => {
    const modal = document.getElementById('photoModal');
    if (!modal) return;
    if (e.target === modal) closePhotoModal();
  });

async function approve(id) {
  await adminApi.approveComment(id);
  loadPendingComments();
}

async function reject(id) {
  await adminApi.rejectComment(id);
  loadPendingComments();
}