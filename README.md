# ♿ Acesso Livre — Front-end

<p align="center">
  <strong>Plataforma colaborativa para mapeamento de acessibilidade no campus</strong>
</p>

<p align="center">
  Projeto desenvolvido no <strong>Projeto Integrador</strong> do curso de
  <strong>Análise e Desenvolvimento de Sistemas (ADS)</strong> — IFBA
</p>

---

## ✨ Sobre o Projeto

O **Acesso Livre** é uma aplicação web que tem como objetivo **mapear e divulgar informações sobre acessibilidade física** no campus, facilitando a locomoção e promovendo a inclusão de pessoas com deficiência.

Este repositório contém o **front-end da aplicação**, desenvolvido com foco em **usabilidade, acessibilidade e uma interface intuitiva**.

---

## 🎯 Objetivos do Front-end

- Criar uma interface simples e acessível  
- Facilitar a visualização dos pontos de acessibilidade  
- Garantir responsividade em diferentes dispositivos  
- Aplicar boas práticas de acessibilidade web  
- Integrar com a API do projeto  

---

## 🧠 Funcionalidades

- 📍 Visualização de locais acessíveis no campus  
- 🔎 Filtros por tipo de acessibilidade (rampas, elevadores, entradas largas etc.)  
- 📝 Exibição de informações detalhadas dos pontos mapeados  
- ♿ Interface pensada para acessibilidade e usabilidade  
- 📱 Layout responsivo (desktop e mobile)  

---

## 🛠️ Tecnologias Utilizadas

- **HTML5** — Estrutura semântica  
- **CSS3** — Estilização e responsividade  
- **JavaScript (Vanilla)** — Lógica e interatividade  
- **Bootstrap** — Layout responsivo e componentes visuais
- **Vite** — Ferramenta de build e ambiente de desenvolvimento rápido  
- **Boas práticas de Acessibilidade Web (WCAG)**  

---

## 📂 Estrutura do Projeto

```
front-end_acesso-livre/
├── public/
│   └── assets/                    # Recursos estáticos
│       ├── fonts/                 # Fontes customizadas
│       ├── img/                   # Imagens do projeto
│       │   ├── icons/             # Ícones de acessibilidade
│       │   └── map/               # Imagens do mapa (SVGs dos locais)
│       └── ...
│
├── src/
│   ├── components/                # Componentes reutilizáveis
│   │   ├── header/                # Header da aplicação
│   │   │   ├── header.html
│   │   │   ├── header.css
│   │   │   └── header.js
│   │   └── footer/                # Footer da aplicação
│   │       ├── footer.html
│   │       └── footer.css
│   │
│   ├── pages/                     # Páginas da aplicação
│   │   ├── admin/                 # Painel administrativo
│   │   │   ├── index.html
│   │   │   ├── script.js          # Lógica do painel admin
│   │   │   ├── api.js             # Chamadas à API (admin)
│   │   │   ├── style.css
│   │   │   └── password-reset/    # Recuperação de senha
│   │   │
│   │   ├── auth/                  # Autenticação (Login)
│   │   │   ├── index.html
│   │   │   ├── script.js          # Lógica de login
│   │   │   ├── api.js             # Chamadas à API (auth)
│   │   │   ├── forgot-password.js # Esqueci minha senha
│   │   │   └── style.css
│   │   │
│   │   └── mapa/                  # Página principal do mapa
│   │       ├── index.html
│   │       ├── map.js             # Lógica do mapa interativo
│   │       ├── api.js             # Chamadas à API (mapa)
│   │       ├── main.js            # Entry point
│   │       └── style.css
│   │
│   ├── styles/                    # Estilos globais
│   │   ├── global.css             # Reset e estilos base
│   │   ├── index.css              # Estilos da home
│   │   └── error-handler.css      # Estilos de erro
│   │
│   ├── utils/                     # Utilitários
│   │   └── ...
│   │
│   ├── index.html                 # Página inicial (home)
│   └── main.js                    # Entry point principal
│
├── .env                           # Variáveis de ambiente (não versionado)
├── .env.example                   # Exemplo de variáveis de ambiente
├── package.json                   # Dependências do projeto
├── vite.config.js                 # Configuração do Vite
└── README.md                      # Este arquivo
```

## ▶️ Como Executar o Projeto

1. Clone o repositório:
   ```bash
   git clone https://github.com/Acesso-Livre/front-end_acesso-livre.git
   ```


Acesse a pasta do projeto:

cd front-end_acesso-livre


Abra o arquivo index.html no navegador

✔️ Não é necessário instalar dependências ou rodar servidor local.

👨‍💻 Contribuição

Contribuições são sempre bem-vindas 🚀

Para contribuir com o projeto, siga os passos abaixo:

Faça um fork do repositório

Crie uma nova branch:

```bash
git checkout -b feature/minha-feature
```

Commit suas alterações:
```bash
git commit -m "Minha nova feature"
```

Envie para o repositório remoto:
```bash
git push origin feature/minha-feature
```

Abra um Pull Request

👥 Equipe

José Henrique Araújo Ravani 

Francisco Simão

Kauan Bento

Lucas Souza

Luís Roberto

Pedro Wandrey

Projeto orientado pelo professor: Fabio Oliveira





