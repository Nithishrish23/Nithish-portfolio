import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, BrainCircuit, Bot, ChevronDown, Code2, Database, ExternalLink, Github, Layers3, Mail, MapPin, Menu, Mic2, Send, ShieldCheck, Sparkles, X } from 'lucide-react';
import PortfolioScene from './PortfolioScene';
import './styles.css';

const work = [
  {
    index: '01',
    title: 'Salesforce AI Copilot',
    category: 'AI / Enterprise Automation',
    description: 'A permission-aware AI system for Salesforce that combines RAG, MCP tool orchestration and conversational workflows with approval, validation and auditability before critical actions.',
    stack: ['FastAPI', 'React', 'RAG', 'MCP', 'Salesforce', 'OpenAI', 'Claude'],
    repo: 'https://github.com/Nithishrish23/Salesforce-ai',
  },
  {
    index: '02',
    title: 'Multi-Agent Finance Platform',
    category: 'AI Agents / Finance',
    description: 'A production-oriented multi-agent platform with provider-agnostic LLM routing, workflow orchestration, memory, finance analysis, notifications and a fail-closed risk layer.',
    stack: ['Next.js', 'FastAPI', 'PostgreSQL', 'Redis', 'Celery', 'LLM Gateway'],
    repo: 'https://github.com/Nithishrish23/agent-earning',
  },
  {
    index: '03',
    title: 'Full-Stack Commerce Platform',
    category: 'Product Engineering',
    description: 'B2B/B2C e-commerce engineering across customer, seller and admin workflows, with Python APIs, PostgreSQL, authentication, authorization and payment integration.',
    stack: ['React', 'Vite', 'Flask', 'PostgreSQL', 'JWT', 'Stripe'],
    repo: 'https://github.com/Nithishrish23',
  },
  {
    index: '04',
    title: 'KYC Document Intelligence',
    category: 'Computer Vision',
    description: 'Document identification and verification workflows using computer vision for PAN, Aadhaar, address and signature documents, including Aadhaar masking.',
    stack: ['Python', 'YOLO', 'OpenCV', 'PIL', 'Computer Vision'],
    repo: 'https://github.com/Nithishrish23',
  },
];

const companies = [
  { name: 'MathuraTech', href: 'https://mathuratech.com', detail: 'Technology & digital work' },
  { name: 'Popular Traders', href: 'https://populartraders.mathuratech.com', detail: 'Web product work' },
  { name: 'Infu Digital', href: 'https://infudigital.com', detail: 'Digital growth & web' },
  { name: 'Ninai Technologies', href: 'https://www.ninaitechnologies.com', detail: 'AI & technology solutions' },
];

const capabilities = [
  { icon: BrainCircuit, title: 'LLM Engineering', text: 'OpenAI, Claude, Gemini, LLaMA, OpenRouter, structured outputs, tool calling and production AI interfaces.' },
  { icon: Bot, title: 'AI Agents & RAG', text: 'Agent orchestration, retrieval pipelines, memory, MCP, workflow execution and permission-aware automation.' },
  { icon: Code2, title: 'Backend & Product', text: 'Python, FastAPI, Flask, Django, React, Next.js, PostgreSQL and scalable API architecture.' },
  { icon: ShieldCheck, title: 'Reliable AI', text: 'Validation, approvals, role-based controls, auditability, testing and fail-closed execution for high-impact actions.' },
];

const experience = [
  { period: 'JUN 2025 — PRESENT', role: 'Software Engineer - II', company: 'CodeDTX Solutions PVT LTD', text: 'Salesforce API and Metadata integrations, intelligent automation, permission-aware action engines and LLM-powered conversational interfaces.' },
  { period: 'OCT 2024 — JUN 2025', role: 'Team Lead', company: 'PCL INFOTECH PVT LTD', text: 'B2B/B2C e-commerce engineering with Flask, React and PostgreSQL, plus AI agents for business automation.' },
  { period: 'AUG 2023 — OCT 2024', role: 'AI Software Associate', company: 'Green Books', text: 'AI/ML and image-identification software with backend optimization, testing, deployment and security.' },
];

const skills = ['Python', 'FastAPI', 'Flask', 'Django', 'React', 'Next.js', 'PostgreSQL', 'MySQL', 'SQL', 'AI / ML', 'LLMs', 'RAG', 'AI Agents', 'MCP', 'OpenAI', 'Claude', 'Gemini', 'TensorFlow', 'OpenCV', 'YOLO', 'Voice AI', 'Azure AI', 'Redis', 'Celery', 'Selenium', 'Pytest', 'Git'];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({ fullname: '', email: '', country: '', mobile: '', message: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [sending, setSending] = useState(false);

  const go = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMenuOpen(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    setStatus({ type: '', message: '' });
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Unable to send your message.');
      setStatus({ type: 'success', message: 'Thanks — your message was sent successfully.' });
      setForm({ fullname: '', email: '', country: '', mobile: '', message: '' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="site">
      <div className="ambient ambient-a" /><div className="ambient ambient-b" />
      <header className="nav-wrap">
        <nav className="nav container">
          <button className="brand" onClick={() => go('home')} aria-label="Back to home"><span className="brand-mark">N</span><span><strong>Nithish Kumar</strong><small>AI ENGINEER · FULL STACK</small></span></button>
          <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
            {['about', 'work', 'experience', 'contact'].map((item) => <button key={item} onClick={() => go(item)}>{item}</button>)}
            <a href="https://github.com/Nithishrish23" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={15}/></a>
          </div>
          <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X/> : <Menu/>}</button>
          <button className="nav-cta" onClick={() => go('contact')}>Let's connect <ArrowUpRight size={16}/></button>
        </nav>
      </header>

      <main>
        <section id="home" className="hero container">
          <div className="hero-copy reveal">
            <div className="hero-line"><span /> BUILDING INTELLIGENT SYSTEMS</div>
            <h1>AI that feels <em>engineered.</em><br/>Products that feel <em>alive.</em></h1>
            <p className="hero-text">I'm Nithish Kumar — a Software Engineer II focused on LLM applications, RAG, AI agents, enterprise automation and full-stack products that turn complex ideas into dependable software.</p>
            <div className="hero-actions"><button className="primary-btn" onClick={() => go('work')}>Explore my work <ArrowUpRight size={18}/></button><button className="ghost-btn" onClick={() => go('contact')}>Start a conversation</button></div>
            <div className="hero-meta"><span><Sparkles size={15}/> AI / LLMs</span><span><Layers3 size={15}/> Full Stack</span><span><ShieldCheck size={15}/> Production-minded</span></div>
          </div>
          <div className="hero-visual"><PortfolioScene /><div className="hero-orbit-note"><span className="pulse-dot"/> INTERACTIVE 3D PROFILE</div></div>
          <button className="scroll-cue" onClick={() => go('about')}><span>SCROLL TO EXPLORE</span><ChevronDown size={18}/></button>
        </section>

        <section id="about" className="section container about-section">
          <div className="section-head"><span className="section-number">01</span><div><p className="section-kicker">THE ENGINEERING APPROACH</p><h2>From intelligence to <span>impact.</span></h2></div></div>
          <div className="about-grid"><div className="about-statement"><p>I work at the intersection of <strong>AI and product engineering</strong> — designing the model layer, backend, tools, data and interface as one system.</p><p>My strongest work spans conversational AI, Salesforce automation, multi-agent workflows, retrieval systems, computer vision and production web applications.</p><div className="signature-line"><span>Chennai, India</span><span>Available for AI-focused opportunities</span></div></div><div className="capability-list">{capabilities.map(({ icon: Icon, title, text }) => <article key={title}><Icon size={22}/><div><h3>{title}</h3><p>{text}</p></div><ArrowUpRight size={17}/></article>)}</div></div>
        </section>

        <section id="work" className="section work-section">
          <div className="container"><div className="section-head"><span className="section-number">02</span><div><p className="section-kicker">SELECTED BUILDS</p><h2>Systems I've <span>shipped.</span></h2></div><p className="section-note">A focused selection of AI, automation, backend and product engineering work.</p></div>
            <div className="work-list">{work.map((item) => <article className="work-row" key={item.title}><div className="work-index">{item.index}</div><div className="work-main"><p className="work-category">{item.category}</p><h3>{item.title}</h3><p>{item.description}</p><div className="stack">{item.stack.map((s) => <span key={s}>{s}</span>)}</div></div><a className="work-link" href={item.repo} target="_blank" rel="noreferrer" aria-label={`Open ${item.title}`}><Github size={20}/><ArrowUpRight size={17}/></a></article>)}</div>
          </div>
        </section>

        <section className="section company-section"><div className="container"><div className="section-head compact"><span className="section-number">03</span><div><p className="section-kicker">REAL-WORLD WORK</p><h2>Built for <span>business.</span></h2></div></div><p className="company-intro">Websites and technology work I created or contributed to across digital products and AI-first businesses.</p><div className="company-grid">{companies.map((company) => <a href={company.href} target="_blank" rel="noreferrer" className="company-card" key={company.name}><div className="company-symbol">{company.name.charAt(0)}</div><div><h3>{company.name}</h3><p>{company.detail}</p></div><ExternalLink size={18}/></a>)}</div></div></section>

        <section id="experience" className="section experience-section"><div className="container"><div className="section-head"><span className="section-number">04</span><div><p className="section-kicker">CAREER</p><h2>Experience with <span>depth.</span></h2></div></div><div className="experience-layout"><div className="experience-intro"><p>4+ years across AI, software engineering, analytics and full-stack product development.</p><div className="experience-rule"/><span>2022 — NOW</span></div><div className="timeline">{experience.map((item) => <article key={item.company}><span className="period">{item.period}</span><div><h3>{item.role}</h3><h4>{item.company}</h4><p>{item.text}</p></div></article>)}</div></div></div></section>

        <section className="section stack-section"><div className="container"><div className="stack-banner"><div><p className="section-kicker">TECHNOLOGY</p><h2>One stack. <span>Many layers.</span></h2></div><p>Python-first backend engineering combined with modern frontend, AI infrastructure, data systems and cloud tooling.</p></div><div className="skill-cloud">{skills.map((skill) => <span key={skill}>{skill}</span>)}</div></div></section>

        <section id="contact" className="section contact-section"><div className="container contact-wrap"><div className="contact-copy"><span className="section-number">05</span><p className="section-kicker">LET'S BUILD</p><h2>Have a hard problem?<br/><span>Let's make it software.</span></h2><p>For AI products, intelligent automation, full-stack systems or engineering opportunities, send me a message.</p><div className="direct-contact"><a href="mailto:nithishkumar140700@gmail.com"><Mail size={18}/> nithishkumar140700@gmail.com</a><span><MapPin size={18}/> Chennai, Tamil Nadu, India</span></div></div><form className="contact-form" onSubmit={submit}><div className="form-row"><input required value={form.fullname} onChange={(e) => setForm({...form, fullname: e.target.value})} placeholder="Full name"/><input required type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} placeholder="Email address"/></div><div className="form-row"><input required value={form.country} onChange={(e) => setForm({...form, country: e.target.value})} placeholder="Country"/><input required value={form.mobile} onChange={(e) => setForm({...form, mobile: e.target.value})} placeholder="Mobile number"/></div><textarea required value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} placeholder="Tell me about the project or opportunity" rows="6"/><button className="primary-btn send-btn" disabled={sending}>{sending ? 'Sending…' : <>Send message <Send size={17}/></>}</button>{status.message && <div className={`form-status ${status.type}`}>{status.message}</div>}</form></div></section>
      </main>

      <footer className="footer container"><div className="footer-brand"><span className="brand-mark">N</span><div><strong>Nithish Kumar</strong><span>AI Engineer · Full Stack Developer</span></div></div><div className="footer-links"><a href="https://github.com/Nithishrish23" target="_blank" rel="noreferrer"><Github size={17}/> GitHub</a><a href="https://www.linkedin.com/in/nithishrish/" target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={15}/></a></div><span className="footer-note">Designed & engineered with intent.</span></footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
