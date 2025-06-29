# PersonaOps

## 🚀 Enterprise AI Sales Intelligence Platform

PersonaOps is a full-stack, enterprise-ready SaaS platform for automated company analysis, ICP/IBP research, and sales intelligence. It leverages LLMs (Claude 3.5 Sonnet via OpenRouter), robust backend logic, strict schema enforcement, and a modern React frontend to deliver actionable business insights for B2B sales teams.

---

## 🛠️ Tech Stack
- **Frontend:** React, Vite, TypeScript, shadcn-ui, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **Database:** SQLite (with robust schema, foreign keys, and analytics)
- **AI/LLM:** OpenRouter API (Claude 3.5 Sonnet, modular agent orchestration)
- **Other:** Modular agent system, persistent caching, analytics, and CI-ready

---

## ⚡ Quickstart

### 1. Clone & Install
```sh
git clone <YOUR_GIT_URL>
cd PersonaOps
npm install
```

### 2. Start Backend
```sh
npm run server:dev
```

### 3. Start Frontend
```sh
npm run dev
```

- Frontend: [http://localhost:8080](http://localhost:8080) or [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:3001](http://localhost:3001)

---

## 🧠 Features & Architecture

### 🔹 **LLM-Powered Company Analyzer**
- Analyze any company URL for ICP/IBP, tech stack, pain points, and more
- Uses Claude 3.5 Sonnet via OpenRouter for deep research
- Strict schema enforcement and robust error handling
- Caching to avoid duplicate LLM calls (30-day expiry)

### 🔹 **Backend Pipeline**
- Express.js API with modular agent orchestration
- Endpoints for company analysis, lead enrichment, sales intelligence, and more
- Persistent SQLite database with foreign keys and analytics
- All LLM and research data saved for downstream processing

### 🔹 **Frontend**
- Modern React UI (Vite, shadcn-ui, Tailwind)
- Real-time company analysis with organized cards for all key data
- Loading, error, and success states for robust UX

### 🔹 **Caching & Data Integrity**
- 30-day cache for all LLM research (by URL)
- Foreign key constraints for both ICP and report-based caching
- Analytics endpoints for cache efficiency and hit rate

### 🔹 **Agent Orchestration**
- Modular agents for LLM, Apollo, Claude, and more
- Intelligent retry, error handling, and cost tracking
- Easy to extend for new research modules or data sources

---

## 📋 API Endpoints (Key)
- `POST /api/company-analyze` — Analyze a company URL (LLM-powered)
- `GET /api/leads` — Lead search and retrieval
- `POST /api/leads/search` — Advanced lead search
- `POST /api/email` — Email personalization
- `POST /api/upload` — Campaign upload
- `GET /api/sales-intelligence` — Sales intelligence reports
- `GET /api/icp` — ICP/IBP generation
- `GET /api/leads/analytics` — Lead analytics
- `GET /api/leads/stats` — Database statistics
- `GET /api/leads/export` — Data export
- `GET /api/leads/agent-stats` — Agent usage

---

## 🗄️ Database Schema Highlights
- **cache**: Stores LLM/analysis results, with `icpId` and `reportId` foreign keys
- **sales_intelligence_reports**: All company analysis and research data
- **icps**: Ideal/Best Customer Profiles
- **company_overview, market_intelligence, technology_stack, etc.**: Modular, normalized tables for all research facets

---

## 🔒 Security & Performance
- CORS, input validation, and SQL injection protection
- Indexed queries, batch operations, and analytics
- Automated backup and optimization scripts

---

## 🧩 Extensibility & Roadmap
- Modular agent system: add new LLMs, data sources, or research modules easily
- Webhook/event system for real-time updates (planned)
- Advanced analytics dashboard (planned)
- CI/CD and production deployment ready

---

## 🤝 Contributing
- Fork, branch, and PR as usual
- All code is TypeScript, modular, and well-documented
- See `IMPLEMENTATION_SUMMARY.md` for deep technical details

---

## 📣 Contact & Support
- For issues, use GitHub Issues
- For roadmap/features, see `IMPLEMENTATION_SUMMARY.md`

---

**PersonaOps is the foundation for next-gen AI sales intelligence.**
