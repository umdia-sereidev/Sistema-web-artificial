/**
 * db.js — Camada de dados do CasaVerde
 * Simula um banco de dados usando localStorage
 * Em produção real, substituir pelas chamadas à API/backend
 */

const DB = (() => {

  // ─── INICIALIZAÇÃO ───────────────────────────────────────────────
  function init() {
    if (!localStorage.getItem('cv_usuarios')) {
      localStorage.setItem('cv_usuarios', JSON.stringify([
        {
          id: 1,
          nome: 'Admin',
          email: 'admin@casaverde.com',
          senha: btoa('admin123'),
          role: 'admin',
          carrinho: [],
          favoritos: [],
          dataCadastro: new Date().toISOString()
        }
      ]));
    }
    if (!localStorage.getItem('cv_sessao')) {
      localStorage.setItem('cv_sessao', JSON.stringify(null));
    }
    if (!localStorage.getItem('cv_carrinho_guest')) {
      localStorage.setItem('cv_carrinho_guest', JSON.stringify([]));
    }
  }

  // ─── USUÁRIOS ────────────────────────────────────────────────────
  const Usuarios = {
    listar() {
      return JSON.parse(localStorage.getItem('cv_usuarios')) || [];
    },
    buscarPorEmail(email) {
      return this.listar().find(u => u.email === email);
    },
    buscarPorId(id) {
      return this.listar().find(u => u.id === id);
    },
    cadastrar({ nome, email, senha }) {
      const lista = this.listar();
      if (lista.find(u => u.email === email)) {
        return { ok: false, erro: 'E-mail já cadastrado.' };
      }
      const novo = {
        id: Date.now(),
        nome,
        email,
        senha: btoa(senha),
        role: 'cliente',
        carrinho: [],
        favoritos: [],
        dataCadastro: new Date().toISOString()
      };
      lista.push(novo);
      localStorage.setItem('cv_usuarios', JSON.stringify(lista));
      return { ok: true, usuario: novo };
    },
    atualizar(id, campos) {
      const lista = this.listar();
      const idx = lista.findIndex(u => u.id === id);
      if (idx === -1) return { ok: false, erro: 'Usuário não encontrado.' };
      lista[idx] = { ...lista[idx], ...campos };
      localStorage.setItem('cv_usuarios', JSON.stringify(lista));
      return { ok: true, usuario: lista[idx] };
    }
  };

  // ─── SESSÃO ──────────────────────────────────────────────────────
  const Sessao = {
    get() {
      return JSON.parse(localStorage.getItem('cv_sessao'));
    },
    set(usuario) {
      // nunca salvar senha na sessão
      const { senha, ...seguro } = usuario;
      localStorage.setItem('cv_sessao', JSON.stringify(seguro));
    },
    destruir() {
      localStorage.setItem('cv_sessao', JSON.stringify(null));
    },
    logado() {
      return !!this.get();
    }
  };

  // ─── AUTENTICAÇÃO ────────────────────────────────────────────────
  const Auth = {
    login(email, senha) {
      const usuario = Usuarios.buscarPorEmail(email);
      if (!usuario) return { ok: false, erro: 'E-mail não encontrado.' };
      if (usuario.senha !== btoa(senha)) return { ok: false, erro: 'Senha incorreta.' };
      Sessao.set(usuario);
      return { ok: true, usuario };
    },
    logout() {
      Sessao.destruir();
    },
    usuarioAtual() {
      const s = Sessao.get();
      if (!s) return null;
      return Usuarios.buscarPorId(s.id) || null;
    }
  };

  // ─── CARRINHO ────────────────────────────────────────────────────
  const Carrinho = {
    _chave() {
      const u = Sessao.get();
      return u ? `cv_carrinho_${u.id}` : 'cv_carrinho_guest';
    },
    listar() {
      return JSON.parse(localStorage.getItem(this._chave())) || [];
    },
    adicionar(produto, quantidade = 1) {
      const itens = this.listar();
      const idx = itens.findIndex(i => i.id === produto.id);
      if (idx >= 0) {
        itens[idx].quantidade += quantidade;
      } else {
        itens.push({ ...produto, quantidade });
      }
      localStorage.setItem(this._chave(), JSON.stringify(itens));
      this._notificar();
      return itens;
    },
    remover(produtoId) {
      const itens = this.listar().filter(i => i.id !== produtoId);
      localStorage.setItem(this._chave(), JSON.stringify(itens));
      this._notificar();
    },
    alterarQuantidade(produtoId, quantidade) {
      if (quantidade <= 0) return this.remover(produtoId);
      const itens = this.listar();
      const idx = itens.findIndex(i => i.id === produtoId);
      if (idx >= 0) itens[idx].quantidade = quantidade;
      localStorage.setItem(this._chave(), JSON.stringify(itens));
      this._notificar();
    },
    limpar() {
      localStorage.setItem(this._chave(), JSON.stringify([]));
      this._notificar();
    },
    total() {
      return this.listar().reduce((acc, i) => acc + i.preco * i.quantidade, 0);
    },
    contagem() {
      return this.listar().reduce((acc, i) => acc + i.quantidade, 0);
    },
    _notificar() {
      window.dispatchEvent(new CustomEvent('carrinho:atualizado', {
        detail: { contagem: this.contagem(), total: this.total() }
      }));
    }
  };

  // ─── FAVORITOS ───────────────────────────────────────────────────
  const Favoritos = {
    _chave() {
      const u = Sessao.get();
      return u ? `cv_favoritos_${u.id}` : 'cv_favoritos_guest';
    },
    listar() {
      return JSON.parse(localStorage.getItem(this._chave())) || [];
    },
    toggle(produtoId) {
      const lista = this.listar();
      const idx = lista.indexOf(produtoId);
      if (idx >= 0) {
        lista.splice(idx, 1);
      } else {
        lista.push(produtoId);
      }
      localStorage.setItem(this._chave(), JSON.stringify(lista));
      return lista.includes(produtoId);
    },
    eFavorito(produtoId) {
      return this.listar().includes(produtoId);
    }
  };

  // ─── PRODUTOS (carregados do JSON) ───────────────────────────────
  let _produtos = [];
  const Produtos = {
    async carregar() {
      if (_produtos.length) return _produtos;
      try {
        const r = await fetch('data/produtos.json');
        const d = await r.json();
        _produtos = d.produtos;
        return _produtos;
      } catch {
        console.warn('Usando produtos do cache local');
        return [];
      }
    },
    async listar(filtros = {}) {
      const lista = await this.carregar();
      return lista.filter(p => {
        if (filtros.categoria && p.categoria !== filtros.categoria) return false;
        if (filtros.busca) {
          const q = filtros.busca.toLowerCase();
          if (!p.nome.toLowerCase().includes(q) && !p.descricao.toLowerCase().includes(q)) return false;
        }
        if (filtros.destaque && !p.destaque) return false;
        if (filtros.hot && !p.hot) return false;
        return true;
      });
    },
    async buscarPorId(id) {
      const lista = await this.carregar();
      return lista.find(p => p.id === id);
    }
  };

  // Inicializar ao carregar
  init();

  return { Usuarios, Sessao, Auth, Carrinho, Favoritos, Produtos };
})();
