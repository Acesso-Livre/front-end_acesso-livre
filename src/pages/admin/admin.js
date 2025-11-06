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
    carregarEstatisticas();
    carregarLogsRecentes();
    inicializarPainel();
  }

  /**
   * Mostra a tela de login e oculta o painel
   */
  function mostrarLogin() {
    painelAdmin.style.display = 'none';
    secaoLogin.style.display = 'flex';
    formularioLogin.reset();
  }

  /**
   * Inicializa os componentes do painel administrativo
   */
  function inicializarPainel() {
    const botaoExportar = document.getElementById('export-data-btn');
    const botaoConfiguracoes = document.getElementById('system-settings-btn');
    const botaoGerenciarUsuarios = document.getElementById('user-management-btn');
    const modalConfiguracoes = document.getElementById('settingsModal');
    const formularioConfiguracoes = document.getElementById('settings-form');

    // Abrir modal de configurações
    botaoConfiguracoes.addEventListener('click', function() {
      modalConfiguracoes.style.display = 'block';
    });

    // Fechar modais ao clicar fora
    window.addEventListener('click', function(evento) {
      if (evento.target === modalConfiguracoes) {
        modalConfiguracoes.style.display = 'none';
      }
      if (evento.target === modalEsqueceuSenha) {
        modalEsqueceuSenha.style.display = 'none';
      }
    });

    // Processar formulário de configurações
    formularioConfiguracoes.addEventListener('submit', function(evento) {
      evento.preventDefault();
      const tituloSite = document.getElementById('site-title').value;
      const modoManutencao = document.getElementById('maintenance-mode').checked;

      // Em produção, enviar para o servidor
      console.log('Configurações atualizadas:', { tituloSite, modoManutencao });
      modalConfiguracoes.style.display = 'none';
    });

    // Ações rápidas (placeholders)
    botaoExportar.addEventListener('click', function() {
      console.log('Iniciando exportação de dados...');
      alert('Funcionalidade de exportação em desenvolvimento.');
    });

    botaoGerenciarUsuarios.addEventListener('click', function() {
      console.log('Abrindo painel de gerenciamento de usuários...');
      alert('Funcionalidade de gerenciamento de usuários em desenvolvimento.');
    });
  }

  /**
   * Carrega as estatísticas do sistema
   */
  function carregarEstatisticas() {
    // Simular carregamento de dados
    document.getElementById('total-users').textContent = '1.234';
    document.getElementById('pending-reports').textContent = '12';
    document.getElementById('today-access').textContent = '567';
  }

  /**
   * Carrega os logs recentes do sistema
   */
  function carregarLogsRecentes() {
    const containerLogs = document.getElementById('recent-logs');
    const logs = [
      '2023-11-06 10:30: Login de admin realizado',
      '2023-11-06 09:15: Novo usuário registrado',
      '2023-11-06 08:45: Relatório gerado',
      '2023-11-06 08:00: Sistema iniciado'
    ];

    containerLogs.innerHTML = logs.map(log => `<p>${log}</p>`).join('');
  }
});