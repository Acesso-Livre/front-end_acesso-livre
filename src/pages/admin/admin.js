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
  function carregarAvaliacoesPendentes() {
    const containerAvaliacoes = document.getElementById('reviews-list');
    const avaliacoes = [
      {
        id: 1,
        usuario: 'João Silva',
        data: '2023-11-06',
        local: 'Rampa Principal',
        avaliacao: '⭐⭐⭐⭐⭐',
        texto: 'Excelente rampa, muito acessível!'
      },
      {
        id: 2,
        usuario: 'Maria Oliveira',
        data: '2023-11-05',
        local: 'Entrada Lateral',
        avaliacao: '⭐⭐⭐⭐',
        texto: 'Boa estrutura, mas poderia ser melhor sinalizada.'
      },
      {
        id: 3,
        usuario: 'Carlos Santos',
        data: '2023-11-04',
        local: 'Corredor Central',
        avaliacao: '⭐⭐⭐⭐⭐',
        texto: 'Muito útil para pessoas com mobilidade reduzida.'
      }
    ];

    containerAvaliacoes.innerHTML = avaliacoes.map(avaliacao => `
      <div class="review-item" data-id="${avaliacao.id}">
        <div class="review-header">
          <span class="review-user">${avaliacao.usuario}</span>
          <span class="review-date">${avaliacao.data}</span>
        </div>
        <div class="review-location">
          <strong>Local:</strong> ${avaliacao.local}
        </div>
        <div class="review-rating">${avaliacao.avaliacao}</div>
        <div class="review-text">${avaliacao.texto}</div>
        <div class="review-actions">
          <button class="btn-approve" onclick="aprovarAvaliacao(${avaliacao.id})">Aprovar</button>
          <button class="btn-reject" onclick="rejeitarAvaliacao(${avaliacao.id})">Rejeitar</button>
        </div>
      </div>
    `).join('');
  }

  /**
   * Aprova uma avaliação
   */
  function aprovarAvaliacao(id) {
    console.log(`Avaliação ${id} aprovada`);
    // Remover da lista
    const item = document.querySelector(`[data-id="${id}"]`);
    if (item) {
      item.remove();
    }
    alert('Avaliação aprovada com sucesso!');
  }

  /**
   * Rejeita uma avaliação
   */
  function rejeitarAvaliacao(id) {
    console.log(`Avaliação ${id} rejeitada`);
    // Remover da lista
    const item = document.querySelector(`[data-id="${id}"]`);
    if (item) {
      item.remove();
    }
    alert('Avaliação rejeitada.');
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