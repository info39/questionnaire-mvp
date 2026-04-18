# Figma Design System Integration Rules

> Reference document for Claude + Figma MCP.  
> Covers every pattern needed to translate Figma designs into this codebase without breaking conventions.

---

## 1. Project Architecture Overview

This is a **vanilla JS / plain HTML + CSS** project. There is no framework, no bundler, no npm build step, and no component library. Everything runs in the browser as-is and is designed to be pasted into a **WordPress Elementor HTML widget**.

```
AGENT/
├── ux-intake/questionnaire/       ← Primary deliverable (Elementor widget)
│   ├── onboarding.js              ← Engine + all rendering logic (vanilla JS IIFE)
│   ├── onboarding.css             ← Scoped component styles
│   ├── data/questions.js          ← Questionnaire data (separate, swappable)
│   └── onboarding.bundle.html     ← Self-contained bundle (CSS + JS inlined)
├── form-ui/                       ← Simpler RTL form prototype (Hebrew)
│   ├── index.html
│   └── form.js
├── output/                        ← Standalone HTML pages (landing pages)
│   ├── meitar-orthopedics.html    ← Premium clinic landing page
│   └── desert-pulse.{html,js}
└── CLAUDE.md                      ← Core project rules (always read first)
```

**Key rule:** All code for a widget must be self-contained. The `onboarding.bundle.html` is the format that goes to production — CSS in a `<style>` block, JS at the bottom, no external dependencies except optionally EmailJS.

---

## 2. Token Definitions

### 2a. Questionnaire Component Tokens (`ux-intake/`)

All tokens are **CSS custom properties** declared on the root wrapper `.ux-onboarding-app`. There is no token transformation pipeline (no Style Dictionary, no Theo). Tokens are scoped — they do not leak into the host page.

```css
/* ux-intake/questionnaire/onboarding.css — .ux-onboarding-app */
--uob-accent:        #2563eb;   /* Primary blue — buttons, active states, links */
--uob-accent-hover:  #1d4ed8;   /* Hover state for accent */
--uob-accent-light:  #eff6ff;   /* Accent tint — selected options, response bubbles */
--uob-bg:            #ffffff;   /* Page/card background */
--uob-surface:       #f8fafc;   /* Sidebar, info card, reflection card background */
--uob-border:        #e2e8f0;   /* All borders */
--uob-text:          #1e293b;   /* Primary text */
--uob-text-muted:    #64748b;   /* Secondary text, labels, chapter titles */
--uob-text-light:    #94a3b8;   /* Placeholder text, minor metadata */
--uob-success:       #16a34a;   /* Success states, complete chapter indicator */
--uob-warning:       #d97706;   /* Medium complexity signal */
--uob-danger:        #dc2626;   /* Error states, high complexity signal */
--uob-radius:        10px;      /* Card / option / input border radius */
--uob-radius-sm:     6px;       /* Button / small element border radius */
--uob-shadow:        0 1px 3px 0 rgb(0 0 0 / .10), 0 1px 2px -1px rgb(0 0 0 / .10);
--uob-shadow-md:     0 4px 6px -1px rgb(0 0 0 / .10), 0 2px 4px -2px rgb(0 0 0 / .10);
--uob-font:          -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--uob-sidebar-w:     240px;
--uob-transition:    150ms ease;
```

**When implementing a Figma design for this component:** Map Figma color styles to the above tokens. Do not add raw hex values to component CSS — always reference a token. If a Figma color has no token equivalent, add the token to `.ux-onboarding-app` first.

### 2b. Landing Page Tokens (`output/`)

Landing pages use **`:root` scoped CSS variables** (global, not scoped to a wrapper). Each page defines its own palette.

```css
/* output/meitar-orthopedics.html — example premium theme */
:root {
  --navy:       #0D1B2A;
  --navy-mid:   #152338;
  --ivory:      #FAF7F2;
  --ivory-dark: #F0EBE1;
  --gold:       #C9A84C;
  --gold-light: #E2C97E;
  --gold-pale:  rgba(201,168,76,.12);
  --text:       #1C1C1C;
  --muted:      #6B6860;
  --border:     rgba(201,168,76,.25);
  --r:          8px;
  --r-lg:       16px;
}
```

**When implementing a Figma design for a landing page:** Define all palette colors as `:root` variables at the top of the `<style>` block. Use semantic names (`--navy`, `--gold`) not generic ones (`--color-1`).

---

## 3. Typography

### Questionnaire Component

System font stack only — no Google Fonts loaded:
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
font-size: 16px;
line-height: 1.6;
```

Type scale (questionnaire):
| Role | Size | Weight |
|---|---|---|
| Question heading | 22px | 700 |
| Intro heading | 28px | 800 |
| Summary heading | 26px | 800 |
| Body / option label | 15px | 500 |
| Small / muted / chapter | 13px | 600 (uppercase) |
| Micro / metadata | 11–12px | 500–700 |

### Landing Pages

Landing pages load **Google Fonts** via `<link>` in `<head>`. The pattern used in `meitar-orthopedics.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600&family=DM+Sans:wght@300;400;500;600&family=Bebas+Neue&display=swap" rel="stylesheet">
```

Semantic utility classes are added for font switching:
```css
.serif { font-family: 'Cormorant Garamond', serif; }
.bebas { font-family: 'Bebas Neue', sans-serif; }
h1,h2,h3,h4 { font-family: 'Cormorant Garamond', serif; font-weight: 500; }
```

Fluid type with `clamp()`:
```css
h1 { font-size: clamp(3rem, 6vw, 5.5rem); font-weight: 300; }
h2 { font-size: clamp(2.2rem, 4vw, 3.6rem); }
```

**When implementing Figma typography:** Use `clamp()` for headings. Use system stack for questionnaire widgets, Google Fonts only for standalone landing pages.

---

## 4. Component Library

There is no shared component library. Components are rendered via **vanilla JS string templates** (innerHTML). The pattern is:

```js
// onboarding.js — all rendering via string concatenation
OnboardingEngine.prototype._renderQuestion = function (step) {
  var html = '';
  html += '<div class="uob-step">';
  html += '<span class="uob-chapter-label">' + chapterTitle + '</span>';
  html += '<h2 class="uob-question">' + step.question + '</h2>';
  // ...
  html += '</div>';
  this.rootEl.innerHTML = html;
  this._bindStepEvents(step);
};
```

### Component Inventory (Questionnaire)

| Component | CSS class | Notes |
|---|---|---|
| Root wrapper | `.ux-onboarding-app` | All styles scoped here |
| Layout | `.uob-layout` | Flex: sidebar + main |
| Sidebar | `.uob-sidebar` | 240px, collapses to top bar on mobile |
| Chapter item | `.uob-chapter` | States: `--active`, `--complete` |
| Main area | `.uob-main` | Scrollable content pane |
| Step container | `.uob-step` | Fade-in animation on render |
| Question | `.uob-question` | 22px bold heading |
| Response bubble | `.uob-response-bubble` | Inline reply after answer; RTL-aware border |
| Option (radio/checkbox) | `.uob-option` | States: `:hover`, `--selected` |
| Textarea / Input | `.uob-textarea`, `.uob-input` | Same styles, focus ring on accent |
| Button primary | `.uob-btn.uob-btn--primary` | Accent fill |
| Button secondary | `.uob-btn.uob-btn--secondary` | Accent outline |
| Button ghost | `.uob-btn.uob-btn--ghost` | Neutral border |
| Info card | `.uob-info-card` | Transition step, surface bg |
| Reflection | `.uob-reflection` | Mid-point check-in, surface bg |
| Checkpoint | `.uob-checkpoint` | Chapter gate, surface bg |
| Tag | `.uob-tag` | Accent-light pill; `.uob-tag--secondary` for neutral |
| Signal row | `.uob-signal-row` | Key-value pair in profile card |
| Summary screen | `.uob-summary` | Full answer review |
| Intro screen | `.uob-intro` | Mode selection (A/B) |
| Submit feedback | `.uob-submit-feedback` | States: `--success`, `--error` |

---

## 5. Styling Approach

### Questionnaire
- **Scoped CSS** under `.ux-onboarding-app` — no global selectors
- **CSS custom properties** for all design decisions
- **No CSS preprocessor** — plain CSS only
- **BEM-lite naming**: block = `uob-`, element = `__`, modifier = `--`
- **Logical properties** for RTL: `border-inline-start`, `border-inline-end`, `padding-inline-*`
- **Transitions**: all interactive state changes use `var(--uob-transition)` = `150ms ease`
- **Animation**: step transitions use `@keyframes uob-fade-in` (`opacity` + `translateY(6px)`)

```css
/* RTL pattern — always use logical properties */
.uob-response-bubble {
  border-inline-start: 3px solid var(--uob-accent);
  border-radius: 0 var(--uob-radius-sm) var(--uob-radius-sm) 0;
}
[dir="rtl"] .uob-response-bubble {
  border-inline-start: none;
  border-inline-end: 3px solid var(--uob-accent);
  border-radius: var(--uob-radius-sm) 0 0 var(--uob-radius-sm);
}
```

### Landing Pages
- **Global CSS** in a single `<style>` block inside the HTML file
- **`:root` variables** for tokens
- No scoping required (each page is self-contained)
- `clamp()` for responsive type
- `scroll-behavior: smooth` on `html`

### Form Prototype (`form-ui/`)
- Inline `<style>` in `index.html`
- Plain selectors (`input[type="text"]`, `.option-item`)
- `dir="rtl"` on `<html>`
- No token system — raw values

---

## 6. Responsive Layout

### Questionnaire Breakpoints

```css
/* Desktop: sidebar left, content right */
.uob-layout { display: flex; }
.uob-sidebar { width: 240px; border-inline-end: 1px solid var(--uob-border); }

/* Tablet / Mobile ≤768px: sidebar collapses to top strip */
@media (max-width: 768px) {
  .uob-layout { flex-direction: column; }
  .uob-sidebar { width: 100%; flex-direction: row; flex-wrap: wrap; }
  .uob-chapter-list { flex-direction: row; flex-wrap: wrap; }
  .uob-main { padding: 24px 20px; }
  .uob-question { font-size: 19px; }
}

/* Small mobile ≤480px: buttons stack full-width */
@media (max-width: 480px) {
  .uob-actions { flex-direction: column-reverse; align-items: stretch; }
  .uob-btn { width: 100%; }
}
```

### Landing Pages

Use `clamp()` for type, percentage widths + `max-width` for containers, and `@media (max-width: 768px)` for layout switches. No CSS Grid frameworks — layout is hand-coded.

---

## 7. RTL Support

RTL is a first-class concern. Rules:

1. **Set direction at the root**: `this.rootEl.setAttribute('dir', this.q.meta.direction)` — pulled from questionnaire `meta.direction`
2. **Use logical CSS properties** everywhere: `margin-inline-start`, `padding-inline-end`, `border-inline-start`
3. **RTL overrides** use `[dir="rtl"] .selector` or `.ux-onboarding-app[dir="rtl"] .selector`
4. **Text alignment**: intro uses `text-align: center` which is RTL-safe; explicit overrides use `text-align: right` under `[dir="rtl"]`
5. **Hebrew content** (`form-ui/`) sets `<html dir="rtl" lang="he">` and uses `font-family: Arial, sans-serif` (system Hebrew font)

**When implementing Figma designs:** If the design is LTR-only, still use logical properties. RTL must work without a separate stylesheet.

---

## 8. Icon System

No icon library is used. Icons are referenced by **string name** in questionnaire data only (chapters: `"icon": "briefcase"`), but the engine does not render actual icons — the icon field is reserved for future use. No SVG sprites, no icon font.

For landing pages, icons are either:
- Unicode characters / emoji used sparingly
- Inline SVG (hand-written `<svg>` elements, not imported)

**When implementing Figma icons:** Use inline SVG. Do not add an icon library dependency. Keep SVGs minimal (fill only, no stroke complexity). Scope them inside the relevant component.

---

## 9. Asset Management

No CDN, no asset pipeline. All assets are:
- **Inline** (SVG, base64 if necessary)
- **External URLs** for images in landing pages (placeholder `https://images.unsplash.com/...` pattern used in `meitar-orthopedics.html`)
- **Google Fonts** loaded via `<link>` tag in landing pages only

For Elementor widget delivery, assets must either be inlined or hosted on the WordPress server. No relative file paths will work when pasted into an HTML widget.

---

## 10. Data Architecture (Questionnaire)

The questionnaire is **data-driven**. All content lives in `data/questions.js` as a `QUESTIONNAIRE` object. The engine (`onboarding.js`) is content-agnostic.

```js
var QUESTIONNAIRE = {
  meta: {
    id, title, language, direction,
    intro: { heading, body, ctaA, ctaB },
    summary: { heading, body }
  },
  chapters: [{ id, title, icon, order }],
  steps: [{
    id, chapter, modes: ["A","B"],
    type: "question" | "info" | "reflection" | "checkpoint",
    inputType: "radio" | "checkbox" | "textarea" | "text",
    question, options: [{ value, label }],
    required, response: { default, byValue: {} },
    followUps: [{ when: [], questions: [] }],
    signals: { default: {}, byValue: {} }
  }]
};
```

**Mode A** = Quick (5 min), **Mode B** = Deep dive (10 min). Steps are filtered by `modes` array.

---

## 11. Figma-to-Code Mapping Rules

When translating a Figma design into this codebase:

### For the Questionnaire Widget
1. **Do not change the HTML structure** — the engine generates all markup. Change CSS tokens only.
2. **Token mapping**: Map Figma color styles → `--uob-*` variables in `.ux-onboarding-app`
3. **Font swap**: If Figma uses a custom typeface, add it to `--uob-font` and load it via `@import` inside the `<style>` block
4. **Spacing**: Map Figma spacing values to existing padding/gap values. Do not add new spacing variables — adjust existing ones.
5. **All output goes into `onboarding.bundle.html`** as a self-contained file

### For Landing Pages
1. **One file per page** in `output/` directory
2. **`:root` variables** must be defined at the top of the `<style>` block
3. **Sections** are coded as `<section id="...">` elements
4. **Utility classes** (`.serif`, `.bebas`, `.gold-rule`) are defined once and reused
5. **No JavaScript frameworks** — interactions are vanilla JS only

### For Form Prototypes
1. Styles go inline in `index.html`, logic in `form.js`
2. Hebrew forms: `<html dir="rtl" lang="he">`
3. Form data is structured JSON in `form.js` (not a separate API call)

---

## 12. What NOT to Do

- Do not add React, Vue, or any JS framework
- Do not add a CSS preprocessor (Sass/Less)
- Do not use Tailwind or any utility-class framework
- Do not use CSS Modules or Styled Components
- Do not add external icon libraries (FontAwesome, Heroicons, etc.)
- Do not add new npm dependencies
- Do not create global CSS that could leak into the Elementor host page
- Do not use `!important` unless overriding Elementor host styles
- Do not hardcode hex values in component CSS — use tokens
- Do not use `id` selectors in CSS (use classes)
- Do not add `document.querySelector` calls that could match outside `.ux-onboarding-app`

---

## 13. Bundle Regeneration

After editing `onboarding.js` or `onboarding.css`, the bundle must be updated:

`onboarding.bundle.html` = `<style>` contents of `onboarding.css` + HTML mount point + `<script>` contents of `questions.js` + `onboarding.js`.

The bundle is the single deliverable. The source files are for editing. Both must stay in sync.
