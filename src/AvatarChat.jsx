import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, Sparkles, X } from 'lucide-react';

const PROFILE_IMAGE = 'https://raw.githubusercontent.com/Nithishrish23/Nithish-portfolio/98f873233766d9efe6688b559262306092e7545d/static/images/1727781988320.jpg';

const QUICK_QUESTIONS = [
  'Tell me about Nithish',
  'What AI projects has he built?',
  'What is his tech stack?',
];

export default function AvatarChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi — I'm Nithish's AI assistant. Ask me anything about his experience, projects, AI work, or engineering stack." },
  ]);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, sending]);

  const ask = async (question = input) => {
    const text = question.trim();
    if (!text || sending) return;
    const history = messages.slice(-8).map(({ role, content }) => ({ role, content }));
    setInput('');
    setMessages((items) => [...items, { role: 'user', content: text }]);
    setSending(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.reply) throw new Error(data.message || 'The assistant is unavailable right now.');
      setMessages((items) => [...items, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      setMessages((items) => [...items, { role: 'assistant', content: error.message || 'Please try again in a moment.' }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`avatar-chat ${open ? 'is-open' : ''}`}>
      {open && (
        <section className="avatar-chat-panel" aria-label="Ask Nithish AI assistant">
          <header className="avatar-chat-head">
            <div className="avatar-chat-person">
              <span className="avatar-chat-photo"><img src={PROFILE_IMAGE} alt=""/></span>
              <span><strong>Nithish AI</strong><small>Ask about my work</small></span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close assistant"><X size={17}/></button>
          </header>
          <div className="avatar-chat-messages">
            {messages.map((message, index) => (
              <div className={`avatar-message ${message.role}`} key={`${message.role}-${index}`}>
                {message.role === 'assistant' && <img src={PROFILE_IMAGE} alt=""/>}
                <p>{message.content}</p>
              </div>
            ))}
            {sending && <div className="avatar-message assistant"><img src={PROFILE_IMAGE} alt=""/><p className="typing"><i/><i/><i/></p></div>}
            <div ref={endRef}/>
          </div>
          {messages.length === 1 && <div className="avatar-quick">{QUICK_QUESTIONS.map((question) => <button key={question} onClick={() => ask(question)}>{question}</button>)}</div>}
          <form className="avatar-chat-form" onSubmit={(event) => { event.preventDefault(); ask(); }}>
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask anything about me…" aria-label="Ask about Nithish" />
            <button disabled={sending || !input.trim()} aria-label="Send question"><Send size={16}/></button>
          </form>
        </section>
      )}
      {!open && <div className="avatar-chat-tease">Ask about my work</div>}
      <button className="avatar-chat-trigger" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Close AI assistant' : 'Open AI assistant'}>
        <span className="avatar-chat-ring"><img src={PROFILE_IMAGE} alt="Nithish Kumar"/></span>
        <span className="avatar-chat-trigger-copy"><strong>Ask me</strong><small>about my work</small></span>
        <span className="avatar-chat-icon">{open ? <X size={17}/> : <MessageCircle size={17}/>}</span>
      </button>
    </div>
  );
}
