// scripts/global.js
async function loadComponent(name, position = "body-end") {
    try {

        // --- HTML ---
        const htmlResponse = await fetch(`./components/${name}/${name}.html`);
        if (!htmlResponse.ok) throw new Error(`Erro ao carregar ${name}.html`);
        const html = await htmlResponse.text();

        const wrapper = document.createElement("div");
        wrapper.innerHTML = html.trim();

        const element = wrapper.firstElementChild;

        // --- CSS ---
        const cssLink = document.createElement("link");
        cssLink.rel = "stylesheet";
        cssLink.href = `./components/${name}/${name}.css`;
        document.head.appendChild(cssLink);

        // --- Inserir no DOM ---
        if (position === "body-start") document.body.prepend(element);
        else if (position === "body-end") document.body.append(element);
        else document.querySelector(position)?.append(element);

        // --- JS ---
        const jsPath = `./components/${name}/${name}.js`;
        const jsExists = await fetch(jsPath).then(r => r.ok).catch(() => false);
        if (jsExists) {
            const script = document.createElement("script");
            script.src = jsPath;
            script.onload = () => console.log(`${name} JS carregado`);
            document.body.appendChild(script);
        }

        console.log(`${name} carregado com sucesso`);
    } catch (err) {
        console.error(err);
    }
}