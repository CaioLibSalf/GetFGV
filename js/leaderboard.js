(function () {
  const LIST = document.getElementById('lb-list');

  // Quantos lugares pedem nome no game over (checa corte do Top 20)
  const RANK_LIMIT = 20;
  // Quantos itens exibir na HOME
  const DISPLAY_LIMIT = 5;

  // --------- Render Top 5 na HOME ---------
  async function fetchTopHome() {
    if (!window.sb || !LIST) return;
    const { data, error } = await sb
      .from('leaderboard')
      .select('name, score, created_at')
      .order('score', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(DISPLAY_LIMIT); // <- só 5 na home

    if (error) { console.error(error); return; }

    LIST.innerHTML = (data && data.length ? data : []).map((r, i) =>
      `<li>
         <span class="pos">${i + 1}º</span>
         <span class="name">${escapeHTML((r.name || '').trim()) || 'Anônimo'}</span>
         <span class="score">${Number(r.score || 0).toLocaleString('pt-BR')}</span>
       </li>`
    ).join('') || `<li><span class="pos">-</span> <span class="name">Sem registros</span> <span class="score">—</span></li>`;
  }

  // --------- Enviar score ----------
  async function submitScore(name, score) {
    name = (name || '').trim().slice(0, 20);
    if (!name) return;

    // Anti-spam simples: 1 envio a cada 30s
    const now = Date.now();
    const last = +localStorage.getItem('getfgv:lastSubmit') || 0;
    if (now - last < 30000) return;
    localStorage.setItem('getfgv:lastSubmit', String(now));

    score = Math.max(0, Math.min(parseInt(score || 0, 10), 5000000));

    try {
      const { error } = await sb.from('leaderboard').insert({ name, score });
      if (error) { console.error(error); return; }
      // Atualiza a lista da HOME, se existir
      if (LIST) fetchTopHome();
    } catch (e) { console.error(e); }
  }

  // --------- Checar corte Top 20 e pedir nome ----------
  async function promptAndMaybeSubmit(score) {
    if (!Number.isFinite(score) || score <= 0) return;

    try {
      const { data, error } = await sb
        .from('leaderboard')
        .select('score, created_at')
        .order('score', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(RANK_LIMIT);

      if (error) throw error;

      const len = Array.isArray(data) ? data.length : 0;

      if (len < RANK_LIMIT) {
        askNameAndSubmit(score);
        return;
      }

      const twentieth = data[RANK_LIMIT - 1];
      const cutoff = Number(twentieth?.score ?? 0);

      if (score >= cutoff) {
        askNameAndSubmit(score);
      }
      // else: não entrou no Top 20, não pede nome
    } catch (e) {
      console.error('Falha ao checar Top 20; oferecendo envio:', e);
      askNameAndSubmit(score);
    }
  }

  function askNameAndSubmit(score) {
    const saved = localStorage.getItem('getfgv:name') || '';
    const name = window.prompt(
      `Parabéns! Você fez ${score.toLocaleString('pt-BR')} pontos.\nDigite seu nome para entrar no ranking:`,
      saved
    );
    if (!name) return;
    localStorage.setItem('getfgv:name', name.trim().slice(0, 20));
    submitScore(name, score);
  }

  // Evento disparado pelo html_actuator.js quando o jogo termina
  window.addEventListener('getfgv:gameover', (ev) => {
    let score = 0;
    if (ev && ev.detail && Number.isFinite(ev.detail.score)) {
      score = ev.detail.score;
    } else {
      const el = document.querySelector('.score-container');
      if (el) score = parseInt(el.textContent.replace(/\D+/g, ''), 10) || 0;
    }
    promptAndMaybeSubmit(score);
  });

  document.addEventListener('DOMContentLoaded', fetchTopHome);

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }
})();
