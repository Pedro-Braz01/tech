#!/usr/bin/env node
/**
 * scripts/generate-sitemap.js
 * Lê blog/posts.json e gera sitemap.xml na raiz do repositório.
 * Executado automaticamente pelo GitHub Actions a cada push em blog/posts.json
 */

const fs   = require('fs');
const path = require('path');

const BASE_URL    = 'https://promo.devpbs.com.br';
const POSTS_JSON  = path.join(__dirname, '..', 'blog', 'posts.json');
const SITEMAP_OUT = path.join(__dirname, '..', 'sitemap.xml');

/* ── páginas estáticas fixas ─────────────────────────── */
const PAGINAS_FIXAS = [
  { loc: '/',       changefreq: 'daily',   priority: '1.0' },
  { loc: '/blog/',  changefreq: 'daily',   priority: '0.9' },
];

/* ── lê posts.json ───────────────────────────────────── */
let posts = [];
try {
  const raw = JSON.parse(fs.readFileSync(POSTS_JSON, 'utf8'));
  // Apenas posts publicados (não rascunho)
  posts = (raw.posts || []).filter(p => !p.rascunho);
  console.log(`[sitemap] ${posts.length} post(s) publicado(s) encontrado(s)`);
} catch (e) {
  console.warn('[sitemap] Aviso: não foi possível ler posts.json:', e.message);
}

/* ── monta entradas ──────────────────────────────────── */
const agora = new Date().toISOString();

function toW3cDate(isoString) {
  try { return new Date(isoString).toISOString(); }
  catch { return agora; }
}

const entradas = [
  ...PAGINAS_FIXAS.map(p => ({
    loc:        `${BASE_URL}${p.loc}`,
    lastmod:    agora,
    changefreq: p.changefreq,
    priority:   p.priority,
  })),
  ...posts.map(p => ({
    loc:        `${BASE_URL}/blog/posts/${p.slug}.html`,
    lastmod:    toW3cDate(p.data),
    changefreq: 'monthly',
    priority:   '0.7',
  })),
];

/* ── gera XML ────────────────────────────────────────── */
const linhas = entradas.map(e => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
          http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${linhas.join('\n')}
</urlset>
`;

fs.writeFileSync(SITEMAP_OUT, xml, 'utf8');
console.log(`[sitemap] ✅ Gerado com ${entradas.length} URL(s) → sitemap.xml`);
entradas.forEach(e => console.log('  ', e.loc));
