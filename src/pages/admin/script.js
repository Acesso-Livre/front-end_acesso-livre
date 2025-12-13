// src/admin/script.js - Entry point para página admin
import { locationService } from "../../services/location-service.js";
import { commentService } from "../../services/comment-service.js";
import { resolveImageUrl } from "../../utils/image-utils.js";
import { showModal, showAlert } from "../../utils/modal.js";
import "../../utils/error-handler.js";

// ==========================
// PROTEÇÃO DE ROTA
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  const token = sessionStorage.getItem("authToken");

  if (!token) {

    window.location.href = "/pages/auth/";
    return;
  }

  loadPendingComments();
  setupTabNavigation();
});

// ==========================
// BOTÃO DE LOGOUT
// ==========================
document.getElementById("logout-btn").addEventListener("click", () => {
  sessionStorage.removeItem("authToken");
  window.location.href = "/pages/auth/";
});

// ==========================
// NAVEGAÇÃO POR ABAS
// ==========================
function setupTabNavigation() {
  const tabs = document.querySelectorAll(".tab-btn");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabName = tab.dataset.tab;

      // Remover classe active de todos os botões e conteúdos
      tabs.forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach((content) => {
        content.classList.remove("active");
      });

      // Adicionar classe active ao botão clicado e seu conteúdo
      tab.classList.add("active");
      document.getElementById(`${tabName}-content`).classList.add("active");

      // Carregar dados específicos
      if (tabName === "locations") {
        loadLocationsList();
      } else if (tabName === "comments") {
        loadPendingComments();
      }
    });
  });
}

// ==========================
// BUSCAR COMENTÁRIOS PENDENTES
// ==========================
async function loadPendingComments() {
  const container = document.getElementById("reviews-list");
  container.innerHTML =
    '<div class="loading-container"><div class="loading-spinner"></div></div>';

  const result = await commentService.getPending();


  // Extrair array de comentários (pode estar em result.comments ou ser um array direto)
  const list = Array.isArray(result) ? result : result?.comments || [];


  if (list.length === 0) {
    container.innerHTML = "<p>Nenhum comentário pendente ✨</p>";
    return;
  }

  // Coletar location_ids para buscar nomes faltantes
  const missingLocationIds = new Set();
  list.forEach((c) => {
    if (!c.location_name) {
      const id = c.location_id || c.locationId || (c.location && c.location.id);
      if (id) missingLocationIds.add(id);
    }
  });

  // Map de lookup id -> nome do local
  const locationNameById = {};
  if (missingLocationIds.size > 0) {
    try {
      await Promise.all(
        Array.from(missingLocationIds).map(async (id) => {
          try {
            const loc = await locationService.getById(id);
            locationNameById[id] = loc && loc.name ? loc.name : "Local desconhecido";
          } catch (err) {
            locationNameById[id] = "Local desconhecido";
          }
        })
      );
    } catch (e) {

    }
  }

  container.innerHTML = "";

  list.forEach((comment) => {
    const card = document.createElement("div");
    card.className = "comment-card-admin";

    const images = comment.images || "";
    const hasImages = images.length > 0;

    // Resolver nome do local
    const locationName =
      comment.location_name ||
      (comment.location && comment.location.name) ||
      locationNameById[comment.location_id] ||
      locationNameById[comment.locationId] ||
      "Local desconhecido";

    // Data do comentário formatada
    const commentDate = comment.created_at
      ? new Date(comment.created_at).toLocaleDateString("pt-BR")
      : "";

    // Renderizar ícones de acessibilidade do comentário
    let iconsHtml = "";
    const commentIcons = comment.comment_icons || [];
    if (commentIcons.length > 0) {
      iconsHtml = `
        <div class="comment-icons-row">
          ${commentIcons.map(icon => `
            <img 
              src="${icon.icon_url || icon.image_url || icon.image}" 
              alt="${icon.name}" 
              title="${icon.name}"
              class="comment-icon-small"
            />
          `).join('')}
        </div>
      `;
    }

    card.innerHTML = `
      <div class="review-header">
        <div>
          <strong>${comment.user_name ?? "Usuário"}</strong>
          <span class="comment-location"> — ${locationName}</span>
        </div>
        <div class="comment-meta">
          <span class="comment-rating">${comment.rating ?? ""} ⭐</span>
          ${commentDate ? `<span class="comment-date">${commentDate}</span>` : ""}
        </div>
      </div>

      <p class="comment-text">${comment.comment}</p>

      ${iconsHtml}

      <div class="actions">
        <button class="btn btn-success" onclick="approve(${comment.id
      })">Aprovar</button>
        <button class="btn btn-danger" onclick="reject(${comment.id
      })">Rejeitar</button>
        ${hasImages
        ? `<button class="btn btn-warning" onclick="viewPhotos(decodeURIComponent('${encodeURIComponent(
          JSON.stringify(images)
        )}'))">Fotos</button>`
        : ""
      }
      </div>
    `;

    container.appendChild(card);
  });
}

// ==========================
// APROVAR / REJEITAR
// ==========================
window.approve = async function (id) {
  showConfirmation({
    title: "Aprovar Comentário",
    message: "Deseja aprovar e publicar este comentário?",
    onConfirm: async () => {
      await commentService.approve(id);
      loadPendingComments();
    }
  });
};

window.reject = async function (id) {
  showModal(
    "Rejeitar Comentário",
    "Tem certeza que deseja rejeitar este comentário?",
    {
      confirmText: "Rejeitar",
      isDestructive: true,
      onConfirm: async () => {
        await commentService.reject(id);
        loadPendingComments();
      }
    }
  );
};

// Função helper resolveImageUrl agora importada de utils
// (Código removido)

// ==========================
// MODAL DE FOTOS COM SWIPER
// ==========================
window.viewPhotos = function (imagesData) {
  const modal = document.getElementById("photoModal");
  const swiperWrapper = document.getElementById("swiperWrapper");

  let images = imagesData;
  if (typeof imagesData === "string") {
    try {
      images = JSON.parse(imagesData);
    } catch (e) {
      images = imagesData;
    }
  }

  // Mostrar modal com spinner
  swiperWrapper.innerHTML =
    '<div class="loading-container"><div class="loading-spinner"></div></div>';
  modal.style.display = "flex";

  // Processar imagens
  let imageArray = [];

  if (Array.isArray(images)) {
    images.forEach((img) => {
      const url = resolveImageUrl(img);
      if (url) imageArray.push(url);
    });
  } else if (typeof images === "string" && images.trim()) {
    imageArray = images.split(",").map((img) => img.trim());
  }

  // Renderizar imagens sem delay desnecessário
  swiperWrapper.innerHTML = "";

  if (imageArray.length === 0) {
    // Fallback: sem imagens
    swiperWrapper.innerHTML = `
      <div class="swiper-slide" style="background-color: #ffffff; height: 100%; display: flex; align-items: center; justify-content: center;">
        <div style="display: flex; flex-direction: column; align-items: center; text-align: center; color: #9ca3af;">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 12px; opacity: 0.5;">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <p style="font-size: 14px; font-weight: 500;">Sem imagens</p>
        </div>
      </div>`;
  } else {
    // Adicionar slides
    imageArray.forEach((url) => {
      const slide = document.createElement("div");
      slide.className = "swiper-slide";
      slide.innerHTML = `<img src="${url}" alt="" style="width: 100%; height: 100%; object-fit: cover;">`;
      swiperWrapper.appendChild(slide);
    });
  }

  // Destruir instância anterior (se existir) para evitar bug
  if (window.swiperInstance) {
    window.swiperInstance.destroy(true, true);
  }

  // Criar Swiper (apenas para o modal de fotos)
  window.swiperInstance = new Swiper("#photoModal .swiper", {
    loop: imageArray.length > 1,
    pagination: {
      el: "#photoModal .swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: "#photoModal .swiper-button-next",
      prevEl: "#photoModal .swiper-button-prev",
    },
  });
};

// Fechar modal
document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("photoModal").style.display = "none";

  if (window.swiperInstance) {
    window.swiperInstance.destroy(true, true);
    window.swiperInstance = null;
  }
});

// ==========================
// GERENCIAR LOCAIS
// ==========================

// 1. Carregar lista de locais
async function loadLocationsList() {
  const container = document.getElementById("locations-container");

  // Mostrar spinner
  container.innerHTML =
    '<div class="loading-container"><div class="loading-spinner"></div></div>';

  try {
    const response = await locationService.getAll();

    // Extrair array de locais (pode estar em response.locations ou ser um array direto)
    const locations = Array.isArray(response)
      ? response
      : response?.locations || [];


    // Se não houver locais
    if (!locations || locations.length === 0) {
      container.innerHTML = `
                <p style="text-align: center; color: #999;">Nenhum local registrado</p>
                <button class="btn-create" onclick="openLocationForm()">+ Criar Novo Local</button>
            `;
      return;
    }

    // Renderizar lista de locais como cards clicáveis
    // Ordenar por nome em ordem alfabética
    locations.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR'));

    let html =
      '<button class="btn btn-success" onclick="openLocationForm()">+ Criar Novo Local</button>';
    html += '<div class="locations-grid">';

    locations.forEach((location) => {
      // Processar imagens - suporta arrays de strings ou objetos
      let images = [];
      if (Array.isArray(location.images)) {
        images = location.images
          .map((img) => {
            if (typeof img === 'string') return img.trim();
            if (img && typeof img === 'object' && img.url) return img.url;
            return null;
          })
          .filter((img) => img);
      } else if (
        typeof location.images === "string" &&
        location.images.trim()
      ) {
        images = location.images
          .split(",")
          .map((img) => img.trim())
          .filter((img) => img);
      }

      const firstImage = images.length > 0 ? images[0] : "";
      const imageHtml = firstImage
        ? `<img src="${firstImage}" alt="${location.name}" class="location-grid-img">`
        : '<div class="location-grid-no-img">📍</div>';

      html += `
                <div class="location-grid-card" onclick="viewLocationDetails(${location.id
        })">
                    <div class="location-grid-image">
                        ${imageHtml}
                    </div>
                    <div class="location-grid-info">
                        <h3>${location.name}</h3>
                        <p>${location.description || "Sem descrição"}</p>
                    </div>
                </div>
            `;
    });

    html += "</div>";
    container.innerHTML = html;
  } catch (error) {

    container.innerHTML =
      '<p style="color: red;">Erro ao carregar locais. Tente novamente.</p>';
  }
}

// 1.5 Visualizar detalhes do local em modal
async function viewLocationDetails(locationId) {
  try {
    // Buscar local e comentários em paralelo
    const [location, commentsResponse, iconsResponse] = await Promise.all([
      locationService.getById(locationId),
      commentService.getByLocation(locationId),
      commentService.getIcons()
    ]);

    // Processar imagens - suporta arrays de strings ou objetos
    let images = [];
    if (Array.isArray(location.images)) {
      images = location.images
        .map((img) => {
          if (typeof img === 'string') return img.trim();
          if (img && typeof img === 'object' && img.url) return img.url;
          return null;
        })
        .filter((img) => img);
    } else if (typeof location.images === "string" && location.images.trim()) {
      images = location.images
        .split(",")
        .map((img) => img.trim())
        .filter((img) => img);
    }

    // Renderizar modal com carrossel
    let swiperSlides = "";
    if (images.length > 0) {
      swiperSlides = images
        .map(
          (img) => `
                <div class="swiper-slide">
                    <div class="project-img">
                        <img src="${img}" alt="Imagem de ${location.name}">
                    </div>
                </div>
            `
        )
        .join("");
    } else {
      swiperSlides = `
                <div class="swiper-slide" style="background-color: #f3f4f6; display: flex; align-items: center; justify-content: center;">
                    <div style="text-align: center; color: #999;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                        <p>Sem imagens</p>
                    </div>
                </div>
            `;
    }

    // Extrair IDs de ícones dos comentários
    const comments = commentsResponse?.comments || commentsResponse || [];
    const commentsIconsIds = new Set();

    if (Array.isArray(comments)) {
      comments.forEach(comment => {
        // Verificar comment_icon_ids (IDs diretos)
        if (comment.comment_icon_ids && Array.isArray(comment.comment_icon_ids)) {
          comment.comment_icon_ids.forEach(id => commentsIconsIds.add(id));
        }
        // Verificar comment_icons (Objetos ou Array misto)
        let icons = comment.comment_icons;
        if (typeof icons === 'string') {
          icons.split(',').forEach(id => commentsIconsIds.add(parseInt(id.trim())));
        } else if (Array.isArray(icons)) {
          icons.forEach(icon => {
            if (typeof icon === 'object' && icon.id) {
              commentsIconsIds.add(icon.id);
            } else if (typeof icon === 'number') {
              commentsIconsIds.add(icon);
            }
          });
        }
      });
    }

    // Processar ícones disponíveis
    let allIcons = [];
    if (Array.isArray(iconsResponse)) {
      allIcons = iconsResponse;
    } else if (iconsResponse?.comment_icons) {
      allIcons = iconsResponse.comment_icons;
    } else if (iconsResponse?.icons) {
      allIcons = iconsResponse.icons;
    }

    // Filtrar ícones que estão nos comentários
    const selectedIcons = allIcons.filter(icon => commentsIconsIds.has(icon.id));

    // Placeholder SVG para quando imagem não carregar
    const placeholderSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239ca3af'%3E%3Cpath d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E";

    // Renderizar itens de acessibilidade no mesmo padrão do mapa
    let accessibilityHtml = "";
    if (selectedIcons.length > 0) {
      accessibilityHtml = `
        <div class="accessibility-icons-grid">
          ${selectedIcons.map(item => `
            <div class="accessibility-icon-item">
              <img 
                src="${item.icon_url || item.image || placeholderSvg}" 
                alt="${item.name}" 
                title="${item.name}"
                class="accessibility-icon-img"
                onerror="this.onerror=null; this.src='${placeholderSvg}'; this.classList.add('icon-placeholder');"
              />
              <span class="accessibility-icon-name">${item.name}</span>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      accessibilityHtml = "<p style='color: #999; text-align: center; padding: 20px;'>Nenhum item de acessibilidade informado</p>";
    }

    const modalHtml = `
            <div class="modal-view-location">
                <button class="btn btn-secondary close-detail-modal" onclick="backToLocationsList()" style="margin-bottom: 15px;">← Voltar</button>
                
                <div class="swiper detail-swiper">
                    <div class="swiper-wrapper">
                        ${swiperSlides}
                    </div>
                    <div class="swiper-button-next"></div>
                    <div class="swiper-button-prev"></div>
                    <div class="swiper-pagination"></div>
                </div>
                
                <section class="detail-info-section">
                    <div class="detail-header">
                        <h1>${location.name}</h1>
                    </div>
                    
                    <div class="detail-tabs">
                        <button class="detail-tab-btn active" data-tab="info">Informações</button>
                        <button class="detail-tab-btn" data-tab="description">Descrição</button>
                        <button class="detail-tab-btn" data-tab="position">Posição</button>
                    </div>
                    
                    <div class="detail-tab-content">
                        <div class="detail-tab-pane active" id="info-pane">
                            <h3>Acessibilidade</h3>
                            ${accessibilityHtml}
                        </div>
                        
                        <div class="detail-tab-pane" id="description-pane">
                            <h3>Descrição</h3>
                            <p>${location.description || "Sem descrição fornecida"
      }</p>
                        </div>
                        
                        <div class="detail-tab-pane" id="position-pane">
                            <h3>Posição no Mapa</h3>
                            <p><strong>Top:</strong> ${location.top || "-"}</p>
                            <p><strong>Left:</strong> ${location.left || "-"
      }</p>
                        </div>
                    </div>
                    
                    <div class="detail-actions">
                        <button class="btn btn-primary" onclick="openLocationForm(${location.id})">Editar</button>
                        <button class="btn btn-danger" onclick="confirmDeleteLocation(${location.id})">Excluir</button>
                    </div>
                </section>
            </div>
        `;

    document.getElementById("locations-container").innerHTML = modalHtml;

    // Configurar abas
    document.querySelectorAll(".detail-tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        document
          .querySelectorAll(".detail-tab-btn")
          .forEach((b) => b.classList.remove("active"));
        document
          .querySelectorAll(".detail-tab-pane")
          .forEach((p) => p.classList.remove("active"));

        e.target.classList.add("active");
        document
          .getElementById(`${e.target.dataset.tab}-pane`)
          .classList.add("active");
      });
    });

    // Inicializar Swiper
    setTimeout(() => {
      if (window.swiperInstance) {
        window.swiperInstance.destroy(true, true);
      }
      window.swiperInstance = new Swiper(".detail-swiper", {
        loop: images.length > 1,
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
        },
      });
    }, 100);
  } catch (error) {

  }
}

// Voltar para lista
function backToLocationsList() {
  loadLocationsList();
}

// 2. Abrir formulário de criação/edição
async function openLocationForm(locationId = null) {
  const container = document.getElementById("locations-container");
  // Carregar dados necessários
  let accessibilityItems = [];
  let location = null;
  let selectedAccessibilityItemIds = [];

  try {
    // Se estiver editando, buscar dados do local
    if (locationId) {
      container.innerHTML =
        '<div class="loading-container"><div class="loading-spinner"></div></div>';

      // Buscar local e comentários em paralelo
      const [loc, commentsResponse] = await Promise.all([
        locationService.getById(locationId),
        commentService.getByLocation(locationId)
      ]);
      location = loc;

      // Extrair array de comentários (API retorna { comments: [...] })
      const comments = commentsResponse?.comments || commentsResponse || [];




      // Extrair IDs de ícones dos comentários
      const commentsIconsIds = new Set();

      if (Array.isArray(comments)) {
        comments.forEach(comment => {
          // 1. Verificar comment_icon_ids (IDs diretos)
          if (comment.comment_icon_ids && Array.isArray(comment.comment_icon_ids)) {
            comment.comment_icon_ids.forEach(id => commentsIconsIds.add(id));
          }

          // 2. Verificar comment_icons (Objetos ou Array misto)
          let icons = comment.comment_icons;
          if (typeof icons === 'string') {
            // Se for string "1,2,3"
            icons.split(',').forEach(id => commentsIconsIds.add(parseInt(id.trim())));
          } else if (Array.isArray(icons)) {
            icons.forEach(icon => {
              if (typeof icon === 'object') {
                if (icon.id) commentsIconsIds.add(icon.id);
                if (icon.icon_url) commentsIconsIds.add(icon.icon_url);
                if (icon.url) commentsIconsIds.add(icon.url);
              } else {
                commentsIconsIds.add(icon);
              }
            });
          }
        });
      }

      selectedAccessibilityItemIds = Array.from(commentsIconsIds);



      // debugEl removed
    }

    // Fallback: Se não achou nos comentários, verificar no próprio local (retrocompatibilidade)
    if (selectedAccessibilityItemIds.length === 0 && location && location.accessibility_items) {
      if (location.accessibility_items.length > 0 && typeof location.accessibility_items[0] === 'object') {
        selectedAccessibilityItemIds = location.accessibility_items.map(item => item.id);
      } else {
        selectedAccessibilityItemIds = location.accessibility_items;
      }
    }
  } catch (error) {

    showAlert("Erro ao carregar dados do formulário", "Erro");
    return;
  }

  // Renderizar formulário
  const html = `
        <h3>${location ? "Editar Local" : "Criar Novo Local"}</h3>
        
        <form class="location-form" id="locationForm">
            <div class="form-group">
                <label for="locName">Nome *</label>
                <input type="text" id="locName" name="name" class="form-control" required value="${location?.name || ""
    }" />
            </div>

            <div class="form-group">
                <label for="locDescription">Descrição</label>
                <textarea id="locDescription" name="description" class="form-control">${location?.description || ""
    }</textarea>
            </div>

            <div class="position-inputs-grid">
                <div class="form-group">
                    <label for="locTop">Posição Y (top)</label>
                    <input type="number" id="locTop" name="top" step="0.01" class="form-control" value="${location?.top || ""
    }" />
                </div>

                <div class="form-group">
                    <label for="locLeft">Posição X (left)</label>
                    <input type="number" id="locLeft" name="left" step="0.01" class="form-control" value="${location?.left || ""}" />
                </div>
            </div>
            
            <div class="form-group" style="margin-top: 5px;">
                <button type="button" id="btnOpenMapPicker" class="btn btn-primary" style="
                    display: flex; align-items: center; gap: 8px;
                ">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    Selecionar no Mapa
                </button>
                <p style="margin: 8px 0 0 0; font-size: 12px; color: #666;">
                    Clique no botão acima para abrir o mapa e selecionar visualmente a posição do local. 
                    As coordenadas X e Y serão preenchidas automaticamente.
                </p>
            </div>

            ${location ? `
            <div class="form-group">
              <label>Imagens do Local</label>
              <div class="location-images-carousel">
                    ${(() => {
        // Processar imagens existentes
        let existingImages = [];
        if (location && Array.isArray(location.images)) {
          existingImages = location.images.map((img) => {
            if (typeof img === 'string') return { url: img, id: null };
            if (img && typeof img === 'object') return { url: img.url, id: img.id };
            return null;
          }).filter(img => img && img.url);
        }

        if (existingImages.length === 0) {
          return '<p class="no-images-msg">Nenhuma imagem cadastrada</p>';
        }

        return `
                        <div id="edit-location-carousel" class="swiper edit-location-carousel">
                          <div class="swiper-wrapper">
                            ${existingImages.map((img, index) => `
                              <div class="swiper-slide">
                                <div class="carousel-image-item" data-image-id="${img.id || ''}" data-image-url="${img.url}">
                                  <img src="${img.url}" alt="Imagem ${index + 1}">
                                  <button type="button" class="btn btn-danger btn-sm" style="position:absolute; top:5px; right:5px; padding:5px; font-size:12px;" onclick="deleteLocationImage('${img.id}', this)" ${!img.id ? 'disabled title="Imagem sem ID"' : ''}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                      <polyline points="3 6 5 6 21 6"></polyline>
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                    Excluir
                                  </button>
                                </div>
                              </div>
                            `).join('')}
                          </div>
                          <div class="swiper-button-next"></div>
                          <div class="swiper-button-prev"></div>
                          <div class="swiper-pagination"></div>
                        </div>
                      `;
      })()}
                </div>
            </div>
            ` : ''}



            <div class="form-actions">
                <button type="submit" class="btn btn-primary">${location ? "Salvar Alterações" : "Criar Local"}</button>
                <button type="button" class="btn btn-secondary" onclick="loadLocationsList()">Cancelar</button>
            </div>
        </form>
    `;

  container.innerHTML = html;

  // Inicializar Swiper do carrossel de imagens (se existir)
  const carouselEl = document.getElementById('edit-location-carousel');
  if (carouselEl) {
    // Destruir instância anterior se existir
    if (window.editLocationCarousel) {
      window.editLocationCarousel.destroy(true, true);
    }
    window.editLocationCarousel = new Swiper('#edit-location-carousel', {
      slidesPerView: 1,
      spaceBetween: 15,
      loop: false,
      autoplay: false,
      grabCursor: true,
      navigation: {
        nextEl: '#edit-location-carousel .swiper-button-next',
        prevEl: '#edit-location-carousel .swiper-button-prev',
      },
      pagination: {
        el: '#edit-location-carousel .swiper-pagination',
        clickable: true,
      },
    });
  }

  // ===== MAP PICKER: Seleção de posição no mapa =====
  const btnOpenMapPicker = document.getElementById('btnOpenMapPicker');
  if (btnOpenMapPicker) {
    btnOpenMapPicker.addEventListener('click', () => {
      openMapPicker();
    });
  }

  // Listener do formulário
  document
    .getElementById("locationForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      // Submit handler with visual feedback
      const submitBtn = e.target.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerText;

      // Inner save function
      const executeSave = async () => {
        try {
          submitBtn.disabled = true;
          submitBtn.innerText = location ? "Salvando..." : "Criando...";

          // Coletar dados do formulário
          const formData = new FormData(e.target);
          const data = {
            name: formData.get("name"),
            description: formData.get("description") || "",
            top: formData.get("top") ? parseFloat(formData.get("top")) : null,
            left: formData.get("left") ? parseFloat(formData.get("left")) : null,
          };

          // Coletar IDs de acessibilidade selecionados
          const selectedCheckboxes = document.querySelectorAll(
            '.accessibility-items-grid input[type="checkbox"]:checked'
          );
          data.accessibility_items = Array.from(selectedCheckboxes).map((cb) =>
            parseInt(cb.value)
          );

          if (location) {
            // Atualizar local existente
            await locationService.update(location.id, data);
            showAlert("Local atualizado com sucesso!", "Sucesso");
          } else {
            // Criar novo local
            const created = await locationService.create(data);

            const createdId = created?.id || (created?.location && created.location.id) || created?.location_id || created?.data?.id || created?.data?.location_id;

            if (!created) {
              throw new Error('Falha na comunicação com a API (resposta vazia)');
            }
            // Validar se realmente criou (algum ID deve existir)
            if (!createdId) {

              // Mesmo assim recarrega, pois pode ter funcionado
            } else {
              // Atualiza a variável de local para que upload use o location_id se fosse ter upload sequencial (mas aqui recarrega list)
            }
            showAlert("Local criado com sucesso!", "Sucesso");
          }
          loadLocationsList();
        } catch (error) {

          showAlert(`Erro ao salvar local: ${error.message || error}`, "Erro");
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = originalText;
          }
        }
      };

      // Se for edição, pede confirmação? Ou sempre salva direto?
      // Padrão UX: Salvar/Criar direto não costuma pedir confirmação.
      // Apenas ações destrutivas ou grandes alterações.
      // Vou executar direto para agilizar, mas mantendo a consistência visual.
      executeSave();

    });
}

// 3. Confirmar e deletar local
async function confirmDeleteLocation(id) {
  showModal(
    "Excluir Local",
    "Tem certeza que deseja excluir este local? Esta ação não pode ser desfeita.",
    {
      confirmText: "Excluir",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await locationService.delete(id);
          showAlert("Local excluído com sucesso!", "Sucesso");
          loadLocationsList();
        } catch (error) {

          showAlert(`Erro ao excluir local: ${error.message || error}`, "Erro");
        }
      }
    }
  );
}

// 4. Deletar imagem de local
// 4. Deletar imagem de local
async function deleteLocationImage(imageId, buttonElement) {
  if (!imageId || imageId === 'null' || imageId === 'undefined') {
    showAlert("Esta imagem não possui um ID válido para exclusão.", "Erro");
    return;
  }

  showModal(
    "Excluir Imagem",
    "Deseja realmente remover esta imagem do local?",
    {
      confirmText: "Excluir",
      isDestructive: true,
      onConfirm: async () => {
        // Desabilitar botão durante operação
        if (buttonElement) {
          buttonElement.disabled = true;
          buttonElement.innerHTML = '<span class="loading-spinner-small"></span> Excluindo...';
        }

        try {
          const success = await commentService.deleteImage(imageId);

          if (success) {
            // Remover slide do carrossel
            const slide = buttonElement?.closest('.swiper-slide');
            if (slide) {
              slide.remove();

              // Atualizar Swiper
              if (window.editLocationCarousel) {
                window.editLocationCarousel.update();
              }

              // Se não houver mais imagens, mostrar mensagem
              const remainingSlides = document.querySelectorAll('#edit-location-carousel .swiper-slide');
              if (remainingSlides.length === 0) {
                const carousel = document.getElementById('location-images-carousel');
                if (carousel) {
                  carousel.innerHTML = '<p class="no-images-msg">Nenhuma imagem cadastrada</p>';
                }
              }
            }

            showAlert("Imagem excluída com sucesso!", "Sucesso");
          } else {
            throw new Error("Falha ao excluir imagem");
          }
        } catch (error) {

          showAlert("Erro ao excluir imagem. Tente novamente.", "Erro");

          // Restaurar botão
          if (buttonElement) {
            buttonElement.disabled = false;
            buttonElement.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                Excluir
              `;
          }
        }
      }
    }
  );
}

// ==========================
// FUNÇÃO HELPER: SHOW CONFIRMATION
// ==========================
// Funções Helpers showConfirmation e showAlert removidas daqui pois são importadas de utils

// Expor funções globalmente para chamadas inline
window.openLocationForm = openLocationForm;
window.confirmDeleteLocation = confirmDeleteLocation;
window.loadLocationsList = loadLocationsList;
window.viewLocationDetails = viewLocationDetails;
window.backToLocationsList = backToLocationsList;
window.showAlert = showAlert;
window.deleteLocationImage = deleteLocationImage;

// ===== MAP PICKER: Função para abrir mapa e selecionar posição =====
let mapPickerInstance = null;
let mapPickerMarker = null;
let selectedMapPosition = { top: null, left: null };

function openMapPicker() {
  const modal = document.getElementById('mapPickerModal');
  const container = document.getElementById('mapPickerContainer');
  const coordsDisplay = document.getElementById('mapPickerCoords');
  const confirmBtn = document.getElementById('confirmMapPicker');
  const closeBtn = document.getElementById('closeMapPicker');
  const cancelBtn = document.getElementById('cancelMapPicker');

  if (!modal || !container) {

    return;
  }

  // Reset
  selectedMapPosition = { top: null, left: null };
  coordsDisplay.textContent = 'Posição: Clique no mapa';

  // Mostrar modal
  modal.style.display = 'flex';

  // Aguardar render e inicializar mapa
  setTimeout(() => {
    // Destruir mapa anterior se existir
    if (mapPickerInstance) {
      mapPickerInstance.remove();
      mapPickerInstance = null;
    }

    // Imagem do mapa
    const imgUrl = '/assets/img/map/mapa_ifba.svg';
    const img = new Image();

    // Iniciar busca de locais existentes (referência visual) IMEDIATAMENTE
    const locationsPromise = locationService.getAll().catch(err => {

      return [];
    });

    img.onload = async () => {
      const W = img.naturalWidth;
      const H = img.naturalHeight;
      const bounds = [[0, 0], [H, W]];

      // Criar mapa
      mapPickerInstance = L.map(container, {
        crs: L.CRS.Simple,
        minZoom: -2,
        maxZoom: 2,
        zoomSnap: 0.25,
        attributionControl: false,
        maxBounds: bounds,
        maxBoundsViscosity: 1.0,
      });

      L.imageOverlay(imgUrl, bounds).addTo(mapPickerInstance);
      mapPickerInstance.fitBounds(bounds);

      // Evento de clique no mapa
      mapPickerInstance.on('click', (e) => {
        const { lat, lng } = e.latlng;

        // Converter para porcentagem (baseado nas dimensões da imagem)
        const topPercent = (lat / H) * 100;
        const leftPercent = (lng / W) * 100;

        selectedMapPosition = {
          top: topPercent.toFixed(2),
          left: leftPercent.toFixed(2)
        };

        // Atualizar display
        coordsDisplay.textContent = `Posição: Y=${selectedMapPosition.top}% | X=${selectedMapPosition.left}%`;

        // Adicionar/mover marcador (destaque azul)
        if (mapPickerMarker) {
          mapPickerMarker.setLatLng(e.latlng);
        } else {
          mapPickerMarker = L.marker(e.latlng, {
            icon: L.divIcon({
              className: 'map-picker-pin',
              html: `<div style="
                width: 30px; height: 30px; background: #007bff; border: 3px solid white;
                border-radius: 50% 50% 50% 0; transform: rotate(-45deg);
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
              "></div>`,
              iconSize: [30, 30],
              iconAnchor: [15, 30],
            })
          }).addTo(mapPickerInstance);
        }
      });

      // CARREGAR LOCAIS EXISTENTES COMO REFERÊNCIA
      try {
        const response = await locationsPromise;
        const existingLocs = Array.isArray(response) ? response : response?.locations || [];

        if (Array.isArray(existingLocs)) {
          const detectType = (name) => {
            const n = (name || "").toLowerCase();
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
          };

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
            default: "#888888",
          };

          existingLocs.forEach(loc => {
            if (!loc.top || !loc.left) return;

            const top = parseFloat(loc.top);
            const left = parseFloat(loc.left);

            const x = (left / 100) * W;
            const y = (top / 100) * H;

            const type = detectType(loc.name);
            const color = corMap[type] || corMap.default;

            L.circleMarker([y, x], {
              radius: 6,
              fillColor: color,
              color: "#fff",
              weight: 1,
              opacity: 0.9,
              fillOpacity: 0.8
            })
              .bindTooltip(loc.name, {
                permanent: true,
                direction: "top",
                className: "map-picker-tooltip",
                offset: [0, -6]
              })
              .addTo(mapPickerInstance);
          });
        }
      } catch (err) {

      }
    };

    img.onerror = () => {
      container.innerHTML = '<p style="color: red; text-align: center; padding: 20px;">Erro ao carregar imagem do mapa</p>';
    };

    img.src = imgUrl;
  }, 100);

  // Confirmar posição
  confirmBtn.onclick = () => {
    if (selectedMapPosition.top !== null && selectedMapPosition.left !== null) {
      // Preencher campos do formulário
      const topInput = document.getElementById('locTop');
      const leftInput = document.getElementById('locLeft');

      if (topInput) topInput.value = selectedMapPosition.top;
      if (leftInput) leftInput.value = selectedMapPosition.left;

      closeMapPickerModal();
    } else {
      showAlert('Por favor, clique no mapa para selecionar uma posição.', "Aviso");
    }
  };

  // Fechar modal (botão X e botão Cancelar)
  if (closeBtn) closeBtn.onclick = closeMapPickerModal;
  if (cancelBtn) cancelBtn.onclick = closeMapPickerModal;

  // Fechar ao clicar fora
  modal.onclick = (e) => {
    if (e.target === modal) {
      closeMapPickerModal();
    }
  };
}

function closeMapPickerModal() {
  const modal = document.getElementById('mapPickerModal');
  if (modal) modal.style.display = 'none';

  // Limpar marcador
  if (mapPickerMarker && mapPickerInstance) {
    mapPickerInstance.removeLayer(mapPickerMarker);
    mapPickerMarker = null;
  }
}

window.openMapPicker = openMapPicker;
