document.addEventListener('DOMContentLoaded', () => {
  const imgUrl = '../../assets/img/map/mapa-ifba.png'; // ajuste o caminho da imagem

  // Garante que o modal comece fechado ao carregar a página
  const initialModal = document.getElementById('infoModal');
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
    { label: 'Entrada', top: 90, left: 7 },
    { label: 'Estacionamento I', top: 72, left: 32 },
    { label: 'Estacionamento II', top: 78, left: 75 },
    { label: 'Estacionamento III', top: 40, left: 96 },
    { label: 'Campo', top: 65, left: 12 },
    { label: 'Quadra', top: 17, left: 10 },
    { label: 'Quadra de Areia', top: 5, left: 14 },
    { label: 'Bloco 06', top: 44, left: 30 },
    { label: 'Bloco 05', top: 46, left: 48 },
    { label: 'Bloco 08', top: 21, left: 30 },
    { label: 'Bloco 09', top: 15, left: 46 },
    { label: 'Cantina', top: 44, left: 71 },
    { label: 'Auditório', top: 60, left: 54 },
    { label: 'Bloco 16', top: 30, left: 80 },
    { label: 'Biblioteca', top: 18, left: 86 },
    { label: 'Cores', top: 32, left: 54 }
  ];

  const img = new Image();
  img.src = imgUrl;

  img.onload = () => {
    const W = img.naturalWidth;
    const H = img.naturalHeight;
    const bounds = [[0, 0], [H, W]];

    const map = L.map('map', {
      crs: L.CRS.Simple,
      minZoom: -3,
      maxZoom: 4,
      zoomSnap: 0.25,
      attributionControl: false
    });

    L.imageOverlay(imgUrl, bounds).addTo(map);
    map.fitBounds(bounds);

    // Cria o ícone de pin
    function makePinIcon() {
      return L.divIcon({
        className: 'pin-marker',
        html: `<div class="dot"></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
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
        const modal = document.getElementById("infoModal");
        modal.style.display = "flex";
        inModal = true;

        try {
          // empurra um estado para que o botão voltar do browser possa fechar o modal primeiro
          history.pushState({ modal: true }, '');
          modalPushed = true;
        } catch (e) {
          // alguns ambientes (file://) podem lançar; ignore
          modalPushed = false;
        }
      });
    });

    // Não fechamos o modal ao clicar fora nem temos um X: o fluxo agora é
    // fechar o modal via botão "voltar" da navbar (arquivo index.html tem o link)

    // Intercepta clique no botão voltar na navbar: quando o modal estiver aberto,
    // fecha o modal e previne a navegação; quando o modal estiver fechado, segue para a página principal
    const navBack = document.querySelector('.btn.voltar');
    if (navBack) {
      navBack.addEventListener('click', function (e) {
        const modal = document.getElementById("infoModal");
        if (modal && modal.style.display === 'flex') {
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
        const modal = document.getElementById("infoModal");
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
          const modal = document.getElementById("infoModal");
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
    });
  });
});

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
      const infoModal = document.getElementById('infoModal');
      const addModal = document.getElementById('addCommentModal');
      if (infoModal) infoModal.style.display = 'none';
      if (addModal) addModal.style.display = 'flex';
    });
  }

  // Event listener para fechar o modal de adicionar comentário
  const addCommentBackBtn = document.querySelector('#addCommentModal .back-btn');
  if (addCommentBackBtn) {
    addCommentBackBtn.addEventListener('click', () => {
      const infoModal = document.getElementById('infoModal');
      const addModal = document.getElementById('addCommentModal');
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
    commentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('user-name').value;
      const rating = ratingInput.value;
      const commentText = document.getElementById('comment-text').value;
      const date = new Date().toISOString(); // Use ISO for database compatibility

      // Prepare comment data for future database submission
      const commentData = {
        name,
        rating: parseInt(rating),
        comment: commentText,
        date
      };

      // For now, log to console (replace with database call later)
      console.log('Comment data to send to database:', commentData);

      // Reset form
      commentForm.reset();
      stars.forEach(s => {
        s.classList.remove('active');
        s.textContent = '☆';
      });
      ratingInput.value = '';

      // Close add comment modal and open info modal
      const addModal = document.getElementById('addCommentModal');
      const infoModal = document.getElementById('infoModal');
      if (addModal) addModal.style.display = 'none';
      if (infoModal) infoModal.style.display = 'flex';

      // Switch to review tab
      const reviewTab = document.getElementById('review-tab');
      if (reviewTab) reviewTab.click();
    });
  }
});