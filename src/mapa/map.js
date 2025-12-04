/* map.js
   Responsabilidade: mapa, pins, modal, abas, formulários, interações.
   Usa window.api.* para dados.
*/

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MODAL_IDS = {
  infoModal: "infoModal",
  addCommentModal: "addCommentModal",
};
const ELEMENT_IDS = {
  locationTitle: "location-title",
  locationDescription: "location-description",
};

document.addEventListener("DOMContentLoaded", () => {
  const imgUrl = "/assets/img/map/mapa-ifba.png";
  const img = new Image();
  // img.src = imgUrl; // Atribuído após definição dos handlers para evitar race conditions

  // Garantir modal fechado
  const initialModal = document.getElementById(MODAL_IDS.infoModal);
  if (initialModal) initialModal.style.display = "none";

  // Estado de modal
  let inModal = false;
  let modalPushed = false;

  // Função para criar ícone de pin
  function makePinIcon(color = "#FF0000") { // cor padrão vermelha
    return L.divIcon({
      className: "pin-marker",
      html: `<div class="dot" style="background-color: ${color};"></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  }


  // Abre modal com dados (somente apresentação)
  async function openLocationModal(locationData) {
    try {
      // Definir o ID do local atual para uso no formulário de comentário
      window.currentLocationId = locationData.id;

      // Usar os dados já carregados de locationData (evita requisição duplicada)
      const details = locationData;

      // ELEMENTOS DO MODAL
      const modal = document.getElementById("infoModal");
      if (modal) modal.style.display = "block"; // Exibir modal imediatamente

      const titleEl = document.querySelector("#location-title");
      const descEl = document.querySelector("#location-description");
      const starsEl = document.querySelector(".stars");
      const swiperWrapper = document.querySelector(".swiper-wrapper");
      const infoList = document.querySelector("#info-content ul");
      const commentsList = document.querySelector(
        "#review-content .comments-list"
      );

      // =========================
      // 1. TÍTULO E DESCRIÇÃO
      // =========================
      titleEl.textContent = details.name || "Sem nome";
      descEl.textContent = details.description || "Sem descrição";

      // =========================
      // 4. ITENS DE ACESSIBILIDADE
      // =========================
      infoList.innerHTML = "";
      if (
        details.accessibility_items &&
        details.accessibility_items.length > 0
      ) {
        details.accessibility_items.forEach((item) => {
          infoList.innerHTML += `<li>${item.name}</li>`;
        });
      } else {
        infoList.innerHTML = "<li>Nenhum item de acessibilidade informado</li>";
      }

      // =========================
      // 5. COMENTÁRIOS E AVALIAÇÃO E IMAGENS (Unificado)
      // =========================
      commentsList.innerHTML = `
        <div class="loader-container" style="padding: 20px;">
          <span class="loader" style="width: 30px; height: 30px; border-width: 3px;"></span>
        </div>`;

      swiperWrapper.innerHTML = `
        <div class="swiper-slide" style="height: 100%; background: #f3f4f6;">
          <div class="loader-container">
            <span class="loader"></span>
          </div>
        </div>`;

      try {
        // Busca comentários uma única vez
        const commentsResponse = await fetch(
          `${API_BASE_URL}/comments/${locationData.id}/comments`
        );
        const commentsData = await commentsResponse.json();
        const comments = commentsData.comments || [];

        // A. Renderizar Lista de Comentários
        commentsList.innerHTML = "";
        if (comments.length === 0) {
          commentsList.innerHTML = "<p>Este local ainda não possui comentários.</p>";
        } else {
          comments.forEach((c) => {
            // Gerar estrelas para cada comentário
            let commentStars = "";
            for (let i = 1; i <= 5; i++) {
              if (i <= c.rating) {
                commentStars += '<span class="star-icon filled"></span>';
              } else {
                commentStars += '<span class="star-icon empty"></span>';
              }
            }

            commentsList.innerHTML += `
                  <div class="comment-card">
                      <div class="comment-header">
                          <span class="user-name">${c.user_name}</span>
                          <span class="comment-date">${new Date(
              c.created_at || c.date // Fallback para c.date se created_at não existir
            ).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <div class="comment-rating">${commentStars}</div>
                      <p class="comment-text">${c.comment}</p>
                  </div>
                  `;
          });
        }

        // B. Calcular Avaliação Média
        let totalRating = 0;
        let count = 0;
        comments.forEach((c) => {
          if (c.rating && c.rating > 0) {
            totalRating += c.rating;
            count++;
          }
        });
        let avgRating = count > 0 ? totalRating / count : 0;
        let rating = Math.floor(avgRating);

        // Renderizar estrelas da média
        let starsHTML = "";
        for (let i = 1; i <= 5; i++) {
          if (i <= rating) {
            starsHTML += '<span class="star-icon filled"></span>';
          } else {
            starsHTML += '<span class="star-icon empty"></span>';
          }
        }
        starsEl.innerHTML = starsHTML;

        // C. Popuar Carrossel de Imagens
        let allImages = [];
        comments.forEach((c) => {
          if (c.images && Array.isArray(c.images)) {
            allImages = allImages.concat(c.images);
          } else if (c.images && typeof c.images === 'string') {
            // Caso venha como string única (depende da API)
            allImages.push(c.images);
          }
        });

        if (allImages.length > 0) {
          swiperWrapper.innerHTML = ""; // Limpar loader antes de adicionar imagens
          allImages.forEach((imgUrl) => {
            swiperWrapper.innerHTML += `
                  <div class="swiper-slide">
                      <div class="project-img">
                          <img src="${imgUrl}" alt="Imagem do comentário">
                      </div>
                  </div>`;
          });
        } else {
          swiperWrapper.innerHTML = `
              <div class="swiper-slide" style="background-color: #ffffff; height: 100%;">
                  <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; width: 100%; color: #9ca3af;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 12px; opacity: 0.5;">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                      <p style="font-size: 14px; font-weight: 500;">Sem imagens disponíveis</p>
                  </div>
              </div>`;
        }

        // Recarregar o carrossel
        if (window.swiperInstance) window.swiperInstance.destroy();
        window.swiperInstance = new Swiper(".swiper", {
          loop: allImages.length > 1, // Só faz loop se tiver mais de 1 imagem
          navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          },
          pagination: {
            el: ".swiper-pagination",
          },
        });

      } catch (error) {
        console.error("Erro ao carregar dados do local:", error);
        commentsList.innerHTML = "<p>Erro ao carregar comentários.</p>";
      }

      // =========================
      // 6. ABRIR O MODAL (Já aberto no início)
      // =========================
      // document.getElementById("infoModal").style.display = "block";
    } catch (error) {
      console.error("Erro ao abrir modal:", error);
    }
  }

  // =====================================
  // FUNÇÃO PARA DETECTAR O TIPO PELO NAME
  // =====================================
  function detectTypeFromName(name) {
    const n = name.toLowerCase();

    if (n.includes("estacionamento")) return "estacionamento";
    if (n.includes("bloco")) return "bloco";
    if (n.includes("quadra de areia")) return "quadra_areia";
    if (n.includes("quadra")) return "quadra";
    if (n.includes("campo")) return "campo";
    if (n.includes("cantina")) return "cantina";
    if (n.includes("biblioteca")) return "biblioteca";
    if (n.includes("audit")) return "auditorio";
    if (n.includes("cores")) return "cores";
    if (n.includes("entrada")) return "entrada";

    return "default";
  }

  // Render de pins (chama window.api.getAllLocations)
  async function renderPinsOnMap(map, W, H) {
    // Busca locations via API
    const pins = await window.api.getAllLocations();
    // Salva no global para outras partes que precisarem (não sobrescrever)
    window.pins = pins || [];

    console.log("PINS RECEBIDOS:", pins);

    pins.forEach((p) => {
      const tipo = detectTypeFromName(p.name);  // ← USAR AQUI

      const top = parseFloat(p.top) || 0;
      const left = parseFloat(p.left) || 0;
      const x = (left / 100) * W;
      const y = (top / 100) * H;

      const corMap = {
        estacionamento: "#FF0000",
        bloco: "#00FF00",
        campo: "#0000FF",
        quadra: "#FFFF00",
        quadra_areia: "#FFA500",
        biblioteca: "#800080",
        cantina: "#00FFFF",
        auditorio: "#FFC0CB",
        cores: "#808080",
        entrada: "#000000",
        default: "#000000"
      };

      const color = corMap[tipo] || corMap.default;

      const marker = L.marker([y, x], { icon: makePinIcon(color) }).addTo(map);

      marker.on("click", async () => {
        // Usar os dados do pin diretamente (p), pois já contêm a descrição retornada pelo getAllLocations
        openLocationModal(p);
      });
    });

    // Ocultar loader após carregar pins
    const loader = document.getElementById("map-loader");
    if (loader) {
      loader.style.display = "none";
    }
  }

  let mapLoaded = false;
  img.onload = async () => {
    if (mapLoaded) return;
    mapLoaded = true;
    const W = img.naturalWidth;
    const H = img.naturalHeight;
    const bounds = [
      [0, 0],
      [H, W],
    ];

    const map = L.map("map", {
      crs: L.CRS.Simple,
      minZoom: 0,
      maxZoom: 4,
      zoomSnap: 0.25,
      attributionControl: false,
      maxBounds: bounds,
      maxBoundsViscosity: 1.0,
    });
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

    // --- AQUI: adicionar botão redondo ---
    const BotaoCustom = L.Control.extend({
      onAdd: function (map) {
        const btn = L.DomUtil.create('button', 'btn-map-custom');
        btn.innerHTML = '?'; // ícone ou texto
        btn.title = "Botão";

        // Impede que o clique arraste o mapa
        L.DomEvent.disableClickPropagation(btn);
        return btn;
      }
    });
    map.addControl(new BotaoCustom({ position: 'bottomright' }));

    // --- AQUI: lógica de clique para mostrar e fechar modal ---
    const btnModal = document.getElementById('btnModal');
    const btnMap = document.querySelector('.btn-map-custom');

    // Ao clicar no botão do mapa
    L.DomEvent.on(btnMap, 'click', function (e) {
      this.style.display = 'none';       // desaparece o botão
      btnModal.style.display = 'block';  // mostra o modal
    });

    // Fecha o modal ao clicar em qualquer lugar do mapa
    map.on('click', () => {
      if (btnModal.style.display === 'block') {
        btnModal.style.display = 'none';  // esconde o modal
        btnMap.style.display = 'block';   // reaparece o botão
      }
    });

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

  const pinTypes = {
    estacionamento: "pin-estacionamento",
    bloco: "pin-bloco",
    campo: "pin-campo",
    quadra: "pin-quadra",
    quadra_areia: "pin-quadra-areia",
    biblioteca: "pin-biblioteca",
    cantina: "pin-cantina",
    auditorio: "pin-auditorio",
    cores: "pin-cores",
    entrada: "pin-entrada",
    default: "pin-default"
  };

  img.onerror = () => {
    console.error("Erro ao carregar a imagem do mapa:", imgUrl);
    alert("Erro ao carregar a imagem do mapa. Verifique o caminho.");
  };

  // Iniciar carregamento da imagem após definir os handlers
  img.src = imgUrl;

  // --- UI: tabs, swiper, carousel init (mantidos) ---
  function initCustomCarousel() {
    /* ... seu código atual (sem mudanças) ... */
  }
  function initSwiperIfAvailable() {
    /* ... seu código atual (sem mudanças) ... */
  }
  initSwiperIfAvailable() || initCustomCarousel();

  // Tabs behaviour (mantido como você já tinha)
  (function initTabs() {
    const tabs = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-pane");
    const tabWrapper = document.querySelector(".tab-content");
    if (tabWrapper) {
      tabWrapper.style.position = tabWrapper.style.position || "relative";
      tabWrapper.style.overflow = tabWrapper.style.overflow || "hidden";
    }
    tabContents.forEach((content, index) => {
      if (index === 0) {
        content.classList.add("active");
        content.classList.remove("enter-right", "exit-left");
      } else {
        content.classList.remove("active");
        content.classList.add("enter-right");
      }
    });
    tabs.forEach((tab) => {
      tab.addEventListener("click", function () {
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        const current = document.querySelector(".tab-pane.active");
        const target = document.querySelector(
          `#${tab.id.replace("tab", "content")}`
        );
        if (!target || current === target) return;
        if (current) {
          current.classList.remove("active");
          current.classList.add("exit-left");
          const onEnd = (e) => {
            if (e.propertyName && e.propertyName.indexOf("transform") === -1)
              return;
            current.classList.remove("exit-left");
            current.removeEventListener("transitionend", onEnd);
          };
          current.addEventListener("transitionend", onEnd);
        }
        target.classList.remove("exit-left");
        target.classList.add("enter-right");
        // force repaint
        // eslint-disable-next-line no-unused-expressions
        target.offsetWidth;
        target.classList.add("active");
        target.classList.remove("enter-right");
        // REMOVIDO: loadCommentsForLocation aqui, pois já carregamos ao abrir o modal
      });
    });
  })();

  // Função para carregar comentários aprovados para um local (usa API)
  async function loadCommentsForLocation(locationId) {
    const commentsList = document.querySelector(".comments-list");
    if (!commentsList) return;
    commentsList.innerHTML = "<p>Carregando comentários...</p>";
    try {
      const comments = await window.api.getApprovedCommentsForLocation(
        locationId
      );
      if (comments.length === 0) {
        commentsList.innerHTML = "<p>Nenhum comentário ainda.</p>";
      } else {
        commentsList.innerHTML = comments
          .map(
            (comment) => `
          <div class="comment-card">
            <div class="comment-header">
              <span class="user-name">${comment.user_name}</span>
              <span class="comment-date">${new Date(
              comment.date
            ).toLocaleDateString("pt-BR")}</span>
            </div>
            <div class="comment-rating">${"⭐".repeat(
              comment.rating || 0
            )}</div>
            <p class="comment-text">${comment.comment}</p>
          </div>
        `
          )
          .join("");
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
      if (enabled) {
        commentBtn.classList.remove("hidden");
        commentBtn.classList.remove("disabled");
        commentBtn.disabled = false;
      } else {
        commentBtn.classList.add("hidden");
        commentBtn.classList.add("disabled");
        commentBtn.disabled = true;
      }
    }
    setCommentButton(
      document.querySelector("#review-content")?.classList.contains("active")
    );
    const tabs = document.querySelectorAll(".tab-btn");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        setTimeout(() => {
          const isReviewActive = document
            .querySelector("#review-content")
            ?.classList.contains("active");
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
    const addCommentBackBtn = document.querySelector(
      `#${MODAL_IDS.addCommentModal} .back-btn`
    );
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
          if (s.getAttribute("data-value") <= value) {
            s.classList.add("active");
            s.textContent = "★";
          } else {
            s.classList.remove("active");
            s.textContent = "☆";
          }
        });
      });
    });

    let selectedImages = [];

    const imgInput = document.getElementById("comment-image");
    const fileList = document.getElementById("file-list");
    const btnAddImage = document.getElementById("btn-add-image");

    btnAddImage.addEventListener("click", () => {
      imgInput.click();
    });

    imgInput.addEventListener("change", () => {
      for (const file of imgInput.files) {
        selectedImages.push(file);
      }

      imgInput.value = "";
      renderFileList();
    });

    function renderFileList() {
      fileList.innerHTML = "";

      selectedImages.forEach((file, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
      <span>${file.name}</span>
      <button data-index="${index}"
              style="
                background:red;
                color:white;
                border:none;
                padding:2px 6px;
                border-radius:4px;
                cursor:pointer;
              ">X</button>
    `;

        fileList.appendChild(li);
      });

      document.querySelectorAll("#file-list button").forEach(btn => {
        btn.addEventListener("click", () => {
          const i = btn.getAttribute("data-index");
          selectedImages.splice(i, 1);
          renderFileList();
        });
      });
    }

    // submit form de comentário
    const commentForm = document.getElementById("comment-form");
    if (commentForm) {
      commentForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("user-name").value;
        const rating = ratingInput.value;
        const commentText = document.getElementById("comment-text").value;
        const imgInput = document.getElementById("imgInput");

        if (!rating || rating === "") {
          alert("Por favor, selecione uma avaliação com estrelas.");
          return;
        }
        const commentData = {
          user_name: name,
          rating: parseInt(rating),
          comment: commentText,
          created_at: new Date().toISOString(),
          location_id: window.currentLocationId,
          status: "pending",
          images: selectedImages // Passar o array de arquivos selecionados
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
        stars.forEach((s) => {
          s.classList.remove("active");
          s.textContent = "☆";
        });
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
        if (modalPushed) {
          try {
            history.back();
          } catch (err) {
            /* ignore */
          }
          modalPushed = false;
        }
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
