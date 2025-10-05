// ===== ANIMAÇÃO BOTÃO "EXPLORAR MAPA" =====
document.addEventListener('DOMContentLoaded', function() {
    const btn = document.querySelector('.explorar-mapa-btn');
    if (btn) {
        btn.addEventListener('click', function() {
            btn.classList.add('animar');
            setTimeout(() => btn.classList.remove('animar'), 350);
        });
    }
});

// ===== TRANSFORMA LOCAL EM LINK ===== // 
document.querySelectorAll('.comentario-local').forEach(function(el) {
    if (el.tagName === 'DIV') {
        const local = el.textContent.trim();
        const id = '#' + local
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .toLowerCase().replace(/\s+/g, '-');
        const a = document.createElement('a');
        a.className = 'comentario-local';
        a.href = id;
        a.textContent = local;
        el.replaceWith(a);
    }
});
