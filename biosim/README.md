# BioSim — Maharashtra Board Class 11 Biology

An interactive smart biology textbook built with React + Vite. Every chapter
has a live simulator alongside topic lists, study tips, and chapter stats.

---

## Quick Start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
```

---

## Project Structure

```
biosim/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx               # React entry point
    ├── index.css              # CSS variables + global reset + keyframes
    ├── App.jsx                # Root component — layout wiring
    │
    ├── tokens/
    │   └── theme.js           # Design tokens (colors, fonts, radii)
    │
    ├── data/
    │   └── curriculum.js      # All syllabus data — units, chapters, topics
    │
    ├── hooks/
    │   └── useInterval.js     # Declarative setInterval hook
    │
    └── components/
        ├── ui/                # Reusable primitives
        │   ├── index.js       ← barrel export
        │   ├── Badge.jsx
        │   ├── Btn.jsx
        │   ├── Callout.jsx
        │   ├── Card.jsx
        │   ├── ProgressBar.jsx
        │   ├── SimHeader.jsx
        │   ├── Slider.jsx
        │   ├── StepPill.jsx
        │   └── TopicChips.jsx
        │
        ├── layout/            # Page-level layout
        │   ├── index.js       ← barrel export
        │   ├── TopBar.jsx
        │   ├── Sidebar.jsx
        │   ├── WelcomeScreen.jsx
        │   └── ChapterView.jsx
        │
        └── simulators/        # One file per chapter simulator
            ├── index.js       ← simulator registry (barrel export)
            ├── TaxonomySimulator.jsx
            ├── FiveKingdomSimulator.jsx
            ├── PlantKingdomSimulator.jsx
            ├── AnimalKingdomSimulator.jsx
            ├── CellSimulator.jsx
            ├── EnzymeSimulator.jsx
            ├── CellDivisionSimulator.jsx
            ├── PhotosynthesisSimulator.jsx
            ├── RespirationSimulator.jsx
            ├── DigestionSimulator.jsx
            ├── ExcretionSimulator.jsx
            └── PlaceholderSimulator.jsx
```

---

## Built Simulators (11)

| Chapter | Simulator | Key Interactions |
|---------|-----------|-----------------|
| Ch 01 – Living World | TaxonomySimulator | Click rank pyramid, switch organisms |
| Ch 02 – Systematics | FiveKingdomSimulator | Kingdom tabs with properties grid |
| Ch 03 – Kingdom Plantae | PlantKingdomSimulator | Life cycle phase comparison |
| Ch 04 – Kingdom Animalia | AnimalKingdomSimulator | 3D flip cards for each phylum |
| Ch 05 – Cell Structure | CellSimulator | Interactive SVG cell diagram |
| Ch 06 – Biomolecules | EnzymeSimulator | Temp/pH sliders, activity meter |
| Ch 07 – Cell Division | CellDivisionSimulator | Step-through mitosis, auto-play |
| Ch 12 – Photosynthesis | PhotosynthesisSimulator | Light/CO₂ sliders, Blackman's Law |
| Ch 13 – Respiration | RespirationSimulator | Aerobic vs anaerobic, ATP counter |
| Ch 14 – Human Nutrition | DigestionSimulator | GI tract organ explorer |
| Ch 15 – Excretion | ExcretionSimulator | ADH/GFR sliders, nephron steps |

---

## Adding a New Simulator

1. Create `src/components/simulators/MySimulator.jsx`
2. Export it from `src/components/simulators/index.js`
3. Add `simulator: 'MySimulator'` to the chapter in `src/data/curriculum.js`

That's it — no other wiring needed.

---

## Adding a New Chapter

Edit `src/data/curriculum.js`. Each chapter object shape:

```js
{
  id: 'c17',           // unique string
  num: '17',           // display number
  title: 'Chapter Title',
  desc: 'One-line description.',
  topics: ['Topic 1', 'Topic 2', ...],
  simulator: 'MySimulator',   // key from simulators/index.js
  studyTip: 'Exam tip text.',
}
```

---

## Tech Stack

- **React 18** — UI
- **Vite 5** — build tool
- **Pure inline styles** — no CSS framework, tokens from `src/tokens/theme.js`
- **Google Fonts** — Playfair Display, Outfit, DM Mono
