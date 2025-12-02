function initHeader() {


    // Modal Sobre
    const aboutBtn = document.getElementById("about-btn");
    const footerAboutBtn = document.getElementById("footer-about-btn"); // Novo botão no footer
    const aboutModal = document.getElementById("about-modal");
    const closeAboutBtn = document.getElementById("close-about-modal");

    function openAboutModal() {
        if (aboutModal) {
            aboutModal.classList.add("show");
            document.body.classList.add("modal-open");
        }
    }

    if (aboutModal && closeAboutBtn) {
        if (aboutBtn) aboutBtn.addEventListener("click", openAboutModal);
        if (footerAboutBtn) footerAboutBtn.addEventListener("click", openAboutModal);

        closeAboutBtn.addEventListener("click", () => {
            aboutModal.classList.remove("show");
            document.body.classList.remove("modal-open");
        });

        // Fechar modal ao clicar fora
        window.addEventListener("click", (event) => {
            if (event.target === aboutModal) {
                aboutModal.classList.remove("show");
                document.body.classList.remove("modal-open");
            }
        });
    }

    // Modal Contato
    const contactBtn = document.getElementById("contact-btn");
    const footerContactBtn = document.getElementById("footer-contact-btn"); // Novo botão no footer
    const contactModal = document.getElementById("contact-modal");
    const closeContactBtn = document.getElementById("close-contact-modal");

    function openContactModal() {
        if (contactModal) {
            contactModal.classList.add("show");
            document.body.classList.add("modal-open");
        }
    }

    if (contactModal && closeContactBtn) {
        if (contactBtn) contactBtn.addEventListener("click", openContactModal);
        if (footerContactBtn) footerContactBtn.addEventListener("click", openContactModal);

        closeContactBtn.addEventListener("click", () => {
            contactModal.classList.remove("show");
            document.body.classList.remove("modal-open");
        });

        // Fechar modal ao clicar fora
        window.addEventListener("click", (event) => {
            if (event.target === contactModal) {
                contactModal.classList.remove("show");
                document.body.classList.remove("modal-open");
            }
        });
    }
}

// Scroll effect
const headerNav = document.querySelector("header nav");
if (headerNav) {
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            headerNav.classList.add("scrolled");
        } else {
            headerNav.classList.remove("scrolled");
        }
    });
}


initHeader();