import json
import os
import urllib.error
import urllib.request

from flask import Flask, jsonify, request

app = Flask(__name__)

PROFILE = """
You are the private portfolio assistant for Nithish Kumar P S, a Chennai, Tamil Nadu based Python and AI developer.
Only describe information in this profile. Do not invent employers, dates, projects, metrics, clients, or skills.

PROFILE
- Objective: Python and AI Developer with 4+ years of IT engineering experience, focused on intelligent systems, APIs, scalable solutions, Flask/Django, TensorFlow, OpenAI and Azure AI.
- Education: Bachelor of Engineering in Computer Science, Loyola Institute of Technology, Chennai, 2018-2022, cumulative GPA 7.5.
- Current role: Software Engineer - II at CodeDTX Solutions PVT LTD, June 2025-present.
- CodeDTX work: Salesforce API and Metadata integration for intelligent automation around permissions, user management, data analysis and administrative operations through conversational interfaces. Builds secure permission-aware action engines that propose, validate and execute changes with auditability and role-based approvals. Integrates OpenAI, LLaMA, Gemini and OpenRouter for natural-language understanding, tool orchestration and real-time AI responses.
- Previous role: Team Lead at PCL INFOTECH PVT LTD, October 2024-June 2025. Built B2B/B2C e-commerce with Flask, React and PostgreSQL and connected AI agents for business automation.
- Previous role: AI Software Associate at Green Books, August 2023-October 2024. Worked on image-identification software, backend optimization, AI/ML algorithms, testing, deployment and security.
- Earlier role: Data Analyst Intern at Skill-Lync, December 2022-March 2023. Worked on trends, correlations, Tableau and Excel visualizations.

PROJECTS
- GenFlow AI - Multimodal Automation & Salesforce Intelligence: multimodal AI platform combining text LLMs and image generation, deployed and scaled on AWS; Salesforce Metadata, Tooling and REST API integration; Azure Pipelines for continuous deployment, environment validation and rollback automation; diagnostic agents for Salesforce errors, deployment issues and performance bottlenecks.
- KYC Document Detection: detects and categorizes KYC documents including first/second pages, PAN, Aadhaar, address proof and signature; masks the first eight Aadhaar digits; uses YOLO, OpenCV, PIL and Canvas.
- ICD-10/11 Medical Code Identification: Flask-based application and REST API for real-time extraction and processing of medical codes.
- PCLMART E-Commerce: Flask backend with PostgreSQL and React frontend.

SKILLS
Python, YOLO, TensorFlow, scikit-learn, Selenium, Pytest, OpenAI integration, Ollama, OCR, Flask, FastAPI, GitHub, React JS, Tailwind CSS, LangChain, Pinecone, pgvector, AI agents, SQLAlchemy, NLP, tokenization, RAG, NER, LLMs, knowledge graphs.

CONTACT
Portfolio: Nithish-Portfolio on GitHub.
Email: nithishkumar140700@gmail.com
Location: Chennai, Tamil Nadu, India.
""".strip()

FALLBACKS = {
    "who": "Nithish Kumar P S is a Python and AI developer in Chennai with 4+ years of IT engineering experience. He focuses on LLM applications, AI agents, RAG, enterprise automation, computer vision and full-stack systems.",
    "experience": "Nithish is currently a Software Engineer - II at CodeDTX Solutions. Before that he was Team Lead at PCL INFOTECH, AI Software Associate at Green Books, and a Data Analyst Intern at Skill-Lync.",
    "skills": "His profile highlights Python, Flask, FastAPI, React, PostgreSQL, LLMs, RAG, AI agents, OpenAI integration, LangChain, Pinecone, pgvector, YOLO, TensorFlow, OpenCV, NLP, NER, Selenium and Pytest.",
    "projects": "Key projects include GenFlow AI for multimodal automation and Salesforce intelligence, KYC document detection, ICD-10/11 medical-code identification, and the PCLMART e-commerce platform.",
}


def fallback_reply(message: str) -> str:
    q = message.lower()
    if any(word in q for word in ["who is", "who are", "about nithish", "introduce", "yourself"]):
        return FALLBACKS["who"]
    if any(word in q for word in ["experience", "career", "company", "work history", "job"]):
        return FALLBACKS["experience"]
    if any(word in q for word in ["skill", "stack", "technology", "tech"]):
        return FALLBACKS["skills"]
    if any(word in q for word in ["project", "built", "portfolio"]):
        return FALLBACKS["projects"]
    if any(word in q for word in ["contact", "email", "hire", "reach"]):
        return "You can reach Nithish at nithishkumar140700@gmail.com. He is based in Chennai, Tamil Nadu, India."
    return "I can answer questions about Nithish's experience, projects, skills, education and engineering work. Ask me about any of those."


def openai_reply(message: str, history: list) -> str:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return fallback_reply(message)

    model = os.getenv("OPENAI_MODEL", "gpt-5.6-luna")
    conversation = []
    for item in history[-8:]:
        role = item.get("role") if isinstance(item, dict) else None
        content = item.get("content") if isinstance(item, dict) else None
        if role in {"user", "assistant"} and content:
            conversation.append({"role": role, "content": str(content)[:2000]})
    conversation.append({"role": "user", "content": message[:4000]})

    payload = {
        "model": model,
        "instructions": (
            "You are Nithish Kumar's portfolio AI. Answer as a concise, confident professional assistant. "
            "Use only the supplied profile. If the answer is not in the profile, say that it is not listed "
            "and invite the visitor to ask about experience, projects, skills, education or contact. "
            "Never claim to be Nithish himself."
        ) + "\n\nPROFILE:\n" + PROFILE,
        "input": conversation,
        "max_output_tokens": 350,
    }

    req = urllib.request.Request(
        "https://api.openai.com/v1/responses",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {api_key}"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            data = json.loads(response.read().decode("utf-8"))
        output = []
        for item in data.get("output", []):
            for part in item.get("content", []):
                if part.get("type") == "output_text" and part.get("text"):
                    output.append(part["text"])
        return "\n".join(output).strip() or fallback_reply(message)
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, ValueError):
        return fallback_reply(message)


@app.route("/", methods=["POST"])
@app.route("/api/chat", methods=["POST"])
def chat():
    body = request.get_json(silent=True) or {}
    message = str(body.get("message", "")).strip()
    history = body.get("history", [])
    if not message:
        return jsonify({"message": "Ask me something about Nithish."}), 400
    if not isinstance(history, list):
        history = []
    try:
        reply = openai_reply(message, history)
        return jsonify({"reply": reply, "source": "ai" if os.getenv("OPENAI_API_KEY") else "profile"})
    except Exception:
        return jsonify({"reply": fallback_reply(message), "source": "profile"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=True)
