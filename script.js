/**
 * PRE-SELL PAGE — SCRIPT.JS  v2.0
 * CRO Agressivo · Afiliados ML · Mobile-first
 * =============================================
 * 100% compatível com index.html e produtos.json existentes.
 * Substitui apenas a renderização dos cards — mantém
 * busca, sticky CTA e tracking intactos.
 */

(function () {
  'use strict';

  /* =============================================
     HELPERS — gatilhos mentais dinâmicos
     ============================================= */

  /**
   * Gera número de "vendidos" falso mas crível,
   * variando ±10% para parecer orgânico.
   */
  function gerarVendidos(base) {
    const variacao = Math.floor(base * 0.1);
    const n = base - variacao + Math.floor(Math.random() * variacao * 2);
    return n >= 1000
      ? '+' + (n / 1000).toFixed(1).replace('.0', '') + 'k'
      : '+' + n;
  }

  /**
   * Gera texto de urgência rotativo.
   */
  const urgencias = [
    '🔥 Oferta por tempo limitado',
    '⚡ Estoque quase esgotado',
    '👀 Muitas pessoas vendo agora',
    '⏰ Promoção relâmpago',
  ];

  function urgenciaAleatoria() {
    return urgencias[Math.floor(Math.random() * urgencias.length)];
  }

  /**
   * Calcula percentual de desconto a partir dos preços.
   */
  function calcDesconto(precoDe, precoPor) {
    if (!precoDe || !precoPor) return null;
    const de  = parseFloat(precoDe.replace(/[^\d,]/g, '').replace(',', '.'));
    const por = parseFloat(precoPor.replace(/[^\d,]/g, '').replace(',', '.'));
    if (!de || !por || de <= por) return null;
    return '-' + Math.round((1 - por / de) * 100) + '%';
  }

  /**
   * Calcula parcelas (3x sem juros).
   */
  function calcParcela(preco) {
    const v = parseFloat(preco.replace(/[^\d,]/g, '').replace(',', '.'));
    if (!v) return null;
    const parcela = (v / 3).toFixed(2).replace('.', ',');
    return `ou 3× de R$${parcela} sem juros`;
  }

  /* =============================================
     1. CARREGAR E RENDERIZAR
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

    /* Config do hero */
    if (config) {
      setTexto('[data-config="hero_headline"]',   config.hero_headline);
      setTexto('[data-config="hero_subheadline"]', config.hero_subheadline);
      setTexto('[data-config="prova_social"]',     config.prova_social);
      setTexto('[data-config="escassez"]',         config.escassez);
      setTexto('[data-config="site_titulo"]',      config.site_titulo);
      document.title = config.site_titulo + ' | Ofertas Mercado Livre';
    }

    const destaque    = produtos.find(p => p.destaque) || produtos[0];
    const secundarios = produtos.filter(p => p.id !== destaque.id);

    renderizarDestaque(destaque);
    renderizarSecundarios(secundarios);

    /* Link lista ML */
    const btnLista = document.getElementById('btn-lista');
    if (btnLista && link_lista_promocoes) btnLista.href = link_lista_promocoes;

    /* Hero CTA scroll */
    const btnHero = document.getElementById('btn-hero');
    if (btnHero) {
      btnHero.addEventListener('click', () => {
        document.getElementById('produto-destaque')?.scrollIntoView({ behavior: 'smooth' });
        trackEvento('hero_cta_click', 'Hero CTA');
      });
    }

    /* Sticky CTA */
    const stickyBtn = document.getElementById('sticky-btn');
    if (stickyBtn && destaque.link) stickyBtn.href = destaque.link;

    iniciarBusca(produtos);
  }

  /* =============================================
     2. RENDERIZAR DESTAQUE
     ============================================= */
  function renderizarDestaque(p) {
    const wrap = document.getElementById('destaque-wrap');
    if (!wrap) return;

    const desconto    = calcDesconto(p.preco_de, p.preco);
    const parcela     = calcParcela(p.preco);
    const temBlog     = p.link_blog && p.link_blog.trim() !== '' && p.link_blog !== 'LINK_DO_SEU_BLOG_PRODUTO_1';
    const textoBlog   = p.texto_blog || 'Saiba mais e veja as avaliações';
    const vendidos    = gerarVendidos(2400);
    const urgencia    = urgenciaAleatoria();

    wrap.innerHTML = `
      <article class="produto-destaque" id="produto-destaque" itemscope itemtype="https://schema.org/Product">

        <!-- IMAGEM GRANDE -->
        <div class="produto-img-wrap">
          <img
            src="${p.imagem || ''}"
            alt="${p.titulo}"
            class="produto-img"
            loading="eager"
            itemprop="image"
            onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22600%22 height=%22400%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22600%22 height=%22400%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23bbb%22 font-size=%2214%22%3ESem imagem%3C/text%3E%3C/svg%3E'"
          />

          ${p.badge ? `<span class="badge-destaque">${p.badge}</span>` : ''}
          ${desconto ? `<span class="desconto-pill">${desconto}</span>` : ''}

          <div class="urgencia-img">
            <div class="dot-live"></div>
            ${urgencia}
          </div>
        </div>

        <!-- CORPO -->
        <div class="produto-destaque-body">

          <!-- Avaliação + prova social -->
          <div class="estrelas-wrap">
            <span class="estrelas">★★★★★</span>
            <span class="nota">4.9</span>
            <span class="qtd-vendidos">${vendidos} vendidos este mês</span>
          </div>

          <h2 itemprop="name">${p.titulo}</h2>
          <p class="descricao" itemprop="description">${p.descricao}</p>

          <!-- Preço -->
          <div class="preco-bloco">
            ${p.preco_de ? `<span class="preco-de">${p.preco_de}</span>` : ''}
            <span class="preco-por" itemprop="price">${p.preco}</span>
          </div>
          ${parcela ? `<p class="parcelamento">${parcela}</p>` : ''}

          ${p.microcopy ? `
          <span class="microcopy">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            ${p.microcopy}
          </span>` : ''}

          <!-- CTA PRINCIPAL -->
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
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            ${textoBlog}
          </a>` : ''}

          <!-- Trust bar -->
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              Melhor preço
            </div>
          </div>

        </div>
      </article>
    `;

    /* Tracking */
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

  /* =============================================
     3. RENDERIZAR SECUNDÁRIOS
     ============================================= */
  function renderizarSecundarios(produtos) {
    const grid = document.getElementById('outros-grid');
    if (!grid) return;

    grid.innerHTML = '';

    produtos.forEach((p, i) => {
      const desconto  = calcDesconto(p.preco_de, p.preco);
      const parcela   = calcParcela(p.preco);
      const temBlog   = p.link_blog && p.link_blog.trim() !== '' && !p.link_blog.startsWith('LINK');
      const textoBlog = p.texto_blog || 'Saiba mais e veja as avaliações';
      const vendidos  = gerarVendidos(i === 0 ? 1100 : 850);
      const urgencia  = urgenciaAleatoria();

      const badgeClass = p.badge && p.badge.toLowerCase().includes('preço')
        ? 'badge-preco'
        : 'badge-premium';

      const card = document.createElement('article');
      card.className = 'card-produto';
      card.dataset.titulo   = p.titulo.toLowerCase();
      card.dataset.descricao = p.descricao.toLowerCase();

      card.innerHTML = `
        <!-- IMAGEM -->
        <div class="produto-img-wrap">
          <img
            src="${p.imagem || ''}"
            alt="${p.titulo}"
            class="produto-img"
            loading="lazy"
            onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22300%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23bbb%22 font-size=%2213%22%3ESem imagem%3C/text%3E%3C/svg%3E'"
          />
          ${p.badge ? `<span class="card-badge ${badgeClass}">${p.badge}</span>` : ''}
          ${desconto ? `<span class="desconto-pill">${desconto}</span>` : ''}
          <div class="urgencia-img">
            <div class="dot-live"></div>
            ${urgencia}
          </div>
        </div>

        <!-- CORPO -->
        <div class="card-body">

          <!-- Estrelas mini -->
          <div class="card-estrelas-wrap">
            <span class="card-estrelas">★★★★★</span>
            <span class="card-nota">4.8</span>
            <span class="card-vendidos">&nbsp;· ${vendidos}</span>
          </div>

          <h3 class="card-titulo">${p.titulo}</h3>
          <p class="card-descricao">${p.descricao}</p>

          ${p.preco_de ? `<p class="card-preco-de">${p.preco_de}</p>` : ''}
          <p class="card-preco">${p.preco}</p>
          ${parcela ? `<p style="font-size:10px;color:#888;margin-bottom:8px;">${parcela}</p>` : ''}

          <a
            href="${p.link}"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-card"
            data-track="produto_secundario"
            data-produto="${p.titulo}"
            aria-label="Ver oferta de ${p.titulo}"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
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
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
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
     4. BUSCA EM TEMPO REAL
     ============================================= */
  function iniciarBusca(produtos) {
    const input        = document.getElementById('busca-input');
    const destaqueWrap = document.getElementById('destaque-wrap');
    const outrosWrap   = document.getElementById('outros-wrap');
    const semResultados = document.getElementById('sem-resultados');
    if (!input) return;

    let timer;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        filtrar(input.value.trim().toLowerCase(), produtos, destaqueWrap, outrosWrap, semResultados);
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
    const matchDest = destaque.titulo.toLowerCase().includes(q) || destaque.descricao.toLowerCase().includes(q);
    destaqueWrap.classList.toggle('hidden', !matchDest);

    let algumVisivel = matchDest;
    document.querySelectorAll('.card-produto').forEach(card => {
      const visivel = (card.dataset.titulo || '').includes(q) || (card.dataset.descricao || '').includes(q);
      card.classList.toggle('hidden', !visivel);
      if (visivel) algumVisivel = true;
    });

    outrosWrap.classList.toggle('hidden', !algumVisivel);
    semResultados.style.display = algumVisivel ? 'none' : 'block';
  }

  /* =============================================
     5. STICKY CTA MOBILE
     ============================================= */
  function iniciarStickyCTA() {
    const sticky = document.getElementById('sticky-cta');
    if (!sticky) return;

    const THRESHOLD = 300;
    let visible = false;

    window.addEventListener('scroll', () => {
      if (window.innerWidth >= 768) return;
      const scrolled = window.scrollY > THRESHOLD;
      if (scrolled !== visible) {
        visible = scrolled;
        sticky.classList.toggle('visible', visible);
      }
    }, { passive: true });

    const stickyBtn = document.getElementById('sticky-btn');
    if (stickyBtn) {
      stickyBtn.addEventListener('click', () => {
        trackEvento('sticky_cta_click', 'Sticky CTA Mobile');
      });
    }
  }

  /* =============================================
     6. TRACKING
     ============================================= */
  function trackEvento(action, label, url) {
    console.log(`[Track] ${action} | ${label}${url ? ' | ' + url : ''}`);

    /* GA4 — descomente após inserir snippet:
    if (typeof gtag === 'function') {
      gtag('event', action, {
        event_category: 'CTA',
        event_label: label,
        outbound_url: url || ''
      });
    }
    */
  }

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

    const btnLista = document.getElementById('btn-lista');
    if (btnLista) {
      btnLista.addEventListener('click', () => {
        trackEvento('lista_ml_click', 'Ver mais ofertas ML');
      });
    }
  });

})();
