(function(){
  const LIST = document.getElementById('lb-list');

  async function fetchTop5(){
    if (!window.sb || !LIST) return;
    const { data, error } = await sb
      .from('leaderboard')
      .select('name, score, created_at')
      .order('score', { ascending:false })
      .order('created_at', { ascending:true })
      .limit(5);
    if (error) { console.error(error); return; }

    LIST.innerHTML = data.map((r, i) =>
      `<li><span class="pos">${i+1}º</span> <span class="name">${escapeHTML(r.name)}</span> <span class="score">${r.score.toLocaleString('pt-BR')}</span></li>`
    ).join('') || `<li>Ninguém no Top 5 ainda. Seja o primeiro!</li>`;
  }

  // Envia resultado com regra anti-spam local simples
  async function submitScore(name, score){
    // Saneamento básico
    name = (name || '').trim().slice(0,20);
    if (!name) return;

    // Anti-spam client-side (1 envio a cada 30s)
    const now = Date.now();
    const last = +localStorage.getItem('getfgv:lastSubmit') || 0;
    if (now - last < 30000) { return; }
    localStorage.setItem('getfgv:lastSubmit', String(now));

    // Limitadores de bom senso
    score = Math.max(0, Math.min(parseInt(score||0,10), 5000000));

    try{
      const { error } = await sb.from('leaderboard').insert({ name, score });
      if (error) { console.error(error); return; }
      fetchTop5(); // atualiza a lista após enviar
    }catch(e){ console.error(e); }
  }

  // Quando o jogo terminar, pergunte o nome e envie
  window.addEventListener('getfgv:gameover', (ev)=>{
    let score = 0;

    // Score do evento, se veio
    if (ev && ev.detail && Number.isFinite(ev.detail.score)) {
      score = ev.detail.score;
    } else {
      // Fallback: tenta ler do DOM (seu html usa .score-container)
      const el = document.querySelector('.score-container');
      if (el) score = parseInt(el.textContent.replace(/\D+/g,''),10) || 0;
    }

    // Só pergunta se o score entra no Top 5 (checagem rápida: pega o 5º e compara)
    promptAndMaybeSubmit(score);
  });

  async function promptAndMaybeSubmit(score){
    try{
      // Busca o atual 5º lugar
      const { data } = await sb
        .from('leaderboard')
        .select('score')
        .order('score', { ascending:false })
        .limit(1).range(4,4); // pega a 5ª linha (index 4)
      const fifth = (data && data[0] && data[0].score) || 0;

      if (score > 0 && (score > fifth)) {
        const saved = localStorage.getItem('getfgv:name') || '';
        const name = window.prompt(`Parabéns! Você fez ${score.toLocaleString('pt-BR')} pontos.\nDigite seu nome para entrar no Top 5:`, saved);
        if (!name) return;
        localStorage.setItem('getfgv:name', name.trim().slice(0,20));
        submitScore(name, score);
      }
    }catch(e){
      // Se der erro na checagem, ainda assim ofereça salvar
      const saved = localStorage.getItem('getfgv:name') || '';
      const name = window.prompt(`Parabéns! Você fez ${score.toLocaleString('pt-BR')} pontos.\nDigite seu nome para entrar no ranking:`, saved);
      if (name) {
        localStorage.setItem('getfgv:name', name.trim().slice(0,20));
        submitScore(name, score);
      }
    }
  }

  // Renderiza o Top 5 ao carregar
  document.addEventListener('DOMContentLoaded', fetchTop5);

  // Util: escapar HTML no nome
  function escapeHTML(s){
    return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
})();
