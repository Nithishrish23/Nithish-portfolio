import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, BrainCircuit, Bot, ChevronDown, Code2, ExternalLink, Github, Layers3, Mail, MapPin, Menu, Send, ShieldCheck, Sparkles, X } from 'lucide-react';
import PortfolioScene from './PortfolioScene';
import './styles.css';

const PROFILE_IMAGE = 'https://raw.githubusercontent.com/Nithishrish23/Nithish-portfolio/98f873233766d9efe6688b559262306092e7545d/static/images/1727781988320.jpg';
const EMAIL = 'nithishkumar140700@gmail.com';

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

const skills = ['Python', 'FastAPI', 'Flask', 'Django', 'React', 'Next.js', 'PostgreSQL', 'MySQL', 'SQL', 'AI / ML', 'LLMs', 'RAG', 'AI Agents', 'MCP', 'OpenAI', 'Claude', 'Gemini', 'TensorFlow', 'OpenCV', 'YOLO', 'Voice AI', 'Azure AI', 'Redis', 'Celery', 'Selenium', 'Pytest', 'Git'];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [intro, setIntro] = useState(true);
  const [form, setForm] = useState({ fullname: '', email: '', country: '', mobile: '', message: '' });
  const [status, setStatus] = useState({ type: '', message: '', fallback: false });
  const [sending, setSending] = useState(false);

  useEffect(() => { const timer = setTimeout(() => setIntro(false), 1250); return () => clearTimeout(timer); }, []);
  const go = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); setMenuOpen(false); };
  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (e) => {
    e.preventDefault(); setSending(true); setStatus({ type: '', message: '', fallback: false });
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json().catch(() => ({}));
      if (res.ok && !data.fallback) {
        setStatus({ type: 'success', message: 'Message sent successfully. I will get back to you soon.', fallback: false });
        setForm({ fullname: '', email: '', country: '', mobile: '', message: '' });
      } else if (data.fallback) {
        const subject = encodeURIComponent(`Portfolio enquiry from ${form.fullname}`);
        const body = encodeURIComponent(`Name: ${form.fullname}\nEmail: ${form.email}\nCountry: ${form.country}\nMobile: ${form.mobile}\n\n${form.message}`);
        window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
        setStatus({ type: 'success', message: 'Your email app is opening with the message ready to send.', fallback: true });
      } else throw new Error(data.message || 'Unable to send your message.');
    } catch (err) { setStatus({ type: 'error', message: err.message, fallback: false }); }
    finally { setSending(false); }
  };

  return <div className="site">
    <div className={`intro-screen ${intro ? 'show' : ''}`} aria-hidden={!intro}><div className="intro-ring"><img src={PROFILE_IMAGE} alt=""/></div><div className="intro-name">NITHISH KUMAR</div><div className="intro-status"><span/> INITIALIZING PORTFOLIO</div></div>
    <div className="ambient ambient-a"/><div className="ambient ambient-b"/>
    <header className="nav-wrap"><nav className="nav container">
      <button className="brand" onClick={() => go('home')} aria-label="Back to home"><span className="brand-mark"><img className="brand-photo" src={PROFILE_IMAGE} alt="Nithish Kumar"/><i/></span><span><strong>Nithish Kumar</strong><small>AI ENGINEER · FULL STACK</small></span></button>
      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>{['about', 'work', 'experience', 'contact'].map((item) => <button key={item} onClick={() => go(item)}>{item}</button>)}<a href="https://github.com/Nithishrish23" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={14}/></a></div>
      <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X/> : <Menu/>}</button>
      <button className="nav-cta" onClick={() => go('contact')}>Let's connect <ArrowUpRight size={15}/></button>
    </nav></header>

    <main>
      <section id="home" className="hero container">
        <div className="hero-copy reveal"><div className="eyebrow"><span/> AI · AUTOMATION · PRODUCT ENGINEERING</div><div className="availability"><b/> AVAILABLE FOR SELECT AI OPPORTUNITIES</div><h1>AI systems.<br/><em>Real products.</em><br/>Built to ship.</h1><p className="hero-text">I'm Nithish Kumar, a Software Engineer II focused on LLM applications, RAG, AI agents, enterprise automation and full-stack systems that turn complex ideas into dependable software.</p><div className="hero-actions"><button className="primary-btn" onClick={() => go('work')}>Explore selected work <ArrowUpRight size={17}/></button><button className="ghost-btn" onClick={() => go('contact')}>Start a conversation</button></div><div className="hero-metrics"><div><strong>4+</strong><span>YEARS ENGINEERING</span></div><div><strong>AI</strong><span>LLM · RAG · AGENTS</span></div><div><strong>FULL</strong><span>STACK DELIVERY</span></div></div></div>
        <div className="hero-visual"><PortfolioScene/><div className="visual-corner top-left">/ SYSTEM<br/><b>THREE.JS + GLB</b></div><div className="visual-corner bottom-right">INTERACTIVE PROFILE <span>●</span></div><div className="hero-photo-card"><img src={PROFILE_IMAGE} alt="Nithish Kumar portrait"/><div><span>ENGINEER</span><strong>NITHISH KUMAR</strong></div></div></div>
        <button className="scroll-cue" onClick={() => go('about')}><span>EXPLORE</span><ChevronDown size={17}/></button>
      </section>

      <section id="about" className="section container about-section"><div className="section-head"><span className="section-number">01</span><div><p className="section-kicker">THE ENGINEERING APPROACH</p><h2>Intelligence into <span>impact.</span></h2></div><p className="section-note">Model layer, backend, tools, data and interface designed as one system.</p></div><div className="about-grid"><div className="about-statement"><p>I work at the intersection of <strong>AI and product engineering</strong>, with a Python-first approach and a strong focus on reliable execution.</p><p>My work spans conversational AI, Salesforce automation, multi-agent workflows, retrieval systems, computer vision and production web applications.</p><div className="signature-line"><span>CHENNAI · INDIA</span><span>AI · FULL STACK · AUTOMATION</span></div></div><div className="capability-list">{capabilities.map(({ icon: Icon, title, text }) => <article key={title}><Icon size={21}/><div><h3>{title}</h3><p>{text}</p></div><ArrowUpRight size={16}/></article>)}</div></div></section>

      <section id="work" className="section work-section"><div className="container"><div className="section-head"><span className="section-number">02</span><div><p className="section-kicker">SELECTED BUILDS</p><h2>Systems I've <span>shipped.</span></h2></div><p className="section-note">AI, automation, backend and product engineering with real implementation depth.</p></div><div className="work-list">{work.map(item => <article className="work-row" key={item.title}><div className="work-index">{item.index}</div><div className="work-main"><p className="work-category">{item.category}</p><h3>{item.title}</h3><p>{item.description}</p><div className="stack">{item.stack.map(s => <span key={s}>{s}</span>)}</div></div><a className="work-link" href={item.repo} target="_blank" rel="noreferrer" aria-label={`Open ${item.title} on GitHub`}><Github size={19}/><ArrowUpRight size={15}/></a></article>)}</div></div></section>

      <section className="section company-section"><div className="container"><div className="section-head compact"><span className="section-number">03</span><div><p className="section-kicker">REAL-WORLD WORK</p><h2>Built for <span>business.</span></h2></div></div><p className="company-intro">Technology and digital product work across AI-first businesses and web platforms.</p><div className="company-grid">{companies.map(company => <a href={company.href} target="_blank" rel="noreferrer" className="company-card" key={company.name}><div className="company-symbol">{company.name.charAt(0)}</div><div><h3>{company.name}</h3><p>{company.detail}</p></div><ExternalLink size={16}/></a>)}</div></div></section>

      <section id="experience" className="section experience-section"><div className="container"><div className="section-head"><span className="section-number">04</span><div><p className="section-kicker">CAREER</p><h2>Experience with <span>depth.</span></h2></div></div><div className="experience-layout"><div className="experience-intro"><p>Engineering across AI, software, analytics and full-stack product development.</p><div className="experience-rule"/><span>2022 — NOW</span></div><div className="timeline">{experience.map(item => <article key={item.company}><span className="period">{item.period}</span><div><h3>{item.role}</h3><h4>{item.company}</h4><p>{item.text}</p></div></article>)}</div></div></div></section>

      <section className="section stack-section"><div className="container"><div className="stack-banner"><div><p className="section-kicker">TECHNOLOGY</p><h2>One stack.<br/><span>Many layers.</span></h2></div><p>Python-first backend engineering combined with modern frontend, AI infrastructure, data systems and cloud tooling.</p></div><div className="skill-cloud">{skills.map(skill => <span key={skill}>{skill}</span>)}</div></div></section>

      <section id="contact" className="section contact-section"><div className="container contact-wrap"><div className="contact-copy"><span className="section-number">05</span><p className="section-kicker">LET'S BUILD</p><h2>Have a hard problem?<br/><span>Let's make it software.</span></h2><p>For AI products, intelligent automation, full-stack systems or engineering opportunities, send a message.</p><div className="direct-contact"><a href={`mailto:${EMAIL}`}><Mail size={17}/> {EMAIL}</a><span><MapPin size={17}/> Chennai, Tamil Nadu, India</span></div></div><form className="contact-form" onSubmit={submit}><div className="form-title"><span>CONTACT</span><b>Tell me what you're building.</b></div><div className="form-row"><input required value={form.fullname} onChange={e => setField('fullname', e.target.value)} placeholder="Full name"/><input required type="email" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="Email address"/></div><div className="form-row"><input required value={form.country} onChange={e => setField('country', e.target.value)} placeholder="Country"/><input required value={form.mobile} onChange={e => setField('mobile', e.target.value)} placeholder="Mobile number"/></div><textarea required value={form.message} onChange={e => setField('message', e.target.value)} placeholder="Tell me about the project or opportunity" rows="6"/><button className="primary-btn send-btn" disabled={sending}>{sending ? 'Preparing…' : <>Send message <Send size={16}/></>}</button>{status.message && <div className={`form-status ${status.type}`}>{status.message}{status.fallback && <a href={`mailto:${EMAIL}`}>Email directly</a>}</div>}</form></div></section>
    </main>

    <footer className="footer container"><div className="footer-brand"><img className="brand-photo" src={PROFILE_IMAGE} alt="Nithish Kumar"/><div><strong>Nithish Kumar</strong><span>AI Engineer · Full Stack Developer</span></div></div><div className="footer-links"><a href="https://github.com/Nithishrish23" target="_blank" rel="noreferrer"><Github size={16}/> GitHub</a><a href="https://www.linkedin.com/in/nithishrish/" target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={14}/></a><a href={`mailto:${EMAIL}`}><Mail size={16}/> Email</a></div><span className="footer-note">Designed & engineered with intent.</span></footer>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
