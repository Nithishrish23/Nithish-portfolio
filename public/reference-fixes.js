(() => {
  document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    link.media = 'print';
    setTimeout(() => { link.media = 'all'; }, 0);
  });

  const fightStyle = document.createElement('link');
  fightStyle.rel = 'stylesheet';
  fightStyle.href = '/fight.css';
  document.head.appendChild(fightStyle);

  const TARGET_EMAIL = 'nithishkumar.job@gmail.com';
  const OPENAI_LOGO = '/openai-logo.svg';
  const RAG_LOGO = '/rag-logo.svg';

  const style = document.createElement('style');
  style.textContent = `
    .hero-actions { margin-top: 30px !important; gap: 14px !important; }
    .hero-actions .primary-btn { transform: translateY(2px); }
    html[data-theme='dark'] .stack-banner { background: #07111f !important; color: #f2f7ff !important; border-color: #203550 !important; }
    html[data-theme='dark'] .stack-banner .section-kicker { color: #6eaaff !important; }
    html[data-theme='dark'] .stack-banner h2 { color: #f1f6ff !important; }
    html[data-theme='dark'] .stack-banner h2 span { color: #5aa2ff !important; }
    html[data-theme='dark'] .stack-banner > p { color: #9db0c8 !important; }
    .technology-items img[alt='OpenAI logo'], .technology-items img[alt='RAG logo'] { width: 28px !important; height: 28px !important; object-fit: contain !important; display: block !important; margin: 0 !important; }

    .fight-shell .player-card { padding: 10px 13px !important; }
    .fight-shell .player-identity { display: flex; align-items: center; gap: 10px; min-height: 48px; }
    .fight-shell .player-photo { width: 46px; height: 46px; flex: 0 0 46px; border-radius: 50%; object-fit: cover; object-position: center; border: 2px solid #1769ff; box-shadow: 0 0 0 3px rgba(23,105,255,.10), 0 8px 20px rgba(23,105,255,.18); background: #e8f2fb; }
    .fight-shell .player-copy { min-width: 0; }
    .fight-shell .player-copy strong { margin: 4px 0 3px !important; font-size: 12px !important; letter-spacing: .045em !important; }
    .fight-shell .player-copy small { margin: 0 !important; font-size: 6px !important; letter-spacing: .11em !important; color: #70869b !important; }
    .fight-shell .player-card .health-track { margin-top: 8px; }
    .fight-shell .player-card .hp-value { margin-top: 5px !important; }
    .fight-shell .fight-topbar { grid-template-columns: minmax(240px, 1fr) 132px minmax(210px, .88fr); }
    .fight-shell .fight-round { box-shadow: 0 18px 45px rgba(23,105,255,.16), inset 0 1px 0 rgba(255,255,255,.7); }
    .fight-shell .fight-status { top: 96px; box-shadow: 0 12px 32px rgba(23,105,255,.13); }
    .fight-shell .fight-controls button { box-shadow: 0 14px 30px rgba(22,53,82,.16); }
    @media(max-width:760px){
      .fight-shell .fight-topbar { grid-template-columns: 1fr 62px 1fr; }
      .fight-shell .player-photo { width: 34px; height: 34px; flex-basis: 34px; }
      .fight-shell .player-identity { gap: 7px; min-height: 36px; }
      .fight-shell .player-copy strong { font-size: 8px !important; }
      .fight-shell .player-copy small { display: none; }
    }
    [data-theme='dark'] .fight-shell .player-photo { border-color: #69b3ff; box-shadow: 0 0 0 3px rgba(105,179,255,.12), 0 8px 20px rgba(0,0,0,.35); }
  `;
  document.head.appendChild(style);

  const applyTechnologyLogos = () => {
    document.querySelectorAll('.technology-items img').forEach((img) => {
      if (img.alt === 'OpenAI logo') img.src = OPENAI_LOGO;
      if (img.alt === 'RAG logo') img.src = RAG_LOGO;
    });
  };

  const replaceEmail = () => {
    document.querySelectorAll('a[href^="mailto:"]').forEach((a) => {
      a.href = `mailto:${TARGET_EMAIL}`;
      if (a.textContent.includes('@')) a.textContent = TARGET_EMAIL;
    });
    const body = document.body;
    if (!body) return;
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      if (node.nodeValue?.includes('nithishkumar140700@gmail.com')) {
        node.nodeValue = node.nodeValue.replaceAll('nithishkumar140700@gmail.com', TARGET_EMAIL);
      }
    });
  };

  const run = () => {
    replaceEmail();
    applyTechnologyLogos();
    setTimeout(applyTechnologyLogos, 0);
    setTimeout(applyTechnologyLogos, 100);
    setTimeout(applyTechnologyLogos, 500);
    setTimeout(applyTechnologyLogos, 1200);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
})();
