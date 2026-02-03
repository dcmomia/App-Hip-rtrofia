# HYPERTROPHY-X: TECHNICAL SPECIFICATIONS

## 1. Tech Stack
- **Frontend:** React + Vite + PWA.
- **Backend:** Supabase (PostgreSQL + Auth).
- **Navigation:** HashRouter (for GitHub Pages compatibility).
- **UI/UX:** Vanilla CSS (Mega-Premium Glassmorphism).
- **Analytics:** Recharts.

## 2. Dynamic Architecture
### Israetel Engine (v2)
Lógica de volumen basada en principios científicos de hipertrofia:
- **Load Adjustment:** +2.5kg if upper range is met with RIR target.
- **Volume Alerts:** Dynamic adjustment ("+1 Set" / "-1 Set") based on recovery trends.
- **Deload Detection:** Proactive detection of accumulated fatigue weeks.

### Persistence Strategy
- **Cloud:** Supabase `sessions` and `sets` tables.
- **Local:** `localStorage` drafts with 24h persistence.
- **Sync:** `LocalSyncQueue` for handling network failures and retries.

## 3. Data Shema (Summary)
- `sessions`: ID, user_id, type, date, notes, volume_score, recovery_score.
- `sets`: ID, session_id, exercise_id, weight, reps, rir, sfr, tempo, order.

## 4. Key Components
- `SupabaseService.js`: Core data logic.
- `IsraetelEngine.js`: Calculation engine.
- `ProgressDashboard.jsx`: Data visualization.
- `MacroCycleView.jsx`: High-level program management.
