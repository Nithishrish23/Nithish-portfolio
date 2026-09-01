# Nithish Kumar P S — Portfolio

Personal portfolio website for **Nithish Kumar P S**, an AI Developer working across AI/ML, backend engineering, web development, data analysis, testing, and Flutter development.

## Live Portfolio

- GitHub: https://github.com/Nithishrish23
- Portfolio repository: https://github.com/Nithishrish23/Nithish-portfolio

## Tech Stack

### Frontend
- React
- Vite
- JavaScript
- HTML
- CSS

### AI / ML
- Python
- TensorFlow
- OpenCV
- YOLO
- OpenAI integrations
- Azure AI

### Backend
- Flask
- Django
- FastAPI
- REST APIs
- SQL
- PostgreSQL
- MySQL

### Mobile
- Flutter
- Dart

### Testing & Data
- Selenium
- Pytest
- Tableau

### Tools
- Git
- GitHub
- Vercel

## Portfolio Sections

The website includes:

- About
- Professional experience
- Technical skills
- Selected projects
- Contact form

## Projects

### GenFlow AI
AI-driven workflow and automation platform.

### KYC Detection
Computer-vision based document and identity verification work.

### ICD-10 / ICD-11
Medical coding and intelligent data-processing work.

### PCLMART
Full-stack application work combining backend services and web development.

## Experience

- **Software Engineer — GreenBooks** — 2023–Present
- **Data Analyst Intern — PCL INFOTECH** — 2022–2023

## Development

This project is a **React + Vite** application optimized for deployment on Vercel.

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Deployment

The project is configured for Vercel with:

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`

No Python runtime is required for the frontend deployment.

## Contact Form

The contact form posts to `/api/contact`. The serverless endpoint can forward submissions to a configured Google Apps Script Web App.

Configure the Vercel environment variable:

```text
GOOGLE_SHEET_WEBHOOK_URL=<Google Apps Script Web App /exec URL>
```

The Google Sheets editor URL is **not** a webhook URL. Deploy the project's Apps Script as a Web App and use its `/exec` endpoint.

## Project Structure

```text
.
├── api/
│   └── contact.js
├── google-apps-script/
│   └── Code.gs
├── src/
│   ├── main.jsx
│   └── styles.css
├── index.html
├── package.json
├── vite.config.js
└── vercel.json
```

## Notes

- The portfolio is intentionally frontend-first and lightweight.
- Legacy Flask/static-site deployment files are not required by the React/Vite application.
- Contact submissions require the Google Apps Script Web App endpoint to be configured in Vercel.

## License

This repository contains personal portfolio content and is intended for portfolio and professional presentation purposes.
