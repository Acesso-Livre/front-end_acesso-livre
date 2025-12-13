// src/utils/error-handler.js
// Sistema padrão de tratamento de erros (global)
// - Captura erros globais (error / unhandledrejection)
// - Mostra modal amigável para o usuário com detalhe técnico
// - Fornece utilitários: mostrarErroParaUsuario(), executarSeguranca(fn)

// Carrega o CSS associado dinamicamente (resolve caminho relativo ao módulo)
try {
  const cssUrl = new URL('../styles/error-handler.css', import.meta.url).href;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = cssUrl;
  document.head.appendChild(link);
} catch (e) {
  // Em ambientes onde import.meta não exista, ignorar (fallback)
}

// Cria o markup do modal de erro (se ainda não existir)
function ensureModal() {
  if (document.getElementById('global-error-modal')) return;

  const overlay = document.createElement('div');
  overlay.id = 'global-error-modal';
  overlay.className = 'error-modal-overlay';
  overlay.style.display = 'none';

  overlay.innerHTML = `
    <div class="error-modal-card" role="dialog" aria-modal="true" aria-labelledby="error-modal-title">
      <h2 id="error-modal-title" class="error-modal-title">Ops, algo deu errado</h2>
      <p class="error-modal-subtitle">Não se preocupe — já registramos o problema. Você pode continuar usando o site.</p>

      <div class="error-modal-technical">
        <strong>Detalhe técnico:</strong>
        <pre id="error-modal-message" class="error-modal-message" aria-live="polite"></pre>
      </div>

      <div class="error-modal-actions">
        <button id="error-modal-close" class="btn error-modal-close">Fechar</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Fechar ao clicar no botão
  const closeBtn = document.getElementById('error-modal-close');
  closeBtn.addEventListener('click', () => {
    overlay.style.display = 'none';
  });

  // Fechar ao clicar fora do card
  overlay.addEventListener('click', (ev) => {
    if (ev.target === overlay) overlay.style.display = 'none';
  });
}

// Mostra o modal com mensagem amigável e detalhe técnico
export function mostrarErroParaUsuario(friendlyMessage = 'Ops, algo deu errado, não é culpa sua!', error = null) {
  try {
    ensureModal();
    const overlay = document.getElementById('global-error-modal');
    const messageEl = document.getElementById('error-modal-message');

    let technical = '';
    if (!error) {
      technical = 'Sem detalhe técnico disponível.';
    } else if (typeof error === 'string') {
      technical = error;
    } else if (error instanceof Error) {
      technical = `${error.message}\n\n${error.stack || ''}`;
    } else {
      try {
        technical = JSON.stringify(error, null, 2);
      } catch (e) {
        technical = String(error);
      }
    }

    // Texto amigável no título/subtitle
    const titleEl = document.getElementById('error-modal-title');
    const subtitleEl = document.querySelector('.error-modal-subtitle');
    if (titleEl) titleEl.textContent = 'Ops, algo deu errado';
    if (subtitleEl) subtitleEl.textContent = friendlyMessage;

    if (messageEl) messageEl.textContent = technical;

    overlay.style.display = 'flex';

    // foco para o botão de fechar para acessibilidade
    const closeBtn = document.getElementById('error-modal-close');
    if (closeBtn) closeBtn.focus();
  } catch (e) {
    // Se o modal quebrar por algum motivo, ainda assim logar

  }
}

// Envolve uma função (sync ou async) numa camada de tratamento que exibe modal em caso de erro.
// Uso: const safeFn = executarSeguranca(originalFn); await safeFn(...args);
export function executarSeguranca(fn) {
  if (typeof fn !== 'function') throw new TypeError('executarSeguranca espera uma função');

  return async function (...args) {
    try {
      return await fn.apply(this, args);
    } catch (err) {

      mostrarErroParaUsuario('Ops, algo deu errado durante a operação.', err);
      // Re-lançar para que o chamador também possa tratar, se desejar
      throw err;
    }
  };
}

// Bind global para facilidade de uso (compatibilidade com código já existente)
window.mostrarErroParaUsuario = mostrarErroParaUsuario;
window.executarSeguranca = executarSeguranca;

// Captura erros globais e promises não tratadas
// Lista de padrões de erro a ignorar (mensagem ou stack)
const IGNORED_ERROR_PATTERNS = [
  /BotaoCustom is not defined/i,
];

function shouldIgnoreError(errLike) {
  if (!errLike) return false;
  const text = (errLike.message || errLike.stack || String(errLike || ''));
  return IGNORED_ERROR_PATTERNS.some((rx) => rx.test(text));
}

// Detecta se o erro é causado por input/ação do usuário (não deve abrir modal)
// Heurísticas:
// - propriedade `isUserError === true` (definida por camadas de API)
// - propriedade `status` entre 400 e 499
function isUserFacingError(errLike) {
  if (!errLike) return false;
  try {
    if (typeof errLike === 'object') {
      if (errLike.isUserError) return true;
      const status = errLike.status || errLike.statusCode || errLike.code;
      if (typeof status === 'number' && status >= 400 && status < 500) return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

window.addEventListener('error', (event) => {
  try {
    const err = event.error || { message: event.message, filename: event.filename, lineno: event.lineno };
    if (shouldIgnoreError(err) || isUserFacingError(err)) {
      // Apenas logar silenciosamente e não mostrar modal

      return;
    }

    mostrarErroParaUsuario('Ops, algo inesperado aconteceu. Relate se precisar.', err);
  } catch (e) {

  }
});

window.addEventListener('unhandledrejection', (event) => {
  try {
    const reason = event.reason;
    if (shouldIgnoreError(reason) || isUserFacingError(reason)) {

      return;
    }

    mostrarErroParaUsuario('Ocorreu um erro não tratado em uma operação assíncrona.', reason);
  } catch (e) {

  }
});

// Exports also attached to window for script usage
export default {
  mostrarErroParaUsuario,
  executarSeguranca,
};
