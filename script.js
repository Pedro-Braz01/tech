/**
 * PRE-SELL PAGE — SCRIPT.JS
 * CRO Optimized | Mobile-first | GitHub Pages
 * =============================================
 * Responsabilidades:
 * 1. Carregar produtos.json e renderizar cards
 * 2. Busca em tempo real
 * 3. Sticky CTA mobile
 * 4. Tracking de cliques (console + gtag)
 */

(function () {
  'use strict';

  /* =============================================
     1. CARREGAR E RENDERIZAR PRODUTOS
     ============================================= */
  async function carregarProdutos() {
    try {
      const resp = await fetch('produtos.json');
      if (!resp.ok) throw new Error('Erro ao carregar produtos.json');
      const data = await resp.json();
      renderizarPagina(data);
    } catch (err) {
      console.error('[PreSell] Falha ao carregar produtos:', err);
    }
  }

  function renderizarPagina(data) {
    const { config, produtos, link_lista_promocoes } = data;

    // Config do hero
    if (config) {
      setTexto('[data-config="hero_headline"]', config.hero_headline);
      setTexto('[data-config="hero_subheadline"]', config.hero_subheadline);
      setTexto('[data-config="prova_social"]', config.prova_social);
      setTexto('[data-config="escassez"]', config.escassez);
      setTexto('[data-config="site_titulo"]', config.site_titulo);
      document.title = config.site_titulo + ' | Ofertas Mercado Livre';
    }

    // Produto destaque (index 0)
    const destaque = produtos.find(p => p.destaque) || produtos[0];
    renderizarDestaque(destaque);

    // Produtos secundários
    const secundarios = produtos.filter(p => p.id !== destaque.id);
    renderizarSecundarios(secundarios);

    // Link lista ML
    const btnLista = document.getElementById('btn-lista');
    if (btnLista && link_lista_promocoes) {
      btnLista.href = link_lista_promocoes;
    }

    // Botão hero CTA → scroll para destaque
    const btnHero = document.getElementById('btn-hero');
    if (btnHero) {
      btnHero.addEventListener('click', () => {
        document.getElementById('produto-destaque')?.scrollIntoView({ behavior: 'smooth' });
        trackEvento('hero_cta_click', 'Hero CTA');
      });
    }

    // Atualizar link do sticky CTA
    const stickyBtn = document.getElementById('sticky-btn');
    if (stickyBtn && destaque.link) {
      stickyBtn.href = destaque.link;
    }

    // Iniciar busca após renderizar
    iniciarBusca(produtos);
  }

  function renderizarDestaque(p) {
    const wrap = document.getElementById('destaque-wrap');
    if (!wrap) return;

    const temPrecoAnterior = p.preco_de && p.preco_de.trim() !== '';
    const temBlog = p.link_blog && p.link_blog.trim() !== '';
    const textoBlog = p.texto_blog || 'Saiba mais e veja as avaliações';

    wrap.innerHTML = `
      <article class="produto-destaque" id="produto-destaque">
        ${p.badge ? `<span class="badge-destaque">${p.badge}</span>` : ''}
        <img
          src="${p.imagem || ''}"
          alt="${p.titulo}"
          class="produto-img"
          loading="eager"
          onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23bbb%22 font-size=%2214%22%3ESem imagem%3C/text%3E%3C/svg%3E'"
        />
        <div class="produto-destaque-body">
          <h2>${p.titulo}</h2>
          <p class="descricao">${p.descricao}</p>
          <div class="preco-bloco">
            ${temPrecoAnterior ? `<span class="preco-de">${p.preco_de}</span>` : ''}
            <span class="preco-por">${p.preco}</span>
          </div>
          ${p.microcopy ? `<p class="microcopy">✓ ${p.microcopy}</p>` : ''}
          <a
            href="${p.link}"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-cta pulse"
            data-track="produto_destaque"
            data-produto="${p.titulo}"
            aria-label="Ver oferta de ${p.titulo} no Mercado Livre"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Ver Oferta no Mercado Livre
          </a>
          ${temBlog ? `
          <a
            href="${p.link_blog}"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-saiba-mais"
            data-track="blog_destaque"
            data-produto="${p.titulo}"
            aria-label="${textoBlog} — ${p.titulo}"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            ${textoBlog}
          </a>` : ''}
          <div class="confianca">
            <div class="confianca-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Compra segura
            </div>
            <div class="confianca-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              Entrega rápida
            </div>
            <div class="confianca-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              Melhor preço
            </div>
          </div>
        </div>
      </article>
    `;

    // Event listeners de tracking
    wrap.querySelector('.btn-cta').addEventListener('click', () => {
      trackEvento('produto_click', p.titulo, p.link);
    });

    const btnBlog = wrap.querySelector('.btn-saiba-mais');
    if (btnBlog) {
      btnBlog.addEventListener('click', () => {
        trackEvento('blog_click', p.titulo, p.link_blog);
      });
    }
  }

  function renderizarSecundarios(produtos) {
    const grid = document.getElementById('outros-grid');
    if (!grid) return;

    grid.innerHTML = '';

    produtos.forEach(p => {
      const temPrecoAnterior = p.preco_de && p.preco_de.trim() !== '';
      const badgeClass = p.badge && p.badge.includes('Preço') ? 'badge-preco' : 'badge-premium';
      const temBlog = p.link_blog && p.link_blog.trim() !== '';
      const textoBlog = p.texto_blog || 'Saiba mais e veja as avaliações';

      const card = document.createElement('article');
      card.className = 'card-produto';
      card.dataset.titulo = p.titulo.toLowerCase();
      card.dataset.descricao = p.descricao.toLowerCase();

      card.innerHTML = `
        ${p.badge ? `<span class="card-badge ${badgeClass}">${p.badge}</span>` : ''}
        <img
          src="${p.imagem || ''}"
          alt="${p.titulo}"
          class="produto-img"
          loading="lazy"
          onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22300%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23bbb%22 font-size=%2213%22%3ESem imagem%3C/text%3E%3C/svg%3E'"
        />
        <div class="card-body">
          <h3 class="card-titulo">${p.titulo}</h3>
          <p class="card-descricao">${p.descricao}</p>
          ${temPrecoAnterior ? `<p class="card-preco-de">${p.preco_de}</p>` : ''}
          <p class="card-preco">${p.preco}</p>
          <a
            href="${p.link}"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-card"
            data-track="produto_secundario"
            data-produto="${p.titulo}"
            aria-label="Ver oferta de ${p.titulo}"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Ver Oferta
          </a>
          ${temBlog ? `
          <a
            href="${p.link_blog}"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-card-saiba"
            data-track="blog_secundario"
            data-produto="${p.titulo}"
            aria-label="${textoBlog} — ${p.titulo}"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            ${textoBlog}
          </a>` : ''}
        </div>
      `;

      card.querySelector('.btn-card').addEventListener('click', () => {
        trackEvento('produto_click', p.titulo, p.link);
      });

      const btnBlog = card.querySelector('.btn-card-saiba');
      if (btnBlog) {
        btnBlog.addEventListener('click', () => {
          trackEvento('blog_click', p.titulo, p.link_blog);
        });
      }

      grid.appendChild(card);
    });
  }

  /* =============================================
     2. BUSCA EM TEMPO REAL
     ============================================= */
  function iniciarBusca(produtos) {
    const input = document.getElementById('busca-input');
    const destaqueWrap = document.getElementById('destaque-wrap');
    const outrosWrap = document.getElementById('outros-wrap');
    const semResultados = document.getElementById('sem-resultados');

    if (!input) return;

    let timer;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const q = input.value.trim().toLowerCase();
        filtrar(q, produtos, destaqueWrap, outrosWrap, semResultados);
      }, 200);
    });
  }

  function filtrar(q, produtos, destaqueWrap, outrosWrap, semResultados) {
    if (!q) {
      destaqueWrap.classList.remove('hidden');
      outrosWrap.classList.remove('hidden');
      document.querySelectorAll('.card-produto').forEach(c => c.classList.remove('hidden'));
      semResultados.style.display = 'none';
      return;
    }

    const destaque = produtos.find(p => p.destaque) || produtos[0];
    const matchDestaque = destaque.titulo.toLowerCase().includes(q) || destaque.descricao.toLowerCase().includes(q);
    destaqueWrap.classList.toggle('hidden', !matchDestaque);

    let algumVisivel = matchDestaque;
    document.querySelectorAll('.card-produto').forEach(card => {
      const t = card.dataset.titulo || '';
      const d = card.dataset.descricao || '';
      const visivel = t.includes(q) || d.includes(q);
      card.classList.toggle('hidden', !visivel);
      if (visivel) algumVisivel = true;
    });

    outrosWrap.classList.toggle('hidden', !algumVisivel);
    semResultados.style.display = algumVisivel ? 'none' : 'block';
  }

  /* =============================================
     3. STICKY CTA MOBILE
     ============================================= */
  function iniciarStickyCTA() {
    const sticky = document.getElementById('sticky-cta');
    if (!sticky) return;

    const THRESHOLD = 300;
    let visible = false;

    const handler = () => {
      if (window.innerWidth >= 640) return;
      const scrolled = window.scrollY > THRESHOLD;
      if (scrolled !== visible) {
        visible = scrolled;
        sticky.classList.toggle('visible', visible);
      }
    };

    window.addEventListener('scroll', handler, { passive: true });

    const stickyBtn = document.getElementById('sticky-btn');
    if (stickyBtn) {
      stickyBtn.addEventListener('click', () => {
        trackEvento('sticky_cta_click', 'Sticky CTA Mobile');
      });
    }
  }

  /* =============================================
     4. TRACKING
     ============================================= */
  function trackEvento(action, label, url) {
    console.log(`[Track] ${action} | ${label}${url ? ' | ' + url : ''}`);

    // Google Analytics 4 (GA4) — descomente após inserir snippet:
    /*
    if (typeof gtag === 'function') {
      gtag('event', action, {
        event_category: 'CTA',
        event_label: label,
        outbound_url: url || ''
      });
    }
    */
  }

  document.addEventListener('DOMContentLoaded', () => {
    const btnLista = document.getElementById('btn-lista');
    if (btnLista) {
      btnLista.addEventListener('click', () => {
        trackEvento('lista_ml_click', 'Ver mais ofertas ML');
      });
    }
  });

  /* =============================================
     UTILITÁRIOS
     ============================================= */
  function setTexto(selector, texto) {
    const el = document.querySelector(selector);
    if (el && texto) el.textContent = texto;
  }

  /* =============================================
     INIT
     ============================================= */
  document.addEventListener('DOMContentLoaded', () => {
    carregarProdutos();
    iniciarStickyCTA();
  });

})();
