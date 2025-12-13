# ♿ Acesso Livre — Front-end

<p align="center">
  <strong>Plataforma colaborativa para mapeamento de acessibilidade no campus</strong>
</p>

<p align="center">
  <a href="#-sobre-o-projeto">Sobre</a> •
  <a href="#-funcionalidades">Funcionalidades</a> •
  <a href="#-tecnologias">Tecnologias</a> •
  <a href="#-como-executar">Como Executar</a> •
  <a href="#-contribuidores">Contribuidores</a>
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

## 🧠 Funcionalidades

- 📍 **Visualização de locais** acessíveis no campus
- 🔎 **Filtros inteligentes** por tipo de acessibilidade (rampas, elevadores, etc.)
- 📝 **Informações detalhadas** dos pontos mapeados
- 🔐 **Painel Administrativo** para gestão de conteúdo
- 🛠️ **Gestão de Locais** (CRUD) com seleção interativa no mapa
- ✅ **Moderação** de comentários e avaliações
- ♿ **Acessibilidade** e usabilidade como prioridade
- 📱 **Layout responsivo** (Desktop e Mobile)

---

## 🛠 Tecnologias

<div align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=Leaflet&logoColor=white)

</div>

---

## 📂 Estrutura do Projeto

```
front-end_acesso-livre/
├── public/                # Recursos estáticos (assets)
├── src/
│   ├── components/        # Componentes reutilizáveis (Header, Footer)
│   ├── pages/             # Páginas (Admin, Auth, Mapa)
│   ├── styles/            # Estilos globais
│   └── utils/             # Scripts utilitários
├── .env.example           # Exemplo de variáveis de ambiente
├── package.json           # Dependências e Scripts
├── vite.config.js         # Configuração do Vite
└── README.md              # Documentação
```

---

## ▶️ Como Executar

Siga os passos abaixo para rodar o projeto localmente:

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/Acesso-Livre/front-end_acesso-livre.git
   ```

2. **Acesse a pasta do projeto:**

   ```bash
   cd front-end_acesso-livre
   ```

3. **Instale as dependências:**

   ```bash
   npm install
   ```

   > **Nota:** É necessário ter o [Node.js](https://nodejs.org/) instalado.

4. **Inicie o servidor de desenvolvimento:**

   ```bash
   npm run dev
   ```

5. **Acesse no navegador:**
   O projeto estará rodando em `http://localhost:5173`.

---

## 👥 Contribuidores

<a href="https://github.com/Acesso-Livre/front-end_acesso-livre/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Acesso-Livre/front-end_acesso-livre" />
</a>

---

<p align="center">
  Orientado pelo Prof. Fabio Oliveira
</p>
