import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Mail, MapPin, Phone, Send, Code2, BrainCircuit, Smartphone, Database, ExternalLink, CheckCircle2, Mic, Bot } from 'lucide-react';
import './styles.css';

const experience = [
  { period: 'June 2025 — Present', role: 'Software Engineer - II', company: 'CodeDTX Solutions PVT LTD', bullets: ['Strong experience in Salesforce API & Metadata integration, enabling intelligent automation for permissions, user management, data analysis, and administrative operations through conversational interfaces.', 'Proven ability to develop secure, permission-aware action engines that propose, validate, and execute system changes with full auditability and role-based approvals.', 'Skilled in LLM integration (OpenAI, LLaMA, Gemini, OpenRouter, and Claude) for natural language understanding, tool orchestration, and real-time AI responses.'] },
  { period: 'Oct 2024 — June 2025', role: 'Team Lead', company: 'PCL INFOTECH PVT LTD', bullets: ['Full Stack AI Developer specializing in B2B and B2C e-commerce applications using Flask, React and PostgreSQL.', 'Integrated backend systems and AI Agents to support business automation and improve user experience.'] },
  { period: 'Aug 2023 — Oct 2024', role: 'AI Software associate', company: 'Green Books', bullets: ['Worked on AI-driven image identification software and backend optimization for reliable software delivery.', 'Designed and implemented AI/ML workflows with focus on testing, deployment and security.'] }
];

const projects = [
  { name: 'Nalos AI', type: 'Current · AI / Grievance Management', text: 'AI-powered complaint and grievance experience designed to help users raise complaints through a structured digital workflow. The system focuses on capturing user concerns clearly and turning them into actionable complaint records for downstream handling.', highlights: ['AI-assisted complaint intake', 'Structured grievance information', 'User-focused complaint workflow', 'Backend and API integration'], url: 'https://github.com/Nithishrish23' },
  { name: 'TVK AI', type: 'Current · AI / User Grievance Platform', text: 'AI-based user grievance platform focused on making it easier for users to raise complaints and communicate issues through a conversational, structured experience. The work combines AI interaction with backend services and complaint-oriented workflows.', highlights: ['Conversational complaint intake', 'AI-assisted user interaction', 'Structured complaint processing', 'Backend/API integration'], url: 'https://github.com/Nithishrish23' },
  { name: 'GenFlow AI', type: 'AI / Backend', text: 'AI-driven workflow and automation platform combining backend services with intelligent task orchestration.', highlights: ['AI workflow automation', 'Backend services', 'Tool-oriented processing'], url: 'https://github.com/Nithishrish23/GenFlow-AI' },
  { name: 'KYC Detection', type: 'Computer Vision', text: 'Computer-vision work for document and identity verification workflows, focused on image-based detection and automated processing.', highlights: ['Computer vision', 'Document processing', 'Automated detection'], url: 'https://github.com/Nithishrish23' },
  { name: 'ICD-10 / ICD-11', type: 'AI / Healthcare', text: 'Intelligent data-processing work around medical coding workflows and structured healthcare information.', highlights: ['AI-assisted processing', 'Healthcare data', 'Structured coding workflow'], url: 'https://github.com/Nithishrish23' },
  { name: 'PCLMART', type: 'Full Stack Web Application', text: 'Full-stack application development combining backend services, web interfaces, database integration and business workflows.', highlights: ['React', 'Flask', 'PostgreSQL', 'Business workflows'], url: 'https://github.com/Nithishrish23' },
];

const skills = [
  'Python', 'FastAPI', 'Flask', 'Django', 'React', 'Next.js', 'JavaScript', 'HTML', 'CSS',
  'PostgreSQL', 'MySQL', 'SQL', 'Git', 'Flutter', 'Dart',
  'AI / ML', 'LLMs', 'RAG', 'AI Agents', 'Computer Vision', 'Voice Integration',
  'OpenAI', 'Claude', 'TensorFlow', 'OpenCV', 'YOLO', 'Azure AI', 'Selenium', 'Pytest', 'Tableau'
];

function App() {
  const [tab, setTab] = useState('about');
  const [form, setForm] = useState({ fullname: '', email: '', country: '', mobile: '', message: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setSending(true); setStatus({ type: '', message: '' });
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Unable to send your message.');
      setStatus({ type: 'success', message: 'Thanks! Your message was sent successfully.' });
      setForm({ fullname: '', email: '', country: '', mobile: '', message: '' });
    } catch (err) { setStatus({ type: 'error', message: err.message }); }
    finally { setSending(false); }
  };

  return <div className="shell">
    <aside className="profile glass">
      <div className="avatar">NK</div><h1>Nithish Kumar P S</h1><p className="badge">Software Engineer - II · AI & Full Stack</p>
      <p className="intro">Software Engineer II building AI-powered products across LLMs, RAG, AI agents, computer vision, voice integration, backend systems, modern web applications and Flutter.</p>
      <div className="contact-mini"><a href="mailto:nithishkumar140700@gmail.com"><Mail size={17}/> nithishkumar140700@gmail.com</a><a href="tel:+917708358913"><Phone size={17}/> +91 7708358913</a><span><MapPin size={17}/> Chennai, Tamil Nadu, India</span></div>
      <div className="socials"><a href="https://github.com/Nithishrish23" target="_blank" rel="noreferrer" aria-label="GitHub"><span className="social-mark">GH</span></a><a href="https://www.linkedin.com/in/nithishrish/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><span className="social-mark">in</span></a></div>
    </aside>
    <main className="content glass">
      <nav>{['about','experience','skills','projects','contact'].map(x => <button className={tab === x ? 'active' : ''} onClick={() => setTab(x)} key={x}>{x}</button>)}</nav>
      {tab === 'about' && <section className="page"><p className="eyebrow">AI • LLMs • RAG • Agents • Full Stack</p><h2>Engineering AI systems and production-ready applications.</h2><p className="lead">I work across Python backend engineering, modern web development, AI/ML, LLM applications, RAG pipelines, AI agents, computer vision, voice integration and Flutter development.</p><div className="cards"><article><BrainCircuit/><h3>AI & LLM Engineering</h3><p>LLM applications, RAG, AI agents, prompt-driven workflows and integrations with OpenAI and Claude.</p></article><article><Bot/><h3>AI Agents & Automation</h3><p>Tool orchestration, conversational interfaces, permission-aware actions and business automation.</p></article><article><Code2/><h3>Backend & Web</h3><p>Python, FastAPI, Flask, PostgreSQL, MySQL, React and Next.js for production applications.</p></article><article><Mic/><h3>Vision & Voice</h3><p>Computer vision systems, image-based workflows and voice-enabled AI experiences.</p></article></div><div className="current-work"><p className="eyebrow">Current work</p><h3>Nalos AI & TVK AI</h3><p>Currently working on AI-driven user grievance experiences that help users raise complaints through structured and conversational workflows, connecting AI interaction with backend services.</p></div></section>}
      {tab === 'experience' && <section className="page"><p className="eyebrow">Career</p><h2>Experience</h2>{experience.map(e => <article className="timeline" key={e.company}><span>{e.period}</span><h3>{e.role} · {e.company}</h3><ul>{e.bullets.map((bullet, i) => <li key={i}>{bullet}</li>)}</ul></article>)}</section>}
      {tab === 'skills' && <section className="page"><p className="eyebrow">Technical stack</p><h2>Skills & Expertise</h2><div className="skill-grid">{skills.map(s => <span key={s}>{s}</span>)}</div></section>}
      {tab === 'projects' && <section className="page"><p className="eyebrow">Selected & current work</p><h2>Projects</h2><div className="project-grid">{projects.map(p => <article className="project" key={p.name}><div><small>{p.type}</small><h3>{p.name}</h3><p>{p.text}</p><div className="project-tags">{p.highlights.map(h => <span key={h}>{h}</span>)}</div></div><a href={p.url} target="_blank" rel="noreferrer" aria-label={`Open ${p.name}`}><ExternalLink size={18}/></a></article>)}</div></section>}
      {tab === 'contact' && <section className="page"><p className="eyebrow">Let's connect</p><h2>Contact me</h2><p className="lead">Send a message and it will be forwarded securely to the configured Google Sheet.</p><form onSubmit={submit}><div className="form-grid"><input required value={form.fullname} onChange={e=>setForm({...form,fullname:e.target.value})} placeholder="Full name"/><input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Email address"/><input required value={form.country} onChange={e=>setForm({...form,country:e.target.value})} placeholder="Country"/><input required value={form.mobile} onChange={e=>setForm({...form,mobile:e.target.value})} placeholder="Mobile number"/></div><textarea required value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Your message" rows="6"/><button className="send" disabled={sending}>{sending ? 'Sending…' : <><Send size={17}/> Send Message</>}</button></form>{status.message && <div className={'status '+status.type}>{status.type==='success' && <CheckCircle2 size={18}/>} {status.message}</div>}</section>}
    </main>
  </div>;
}
createRoot(document.getElementById('root')).render(<App />);
