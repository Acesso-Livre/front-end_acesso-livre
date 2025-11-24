/* map.js
   Responsabilidade: mapa, pins, modal, abas, formulários, interações.
   Usa window.api.* para dados.
*/

const MODAL_IDS = { infoModal: "infoModal", addCommentModal: "addCommentModal" };
const ELEMENT_IDS = { locationTitle: "location-title", locationDescription: "location-description" };

document.addEventListener("DOMContentLoaded", () => {
  const imgUrl = "/src/assets/img/map/mapa-ifba.png";
  const img = new Image();
  img.src = imgUrl;

  // Garantir modal fechado
  const initialModal = document.getElementById(MODAL_IDS.infoModal);
  if (initialModal) initialModal.style.display = "none";

  // Estado de modal
  let inModal = false;
  let modalPushed = false;

  // Função para criar ícone de pin
  function makePinIcon() {
    return L.divIcon({ className: "pin-marker", html: `<div class="dot"></div>`, iconSize: [32, 32], iconAnchor: [16, 16] });
  }

  // Abre modal com dados (somente apresentação)
  async function openLocationModal(locationData) {
    try {
        // Buscar detalhes completos
        const response = await fetch(`https://acesso-livre-api.onrender.com/api/locations/${locationData.id}`);
        const details = await response.json();

        // ELEMENTOS DO MODAL
        const titleEl = document.querySelector("#location-title");
        const descEl = document.querySelector("#location-description");
        const starsEl = document.querySelector(".stars");
        const swiperWrapper = document.querySelector(".swiper-wrapper");
        const infoList = document.querySelector("#info-content ul");
        const commentsList = document.querySelector("#review-content .comments-list");

        // =========================
        // 1. TÍTULO E DESCRIÇÃO
        // =========================
        titleEl.textContent = details.name || "Sem nome";
        descEl.textContent = details.description || "Sem descrição";

        // =========================
        // 2. AVALIAÇÃO (ESTRELAS)
        // =========================
        let rating = details.avg_rating ? Math.round(details.avg_rating) : 0;
        starsEl.innerHTML = "⭐".repeat(rating) + "☆".repeat(5 - rating);

        // =========================
        // 3. IMAGENS (SWIPER)
        // =========================
        swiperWrapper.innerHTML = "";
        if (details.images && details.images.length > 0) {
            details.images.forEach(imgUrl => {
                swiperWrapper.innerHTML += `
                <div class="swiper-slide">
                    <div class="project-img">
                        <img src="${imgUrl}" alt="Imagem do local">
                    </div>
                </div>`;
            });
        } else {
            swiperWrapper.innerHTML = `
            <div class="swiper-slide">
                <div class="project-img">
                    <p>Sem imagens disponíveis</p>
                </div>
            </div>`;
        }

        // Recarregar o carrossel
        if (window.swiperInstance) window.swiperInstance.destroy();
        window.swiperInstance = new Swiper(".swiper", {
            loop: true,
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
            pagination: {
                el: ".swiper-pagination",
            },
        });

        // =========================
        // 4. ITENS DE ACESSIBILIDADE
        // =========================
        infoList.innerHTML = "";
        if (details.accessibility_items && details.accessibility_items.length > 0) {
            details.accessibility_items.forEach(item => {
                infoList.innerHTML += `<li>${item.name}</li>`;
            });
        } else {
            infoList.innerHTML = "<li>Nenhum item de acessibilidade informado</li>";
        }

        // =========================
        // 5. COMENTÁRIOS
        // =========================
        commentsList.innerHTML = "<p>Carregando comentários...</p>";

        const commentsResponse = await fetch(`https://acesso-livre-api.onrender.com/api/comments/${locationData.id}/comments`);
        const commentsData = await commentsResponse.json();

        commentsList.innerHTML = "";

        if (commentsData.comments.length === 0) {
            commentsList.innerHTML = "<p>Este local ainda não possui comentários.</p>";
        } else {
            commentsData.comments.forEach(c => {
                commentsList.innerHTML += `
                <div class="comment-card">
                    <div class="comment-header">
                        <span class="user-name">${c.user_name}</span>
                        <span class="comment-date">${new Date(c.created_at).toLocaleDateString("pt-BR")}</span>
                    </div>
                    <div class="comment-rating">${"⭐".repeat(c.rating)}</div>
                    <p class="comment-text">${c.comment}</p>
                </div>
                `;
            });
        }

        // =========================
        // 6. ABRIR O MODAL
        // =========================
        document.getElementById("infoModal").style.display = "block";

    } catch (error) {
        console.error("Erro ao abrir modal:", error);
    }
}


  // Render de pins (chama window.api.getAllLocations)
  async function renderPinsOnMap(map, W, H) {
    // Busca locations via API
    const pins = await window.api.getAllLocations();
    // Salva no global para outras partes que precisarem (não sobrescrever)
    window.pins = pins || [];

    pins.forEach((p) => {
      const top = parseFloat(p.top) || 0;
      const left = parseFloat(p.left) || 0;
      const x = (left / 100) * W;
      const y = (top / 100) * H;
      const marker = L.marker([y, x], { icon: makePinIcon() }).addTo(map);

      marker.on("click", async () => {
        console.log("Pin clicado:", p.id);
        // Pega a localização (caso precise dados adicionais)
        const location = await window.api.getLocationById(p.id);
        // Busca comentários direto da API endpoint (opcional, loadCommentsForLocation também fará)
        // const comments = await window.api.getCommentsByLocationId(location.id);
        openLocationModal(location || p, p.name || "Localização");
      });
    });
  }

  img.onload = async () => {
    const W = img.naturalWidth;
    const H = img.naturalHeight;
    const bounds = [[0, 0], [H, W]];

    const map = L.map("map", { crs: L.CRS.Simple, minZoom: 0, maxZoom: 4, zoomSnap: 0.25, attributionControl: false, maxBounds: bounds, maxBoundsViscosity: 1.0 });
    L.imageOverlay(imgUrl, bounds).addTo(map);
    map.fitBounds(bounds);


    const viewport = map.getSize();
    const zoomH = Math.log2(viewport.y / H);
    const zoomW = Math.log2(viewport.x / W);
    const fillZoom = Math.max(zoomH, zoomW);
    map.setZoom(fillZoom);
    map.setMinZoom(fillZoom);

    // Renderiza os pins usando a API (apenas aqui)
    await renderPinsOnMap(map, W, H);

    // resize handling
    let resizeTimer = null;
    window.addEventListener("resize", () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        map.invalidateSize(false);
        map.setView(center, zoom, { animate: false });
      }, 100);
    });
  };

  img.onerror = () => {
    console.error("Erro ao carregar a imagem do mapa:", imgUrl);
    alert("Erro ao carregar a imagem do mapa. Verifique o caminho.");
  };

  // --- UI: tabs, swiper, carousel init (mantidos) ---
  function initCustomCarousel() { /* ... seu código atual (sem mudanças) ... */ }
  function initSwiperIfAvailable() { /* ... seu código atual (sem mudanças) ... */ }
  initSwiperIfAvailable() || initCustomCarousel();

  // Tabs behaviour (mantido como você já tinha)
  (function initTabs() {
    const tabs = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-pane");
    const tabWrapper = document.querySelector(".tab-content");
    if (tabWrapper) { tabWrapper.style.position = tabWrapper.style.position || "relative"; tabWrapper.style.overflow = tabWrapper.style.overflow || "hidden"; }
    tabContents.forEach((content, index) => {
      if (index === 0) { content.classList.add("active"); content.classList.remove("enter-right", "exit-left"); } else { content.classList.remove("active"); content.classList.add("enter-right"); }
    });
    tabs.forEach((tab) => {
      tab.addEventListener("click", function () {
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        const current = document.querySelector(".tab-pane.active");
        const target = document.querySelector(`#${tab.id.replace("tab", "content")}`);
        if (!target || current === target) return;
        if (current) { current.classList.remove("active"); current.classList.add("exit-left"); const onEnd = (e) => { if (e.propertyName && e.propertyName.indexOf("transform") === -1) return; current.classList.remove("exit-left"); current.removeEventListener("transitionend", onEnd); }; current.addEventListener("transitionend", onEnd); }
        target.classList.remove("exit-left"); target.classList.add("enter-right");
        // force repaint
        // eslint-disable-next-line no-unused-expressions
        target.offsetWidth;
        target.classList.add("active"); target.classList.remove("enter-right");
        // Load comments if review tab is activated
        if (target.id === "review-content" && window.currentLocationId) {
          loadCommentsForLocation(window.currentLocationId);
        }
      });
    });
  })();

  // Função para carregar comentários aprovados para um local (usa API)
  async function loadCommentsForLocation(locationId) {
    const commentsList = document.querySelector(".comments-list");
    if (!commentsList) return;
    commentsList.innerHTML = "<p>Carregando comentários...</p>";
    try {
      const comments = await window.api.getApprovedCommentsForLocation(locationId);
      if (comments.length === 0) {
        commentsList.innerHTML = "<p>Nenhum comentário ainda.</p>";
      } else {
        commentsList.innerHTML = comments.map((comment) => `
          <div class="comment-card">
            <div class="comment-header">
              <span class="user-name">${comment.user_name}</span>
              <span class="comment-date">${new Date(comment.date).toLocaleDateString("pt-BR")}</span>
            </div>
            <div class="comment-rating">${"⭐".repeat(comment.rating || 0)}</div>
            <p class="comment-text">${comment.comment}</p>
          </div>
        `).join("");
      }
    } catch (error) {
      console.error("Erro ao carregar comentários:", error);
      commentsList.innerHTML = "<p>Erro ao carregar comentários.</p>";
    }
  }

  // Controla o botão "Adicionar comentário"
  (function initCommentFlow() {
    const commentBtn = document.querySelector(".comment-btn");
    function setCommentButton(enabled) {
      if (!commentBtn) return;
      if (enabled) { commentBtn.classList.remove("hidden"); commentBtn.classList.remove("disabled"); commentBtn.disabled = false; }
      else { commentBtn.classList.add("hidden"); commentBtn.classList.add("disabled"); commentBtn.disabled = true; }
    }
    setCommentButton(document.querySelector("#review-content")?.classList.contains("active"));
    const tabs = document.querySelectorAll(".tab-btn");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        setTimeout(() => {
          const isReviewActive = document.querySelector("#review-content")?.classList.contains("active");
          setCommentButton(!!isReviewActive);
        }, 0);
      });
    });

    // abrir modal de adicionar comentário
    if (commentBtn) {
      commentBtn.addEventListener("click", () => {
        const infoModal = document.getElementById(MODAL_IDS.infoModal);
        const addModal = document.getElementById(MODAL_IDS.addCommentModal);
        if (infoModal) infoModal.style.display = "none";
        if (addModal) addModal.style.display = "flex";
      });
    }

    // fechar add-comment modal
    const addCommentBackBtn = document.querySelector(`#${MODAL_IDS.addCommentModal} .back-btn`);
    if (addCommentBackBtn) {
      addCommentBackBtn.addEventListener("click", () => {
        const infoModal = document.getElementById(MODAL_IDS.infoModal);
        const addModal = document.getElementById(MODAL_IDS.addCommentModal);
        if (addModal) addModal.style.display = "none";
        if (infoModal) infoModal.style.display = "flex";
      });
    }

    // estrela rating
    const stars = document.querySelectorAll(".star");
    const ratingInput = document.getElementById("rating");
    stars.forEach((star) => {
      star.addEventListener("click", () => {
        const value = star.getAttribute("data-value");
        ratingInput.value = value;
        stars.forEach((s) => {
          if (s.getAttribute("data-value") <= value) { s.classList.add("active"); s.textContent = "★"; }
          else { s.classList.remove("active"); s.textContent = "☆"; }
        });
      });
    });

    // submit form de comentário
    const commentForm = document.getElementById("comment-form");
    if (commentForm) {
      commentForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("user-name").value;
        const rating = ratingInput.value;
        const commentText = document.getElementById("comment-text").value;
        if (!rating || rating === "") { alert("Por favor, selecione uma avaliação com estrelas."); return; }
        const commentData = {
          user: name,
          rating: parseInt(rating),
          text: commentText,
          date: new Date().toISOString(),
          location_id: window.currentLocationId,
          status: "pending",
        };

        // NÃO sobrescrever window.pins — apenas chamar a API para enviar comentário
        const result = await window.api.postComment(commentData);
        if (result) {
          alert("Comentário enviado para aprovação!");
        } else {
          alert("Erro ao enviar comentário. Tente novamente.");
          return;
        }

        // reset visual do form
        commentForm.reset();
        stars.forEach((s) => { s.classList.remove("active"); s.textContent = "☆"; });
        ratingInput.value = "";

        // fecha addCommentModal e reabre infoModal
        const addModal = document.getElementById(MODAL_IDS.addCommentModal);
        const infoModal = document.getElementById(MODAL_IDS.infoModal);
        if (addModal) addModal.style.display = "none";
        if (infoModal) infoModal.style.display = "flex";

        // aciona a aba de reviews para o usuário ver (loadCommentsForLocation será chamado quando a aba ficar ativa)
        const reviewTab = document.getElementById("review-tab");
        if (reviewTab) reviewTab.click();
      });
    }
  })();

  // Back button navbar behavior
  const navBack = document.querySelector(".btn.voltar");
  if (navBack) {
    navBack.addEventListener("click", function (e) {
      const modal = document.getElementById(MODAL_IDS.infoModal);
      const addModal = document.getElementById(MODAL_IDS.addCommentModal);
      if (addModal && addModal.style.display === "flex") {
        e.preventDefault();
        addModal.style.display = "none";
        if (modal) modal.style.display = "flex";
      } else if (modal && modal.style.display === "flex") {
        e.preventDefault();
        modal.style.display = "none";
        inModal = false;
        if (modalPushed) { try { history.back(); } catch (err) { /* ignore */ } modalPushed = false; }
      }
    });
  }

  // popstate handler
  window.addEventListener("popstate", function () {
    if (inModal) {
      const modal = document.getElementById(MODAL_IDS.infoModal);
      if (modal) modal.style.display = "none";
      inModal = false;
      modalPushed = false;
    }
  });
});