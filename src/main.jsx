import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Mail, MapPin, Phone, Send, Code2, BrainCircuit, Smartphone, Database, ExternalLink, CheckCircle2 } from 'lucide-react';
import './styles.css';

const experience = [
  { period: '2023 — Present', role: 'Software Engineer', company: 'GreenBooks', text: 'AI and backend development across image identification, automation, testing, deployment and secure software delivery.' },
  { period: '2022 — 2023', role: 'Data Analyst Intern', company: 'PCL INFOTECH', text: 'Data cleaning, exploratory analysis, trend identification and visualization using Python, SQL and Tableau.' },
];

const projects = [
  { name: 'GenFlow AI', type: 'AI / Backend', text: 'AI-driven workflow and automation platform.', url: 'https://github.com/Nithishrish23/GenFlow-AI' },
  { name: 'KYC Detection', type: 'Computer Vision', text: 'Document and identity verification workflow using computer vision techniques.', url: 'https://github.com/Nithishrish23' },
  { name: 'ICD-10 / ICD-11', type: 'AI / Healthcare', text: 'Medical coding workflow and intelligent data processing project.', url: 'https://github.com/Nithishrish23' },
  { name: 'PCLMART', type: 'Web Application', text: 'Full-stack application work combining backend services and web development.', url: 'https://github.com/Nithishrish23' },
];

const skills = ['Python', 'TensorFlow', 'OpenCV', 'YOLO', 'OpenAI', 'Azure AI', 'Flask', 'Django', 'FastAPI', 'SQL', 'PostgreSQL', 'MySQL', 'Selenium', 'Pytest', 'Flutter', 'Dart', 'HTML', 'CSS', 'JavaScript', 'Git', 'Tableau'];

function App() {
  const [tab, setTab] = useState('about');
  const [form, setForm] = useState({ fullname: '', email: '', country: '', mobile: '', message: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true); setStatus({ type: '', message: '' });
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
      <div className="avatar">NK</div>
      <h1>Nithish Kumar P S</h1>
      <p className="badge">AI Developer</p>
      <p className="intro">AI, backend, web and Flutter developer focused on practical software, automation and intelligent systems.</p>
      <div className="contact-mini">
        <a href="mailto:nithishkumar140700@gmail.com"><Mail size={17}/> nithishkumar140700@gmail.com</a>
        <a href="tel:+917708358913"><Phone size={17}/> +91 7708358913</a>
        <span><MapPin size={17}/> Chennai, Tamil Nadu, India</span>
      </div>
      <div className="socials">
        <a href="https://github.com/Nithishrish23" target="_blank" rel="noreferrer" aria-label="GitHub"><span className="social-mark">GH</span></a>
        <a href="https://www.linkedin.com/in/nithishrish/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><span className="social-mark">in</span></a>
      </div>
    </aside>

    <main className="content glass">
      <nav>{['about','experience','skills','projects','contact'].map(x => <button className={tab === x ? 'active' : ''} onClick={() => setTab(x)} key={x}>{x}</button>)}</nav>

      {tab === 'about' && <section className="page"><p className="eyebrow">AI • Backend • Web • Mobile</p><h2>Building useful software with AI at the core.</h2><p className="lead">I am a Computer Science Engineering graduate and software developer working across AI/ML, backend engineering, data analysis, web applications and Flutter development.</p><div className="cards"><article><BrainCircuit/><h3>AI Development</h3><p>Machine learning, computer vision, LLM integrations and automation.</p></article><article><Code2/><h3>Backend & Web</h3><p>Python, Flask, Django, FastAPI, SQL and production APIs.</p></article><article><Smartphone/><h3>Flutter Development</h3><p>Cross-platform mobile application development with Flutter and Dart.</p></article><article><Database/><h3>Data & Testing</h3><p>Python, SQL, Tableau, Selenium and Pytest for reliable software.</p></article></div></section>}

      {tab === 'experience' && <section className="page"><p className="eyebrow">Career</p><h2>Experience</h2>{experience.map(e => <article className="timeline" key={e.company}><span>{e.period}</span><h3>{e.role} · {e.company}</h3><p>{e.text}</p></article>)}<div className="education"><span>2018 — 2022</span><h3>B.E. Computer Science Engineering · Loyola Institute of Technology</h3><p>Completed Bachelor of Engineering in Computer Science Engineering with practical project experience.</p></div></section>}

      {tab === 'skills' && <section className="page"><p className="eyebrow">Technical stack</p><h2>Skills</h2><div className="skill-grid">{skills.map(s => <span key={s}>{s}</span>)}</div></section>}

      {tab === 'projects' && <section className="page"><p className="eyebrow">Selected work</p><h2>Projects</h2><div className="project-grid">{projects.map(p => <article className="project" key={p.name}><div><small>{p.type}</small><h3>{p.name}</h3><p>{p.text}</p></div><a href={p.url} target="_blank" rel="noreferrer"><ExternalLink size={18}/></a></article>)}</div></section>}

      {tab === 'contact' && <section className="page"><p className="eyebrow">Let's connect</p><h2>Contact me</h2><p className="lead">Send a message and it will be forwarded securely to the configured Google Sheet.</p><form onSubmit={submit}><div className="form-grid"><input required value={form.fullname} onChange={e=>setForm({...form,fullname:e.target.value})} placeholder="Full name"/><input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Email address"/><input required value={form.country} onChange={e=>setForm({...form,country:e.target.value})} placeholder="Country"/><input required value={form.mobile} onChange={e=>setForm({...form,mobile:e.target.value})} placeholder="Mobile number"/></div><textarea required value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Your message" rows="6"/><button className="send" disabled={sending}>{sending ? 'Sending…' : <><Send size={17}/> Send Message</>}</button></form>{status.message && <div className={'status '+status.type}>{status.type==='success' && <CheckCircle2 size={18}/>} {status.message}</div>}</section>}
    </main>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
