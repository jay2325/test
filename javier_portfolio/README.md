# Javier Hernandez — Portfolio

A simple, fast, accessible portfolio to showcase sports & entertainment marketing campaigns with **evidence-backed case studies**.

## 🚀 Quick Start
1) Open `index.html` locally to preview.
2) Update `data/projects.json` with your real projects (video links, metrics, evidence URLs).
3) Drop any cover images into `assets/` and reference them in `projects.json`.
4) Deploy via GitHub Pages, Netlify, or Vercel (instructions below).

## ✏️ How to Edit `data/projects.json`
Each project supports:
```json
{
  "title": "Gatorlyte Launch — Jayson Tatum",
  "brand": "Gatorade",
  "campaign": "Rapid Rehydration",
  "year": "2023",
  "role": "Campaign Coordination · Shoot Support · Asset QC",
  "summary": "One-liner that explains the goal and your contribution.",
  "channels": ["TV","OOH","YouTube","TikTok","Social"],
  "badges": ["Athlete","Multi-channel"],
  "tags": ["sports","tv","social"],
  "video": "https://www.youtube.com/embed/XXXXXXXX",
  "cover": "assets/cover1.jpg",
  "metrics": [
    "Replace with ADA-verified metrics you can share publicly"
  ],
  "evidence": { "label": "ADA Amplify Report", "url": "#" }
}
```
> ⚠️ Only publish **non-confidential** metrics and links. If an ADA PDF is confidential, host a **View-Only** link with access requests or use a redacted case study.

## 🌗 Dark/Light Mode
Use the ◐ toggle in the nav (persists via localStorage).

## 🛠 Tech
- Static HTML/CSS/JS (no frameworks)
- Accessible patterns (semantic tags, dialog modal)
- Filter + search + modal case-study view
- Data-driven via `projects.json`

## 📤 Deploy Options
### 1) GitHub Pages (free)
- Create a new repo (e.g., `javier-portfolio`), upload these files.
- Settings → Pages → “Deploy from Branch”, select `main` and `/ (root)`.
- Your site will be at `https://<your-username>.github.io/javier-portfolio/`

### 2) Netlify (drag‑and‑drop)
- Go to https://app.netlify.com/ → Add new site → Drag the `javier_portfolio` folder.
- Netlify gives you a URL; set a custom domain if you want.

### 3) Vercel (one‑click)
- Go to https://vercel.com/ → New Project → Import GitHub repo or “Deploy Project” from local.
- Root directory = this folder. Deploy.

## 🔍 SEO Tips
- Edit `<title>` and `<meta name="description">` in `index.html`.
- Add an OpenGraph image (1200×630) in `/assets` and reference it in `<meta property="og:image">`.

## 📇 Resume Link
Place your PDF in `/assets/` and link it from `index.html` if desired.

## 🧪 Local Testing
Just open `index.html` in a browser. For fetch of `projects.json` to work locally in some browsers, you may need a simple server:
```bash
# Python 3
python -m http.server 5500
# then visit http://localhost:5500
```

---
Built for fast recruiter review and credible, evidence-backed storytelling.
