/**
 * PRE-SELL PAGE — SCRIPT.JS v3.0
 * Compatível com index.html + produtos.json existentes
 * Novo HTML de cards: .produto-img-wrap wrapping .produto-img
 */
(function () {
  'use strict';

  /* ── helpers ── */
  function gerarVendidos(base) {
    const v = base - Math.floor(base * 0.05) + Math.floor(Math.random() * base * 0.1);
    return v >= 1000 ? '+' + (v / 1000).toFixed(1).replace('.0', '') + 'k' : '+' + v;
  }

  const urgencias = [
    '🔥 Oferta por tempo limitado',
    '⚡ Estoque quase esgotado',
    '👀 Muitas pessoas vendo agora',
    '⏰ Promoção relâmpago',
  ];
  function urgencia() { return urgencias[Math.floor(Math.random() * urgencias.length)]; }

  function desconto(de, por) {
    if (!de || !por) return null;
    const a = parseFloat(de.replace(/[^\d,]/g, '').replace(',', '.'));
    const b = parseFloat(por.replace(/[^\d,]/g, '').replace(',', '.'));
    return a > b ? '-' + Math.round((1 - b / a) * 100) + '%' : null;
  }

  function parcela(preco) {
    const v = parseFloat(preco.replace(/[^\d,]/g, '').replace(',', '.'));
    if (!v) return null;
    return 'ou 3× de R$' + (v / 3).toFixed(2).replace('.', ',') + ' sem juros';
  }

  function setTexto(sel, txt) {
    const el = document.querySelector(sel);
    if (el && txt) el.textContent = txt;
  }

  /* ── carga principal ── */
  async function carregarProdutos() {
    try {
      const r = await fetch('produtos.json');
      if (!r.ok) throw new Error('produtos.json não carregado');
      renderizarPagina(await r.json());
    } catch (e) { console.error('[PreSell]', e); }
  }

  function renderizarPagina({ config, produtos, link_lista_promocoes }) {
    if (config) {
      setTexto('[data-config="hero_headline"]',    config.hero_headline);
      setTexto('[data-config="hero_subheadline"]', config.hero_subheadline);
      setTexto('[data-config="prova_social"]',     config.prova_social);
      setTexto('[data-config="escassez"]',         config.escassez);
      document.title = (config.site_titulo || 'Ofertas') + ' | Mercado Livre';
    }

    const destaque    = produtos.find(p => p.destaque) || produtos[0];
    const secundarios = produtos.filter(p => p.id !== destaque.id);

    renderDestaque(destaque);
    renderSecundarios(secundarios);

    const btnLista = document.getElementById('btn-lista');
    if (btnLista && link_lista_promocoes) btnLista.href = link_lista_promocoes;

    document.getElementById('btn-hero')?.addEventListener('click', () => {
      document.getElementById('produto-destaque')?.scrollIntoView({ behavior: 'smooth' });
      track('hero_cta_click', 'Hero CTA');
    });

    const stickyBtn = document.getElementById('sticky-btn');
    if (stickyBtn && destaque.link) stickyBtn.href = destaque.link;

    iniciarBusca(produtos);
  }

  /* ── destaque ── */
  function renderDestaque(p) {
    const wrap = document.getElementById('destaque-wrap');
    if (!wrap) return;

    const desc   = desconto(p.preco_de, p.preco);
    const par    = parcela(p.preco);
    const vend   = gerarVendidos(2400);
    const urg    = urgencia();
    const temBlog = p.link_blog && !p.link_blog.startsWith('LINK');
    const txtBlog = p.texto_blog || 'Saiba mais e veja as avaliações';

    wrap.innerHTML = `
<article class="produto-destaque" id="produto-destaque">

  <div class="produto-img-wrap">
    <img src="${p.imagem||''}" alt="${p.titulo}" class="produto-img" loading="eager"
      onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22600%22 height=%22400%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22600%22 height=%22400%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23bbb%22 font-size=%2214%22%3ESem imagem%3C/text%3E%3C/svg%3E'"/>
    ${p.badge ? `<span class="badge-destaque">${p.badge}</span>` : ''}
    ${desc     ? `<span class="desconto-pill">${desc}</span>` : ''}
    <div class="urgencia-img"><div class="dot-live"></div>${urg}</div>
  </div>

  <div class="produto-destaque-body">
    <div class="estrelas-wrap">
      <span class="estrelas">★★★★★</span>
      <span class="nota">4.9</span>
      <span class="qtd-vendidos">${vend} vendidos este mês</span>
    </div>
    <h2>${p.titulo}</h2>
    <p class="descricao">${p.descricao}</p>
    <div class="preco-bloco">
      ${p.preco_de ? `<span class="preco-de">${p.preco_de}</span>` : ''}
      <span class="preco-por">${p.preco}</span>
    </div>
    ${par ? `<p class="parcelamento">${par}</p>` : ''}
    ${p.microcopy ? `
    <span class="microcopy">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
      ${p.microcopy}
    </span>` : ''}
    <a href="${p.link}" target="_blank" rel="noopener noreferrer"
       class="btn-cta pulse" data-produto="${p.titulo}"
       aria-label="Ver oferta de ${p.titulo} no Mercado Livre">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      Ver Oferta no Mercado Livre
    </a>
    ${temBlog ? `
    <a href="${p.link_blog}" target="_blank" rel="noopener noreferrer"
       class="btn-saiba-mais" data-produto="${p.titulo}">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      ${txtBlog}
    </a>` : ''}
    <div class="confianca">
      <div class="confianca-item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>Compra segura
      </div>
      <div class="confianca-item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>Entrega rápida
      </div>
      <div class="confianca-item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>Melhor preço
      </div>
    </div>
  </div>

</article>`;

    wrap.querySelector('.btn-cta').addEventListener('click', () => track('produto_click', p.titulo, p.link));
    wrap.querySelector('.btn-saiba-mais')?.addEventListener('click', () => track('blog_click', p.titulo, p.link_blog));
  }

  /* ── secundários ── */
  function renderSecundarios(produtos) {
    const grid = document.getElementById('outros-grid');
    if (!grid) return;
    grid.innerHTML = '';

    produtos.forEach((p, i) => {
      const desc    = desconto(p.preco_de, p.preco);
      const par     = parcela(p.preco);
      const vend    = gerarVendidos(i === 0 ? 1100 : 860);
      const urg     = urgencia();
      const temBlog = p.link_blog && !p.link_blog.startsWith('LINK');
      const txtBlog = p.texto_blog || 'Saiba mais e veja as avaliações';
      const bCls    = p.badge?.toLowerCase().includes('preço') ? 'badge-preco' : 'badge-premium';

      const card = document.createElement('article');
      card.className = 'card-produto';
      card.dataset.titulo    = p.titulo.toLowerCase();
      card.dataset.descricao = p.descricao.toLowerCase();

      card.innerHTML = `
  <div class="produto-img-wrap">
    <img src="${p.imagem||''}" alt="${p.titulo}" class="produto-img" loading="lazy"
      onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23bbb%22 font-size=%2213%22%3ESem imagem%3C/text%3E%3C/svg%3E'"/>
    ${p.badge ? `<span class="card-badge ${bCls}">${p.badge}</span>` : ''}
    ${desc    ? `<span class="desconto-pill">${desc}</span>` : ''}
    <div class="urgencia-img"><div class="dot-live"></div>${urg}</div>
  </div>

  <div class="card-body">
    <div class="card-estrelas-wrap">
      <span class="card-estrelas">★★★★★</span>
      <span class="card-nota">4.8</span>
      <span class="card-vendidos">&nbsp;· ${vend}</span>
    </div>
    <h3 class="card-titulo">${p.titulo}</h3>
    <p class="card-descricao">${p.descricao}</p>
    ${p.preco_de ? `<p class="card-preco-de">${p.preco_de}</p>` : ''}
    <p class="card-preco">${p.preco}</p>
    ${par ? `<p class="card-parcela">${par}</p>` : ''}
    <div class="card-btns">
      <a href="${p.link}" target="_blank" rel="noopener noreferrer"
         class="btn-card" data-produto="${p.titulo}"
         aria-label="Ver oferta de ${p.titulo}">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        Ver Oferta
      </a>
      ${temBlog ? `
      <a href="${p.link_blog}" target="_blank" rel="noopener noreferrer"
         class="btn-card-saiba" data-produto="${p.titulo}">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        ${txtBlog}
      </a>` : ''}
    </div>
  </div>`;

      card.querySelector('.btn-card').addEventListener('click', () => track('produto_click', p.titulo, p.link));
      card.querySelector('.btn-card-saiba')?.addEventListener('click', () => track('blog_click', p.titulo, p.link_blog));
      grid.appendChild(card);
    });
  }

  /* ── busca ── */
  function iniciarBusca(produtos) {
    const input = document.getElementById('busca-input');
    const dWrap = document.getElementById('destaque-wrap');
    const oWrap = document.getElementById('outros-wrap');
    const sem   = document.getElementById('sem-resultados');
    if (!input) return;

    let t;
    input.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => filtrar(input.value.trim().toLowerCase(), produtos, dWrap, oWrap, sem), 200);
    });
  }

  function filtrar(q, produtos, dWrap, oWrap, sem) {
    if (!q) {
      dWrap.classList.remove('hidden');
      oWrap.classList.remove('hidden');
      document.querySelectorAll('.card-produto').forEach(c => c.classList.remove('hidden'));
      sem.style.display = 'none';
      return;
    }
    const dest = produtos.find(p => p.destaque) || produtos[0];
    const mD   = dest.titulo.toLowerCase().includes(q) || dest.descricao.toLowerCase().includes(q);
    dWrap.classList.toggle('hidden', !mD);

    let algum = mD;
    document.querySelectorAll('.card-produto').forEach(card => {
      const vis = (card.dataset.titulo||'').includes(q) || (card.dataset.descricao||'').includes(q);
      card.classList.toggle('hidden', !vis);
      if (vis) algum = true;
    });
    oWrap.classList.toggle('hidden', !algum);
    sem.style.display = algum ? 'none' : 'block';
  }

  /* ── sticky mobile ── */
  function iniciarSticky() {
    const sticky = document.getElementById('sticky-cta');
    if (!sticky) return;
    let vis = false;
    window.addEventListener('scroll', () => {
      if (window.innerWidth >= 768) return;
      const s = window.scrollY > 300;
      if (s !== vis) { vis = s; sticky.classList.toggle('visible', vis); }
    }, { passive: true });
    document.getElementById('sticky-btn')?.addEventListener('click', () => track('sticky_click', 'Sticky Mobile'));
  }

  /* ── tracking ── */
  function track(action, label, url) {
    console.log(`[Track] ${action} | ${label}${url ? ' | ' + url : ''}`);
    /* GA4:
    if (typeof gtag === 'function') gtag('event', action, { event_label: label, outbound_url: url||'' });
    */
  }

  /* ── init ── */
  document.addEventListener('DOMContentLoaded', () => {
    carregarProdutos();
    iniciarSticky();
    document.getElementById('btn-lista')?.addEventListener('click', () => track('lista_ml', 'Ver mais ML'));
  });

})();
