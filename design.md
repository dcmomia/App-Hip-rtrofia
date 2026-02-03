# HYPERTROPHY-X: DESIGN SYSTEMS & UI RULES

## 1. Visual Identity (Mega-Premium UX)
The project follows a "Tactical Sci-Fi" aesthetic with high-contrast elements, glassmorphism, and dynamic accents.

### Color Palette
- **Background:** `#08080a` (Deep Space Dark)
- **Surface:** `rgba(255, 255, 255, 0.03)` (Glass)
- **Primary Accent:** `#00d4ff` (Cyan Glow)
- **Secondary Accent:** `#a855f7` (Purple Electric)
- **Text Primary:** `#ffffff`
- **Text Secondary:** `#94a3b8` (Muted Slate)

### Dynamic Mesocycle Accents
Each meso has a unique identity:
- **Meso 1:** Cyan (`#00d4ff`)
- **Meso 2:** Purple (`#a855f7`)
- **Meso 3:** Amber (`#fbbf24`)
- **Meso 4:** Red (`#ef4444`)
- **Meso 5:** Green (`#10b981`)

## 2. UI Components & Tokens
### Glassmorphism
- **Blur:** 20px
- **Border:** `1px solid rgba(255, 255, 255, 0.08)`
- **Shadow:** `0 12px 40px 0 rgba(0, 0, 0, 0.7)`

### Typography
- **Core Font:** 'Outfit', 'Inter', sans-serif.
- **Headings:** 900 weight, negative letter-spacing (-2px), drop-shadow glow.

### Transitions
- **Hover:** `translateY(-3px)`, filtering brightness, glow expansion.
- **Duration:** 0.3s cubic-bezier(0.4, 0, 0.2, 1).

## 3. UI Implementation Rules
1. **No Hard Colors:** Use CSS variables (`--accent-color`) instead of hex values in components.
2. **Contextual Scaling:** Cards must have hover effects that suggest interactivity.
3. **Data Visualization:** Use `Recharts` with custom tooltips that match the Glassmorphism style.
4. **Mobile-First:** Ensure all interactions are touch-friendly (min 44px hit areas).
