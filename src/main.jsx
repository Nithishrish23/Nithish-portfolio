import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, BrainCircuit, Bot, Cloud, Code2, Database, ExternalLink, Github, Mail, MapPin, Menu, Monitor, Send, ShieldCheck, Sparkles, Server, Layers, Workflow, X } from 'lucide-react';
import PortfolioScene from './PortfolioScene';
import AvatarChat from './AvatarChat';
import ThemeToggle from './ThemeToggle';
import './styles.css';
import './ai-avatar.css';
import './theme-refine.css';
import './reference-overrides.css';

const PROFILE_IMAGE = 'https://raw.githubusercontent.com/Nithishrish23/Nithish-portfolio/98f873233766d9efe6688b559262306092e7545d/static/images/1727781988320.jpg';
const EMAIL = 'nithishkumar140700@gmail.com';
const RESUME_URL = 'https://raw.githubusercontent.com/Nithishrish23/Nithish-portfolio/main/static/files/nithishresume(1).pdf';

const technologyGroups = [
  { number: '01', title: 'AI & LLM', lead: 'Intelligence layer', icon: BrainCircuit, items: ['OpenAI', 'Claude', 'Gemini', 'Ollama', 'LangChain', 'Llama', 'RAG', 'MCP'] },
  { number: '02', title: 'Backend & Data', lead: 'Systems layer', icon: Database, items: ['Python', 'FastAPI', 'Django', 'Flask', 'PostgreSQL', 'MySQL', 'Redis', 'Celery'] },
  { number: '03', title: 'Frontend & 3D', lead: 'Experience layer', icon: Monitor, items: ['React', 'Next.js', 'TypeScript', 'Tailwind', 'Three.js', 'Vite', 'WebGL', 'GSAP'] },
  { number: '04', title: 'Tools & Cloud', lead: 'Delivery layer', icon: Cloud, items: ['Docker', 'Git', 'Linux', 'AWS', 'Vercel', 'Azure', 'GitHub', 'CI/CD'] },
];

const BRAND_ICONS = {
  OpenAI: 'https://cdn.simpleicons.org/openai/111111', Claude: 'https://cdn.simpleicons.org/claude/111111', Gemini: 'https://cdn.simpleicons.org/googlegemini/111111', Ollama: 'https://cdn.simpleicons.org/ollama/111111', LangChain: 'https://cdn.simpleicons.org/langchain/111111', Llama: 'https://cdn.simpleicons.org/meta/111111', RAG: 'https://cdn.simpleicons.org/weaviate/111111', MCP: 'https://cdn.simpleicons.org/modelcontextprotocol/111111',
  Python: 'https://cdn.simpleicons.org/python/111111', FastAPI: 'https://cdn.simpleicons.org/fastapi/111111', Django: 'https://cdn.simpleicons.org/django/111111', Flask: 'https://cdn.simpleicons.org/flask/111111', PostgreSQL: 'https://cdn.simpleicons.org/postgresql/111111', MySQL: 'https://cdn.simpleicons.org/mysql/111111', Redis: 'https://cdn.simpleicons.org/redis/111111', Celery: 'https://cdn.simpleicons.org/celery/111111',
  React: 'https://cdn.simpleicons.org/react/111111', 'Next.js': 'https://cdn.simpleicons.org/nextdotjs/111111', TypeScript: 'https://cdn.simpleicons.org/typescript/111111', Tailwind: 'https://cdn.simpleicons.org/tailwindcss/111111', 'Three.js': 'https://cdn.simpleicons.org/threedotjs/111111', Vite: 'https://cdn.simpleicons.org/vite/111111', WebGL: 'https://cdn.simpleicons.org/webgl/111111', GSAP: 'https://cdn.simpleicons.org/greensock/111111',
  Docker: 'https://cdn.simpleicons.org/docker/111111', Git: 'https://cdn.simpleicons.org/git/111111', Linux: 'https://cdn.simpleicons.org/linux/111111', AWS: 'https://cdn.simpleicons.org/amazonaws/111111', Vercel: 'https://cdn.simpleicons.org/vercel/111111', Azure: 'https://cdn.simpleicons.org/microsoftazure/111111', GitHub: 'https://cdn.simpleicons.org/github/111111', 'CI/CD': 'https://cdn.simpleicons.org/githubactions/111111',
};

const work = [
  { index: '01', title: 'Salesforce AI Copilot', category: 'AI / Enterprise Automation', description: 'Permission-aware AI with RAG, MCP orchestration, conversational workflows, validation, approvals and auditability before critical actions.', stack: ['FastAPI', 'React', 'RAG', 'MCP', 'Salesforce', 'OpenAI', 'Claude'], repo: 'https://github.com/Nithishrish23/Salesforce-ai' },
  { index: '02', title: 'Multi-Agent Finance Platform', category: 'AI Agents / Finance', description: 'Provider-agnostic LLM routing, DAG workflows, memory, finance analysis, notifications and a fail-closed risk layer.', stack: ['Next.js', 'FastAPI', 'PostgreSQL', 'Redis', 'Celery', 'LLM Gateway'], repo: 'https://github.com/Nithishrish23/agent-earning' },
  { index: '03', title: 'Full-Stack Commerce Platform', category: 'Product Engineering', description: 'B2B/B2C commerce across customer, seller and admin workflows with Python APIs, PostgreSQL, authentication and payments.', stack: ['React', 'Vite', 'Flask', 'PostgreSQL', 'JWT', 'Stripe'], repo: 'https://github.com/Nithishrish23' },
  { index: '04', title: 'KYC Document Intelligence', category: 'Computer Vision', description: 'Computer-vision workflows for PAN, Aadhaar, address and signature documents with document-page classification and Aadhaar masking.', stack: ['Python', 'YOLO', 'OpenCV', 'PIL', 'Computer Vision'], repo: 'https://github.com/Nithishrish23' },
];
const companies = [
  { name: 'MathuraTech', href: 'https://mathuratech.com', detail: 'Technology & digital work' },
  { name: 'Popular Traders', href: 'https://populartraders.mathuratech.com', detail: 'Web product work' },
  { name: 'Infu Digital', href: 'https://infudigital.com', detail: 'Digital growth & web' },
  { name: 'Ninai Technologies', href: 'https://www.ninaitechnologies.com', detail: 'AI & technology solutions' },
];
const capabilities = [
  { icon: BrainCircuit, title: 'LLM Engineering', text: 'OpenAI, Claude, Gemini, LLaMA, OpenRouter, structured outputs and tool calling.' },
  { icon: Bot, title: 'AI Agents & RAG', text: 'Agent orchestration, retrieval, memory, MCP, workflows and permission-aware automation.' },
  { icon: Code2, title: 'Backend & Product', text: 'Python, FastAPI, Flask, Django, React, Next.js, PostgreSQL and scalable APIs.' },
  { icon: ShieldCheck, title: 'Reliable AI', text: 'Validation, approvals, role controls, auditability, testing and fail-closed execution.' },
];
const experience = [
  { period: 'JUN 2025 — PRESENT', role: 'Software Engineer - II', company: 'CodeDTX Solutions PVT LTD', text: 'Salesforce API and Metadata integrations, intelligent automation, permission-aware action engines and LLM-powered conversational interfaces.' },
  { period: 'OCT 2024 — JUN 2025', role: 'Team Lead', company: 'PCL INFOTECH PVT LTD', text: 'B2B/B2C e-commerce engineering with Flask, React and PostgreSQL, plus AI agents for business automation.' },
  { period: 'AUG 2023 — OCT 2024', role: 'AI Software Associate', company: 'Green Books', text: 'AI/ML and image-identification software with backend optimization, testing, deployment and security.' },
  { period: 'DEC 2022 — MAR 2023', role: 'Data Analyst Intern', company: 'Skill-Lync', text: 'Trend and correlation analysis with Tableau and Excel visualizations.' },
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [intro, setIntro] = useState(true);
  const [form, setForm] = useState({ fullname: '', email: '', country: '', mobile: '', message: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [sending, setSending] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setIntro(false), 1000); return () => clearTimeout(timer); }, []);
  const go = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); setMenuOpen(false); };
  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (e) => { e.preventDefault(); setSending(true); setStatus({ type: '', message: '' }); try { const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }); const data = await res.json().catch(() => ({})); if (!res.ok || !data.success) throw new Error(data.message || 'Unable to save your message.'); setStatus({ type: 'success', message: 'Message saved successfully. I will get back to you soon.' }); setForm({ fullname: '', email: '', country: '', mobile: '', message: '' }); } catch (err) { setStatus({ type: 'error', message: err.message }); } finally { setSending(false); } };
  return <div className="site">
    <div className={`intro-screen ${intro ? 'show' : ''}`} aria-hidden={!intro}><div className="intro-ring"><img src={PROFILE_IMAGE} alt=""/></div><div className="intro-name">NITHISH KUMAR</div><div className="intro-status"><span/> STARTING</div></div>
    <header className="nav-wrap"><nav className="nav container">
      <button className="brand" onClick={() => go('home')} aria-label="Back to home"><span className="brand-mark"><img className="brand-photo" src={PROFILE_IMAGE} alt="Nithish Kumar"/></span><span><strong>Nithish Kumar</strong><small>AI Engineer &amp; Full Stack Developer</small></span></button>
      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>{[['about','About'],['work','Projects'],['experience','Experience'],['stack','Tech Stack'],['contact','Contact']].map(([id,label]) => <button key={id} onClick={() => go(id)}>{label}</button>)}<a href="https://github.com/Nithishrish23" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={14}/></a></div>
      <div className="nav-actions"><ThemeToggle/><button className="nav-cta" onClick={() => go('contact')}>Let's Talk <ArrowUpRight size={15}/></button><button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X/> : <Menu/>}</button></div>
    </nav></header>
    <main>
      <section id="home" className="hero container">
        <div className="hero-copy reveal"><div className="eyebrow">BUILD AUTOMATE INNOVATE</div><div className="availability"><b/> Open to opportunities</div><h1>Turning ideas into<br/>real-world <em>solutions.</em></h1><p className="hero-text">I'm Nithish Kumar, a Software Engineer focused on LLM applications, RAG, AI agents, automation and full-stack systems that create real impact.</p><div className="hero-actions"><button className="primary-btn" onClick={() => go('work')}>View My Work <ArrowUpRight size={17}/></button><button className="ghost-btn" onClick={() => window.open(RESUME_URL, '_blank')}>Download Resume <ArrowUpRight size={17}/></button></div><div className="hero-metrics"><div><strong>4+</strong><span>Years Experience</span></div><div><strong>20+</strong><span>Projects Built</span></div><div><strong>5+</strong><span>Domains</span></div><div><strong>∞</strong><span>Continuous Learning</span></div></div></div>
        <div className="hero-visual"><PortfolioScene/><div className="hero-photo-card"><img src={PROFILE_IMAGE} alt="Nithish Kumar portrait"/><div><span>AI ENGINEER</span><strong>NITHISH KUMAR</strong></div></div></div>
      </section>

      <section id="about" className="section container about-section"><div className="section-head"><span className="section-number">01</span><div><p className="section-kicker">ABOUT</p><h2>Engineering <span>real impact.</span></h2></div><p className="section-note">AI, backend, interfaces and automation designed as one production system.</p></div><div className="about-grid"><div className="about-statement"><p>I work at the intersection of <strong>AI and product engineering</strong>, with a Python-first approach and a strong focus on reliable execution.</p><p>My work spans conversational AI, Salesforce automation, multi-agent workflows, retrieval systems, computer vision and production web applications.</p><div className="signature-line"><span>CHENNAI · INDIA</span><span>AI · FULL STACK · AUTOMATION</span></div></div><div className="capability-list">{capabilities.map(({ icon: Icon, title, text }) => <article key={title}><Icon size={21}/><div><h3>{title}</h3><p>{text}</p></div><ArrowUpRight size={16}/></article>)}</div></div></section>

      <section id="work" className="section work-section"><div className="container"><div className="section-head"><span className="section-number">02</span><div><p className="section-kicker">PROJECTS</p><h2>Systems I've <span>shipped.</span></h2></div><p className="section-note">AI, automation, backend and product engineering with real implementation depth.</p></div><div className="work-list">{work.map(item => <article className="work-row" key={item.title}><div className="work-index">{item.index}</div><div className="work-main"><p className="work-category">{item.category}</p><h3>{item.title}</h3><p>{item.description}</p><div className="stack">{item.stack.map(s => <span key={s}>{s}</span>)}</div></div><a className="work-link" href={item.repo} target="_blank" rel="noreferrer" aria-label={`Open ${item.title} on GitHub`}><Github size={19}/><ArrowUpRight size={15}/></a></article>)}</div></div></section>

      <section className="section company-section"><div className="container"><div className="section-head compact"><span className="section-number">03</span><div><p className="section-kicker">REAL-WORLD WORK</p><h2>Built for <span>business.</span></h2></div></div><p className="company-intro">Technology and digital product work across AI-first businesses and web platforms.</p><div className="company-grid">{companies.map(company => <a href={company.href} target="_blank" rel="noreferrer" className="company-card" key={company.name}><div className="company-symbol">{company.name.charAt(0)}</div><div><h3>{company.name}</h3><p>{company.detail}</p></div><ExternalLink size={16}/></a>)}</div></div></section>

      <section id="experience" className="section experience-section"><div className="container"><div className="section-head"><span className="section-number">04</span><div><p className="section-kicker">EXPERIENCE</p><h2>Experience with <span>depth.</span></h2></div></div><div className="experience-layout"><div className="experience-intro"><p>Engineering across AI, software, analytics and full-stack product development.</p><div className="experience-rule"/><span>2022 — NOW</span></div><div className="timeline">{experience.map(item => <article key={item.company}><span className="period">{item.period}</span><div><h3>{item.role}</h3><h4>{item.company}</h4><p>{item.text}</p></div></article>)}</div></div></div></section>

      <section id="stack" className="section stack-section"><div className="container"><div className="stack-banner"><div><p className="section-kicker">TECHNOLOGY</p><h2>Engineered in <span>layers.</span></h2></div><p>A focused toolkit across intelligence, backend, frontend, 3D and cloud to build, deploy and scale real-world solutions.</p></div><div className="technology-grid">{technologyGroups.map(group => { const GroupIcon = group.icon; return <article className="technology-card" key={group.title}><div className="technology-card-head"><div className="technology-icon"><GroupIcon size={22}/></div><div><div className="technology-top"><span>{group.number}</span><small>{group.lead}</small></div><h3>{group.title}</h3></div></div><div className="technology-items">{group.items.map(item => <span key={item}>{BRAND_ICONS[item] ? <img src={BRAND_ICONS[item]} alt={`${item} logo`} loading="lazy"/> : <Code2 size={18}/>}<b>{item}</b></span>)}</div></article>; })}</div></div></section>

      <section id="contact" className="section contact-section"><div className="container contact-wrap"><div className="contact-copy"><span className="section-number">05</span><p className="section-kicker">LET'S BUILD</p><h2>Have a hard problem?<br/><span>Let's make it software.</span></h2><p>For AI products, intelligent automation, full-stack systems or engineering opportunities, send a message.</p><div className="direct-contact"><a href={`mailto:${EMAIL}`}><Mail size={17}/> {EMAIL}</a><span><MapPin size={17}/> Chennai, Tamil Nadu, India</span></div></div><form className="contact-form" onSubmit={submit}><div className="form-title"><span>CONTACT</span><b>Tell me what you're building.</b></div><div className="form-row"><input required value={form.fullname} onChange={e => setField('fullname', e.target.value)} placeholder="Full name"/><input required type="email" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="Email"/></div><div className="form-row"><input required value={form.country} onChange={e => setField('country', e.target.value)} placeholder="Country"/><input required value={form.mobile} onChange={e => setField('mobile', e.target.value)} placeholder="Mobile"/></div><textarea required value={form.message} onChange={e => setField('message', e.target.value)} placeholder="Your message"/><button className="submit-btn" disabled={sending}>{sending ? 'Sending…' : 'Send message'}</button>{status.message && <div className={`form-status ${status.type}`}>{status.message}</div>}</form></div></section>
    </main>
    <footer className="site-footer"><div className="container"><span>© 2026 Nithish Kumar. Built with React, Three.js &amp; AI.</span><span>Chennai · India</span></div></footer>
    <AvatarChat/>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
