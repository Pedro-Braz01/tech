/**
 * github-proxy-worker.js — Cloudflare Worker
 *
 * DEPLOY:
 * 1. Acesse https://dash.cloudflare.com → Workers → Create
 * 2. Cole este código
 * 3. Em Settings → Variables → Add:
 *    GITHUB_TOKEN = ghp_SeuTokenAqui
 * 4. Anote a URL do Worker (ex: https://github-proxy.SEU-USER.workers.dev)
 *
 * PERMISSÕES DO TOKEN (Fine-grained):
 * Repository access: seu-repo
 * Contents: Read and write
 */

const ALLOWED_ORIGINS = [
  'https://promo.devpbs.com.br',
  'http://localhost',
  'http://127.0.0.1',
  'null', // file:// local
];

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const corsHeaders = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let body;
    try { body = await request.json(); }
    catch { return json({ error: 'Invalid JSON' }, 400, corsHeaders); }

    const { action, owner, repo, branch = 'main', path, content, message, sha } = body;

    if (!owner || !repo || !path) {
      return json({ error: 'Missing owner, repo or path' }, 400, corsHeaders);
    }

    const token = env.GITHUB_TOKEN;
    if (!token) return json({ error: 'GITHUB_TOKEN not configured in Worker' }, 500, corsHeaders);

    const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const headers  = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'PbsDevop-BlogAdmin/1.0',
      'X-GitHub-Api-Version': '2022-11-28',
    };

    // ── GET SHA ──────────────────────────────
    if (action === 'get_sha') {
      try {
        const r = await fetch(`${apiBase}?ref=${branch}`, { headers });
        if (r.status === 404) return json({ sha: null }, 200, corsHeaders);
        if (!r.ok) return json({ error: `GitHub ${r.status}` }, r.status, corsHeaders);
        const d = await r.json();
        return json({ sha: d.sha }, 200, corsHeaders);
      } catch(e) {
        return json({ error: e.message }, 500, corsHeaders);
      }
    }

    // ── PUT / CREATE FILE ─────────────────────
    if (!content || !message) {
      return json({ error: 'Missing content or message' }, 400, corsHeaders);
    }

    // Auto-fetch SHA if not provided (handles update)
    let fileSha = sha;
    if (!fileSha) {
      try {
        const r = await fetch(`${apiBase}?ref=${branch}`, { headers });
        if (r.ok) { const d = await r.json(); fileSha = d.sha; }
      } catch {}
    }

    const putBody = { message, content, branch };
    if (fileSha) putBody.sha = fileSha;

    try {
      const r = await fetch(apiBase, {
        method: 'PUT',
        headers,
        body: JSON.stringify(putBody)
      });
      const d = await r.json();
      if (!r.ok) return json({ error: d.message || `GitHub ${r.status}` }, r.status, corsHeaders);
      return json({ ok: true, sha: d.content?.sha }, 200, corsHeaders);
    } catch(e) {
      return json({ error: e.message }, 500, corsHeaders);
    }
  }
};

function json(data, status, cors) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' }
  });
}
