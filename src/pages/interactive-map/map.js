const MODAL_IDS = {
  infoModal: 'infoModal',
  addCommentModal: 'addCommentModal'
};

const ELEMENT_IDS = {
  locationTitle: 'location-title',
  locationDescription: 'location-description'
};

document.addEventListener('DOMContentLoaded', () => {
  const imgUrl = '../../assets/img/map/mapa-ifba.png'; // ajuste o caminho da imagem

  // Garante que o modal comece fechado ao carregar a página
  const initialModal = document.getElementById(MODAL_IDS.infoModal);
  if (initialModal) initialModal.style.display = 'none';

  // Se o usuário veio do botão 'Explorar mapa', limpamos o flag e garantimos
  // que nenhum modal seja aberto automaticamente
  try {
    if (sessionStorage.getItem('enterFromExplore') === '1') {
      sessionStorage.removeItem('enterFromExplore');
    }
  } catch (e) {
    /* ignore */
  }

  const pins = [
    { label: 'Entrada', top: 87, left: 3.7, id: 1 },
    { label: 'Estacionamento I', top: 75, left: 27, id: 2 },
    { label: 'Estacionamento II', top: 80.5, left: 72.5, id: 3 },
    { label: 'Estacionamento III', top: 42, left: 91, id: 4 },
    { label: 'Campo', top: 66.5, left: 10.3, id: 5 },
    { label: 'Quadra', top: 20, left: 8.3, id: 6 },
    { label: 'Quadra de Areia', top: 7.5, left: 17.5, id: 7 },
    { label: 'Bloco 06', top: 42.5, left: 30, id: 8 },
    { label: 'Bloco 05', top: 45.8, left: 46.5, id: 9 },
    { label: 'Bloco 08', top: 20, left: 30, id: 10 },
    { label: 'Bloco 09', top: 14.8, left: 46, id: 11 },
    { label: 'Cantina', top: 59, left: 69, id: 12 },
    { label: 'Auditório', top: 60, left: 54.2, id: 13 },
    { label: 'Bloco 16', top: 39, left: 78, id: 14 },
    { label: 'Biblioteca', top: 21.5, left: 84.6, id: 15 },
    { label: 'Cores', top: 34.5, left: 48.2, id: 16 }
  ];

  // Expor pins para uso em api.js
  window.pins = pins;

  const img = new Image();
  img.src = imgUrl;

  // Função para abrir o modal com dados da localização
  async function openLocationModal(locationData, pinLabel) {
    const titleElement = document.getElementById(ELEMENT_IDS.locationTitle);
    const descriptionElement = document.getElementById(ELEMENT_IDS.locationDescription);

    if (titleElement) titleElement.textContent = locationData?.name || pinLabel;
    if (descriptionElement) descriptionElement.textContent = locationData?.description || 'Descrição não disponível.';

    // Store current location ID for comment submission
    window.currentLocationId = locationData?.id || null;

    // Load approved comments for this location
    if (window.currentLocationId) {
      loadCommentsForLocation(window.currentLocationId);
    }

    const modal = document.getElementById(MODAL_IDS.infoModal);
    modal.style.display = "flex";
    inModal = true;

    try {
      history.pushState({ modal: true }, '');
      modalPushed = true;
    } catch (e) {
      modalPushed = false;
    }
  }

  // Função para criar ícone de pin
  function makePinIcon() {
    return L.divIcon({
      className: 'pin-marker',
      html: `<div class="dot"></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  }

  img.onload = async () => {
    const W = img.naturalWidth;
    const H = img.naturalHeight;
    const bounds = [[0, 0], [H, W]];

    const map = L.map('map', {
      crs: L.CRS.Simple,
      minZoom: 0,
      maxZoom: 4,
      zoomSnap: 0.25,
      attributionControl: false,
      maxBounds: bounds,
      maxBoundsViscosity: 1.0
    });

    L.imageOverlay(imgUrl, bounds).addTo(map);
    map.fitBounds(bounds);

    // Calculate zoom to fill the screen
    const viewport = map.getSize();
    const zoomH = Math.log2(viewport.y / H);
    const zoomW = Math.log2(viewport.x / W);
    const fillZoom = Math.max(zoomH, zoomW);
    map.setZoom(fillZoom);
    map.setMinZoom(fillZoom);

    // Carrega todos os dados de localização primeiro
    let allLocations = [];
    try {
      allLocations = await fetchData() || [];
    } catch (error) {
      console.error('Erro ao carregar dados de localizações:', error);
    }

    // Adiciona os pins no mapa
    // Vamos rastrear o estado do modal para controlar o comportamento do botão "Voltar"
    let inModal = false;
    let modalPushed = false; // se true, a abertura do modal empurrou um estado no history

    pins.forEach(p => {
      const x = (p.left / 100) * W;
      const y = (p.top / 100) * H;
      const marker = L.marker([y, x], { icon: makePinIcon() }).addTo(map);

      // Ao clicar em um pin → abre modal
      marker.on('click', () => {
        console.log(`Pin clicado:`, p);
        const locationData = allLocations.find(loc => loc.id == p.id);
        openLocationModal(locationData, p.label);
      });
    });

    // Não fechamos o modal ao clicar fora nem temos um X: o fluxo agora é
    // fechar o modal via botão "voltar" da navbar (arquivo index.html tem o link)

    // Intercepta clique no botão voltar na navbar: quando o modal estiver aberto,
    // fecha o modal e previne a navegação; quando o modal estiver fechado, segue para a página principal
    const navBack = document.querySelector('.btn.voltar');
    if (navBack) {
      navBack.addEventListener('click', function (e) {
        const modal = document.getElementById(MODAL_IDS.infoModal);
        const addModal = document.getElementById(MODAL_IDS.addCommentModal);
        if (addModal && addModal.style.display === 'flex') {
          // fecha modal de adicionar comentário e volta para o modal de info
          e.preventDefault();
          addModal.style.display = 'none';
          if (modal) modal.style.display = 'flex';
          // inModal permanece true, pois estamos voltando para o modal de info
        } else if (modal && modal.style.display === 'flex') {
          // fecha modal em vez de navegar
          e.preventDefault();
          modal.style.display = 'none';
          inModal = false;
          if (modalPushed) {
            try { history.back(); } catch (err) { /* ignore */ }
            modalPushed = false;
          }
        } else {
          // deixa o link agir normalmente (navegar para a página principal)
        }
      });
    }

    // Se o usuário usar o botão "voltar" do browser enquanto o modal estiver aberto
    window.addEventListener('popstate', function (event) {
      if (inModal) {
        const modal = document.getElementById(MODAL_IDS.infoModal);
        modal.style.display = "none";
        inModal = false;
        modalPushed = false;
      }
    });

    // Botão interno "Voltar" do modal: primeiro fecha o modal; se já estiver no mapa, volta para a página principal
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        if (inModal) {
          const modal = document.getElementById(MODAL_IDS.infoModal);
          modal.style.display = "none";
          inModal = false;
          if (modalPushed) {
            try { history.back(); } catch (e) { /* ignore */ }
            modalPushed = false;
          }
        } else {
          // já está no mapa: volta para a página principal
          window.location.href = '../../index.html';
        }
      });
    }

    // Recalibra o mapa ao redimensionar a janela
    let resizeTimer = null;
    window.addEventListener('resize', () => {
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
    console.error('Erro ao carregar a imagem do mapa:', imgUrl);
    alert('Erro ao carregar a imagem do mapa. Verifique o caminho.');
  };
});

document.addEventListener("DOMContentLoaded", () => {
  // Suporte a duas variações de markup:
  // 1) Swiper (markup .swiper .swiper-wrapper .swiper-slide)
  // 2) Carrossel custom (markup .carousel-track .project-card)

  function initCustomCarousel() {
    const track = document.querySelector(".carousel-track");
    const cards = document.querySelectorAll(".project-card");
    const prevBtn = document.querySelector(".carousel-btn.left");
    const nextBtn = document.querySelector(".carousel-btn.right");

    if (!track || cards.length === 0) return false;

    let currentIndex = 0;

    function updateCarousel() {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      if (prevBtn) prevBtn.style.display = currentIndex === 0 ? "none" : "block";
      if (nextBtn) nextBtn.style.display = currentIndex === cards.length - 1 ? "none" : "block";
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (currentIndex < cards.length - 1) {
          currentIndex++;
          updateCarousel();
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (currentIndex > 0) {
          currentIndex--;
          updateCarousel();
        }
      });
    }

    // Inicial state
    if (prevBtn) prevBtn.style.display = "none";
    if (nextBtn) nextBtn.style.display = cards.length > 1 ? "block" : "none";
    updateCarousel();

    return true;
  }

  function initSwiperIfAvailable() {
    const swiperEl = document.querySelector('.swiper');
    if (!swiperEl) return false;

    function createSwiper() {
      if (typeof Swiper === 'undefined') return false;
      // eslint-disable-next-line no-unused-vars
      const swiper = new Swiper('.swiper', {
        slidesPerView: 1,
        spaceBetween: 8,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        loop: false,
      });
      return true;
    }

    // Tenta criar imediatamente, se a lib já foi carregada
    if (createSwiper()) return true;

    // Se a lib ainda não carregou (map.js foi incluído antes do Swiper), aguarda o load
    window.addEventListener('load', () => {
      createSwiper();
    });

    return true;
  }

  // Primeiro tenta inicializar Swiper (marcações mais recentes). Se não houver, tenta o carrossel custom.
  const used = initSwiperIfAvailable() || initCustomCarousel();
  // se nenhum foi inicializado, não faz nada (sem erros no console)
});

document.addEventListener("DOMContentLoaded", function () {
  const tabs = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-pane");
  const tabWrapper = document.querySelector('.tab-content');

  // Inicializa o layout: posiciona os painéis e mostra somente o primeiro
  if (tabWrapper) {
    tabWrapper.style.position = tabWrapper.style.position || 'relative';
    tabWrapper.style.overflow = tabWrapper.style.overflow || 'hidden';
  }

  tabContents.forEach((content, index) => {
    // garante as classes iniciais
    if (index === 0) {
      content.classList.add('active');
      content.classList.remove('enter-right', 'exit-left');
    } else {
      content.classList.remove('active');
      content.classList.add('enter-right');
    }
  });

  tabs.forEach(tab => {
    tab.addEventListener('click', function () {
      // Atualiza a aba ativa visual
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const current = document.querySelector('.tab-pane.active');
      const target = document.querySelector(`#${tab.id.replace('tab', 'content')}`);
      if (!target || current === target) return;

      // Anima o painel atual para a esquerda
      if (current) {
        current.classList.remove('active');
        // força reflow para garantir que a transição ocorra
        current.classList.add('exit-left');
        const onEnd = (e) => {
          if (e.propertyName && (e.propertyName.indexOf('transform') === -1)) return;
          current.classList.remove('exit-left');
          current.removeEventListener('transitionend', onEnd);
        };
        current.addEventListener('transitionend', onEnd);
      }

      // Prepara o painel alvo vindo da direita
      target.classList.remove('exit-left');
      target.classList.add('enter-right');

      // Força repaint antes de ativar (para garantir animação)
      // eslint-disable-next-line no-unused-expressions
      target.offsetWidth;

      target.classList.add('active');
      target.classList.remove('enter-right');

      // Load comments if review tab is activated
      if (target.id === 'review-content' && window.currentLocationId) {
        loadCommentsForLocation(window.currentLocationId);
      }
    });
  });
});

// Função para carregar comentários aprovados para um local
async function loadCommentsForLocation(locationId) {
  const commentsList = document.querySelector('.comments-list');
  if (!commentsList) return;

  commentsList.innerHTML = '<p>Carregando comentários...</p>';
  try {
    const comments = await getApprovedCommentsForLocation(locationId);
    if (comments.length === 0) {
      commentsList.innerHTML = '<p>Nenhum comentário ainda.</p>';
    } else {
      commentsList.innerHTML = comments.map(comment => `
        <div class="comment-card">
          <div class="comment-header">
            <span class="user-name">${comment.user}</span>
            <span class="comment-date">${new Date(comment.date).toLocaleDateString('pt-BR')}</span>
          </div>
          <div class="comment-rating">${'⭐'.repeat(comment.rating || 0)}</div>
          <p class="comment-text">${comment.text}</p>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Erro ao carregar comentários:', error);
    commentsList.innerHTML = '<p>Erro ao carregar comentários.</p>';
  }
}

// Controla o estado do botão de adicionar comentário: só habilita quando a aba 'Comentarios' está ativa
document.addEventListener('DOMContentLoaded', () => {
  const commentBtn = document.querySelector('.comment-btn');
  const reviewTab = document.getElementById('review-tab');

  function setCommentButton(enabled) {
    if (!commentBtn) return;
    // Se o usuário pediu que o botão suma, usamos a classe 'hidden' para removê-lo do fluxo
    if (enabled) {
      commentBtn.classList.remove('hidden');
      commentBtn.classList.remove('disabled');
      commentBtn.disabled = false;
    } else {
      commentBtn.classList.add('hidden');
      commentBtn.classList.add('disabled');
      commentBtn.disabled = true;
    }
  }

  // estado inicial: somente habilitado se a aba 'review' já estiver ativa
  setCommentButton(document.querySelector('#review-content')?.classList.contains('active'));

  // Quando o usuário clica em uma aba, o código já troca as classes; escutamos cliques nas abas para atualizar o botão
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      setTimeout(() => { // aguarda micro-tick para garantir que a troca de classes já tenha ocorrido
        const isReviewActive = document.querySelector('#review-content')?.classList.contains('active');
        setCommentButton(!!isReviewActive);
      }, 0);
    });
  });

  // Event listener para abrir o modal de adicionar comentário
  if (commentBtn) {
    commentBtn.addEventListener('click', () => {
      const infoModal = document.getElementById(MODAL_IDS.infoModal);
      const addModal = document.getElementById(MODAL_IDS.addCommentModal);
      if (infoModal) infoModal.style.display = 'none';
      if (addModal) addModal.style.display = 'flex';
    });
  }

  // Event listener para fechar o modal de adicionar comentário
  const addCommentBackBtn = document.querySelector(`#${MODAL_IDS.addCommentModal} .back-btn`);
  if (addCommentBackBtn) {
    addCommentBackBtn.addEventListener('click', () => {
      const infoModal = document.getElementById(MODAL_IDS.infoModal);
      const addModal = document.getElementById(MODAL_IDS.addCommentModal);
      if (addModal) addModal.style.display = 'none';
      if (infoModal) infoModal.style.display = 'flex';
    });
  }

  // Star rating functionality
  const stars = document.querySelectorAll('.star');
  const ratingInput = document.getElementById('rating');
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const value = star.getAttribute('data-value');
      ratingInput.value = value;
      stars.forEach(s => {
        if (s.getAttribute('data-value') <= value) {
          s.classList.add('active');
          s.textContent = '★';
        } else {
          s.classList.remove('active');
          s.textContent = '☆';
        }
      });
    });
  });

  // Handle comment form submission
  const commentForm = document.getElementById('comment-form');
  if (commentForm) {
    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('user-name').value;
      const rating = ratingInput.value;
      const commentText = document.getElementById('comment-text').value;

      // Check if rating is mandatory
      if (!rating || rating === '') {
        alert('Por favor, selecione uma avaliação com estrelas.');
        return;
      }

      const date = new Date().toISOString(); // Use ISO for database compatibility

      // Prepare comment data for submission
      const commentData = {
        user: name,
        rating: parseInt(rating),
        text: commentText,
        date: new Date().toISOString(),
        location_id: window.currentLocationId,
        status: 'pending'
      };

      // Submit comment to API
      const result = await postComment(commentData);
      if (result) {
        alert('Comentário enviado para aprovação!');
      } else {
        alert('Erro ao enviar comentário. Tente novamente.');
        return; // Don't reset form if failed
      }

      // Reset form
      commentForm.reset();
      stars.forEach(s => {
        s.classList.remove('active');
        s.textContent = '☆';
      });
      ratingInput.value = '';

      // Close add comment modal and open info modal
      const addModal = document.getElementById(MODAL_IDS.addCommentModal);
      const infoModal = document.getElementById(MODAL_IDS.infoModal);
      if (addModal) addModal.style.display = 'none';
      if (infoModal) infoModal.style.display = 'flex';

      // Switch to review tab
      const reviewTab = document.getElementById('review-tab');
      if (reviewTab) reviewTab.click();
    });
  }
});