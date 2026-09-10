(() => {
  // Prevent remote font/CSS requests from blocking the deferred React module.
  document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    link.media = 'print';
    setTimeout(() => { link.media = 'all'; }, 0);
  });

  const TARGET_EMAIL = 'nithishkumar.job@gmail.com';
  const OPENAI_LOGO = '/openai-logo.svg';
  const RAG_LOGO = '/rag-logo.svg';

  const style = document.createElement('style');
  style.textContent = `
    .hero-actions { margin-top: 30px !important; gap: 14px !important; }
    .hero-actions .primary-btn { transform: translateY(2px); }

    /* Dark theme: the technology banner must use the same dark surface as the section. */
    html[data-theme='dark'] .stack-banner {
      background: #07111f !important;
      color: #f2f7ff !important;
      border-color: #203550 !important;
    }
    html[data-theme='dark'] .stack-banner .section-kicker { color: #6eaaff !important; }
    html[data-theme='dark'] .stack-banner h2 { color: #f1f6ff !important; }
    html[data-theme='dark'] .stack-banner h2 span { color: #5aa2ff !important; }
    html[data-theme='dark'] .stack-banner > p { color: #9db0c8 !important; }

    /* Technology logos are local so they cannot become broken-image placeholders. */
    .technology-items img[alt='OpenAI logo'],
    .technology-items img[alt='RAG logo'] {
      width: 28px !important;
      height: 28px !important;
      object-fit: contain !important;
      display: block !important;
      margin: 0 !important;
    }
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
