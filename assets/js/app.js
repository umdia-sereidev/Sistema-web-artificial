/**
 * app.js — CasaVerde · Lógica principal da interface
 * Depende de: db.js (deve ser carregado antes)
 */

// ─── EMOJIS POR CATEGORIA (placeholder de imagem) ────────────────
const EMOJI_CAT = {
  poltronas:  '🪑',
  sofas:      '🛋️',
  mesas:      '🪞',
  cadeiras:   '💺',
  iluminacao: '💡',
  estantes:   '📚',
  aparadores: '🗄️',
  tapetes:    '🟫',
  default:    '🛋️'
};

// ─── UTILIDADES ──────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

function formatBRL(val) {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ─── TOAST ───────────────────────────────────────────────────────
function toast(msg, tipo = 'ok', icone = null) {
  const wrap = $('toastWrap');
  const icons = { ok: '✅', erro: '❌', info: 'ℹ️', cart: '🛒' };
  const el = document.createElement('div');
  el.className = `toast${tipo === 'erro' ? ' erro' : ''}`;
  el.innerHTML = `<span class="icon">${icone || icons[tipo] || icons.ok}</span>
                  <span class="msg">${msg}</span>`;
  wrap.appendChild(el);
  setTimeout(() => {
    el.classList.add('saindo');
    el.addEventListener('animationend', () => el.remove());
  }, 3200);
}

// ─── NAVBAR SCROLL ───────────────────────────────────────────────
(function initNavbarScroll() {
  const nav = $('navbar');
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ─── SCROLL REVEAL ───────────────────────────────────────────────
(function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visivel');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  $$('.reveal, [data-reveal]').forEach(el => {
    el.classList.add('reveal');
    obs.observe(el);
  });
})();

// ─── OVERLAY ─────────────────────────────────────────────────────
const overlay = $('overlay');

function mostrarOverlay(cb) {
  overlay.classList.add('visivel');
  overlay._cb = cb;
}

function esconderOverlay() {
  overlay.classList.remove('visivel');
}

overlay.addEventListener('click', () => {
  fecharSidePanel();
  fecharCarrinho();
  esconderOverlay();
});

// ─── SIDE PANEL (MENU) ───────────────────────────────────────────
const sidePanel   = $('sidePanel');
const btnMenu     = $('btnMenu');
const btnFecharPainel = $('btnFecharPainel');

function abrirSidePanel() {
  sidePanel.classList.add('aberto');
  btnMenu.classList.add('ativo');
  mostrarOverlay();
  atualizarSidePanel();
}

function fecharSidePanel() {
  sidePanel.classList.remove('aberto');
  btnMenu.classList.remove('ativo');
  esconderOverlay();
}

btnMenu.addEventListener('click', () => {
  if (sidePanel.classList.contains('aberto')) fecharSidePanel();
  else abrirSidePanel();
});

btnFecharPainel.addEventListener('click', fecharSidePanel);

function atualizarSidePanel() {
  const user = DB.Auth.usuarioAtual();
  const cont = DB.Carrinho.contagem();

  $('panelBadgeCarrinho').textContent = cont;

  if (user) {
    $('panelAvatar').textContent = user.nome.charAt(0).toUpperCase();
    $('panelNome').textContent   = user.nome;
    $('panelEmail').textContent  = user.email;
    $('panelLoginBtn').style.display  = 'none';
    $('panelBtnAcao').style.display   = 'none';
    $('panelBtnLogout').style.display = '';
  } else {
    $('panelAvatar').textContent = '?';
    $('panelNome').textContent   = 'Visitante';
    $('panelEmail').textContent  = 'Faça login para continuar';
    $('panelLoginBtn').style.display  = '';
    $('panelBtnAcao').style.display   = '';
    $('panelBtnLogout').style.display = 'none';
  }
}

$('panelLoginBtn').addEventListener('click', e => {
  e.preventDefault();
  fecharSidePanel();
  abrirModal();
});

$('panelBtnAcao').addEventListener('click', () => {
  fecharSidePanel();
  abrirModal();
});

$('panelBtnLogout').addEventListener('click', () => {
  DB.Auth.logout();
  fecharSidePanel();
  atualizarBadgeCarrinho();
  atualizarSidePanel();
  toast('Você saiu da conta.', 'info');
});

$('panelCarrinhoBtn').addEventListener('click', e => {
  e.preventDefault();
  fecharSidePanel();
  abrirCarrinho();
});

// ─── MODAL AUTH ──────────────────────────────────────────────────
const modalAuth = $('modalAuth');

function abrirModal(tela = 'login') {
  modalAuth.classList.add('visivel');
  mostrarOverlay(() => fecharModal());
  mostrarTela(tela);
}

function fecharModal() {
  modalAuth.classList.remove('visivel');
  esconderOverlay();
}

function mostrarTela(tela) {
  $('telaLogin').style.display    = tela === 'login'    ? '' : 'none';
  $('telaCadastro').style.display = tela === 'cadastro' ? '' : 'none';
  $('loginMsg').className    = 'form-msg';
  $('cadastroMsg').className = 'form-msg';
}

$('btnFecharModal').addEventListener('click', fecharModal);
$('btnFecharModalCad').addEventListener('click', fecharModal);
$('irCadastro').addEventListener('click', () => mostrarTela('cadastro'));
$('irLogin').addEventListener('click', () => mostrarTela('login'));

$('btnLogin').addEventListener('click', () => {
  if (DB.Auth.usuarioAtual()) {
    toast('Você já está logado!', 'info', '👤');
    abrirSidePanel();
  } else {
    abrirModal('login');
  }
});

// Login
$('btnFazerLogin').addEventListener('click', () => {
  const email = $('loginEmail').value.trim();
  const senha = $('loginSenha').value;
  if (!email || !senha) {
    mostrarMsgModal('loginMsg', 'Preencha todos os campos.', 'erro');
    return;
  }
  const res = DB.Auth.login(email, senha);
  if (!res.ok) {
    mostrarMsgModal('loginMsg', res.erro, 'erro');
    return;
  }
  fecharModal();
  atualizarBadgeCarrinho();
  atualizarSidePanel();
  toast(`Bem-vindo, ${res.usuario.nome}! 🌿`, 'ok');
  renderizarProdutos();
});

// Cadastro
$('btnCadastrar').addEventListener('click', () => {
  const nome  = $('cadNome').value.trim();
  const email = $('cadEmail').value.trim();
  const senha = $('cadSenha').value;
  if (!nome || !email || !senha) {
    mostrarMsgModal('cadastroMsg', 'Preencha todos os campos.', 'erro');
    return;
  }
  if (senha.length < 6) {
    mostrarMsgModal('cadastroMsg', 'A senha precisa ter no mínimo 6 caracteres.', 'erro');
    return;
  }
  const res = DB.Usuarios.cadastrar({ nome, email, senha });
  if (!res.ok) {
    mostrarMsgModal('cadastroMsg', res.erro, 'erro');
    return;
  }
  DB.Auth.login(email, senha);
  fecharModal();
  atualizarBadgeCarrinho();
  atualizarSidePanel();
  toast(`Conta criada! Bem-vindo, ${nome}! 🌱`, 'ok');
});

// Enter nos campos
[$('loginEmail'), $('loginSenha')].forEach(el =>
  el.addEventListener('keydown', e => { if (e.key === 'Enter') $('btnFazerLogin').click(); })
);

function mostrarMsgModal(id, txt, tipo) {
  const el = $(id);
  el.textContent = txt;
  el.className = `form-msg ${tipo}`;
}

// ─── BADGE DO CARRINHO ───────────────────────────────────────────
function atualizarBadgeCarrinho() {
  const n = DB.Carrinho.contagem();
  $('badgeCarrinho').textContent = n;
  $('panelBadgeCarrinho').textContent = n;
  if (n > 0) $('badgeCarrinho').classList.add('bump');
  setTimeout(() => $('badgeCarrinho').classList.remove('bump'), 400);
}

window.addEventListener('carrinho:atualizado', () => {
  atualizarBadgeCarrinho();
  if ($('carrinhoPanel').classList.contains('aberto')) renderizarCarrinho();
});

// ─── PAINEL DO CARRINHO ──────────────────────────────────────────
const carrinhoPanel = $('carrinhoPanel');

function abrirCarrinho() {
  carrinhoPanel.classList.add('aberto');
  mostrarOverlay();
  renderizarCarrinho();
}

function fecharCarrinho() {
  carrinhoPanel.classList.remove('aberto');
  esconderOverlay();
}

$('btnCarrinho').addEventListener('click', abrirCarrinho);
$('btnFecharCarrinho').addEventListener('click', fecharCarrinho);
$('btnLimparCarrinho').addEventListener('click', () => {
  DB.Carrinho.limpar();
  renderizarCarrinho();
  toast('Carrinho esvaziado.', 'info');
});

function renderizarCarrinho() {
  const itens = DB.Carrinho.listar();
  const cont  = $('carrinhoItens');
  const total = DB.Carrinho.total();

  $('carrinhoTotal').textContent = formatBRL(total);

  if (!itens.length) {
    cont.innerHTML = `
      <div class="carrinho-vazio">
        <div class="icon">🛒</div>
        <h3>Carrinho vazio</h3>
        <p>Adicione produtos para continuar</p>
        <button class="btn btn-primary btn-sm" onclick="fecharCarrinho()">Explorar produtos</button>
      </div>`;
    return;
  }

  cont.innerHTML = itens.map(item => `
    <div class="carrinho-item">
      <div class="carrinho-item-img">${EMOJI_CAT[item.categoria] || EMOJI_CAT.default}</div>
      <div class="carrinho-item-info">
        <div class="nome">${item.nome}</div>
        <div class="preco">${formatBRL(item.preco * item.quantidade)}</div>
        <div class="quantidade-ctrl">
          <button class="qty-btn" onclick="alterarQtd(${item.id}, ${item.quantidade - 1})">−</button>
          <span class="qty-val">${item.quantidade}</span>
          <button class="qty-btn" onclick="alterarQtd(${item.id}, ${item.quantidade + 1})">+</button>
        </div>
      </div>
      <button class="btn-remover-item" onclick="removerItem(${item.id})" title="Remover">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </div>
  `).join('');
}

function alterarQtd(id, qtd) {
  DB.Carrinho.alterarQuantidade(id, qtd);
  renderizarCarrinho();
}

function removerItem(id) {
  DB.Carrinho.remover(id);
  renderizarCarrinho();
  toast('Item removido do carrinho.', 'info', '🗑️');
}

// ─── CATEGORIAS ──────────────────────────────────────────────────
async function renderizarCategorias() {
  try {
    const r = await fetch('data/produtos.json');
    const d = await r.json();
    const grid = $('categoriasGrid');

    grid.innerHTML = d.categorias.map(cat => `
      <div class="categoria-card" onclick="filtrarPorCategoria('${cat.id}')">
        <span class="icon-wrap">${cat.icone}</span>
        <span class="cat-name">${cat.nome}</span>
        <span class="cat-count">${cat.count} produtos</span>
      </div>
    `).join('');

    // Reveal nas cards
    $$('.categoria-card').forEach((el, i) => {
      el.style.transitionDelay = `${i * 60}ms`;
      el.classList.add('reveal');
    });

    initRevealEls($$('.categoria-card'));
  } catch (e) {
    console.error('Erro ao carregar categorias:', e);
  }
}

function filtrarPorCategoria(catId) {
  tabAtual = catId;
  renderizarProdutos();
  document.querySelector('#produtos').scrollIntoView({ behavior: 'smooth' });
}

// ─── PRODUTOS ────────────────────────────────────────────────────
let tabAtual = 'destaque';

async function renderizarProdutos() {
  const grid = $('produtoGrid');
  grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--marrom-claro)">🌿 Carregando produtos...</div>';

  try {
    let filtros = {};
    if (tabAtual === 'destaque') filtros.destaque = true;
    else if (tabAtual === 'hot') filtros.hot = true;
    else if (!['todos'].includes(tabAtual)) filtros.categoria = tabAtual;

    const produtos = await DB.Produtos.listar(filtros);

    if (!produtos.length) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px">Nenhum produto encontrado.</div>';
      return;
    }

    const user = DB.Auth.usuarioAtual();

    grid.innerHTML = produtos.map(p => {
      const fav = DB.Favoritos.eFavorito(p.id);
      const emoji = EMOJI_CAT[p.categoria] || EMOJI_CAT.default;
      return `
        <div class="produto-card reveal" data-id="${p.id}">
          <div class="produto-img-wrap">
            <div class="produto-img-placeholder">${emoji}</div>
            <div class="produto-badges">
              ${p.desconto ? `<span class="badge-desconto">-${p.desconto}%</span>` : ''}
              ${p.hot ? `<span class="badge-hot">🔥 Hot</span>` : ''}
            </div>
            <div class="produto-acoes">
              <button class="acao-btn ${fav ? 'favoritado' : ''}"
                onclick="toggleFav(${p.id}, this)" title="Favoritar">
                <i class="fa-${fav ? 'solid' : 'regular'} fa-heart"></i>
              </button>
              <button class="acao-btn" title="Visualizar" onclick="toast('Em breve: página do produto!','info')">
                <i class="fa-regular fa-eye"></i>
              </button>
            </div>
          </div>
          <div class="produto-info">
            <span class="cat-label">${p.categoria}</span>
            <h3>${p.nome}</h3>
            <div class="produto-estrelas">
              <span class="estrelas">${renderEstrelas(p.avaliacao)}</span>
              <span class="reviews-count">(${p.reviews})</span>
            </div>
            <div class="produto-precos">
              <span class="preco-atual">${formatBRL(p.preco)}</span>
              ${p.precoOriginal ? `<span class="preco-original">${formatBRL(p.precoOriginal)}</span>` : ''}
            </div>
            <button class="btn-adicionar" onclick="adicionarAoCarrinho(${p.id})">
              <i class="fa-solid fa-bag-shopping"></i> Adicionar
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Re-aplicar reveal nas cards
    initRevealEls($$('.produto-card'));

  } catch (e) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:#e53935">
      Erro ao carregar produtos. Verifique se está rodando via servidor local.
    </div>`;
    console.error(e);
  }
}

function renderEstrelas(nota) {
  const cheias   = Math.floor(nota);
  const meia     = nota % 1 >= 0.5 ? 1 : 0;
  const vazias   = 5 - cheias - meia;
  return '★'.repeat(cheias) + (meia ? '½' : '') + '☆'.repeat(vazias);
}

async function adicionarAoCarrinho(id) {
  const produto = await DB.Produtos.buscarPorId(id);
  if (!produto) return;
  DB.Carrinho.adicionar(produto, 1);
  toast(`"${produto.nome}" adicionado ao carrinho!`, 'ok', '🛒');
}

function toggleFav(id, btn) {
  const favoritado = DB.Favoritos.toggle(id);
  btn.classList.toggle('favoritado', favoritado);
  btn.querySelector('i').className = `fa-${favoritado ? 'solid' : 'regular'} fa-heart`;
  toast(favoritado ? 'Adicionado aos favoritos ❤️' : 'Removido dos favoritos', 'info');
}

// Tabs
$$('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.tab-btn').forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');
    tabAtual = btn.dataset.tab;
    renderizarProdutos();
  });
});

// ─── SLIDER DE BANNERS ───────────────────────────────────────────
(function initSlider() {
  const track   = $('sliderTrack');
  const dotsEl  = $('sliderDots');
  const slides  = track.querySelectorAll('.banner-slide');
  const total   = slides.length;
  let atual     = 0;
  let autoplay;

  // Quantos slides visíveis depende da largura
  function visiveis() {
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  }

  const maxIdx = () => total - visiveis();

  // Criar dots
  function criarDots() {
    dotsEl.innerHTML = '';
    const n = maxIdx() + 1;
    for (let i = 0; i < n; i++) {
      const d = document.createElement('button');
      d.className = 'dot' + (i === 0 ? ' ativo' : '');
      d.addEventListener('click', () => irPara(i));
      dotsEl.appendChild(d);
    }
  }

  function irPara(idx) {
    atual = Math.max(0, Math.min(idx, maxIdx()));
    const slideW = slides[0].offsetWidth + 24; // + gap
    track.style.transform = `translateX(-${atual * slideW}px)`;
    dotsEl.querySelectorAll('.dot').forEach((d, i) =>
      d.classList.toggle('ativo', i === atual)
    );
  }

  function avancar() { irPara(atual >= maxIdx() ? 0 : atual + 1); }
  function voltar()  { irPara(atual <= 0 ? maxIdx() : atual - 1); }

  $('sliderNext').addEventListener('click', avancar);
  $('sliderPrev').addEventListener('click', voltar);

  function iniciarAutoplay() {
    autoplay = setInterval(avancar, 4000);
  }

  function pararAutoplay() {
    clearInterval(autoplay);
  }

  track.addEventListener('mouseenter', pararAutoplay);
  track.addEventListener('mouseleave', iniciarAutoplay);

  // Swipe touch
  let touchStart = 0;
  track.addEventListener('touchstart', e => { touchStart = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? avancar() : voltar();
  });

  // Resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      criarDots();
      irPara(0);
    }, 200);
  });

  criarDots();
  iniciarAutoplay();
})();

// ─── BUSCA (PLACEHOLDER) ─────────────────────────────────────────
$('btnBusca').addEventListener('click', () => {
  const q = prompt('🔍 O que você está procurando?');
  if (q && q.trim()) {
    tabAtual = 'busca_' + q.trim();
    // Filtro customizado de busca
    buscarProdutos(q.trim());
    document.querySelector('#produtos').scrollIntoView({ behavior: 'smooth' });
  }
});

async function buscarProdutos(query) {
  const grid = $('produtoGrid');
  const produtos = await DB.Produtos.listar({ busca: query });
  tabAtual = 'todos'; // reset visual

  if (!produtos.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px">
      Nenhum produto encontrado para "<strong>${query}</strong>".
    </div>`;
    return;
  }

  // Reaproveitamos a lógica de renderização passando os produtos filtrados
  grid.innerHTML = produtos.map(p => {
    const emoji = EMOJI_CAT[p.categoria] || EMOJI_CAT.default;
    return `
      <div class="produto-card reveal" data-id="${p.id}">
        <div class="produto-img-wrap">
          <div class="produto-img-placeholder">${emoji}</div>
          <div class="produto-badges">
            ${p.desconto ? `<span class="badge-desconto">-${p.desconto}%</span>` : ''}
            ${p.hot ? `<span class="badge-hot">🔥 Hot</span>` : ''}
          </div>
        </div>
        <div class="produto-info">
          <span class="cat-label">${p.categoria}</span>
          <h3>${p.nome}</h3>
          <div class="produto-precos">
            <span class="preco-atual">${formatBRL(p.preco)}</span>
          </div>
          <button class="btn-adicionar" onclick="adicionarAoCarrinho(${p.id})">
            <i class="fa-solid fa-bag-shopping"></i> Adicionar
          </button>
        </div>
      </div>
    `;
  }).join('');

  initRevealEls($$('.produto-card'));
}

// Botão favoritos na navbar
$('btnFavoritos').addEventListener('click', () => {
  toast('Em breve: página de favoritos!', 'info', '❤️');
});

// ─── REVEAL HELPER ───────────────────────────────────────────────
function initRevealEls(els) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visivel');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  els.forEach(el => obs.observe(el));
}

// ─── INICIALIZAÇÃO ───────────────────────────────────────────────
(async function init() {
  atualizarBadgeCarrinho();
  atualizarSidePanel();
  await renderizarCategorias();
  await renderizarProdutos();
})();
