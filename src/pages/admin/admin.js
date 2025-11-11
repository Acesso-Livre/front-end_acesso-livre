// JavaScript da Página Administrativa - Acesso Livre
// Este arquivo gerencia a autenticação, interface do dashboard e interações do usuário

document.addEventListener('DOMContentLoaded', function() {
  // Constantes para elementos DOM
  const formularioLogin = document.getElementById('login-form');
  const secaoLogin = document.getElementById('login-section');
  const painelAdmin = document.getElementById('admin-dashboard');
  const erroLogin = document.getElementById('login-error');
  const botaoLogout = document.getElementById('logout-btn');
  const linkEsqueceuSenha = document.getElementById('forgot-password-link');
  const modalEsqueceuSenha = document.getElementById('forgotPasswordModal');
  const formularioEsqueceuSenha = document.getElementById('forgot-password-form');
  const erroEsqueceuSenha = document.getElementById('forgot-error');
  const sucessoEsqueceuSenha = document.getElementById('forgot-success');
  const fecharModalEsqueceu = document.getElementById('close-forgot-modal');

  // Credenciais padrão do administrador
  const CREDENCIAIS_ADMIN = {
    email: 'admin@acessolivre.com',
    senha: 'admin123'
  };

  // Verificar se já está logado na sessão
  if (sessionStorage.getItem('adminLogado') === 'true') {
    mostrarPainelAdmin();
  }

  // Configurar event listeners
  configurarEventos();

  /**
   * Configura todos os event listeners da página
   */
  function configurarEventos() {
    // Evento para link "Esqueceu a senha?"
    linkEsqueceuSenha.addEventListener('click', function(evento) {
      evento.preventDefault();
      modalEsqueceuSenha.style.display = 'block';
    });

    // Evento para fechar modal de recuperação de senha
    fecharModalEsqueceu.addEventListener('click', function() {
      modalEsqueceuSenha.style.display = 'none';
    });

    // Evento para submissão do formulário de recuperação de senha
    formularioEsqueceuSenha.addEventListener('submit', function(evento) {
      evento.preventDefault();
      processarRecuperacaoSenha();
    });

    // Evento para submissão do formulário de login
    formularioLogin.addEventListener('submit', function(evento) {
      evento.preventDefault();
      processarLogin();
    });

    // Evento para logout
    botaoLogout.addEventListener('click', function() {
      sessionStorage.removeItem('adminLogado');
      mostrarLogin();
    });
  }

  /**
   * Processa a recuperação de senha
   */
  function processarRecuperacaoSenha() {
    const email = document.getElementById('forgot-email').value;

    if (email === CREDENCIAIS_ADMIN.email) {
      // Simular envio de email - em produção, seria uma chamada para o backend
      console.log(`Enviando email de recuperação para: ${email}`);
      erroEsqueceuSenha.style.display = 'none';
      sucessoEsqueceuSenha.style.display = 'block';
      setTimeout(() => {
        modalEsqueceuSenha.style.display = 'none';
        formularioEsqueceuSenha.reset();
        sucessoEsqueceuSenha.style.display = 'none';
      }, 2000);
    } else {
      erroEsqueceuSenha.textContent = 'Email não encontrado.';
      erroEsqueceuSenha.style.display = 'block';
      sucessoEsqueceuSenha.style.display = 'none';
    }
  }

  /**
   * Processa o login do administrador
   */
  function processarLogin() {
    const email = document.getElementById('admin-email').value;
    const senha = document.getElementById('admin-password').value;

    if (email === CREDENCIAIS_ADMIN.email && senha === CREDENCIAIS_ADMIN.senha) {
      sessionStorage.setItem('adminLogado', 'true');
      mostrarPainelAdmin();
    } else {
      erroLogin.style.display = 'block';
      setTimeout(() => {
        erroLogin.style.display = 'none';
      }, 3000);
    }
  }

  /**
   * Mostra o painel administrativo e oculta o login
   */
  function mostrarPainelAdmin() {
    secaoLogin.style.display = 'none';
    painelAdmin.style.display = 'block';
    carregarAvaliacoesPendentes();
  }

  /**
   * Carrega as avaliações pendentes
   */
  async function carregarAvaliacoesPendentes() {
    const containerAvaliacoes = document.getElementById('reviews-list');
    containerAvaliacoes.innerHTML = '<p>Carregando...</p>';

    try {
      const comments = await getPendingComments();
      if (comments.length === 0) {
        containerAvaliacoes.innerHTML = '<p>Nenhum comentário pendente.</p>';
        return;
      }

      containerAvaliacoes.innerHTML = comments.map(comment => {
        const locationName = comment.location || `Local ${comment.location_id}`;
        const ratingStars = '⭐'.repeat(comment.rating || 0);
        const dateFormatted = new Date(comment.date).toLocaleDateString('pt-BR');

        return `
          <div class="review-item" data-id="${comment.id}">
            <div class="review-header">
              <span class="review-user">${comment.user}</span>
              <span class="review-date">${dateFormatted}</span>
            </div>
            <div class="review-location">
              <strong>Local:</strong> ${locationName}
            </div>
            <div class="review-rating">${ratingStars}</div>
            <div class="review-text">${comment.text}</div>
            <div class="review-actions">
              <button class="btn-approve" onclick="aprovarAvaliacao(${comment.id})">Aprovar</button>
              <button class="btn-reject" onclick="rejeitarAvaliacao(${comment.id})">Rejeitar</button>
            </div>
          </div>
        `;
      }).join('');
    } catch (error) {
      console.error('Erro ao carregar comentários pendentes:', error);
      containerAvaliacoes.innerHTML = '<p>Erro ao carregar comentários.</p>';
    }
  }

  /**
   * Aprova uma avaliação
   */
  async function aprovarAvaliacao(id) {
    try {
      const success = await approveComment(id);
      if (success) {
        // Remover da lista
        const item = document.querySelector(`[data-id="${id}"]`);
        if (item) {
          item.remove();
        }
        alert('Comentário aprovado com sucesso!');
      } else {
        alert('Erro ao aprovar comentário.');
      }
    } catch (error) {
      console.error('Erro ao aprovar:', error);
      alert('Erro ao aprovar comentário.');
    }
  }

  /**
   * Rejeita uma avaliação
   */
  async function rejeitarAvaliacao(id) {
    try {
      const success = await rejectComment(id);
      if (success) {
        // Remover da lista
        const item = document.querySelector(`[data-id="${id}"]`);
        if (item) {
          item.remove();
        }
        alert('Comentário rejeitado.');
      } else {
        alert('Erro ao rejeitar comentário.');
      }
    } catch (error) {
      console.error('Erro ao rejeitar:', error);
      alert('Erro ao rejeitar comentário.');
    }
  }

  // Tornar funções globais para onclick
  window.aprovarAvaliacao = aprovarAvaliacao;
  window.rejeitarAvaliacao = rejeitarAvaliacao;

  /**
   * Mostra a tela de login e oculta o painel
   */
  function mostrarLogin() {
    painelAdmin.style.display = 'none';
    secaoLogin.style.display = 'flex';
    formularioLogin.reset();
  }

});