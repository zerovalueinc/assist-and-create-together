# PersonaOps 2.0 – Global Data-Fetching & Session Pattern

## 🚨 Global SaaS-Grade Data-Fetching Pattern (MANDATORY)

PersonaOps 2.0 enforces a single, robust, and scalable pattern for all user/session-aware data fetching. This is critical to prevent infinite fetch loops, quota exhaustion, and UI instability.

### **Key Rules:**

1. **Canonical User/Session State:**
   - All user/session state must come from the `useUser` hook in [`src/hooks/useUserData.ts`](src/hooks/useUserData.ts).
   - No component, hook, or context may call `supabase.auth.getSession()` or `supabase.auth.onAuthStateChange` directly—only `useUser` manages this.

2. **Memoized Supabase Client:**
   - All Supabase queries must use the client exported from [`src/lib/supabase.ts`](src/lib/supabase.ts).
   - Remove all imports from `@/integrations/supabase/client` or any other duplicate client files.

3. **Fetch Guards:**
   - All Supabase fetches must be guarded: `if (!user?.id) return;` (or equivalent) before any query.
   - Never fetch in render functions. Only fetch in guarded `useEffect` or event handlers.
   - Use refs (e.g., `hasFetched.current`) to ensure fetches only run once per user/session, unless explicitly retried.

4. **Query Scoping:**
   - All queries must be scoped: `.eq('user_id', user.id)` (or equivalent) to prevent data leaks and reduce load.

5. **Data Sanitization:**
   - Always sanitize fetched data before setting state: `JSON.parse(JSON.stringify(data))`.

6. **No Infinite Loops:**
   - Never trigger fetches on every render or in unguarded effects. Use stable dependencies and guards.

7. **Testing & Monitoring:**
   - Use Supabase logs and browser devtools to confirm only a single fetch per user/session per component.

---

## Example Usage

```tsx
import { useUser } from '../hooks/useUserData';
import { supabase } from '../lib/supabase';

function MyComponent() {
  const user = useUser();
  useEffect(() => {
    if (!user?.id) return;
    // Fetch data here, scoped by user.id
  }, [user]);
}
```

---

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

## 🚩 Save State: FULLY WORKING (Pills + LLM Save)

**Tag:** `save-state-working-pills-llm`

This tag marks the last known good, fully functional baseline for both backend and frontend.

- **Backend (Edge Function + Agent):**
  - Commit: `5c65766`
  - Message: `feat: clean Intel LLM backend with robust JSON output and OpenRouter integration (#12)`
  - ✅ LLM research is saved to Supabase as JSONB, robust, minimal, and production-ready.

- **Frontend (Pills, CompanyAnalyzer, GTM Tab):**
  - Commit: `da76f46`
  - Message: `feat: optimize company overview cards and fix company pills logic (#14)`
  - ✅ Pills display on login, after analysis, and in both Intel and GTM tabs. New reports appear immediately.

**How to restore this state:**

```
git checkout save-state-working-pills-llm
```

Or reference the tag in GitHub for deployment, debugging, or rollback.

## 🚩 Save State: INTEL TAB INSTANT UPDATE FIX

**Tag:** `save-state-intel-fix`

This tag marks the state where the Intel tab (CompanyAnalyzer) instantly updates pills and report details after analysis, even if the backend returns an array or object. No logout/login required.

- **Backend/Frontend:**
  - Commit: `70642c3`
  - Message: `Fix: handle data.output as array or object after analysis, use first element if array, add warnings/logs`
  - ✅ After running a new analysis, the new report appears immediately in the UI. Pills and report details are always correct.

**How to restore this state:**

```
git checkout save-state-intel-fix
```

Or reference the tag in GitHub for deployment, debugging, or rollback.
