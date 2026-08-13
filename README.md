# 🌿 CasaVerde — Loja de Móveis & Decoração

Projeto front-end completo com HTML, CSS e JavaScript puro.
Gradiente marrom → verde, slider de 6 banners, carrinho, login e muito mais.

---

## 📁 Estrutura de arquivos

```
loja-moveis/
│
├── index.html                  ← Página principal (home)
│
├── pages/
│   ├── contato.html            ← Formulário de contato
│   └── ajuda.html              ← Central de ajuda + FAQ
│
├── assets/
│   ├── css/
│   │   └── style.css           ← Todo o estilo (design tokens, componentes)
│   │
│   ├── js/
│   │   ├── db.js               ← Camada de dados (localStorage)
│   │   └── app.js              ← Lógica da interface
│   │
│   └── images/                 ← (pasta para suas imagens futuras)
│
└── data/
    ├── produtos.json           ← Catálogo de produtos e categorias
    └── usuarios.json           ← Referência de usuários (não usado em prod)
```

---

## 💾 Como salvar cada arquivo

### Passo 1 — Criar a pasta raiz

No seu computador, crie uma pasta chamada:
```
loja-moveis
```
Pode ser dentro de Documentos, Área de Trabalho ou onde preferir.

---

### Passo 2 — Criar as subpastas

Dentro de `loja-moveis`, crie manualmente estas pastas:

```
loja-moveis/
  assets/
    css/
    js/
    images/
  pages/
  data/
```

No Windows: clique com botão direito → Nova pasta
No Linux/Mac: mkdir -p assets/css assets/js assets/images pages data

---

### Passo 3 — Salvar os arquivos na ordem certa

Salve cada arquivo no caminho correto:

| Arquivo          | Onde salvar                        |
|------------------|------------------------------------|
| index.html       | loja-moveis/                       |
| style.css        | loja-moveis/assets/css/            |
| db.js            | loja-moveis/assets/js/             |
| app.js           | loja-moveis/assets/js/             |
| contato.html     | loja-moveis/pages/                 |
| ajuda.html       | loja-moveis/pages/                 |
| produtos.json    | loja-moveis/data/                  |
| usuarios.json    | loja-moveis/data/                  |

---

### Passo 4 — Abrir no navegador (IMPORTANTE)

O site usa `fetch()` para carregar o `produtos.json`.
Por isso você NÃO pode abrir o `index.html` clicando direto no arquivo
(o navegador bloqueia fetch em arquivos locais por segurança).

**Você precisa de um servidor local. Opções:**

#### Opção A — VS Code + Live Server (recomendado)
1. Instale a extensão **Live Server** no VS Code
2. Abra a pasta `loja-moveis` no VS Code
3. Clique com botão direito no `index.html`
4. Clique em **"Open with Live Server"**
5. O site abre em http://localhost:5500

#### Opção B — Python (se tiver Python instalado)
No terminal, dentro da pasta `loja-moveis`:
```bash
python -m http.server 8000
```
Depois acesse: http://localhost:8000

#### Opção C — Node.js
```bash
npx serve .
```

---

## ✨ Funcionalidades implementadas

### 🎨 Visual
- Gradiente marrom escuro → verde floresta em todo o fundo e hero
- Tipografia com Playfair Display (títulos) + Inter (corpo)
- Scroll reveal: elementos aparecem suavemente ao rolar
- Navbar transparente que fica branca ao rolar

### 🖼️ Slider de Banners (6 janelas)
- 6 cards de ambiente (Sala, Jardim, Jantar, Quarto, Home Office, Banheiro)
- Cada banner tem cor, emoji e gradiente únicos
- Hover: emoji gira e aumenta, botão "Ver ambiente" aparece com animação
- Controles: seta anterior/próximo + dots clicáveis
- Autoplay a cada 4 segundos (pausa no hover)
- Swipe funciona em celular (touch)

### 🗂️ Categorias
- 6 cards de categoria carregados do JSON
- Hover: card sobe, fica verde, emoji gira

### 🛒 Carrinho
- Painel lateral deslizante pelo lado direito
- Adicionar, remover, alterar quantidade
- Total calculado em tempo real
- Badge com contagem na navbar
- Persiste entre recarregamentos (localStorage)

### 👤 Sistema de Usuários
- Cadastro com nome, e-mail e senha
- Login com validação
- Sessão salva em localStorage
- Painel lateral mostra nome/e-mail ao logar
- Logout disponível

### 📱 Menu hambúrguer
- Painel lateral direito com animação suave
- Seções: Minha Conta, Navegação, Suporte
- Ícones animados no hover (zoom + rotação)
- Linha ativa no lado esquerdo de cada item

### 🔔 Toasts
- Notificações no canto inferior direito
- Tipos: sucesso, erro, informação
- Aparecem e desaparecem com animação

### ❤️ Favoritos
- Botão de coração em cada produto
- Toggle visual (vermelho quando favoritado)
- Salvo em localStorage

---

## 🚀 Próximos passos sugeridos

1. **Adicionar imagens reais** na pasta `assets/images/`
   e atualizar os caminhos em `data/produtos.json`

2. **Criar `pages/loja.html`** — página com todos os produtos + filtros

3. **Criar `pages/produto.html`** — página de detalhe do produto

4. **Backend real** — substituir o localStorage por uma API
   em PHP, Node.js ou Python (Flask/Django)

5. **Deploy** — hospedar no GitHub Pages, Vercel ou Netlify (grátis)

---

## 🧑‍💻 Tecnologias usadas

| Tecnologia      | Versão   | Uso                          |
|-----------------|----------|------------------------------|
| HTML5           | —        | Estrutura                    |
| CSS3            | —        | Estilo + animações           |
| JavaScript      | ES2022   | Lógica e interatividade      |
| Font Awesome    | 6.5      | Ícones                       |
| Google Fonts    | —        | Playfair Display + Inter     |
| localStorage    | —        | Banco de dados local         |

Sem frameworks. Sem dependências de npm. HTML/CSS/JS puros.

---

Feito com 🌿 para a CasaVerde.
