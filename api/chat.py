import json
import os
import urllib.error
import urllib.request

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Nithish Portfolio AI", version="1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["POST", "OPTIONS"], allow_headers=["*"])

PROFILE = """
You are the portfolio AI assistant for Nithish Kumar P S, a Chennai, Tamil Nadu based Python and AI developer.
Use ONLY the profile below. Never invent employers, dates, clients, metrics, projects or skills. Never claim to be Nithish himself.
Answer naturally and professionally. If something is not listed, say it is not listed and offer a relevant topic.

EXPERIENCE
- Software Engineer II, CodeDTX Solutions PVT LTD, June 2025-present: Salesforce API/Metadata integration, intelligent automation for permissions, user management, data analysis and administrative operations; permission-aware action engines with proposals, validation, execution, auditability and role-based approvals; LLM integration.
- Team Lead, PCL INFOTECH PVT LTD, October 2024-June 2025: B2B/B2C e-commerce using Flask, React and PostgreSQL plus AI agents for business automation.
- AI Software Associate, Green Books, August 2023-October 2024: image-identification software, backend optimization, AI/ML algorithms, testing, deployment and security.
- Data Analyst Intern, Skill-Lync, December 2022-March 2023: trends/correlations, Tableau and Excel visualizations.

PROJECTS
- GenFlow AI: multimodal automation and Salesforce intelligence using text LLMs, image generation, Salesforce Metadata/Tooling/REST APIs, AWS, Azure Pipelines and diagnostic agents.
- KYC Document Intelligence: YOLO/OpenCV/PIL/Canvas for PAN, Aadhaar, address/signature and page classification, including Aadhaar masking.
- ICD-10/11 Medical Code Identification: Flask application and REST API for real-time extraction.
- PCLMART: Flask/PostgreSQL backend and React frontend.

SKILLS
Python, Flask, FastAPI, Django, React, Tailwind, PostgreSQL, SQLAlchemy, TensorFlow, YOLO, OpenCV, OCR, NLP, NER, scikit-learn, Selenium, Pytest, LLMs, RAG, AI agents, LangChain, OpenAI integration, Ollama, Pinecone, pgvector, knowledge graphs, Salesforce APIs, AWS, Azure.

EDUCATION
BE Computer Science, Loyola Institute of Technology, Chennai, 2018-2022, GPA 7.5.

CONTACT
Email: nithishkumar140700@gmail.com. Location: Chennai, Tamil Nadu, India.
""".strip()

class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []


def fallback_reply(message: str) -> str:
    q = message.lower()
    if any(x in q for x in ["who", "about nithish", "introduce"]):
        return "Nithish Kumar P S is a Python and AI developer in Chennai with 4+ years of IT engineering experience, focused on LLM applications, RAG, AI agents, enterprise automation, computer vision and full-stack systems."
    if any(x in q for x in ["experience", "career", "company", "work history"]):
        return "Nithish is currently a Software Engineer II at CodeDTX Solutions. Previously he was Team Lead at PCL INFOTECH, AI Software Associate at Green Books, and Data Analyst Intern at Skill-Lync."
    if any(x in q for x in ["skill", "stack", "technology", "tech"]):
        return "His stack includes Python, FastAPI, Flask, React, PostgreSQL, LLMs, RAG, AI agents, OpenAI-compatible integrations, Ollama, LangChain, Pinecone, pgvector, YOLO, TensorFlow and OpenCV."
    if any(x in q for x in ["project", "built"]):
        return "Key builds include GenFlow AI/Salesforce intelligence, KYC document intelligence, ICD-10/11 medical-code identification and PCLMART e-commerce."
    if any(x in q for x in ["contact", "email", "hire", "reach"]):
        return "You can reach Nithish at nithishkumar140700@gmail.com. He is based in Chennai, Tamil Nadu, India."
    return "Ask me about Nithish's experience, projects, skills, education, AI work or engineering stack."


def ollama_reply(message: str, history: list[dict]) -> str:
    base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1").rstrip("/")
    model = os.getenv("OLLAMA_MODEL", "gpt-oss:20b")
    api_key = os.getenv("OLLAMA_API_KEY", "ollama")
    messages = [{"role": "system", "content": PROFILE}]
    for item in history[-8:]:
        if item.get("role") in {"user", "assistant"} and item.get("content"):
            messages.append({"role": item["role"], "content": str(item["content"])[:2000]})
    messages.append({"role": "user", "content": message[:4000]})
    payload = {"model": model, "messages": messages, "temperature": 0.35, "max_tokens": 450}
    req = urllib.request.Request(
        f"{base_url}/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {api_key}"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=45) as response:
        data = json.loads(response.read().decode("utf-8"))
    return data["choices"][0]["message"]["content"].strip()


@app.post("/")
@app.post("/api/chat")
def chat(body: ChatRequest):
    message = body.message.strip()
    if not message:
        return {"message": "Ask me something about Nithish."}
    try:
        reply = ollama_reply(message, body.history)
        return {"reply": reply, "source": "ollama"}
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, KeyError, ValueError):
        return {"reply": fallback_reply(message), "source": "profile"}
