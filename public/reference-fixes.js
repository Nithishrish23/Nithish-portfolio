(() => {
  const TARGET_EMAIL = 'nithishkumar.job@gmail.com';
  const style = document.createElement('style');
  style.textContent = `
    /* Final reference polish */
    .hero-actions { margin-top: 30px !important; gap: 14px !important; }
    .hero-actions .primary-btn { transform: translateY(2px); }

    /* Reliable inline technology marks when external Simple Icons are unavailable. */
    .technology-items img[src*="simpleicons.org/openai"] {
      content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%231765ff' d='M24 5.5c4.8 0 8.9 2.9 10.7 7.1 4.4.2 8.1 3.4 9 7.7.9 4.4-1.3 8.8-5.1 11.1 1.1 4.3-.5 8.8-4.3 11.1-3.8 2.3-8.7 1.7-11.8-1.5-4 2.1-8.9 1.2-11.7-2.1-2.8-3.4-2.9-8.3-.3-11.8-2.5-3.5-2.1-8.4.9-11.6 3-3.1 7.9-3.7 11.7-1.5C24.5 6.2 24.2 5.9 24 5.5Zm-5.8 10.8c-2.5-1.2-5.5-.4-7 1.8-1.6 2.2-1.3 5.3.5 7.3l7.2-4.2 5.1-3-5.8-1.9Zm13.5 2.1-7.2 4.2-5.1 3 5.8 1.9c2.5 1.2 5.5.4 7-1.8 1.6-2.2 1.3-5.3-.5-7.3Zm-14.4 9.8-1.9 5.8c-.8 2.6.6 5.4 3.1 6.4 2.5 1 5.4-.1 6.7-2.5l-7.9-4.7Zm13.4-1.5-5.1 3 7.2 4.2c2.2 1.3 5.1.6 6.4-1.6 1.3-2.2.6-5.1-1.6-6.4l-6.9-4.1Zm-2.1-11.2 1.9 5.8 7.9-4.7c-1.3-2.4-4.2-3.5-6.7-2.5-1.2.5-2.4 1-3.1 1.4Z'/%3E%3C/svg%3E") !important;
    }
    .technology-items img[src*="simpleicons.org/weaviate"] {
      content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect x='4' y='4' width='40' height='40' rx='12' fill='%23edf4ff'/%3E%3Ccircle cx='15' cy='15' r='4' fill='none' stroke='%231765ff' stroke-width='3'/%3E%3Ccircle cx='33' cy='15' r='4' fill='none' stroke='%231765ff' stroke-width='3'/%3E%3Ccircle cx='15' cy='33' r='4' fill='none' stroke='%231765ff' stroke-width='3'/%3E%3Ccircle cx='33' cy='33' r='4' fill='none' stroke='%231765ff' stroke-width='3'/%3E%3Cpath d='M19 15h10M15 19v10M33 19v10M19 33h10' stroke='%231765ff' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E") !important;
    }
  `;
  document.head.appendChild(style);

  const replaceEmail = () => {
    document.querySelectorAll('a[href^="mailto:"]').forEach((a) => {
      a.href = `mailto:${TARGET_EMAIL}`;
      if (a.textContent.includes('@')) a.textContent = TARGET_EMAIL;
    });
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      if (node.nodeValue && node.nodeValue.includes('nithishkumar140700@gmail.com')) {
        node.nodeValue = node.nodeValue.replaceAll('nithishkumar140700@gmail.com', TARGET_EMAIL);
      }
    });
  };

  const run = () => replaceEmail();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  new MutationObserver(run).observe(document.documentElement, { childList: true, subtree: true });
})();
