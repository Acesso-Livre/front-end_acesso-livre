// src/utils/modal.js

/**
 * Show a confirmation or information modal.
 * @param {string} title - Title of the modal.
 * @param {string} message - Message body.
 * @param {object} options - Configuration options.
 * @param {function} options.onConfirm - Callback when confirmed.
 * @param {boolean} options.isDestructive - Logic to style delete buttons red.
 * @param {string} options.confirmText - Text for confirm button.
 * @param {boolean} options.showCancel - Whether to show cancel button (default true).
 */
export function showModal(title, message, { onConfirm = null, isDestructive = false, confirmText = "Confirmar", showCancel = true } = {}) {
    // Remove existing modal if any
    const existing = document.getElementById("custom-modal-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "custom-modal-overlay";
    overlay.className = "custom-modal-overlay";

    // Use CSS classes defined in global.css
    // overlay.style.cssText removed - handled by .custom-modal-overlay

    const content = document.createElement("div");
    content.className = "custom-modal-content";
    // content.style.cssText removed - handled by .custom-modal-content

    const h3 = document.createElement("h3");
    h3.textContent = title;
    h3.style.marginTop = "0"; // Keep minimal specific override if needed

    const p = document.createElement("p");
    p.textContent = message;
    p.style.color = "#555";
    p.style.lineHeight = "1.5";

    const actions = document.createElement("div");
    actions.className = "custom-modal-actions";
    // actions.style.cssText removed - handled by .custom-modal-actions

    if (showCancel) {
        const btnCancel = document.createElement("button");
        btnCancel.textContent = "Cancelar";
        btnCancel.className = "btn-modal-cancel";
        btnCancel.onclick = () => overlay.remove();
        actions.appendChild(btnCancel);
    }

    const btnConfirm = document.createElement("button");
    btnConfirm.textContent = confirmText;
    btnConfirm.className = isDestructive ? "btn-modal-destructive" : "btn-modal-primary";

    btnConfirm.onclick = async () => {
        btnConfirm.disabled = true;
        if (onConfirm) {
            try {
                await onConfirm();
            } catch (e) {

                // Re-enable if failed and we want to allow retry?
                // But usually onConfirm handles its own alerts.
            }
        }
        overlay.remove();
    };
    actions.appendChild(btnConfirm);

    content.appendChild(h3);
    content.appendChild(p);
    content.appendChild(actions);
    overlay.appendChild(content);

    document.body.appendChild(overlay);
}

/**
 * Show a simple alert modal (wrapper around showModal).
 * @param {string} message 
 */
export function showAlert(message, title = "Aviso") {
    showModal(title, message, { showCancel: false, confirmText: "OK" });
}

export function showConfirmation({ title, message, onConfirm }) {
    showModal(title, message, { onConfirm: onConfirm });
}
