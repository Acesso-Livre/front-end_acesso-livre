export function initHeader() {


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

    // Copy email functionality
    const emailCopyElement = document.getElementById("email-copy");
    if (emailCopyElement) {
        emailCopyElement.addEventListener("click", async () => {
            const email = "acessolivreifbaeun@gmail.com";

            try {
                // Try using the modern Clipboard API first
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(email);
                } else {
                    // Fallback for older browsers
                    const textArea = document.createElement("textarea");
                    textArea.value = email;
                    textArea.style.position = "fixed";
                    textArea.style.left = "-999999px";
                    textArea.style.top = "-999999px";
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    document.execCommand('copy');
                    textArea.remove();
                }

                // Show feedback to user
                const originalText = emailCopyElement.textContent;
                emailCopyElement.textContent = "Email copiado!";
                emailCopyElement.style.color = "#28a745"; // Green color for success

                setTimeout(() => {
                    emailCopyElement.textContent = originalText;
                    emailCopyElement.style.color = "";
                }, 2000);

            } catch (err) {

                // Show error feedback
                const originalText = emailCopyElement.textContent;
                emailCopyElement.textContent = "Erro ao copiar";
                emailCopyElement.style.color = "#dc3545"; // Red color for error

                setTimeout(() => {
                    emailCopyElement.textContent = originalText;
                    emailCopyElement.style.color = "";
                }, 2000);
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


// initHeader é chamado pelo main.js após carregar os componentes