function initHeader() {
    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");
    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", () => {
            navLinks.classList.toggle("show");
        });
    }

    // Modal Sobre
    const aboutBtn = document.getElementById("about-btn");
    const aboutModal = document.getElementById("about-modal");
    const closeAboutBtn = document.getElementById("close-about-modal");

    if (aboutBtn && aboutModal && closeAboutBtn) {
        aboutBtn.addEventListener("click", () => {
            aboutModal.classList.add("show");
            document.body.classList.add("modal-open");
        });

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
    const contactModal = document.getElementById("contact-modal");
    const closeContactBtn = document.getElementById("close-contact-modal");

    if (contactBtn && contactModal && closeContactBtn) {
        contactBtn.addEventListener("click", () => {
            contactModal.classList.add("show");
            document.body.classList.add("modal-open");
        });

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

initHeader();