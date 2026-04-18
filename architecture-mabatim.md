# ארכיטקטורת דף נחיתה — מבטים הדמיות

מסמך אפיון מבני ליישום ב־**HTML/CSS וניל** בלבד, מוכן להטמעה כווידג'ט ב־Elementor, בהתאם לכללי [`FIGMA_DESIGN_SYSTEM.md`](./FIGMA_DESIGN_SYSTEM.md).

---

## 1. עקרונות יישום (חובה)

| נושא | החלטה |
|------|--------|
| **מסגרת** | ללא פריימוורק, ללא bundler, ללא npm |
| **טוקנים** | משתני CSS תחת מעטפת אחת: כל צבע, רדיוס, צל, מרווח טיפוגרפי ו־transition יוגדרו כ־`--uob-*` על המעטפת (לא ערכי hex ישירים ברכיבים) |
| **כיוון** | `dir="rtl"` ו־`lang="he"` בשורש המעטפת; ב־CSS שימוש במאפיינים לוגיים בלבד: `margin-inline-*`, `padding-inline-*`, `border-inline-*`, `inset-inline-*`, `text-align: start` וכו' |
| **בידוד מ־Elementor** | כל הסלקטורים מתחילים מתוך בלוק השורש (למשל `.mabatim-landing …`) כדי למנוע דליפת סגנונות ולמנוע התנגשות עם ערכת הנושא |
| **נגישות** | כותרות היררכיות ללא דילוגים; טפסים עם `<label>` מקושר; אקורדיון וקרוסלה עם תפקידי ARIA וניווט מקלדת (או דפוס native שמספק זאת) |
| **טיפוגרפיה** | Google Fonts — **Assistant** או **Heebo** (בחירה אחת לכל הדף), טעינה ב־`<link>` ב־`<head>` של `index.html` בלבד |
| **אייקונים** | ללא ספריית אייקונים; אם נדרש — SVG מוטמע מינימלי |
| **רספונסיביות** | `clamp()` לכותרות; מיכל עם `max-width` + `padding-inline`; שבירה ב־`@media (max-width: 768px)` (ותיקון נקודתי ל־480px במקומות צפופים) |

---

## 2. עץ קבצים

```
AGENT/
└── output/
    └── mabatim-landing/
        ├── index.html      # מבנה סמנטי מלא, קישור ל־styles.css ול־Google Fonts
        └── styles.css      # כל משתני --uob-* (על השורש), כלל הסגנונות, מדיה־קווריז
```

**הערת משלוח ל־Elementor (שלב מאוחר):** ניתן לייצר גרסת `mabatim-landing.bundle.html` — העתקת תוכן `styles.css` לתוך `<style>` בתוך המעטפת, וטעינת סקריפט וניל קטן (אם נוסף) לפני `</body>`, ללא נתיבים יחסיים לקבצים — בהתאם לסעיף Bundle במסמך העיצוב.

---

## 3. מעטפת שורש, טוקנים וטיפוגרפיה

### 3.1 מבנה שורש ב־HTML

- אלמנט יחיד עוטף את כל הווידג'ט (למשל `<div class="mabatim-landing" dir="rtl" lang="he">` או `<section class="mabatim-landing" …>` אם מתאים למודל התוכן).
- בתוך המעטפת: אזור **עיקרי** אחד `<main class="mabatim-landing__main">` המכיל את כל הסקשנים.
- אין `<h1>` מחוץ ל־Hero; אין כותרות "לתצוגה בלבד" בדרגה שגויה — ראה סעיף 5.

### 3.2 טוקנים (`--uob-*`) ב־`styles.css`

להגדיר על `.mabatim-landing` (או `:root` רק אם מוותרים על בידוד — **לא מומלץ ל־Elementor**):

- **צבעים:** `--uob-accent`, `--uob-accent-hover`, `--uob-accent-light`, `--uob-bg`, `--uob-surface`, `--uob-border`, `--uob-text`, `--uob-text-muted`, `--uob-text-light` (+ אופציונלי: `--uob-success` אם יש משוב טפסים).
- **מרחק ועיגול:** `--uob-radius`, `--uob-radius-sm`, `--uob-shadow`, `--uob-shadow-md`.
- **טיפוגרפיה:** `--uob-font` (משפחת Assistant/Heebo + גיבוי מערכת), `--uob-transition`.
- **פריסה:** `--uob-container-max`, `--uob-section-space`, `--uob-gap` (מרווח אחיד בין כרטיסים/פריטים).

בפריסה להשתמש ב־`gap` בגריד/פלקס, ב־`padding-block` / `padding-inline` לסקשנים.

### 3.3 סולם כותרות (כל הדף)

| רמה | שימוש |
|-----|--------|
| **h1** | פעם אחת בלבד — כותרת ה־Hero (Section 1) |
| **h2** | תת־כותרת ב־Hero; כותרת אזור הטופס ב־Hero; כותרת כל סקשן (2–9) |
| **h3** | כרטיסי קהל יעד; פריטי ערך; שלבי תהליך; כותרות קטגוריות בגלריה; כותרת שאלה באקורדיון (או כותרת משנה בכרטיס המלצה) |

**הערה:** ב־Section 6, שמות הקטגוריות יכולים להיות **h3**; כותרת משנה לגלריה (אם תתווסף) תישאר **p** עם מחלקת עיצוב כדי לא לשבור היררכיה.

---

## 4. מבנה HTML, BEM ותוכן — לפי סקשנים

**קונבנציית BEM**

- **בלוק:** `mabatim-landing` (שורש), ולכל סקשן בלוק משלו עם קידומת `mabatim-` + שם התחום.
- **אלמנט:** `בלוק__שם` (למשל `mabatim-hero__title`).
- **מודיפייר:** `בלוק--מצב` או `בלוק__אלמנט--מצב` (למשל `mabatim-gallery__item--placeholder`).

---

### Section 1 — Hero (`mabatim-hero`)

**תפקיד:** פתיחה, מסר מרכזי, רשימת יתרונות קצרה, טופס יצירת קשר ראשון.

**מבנה תגיות (מומלץ):**

```text
<section class="mabatim-hero" id="mabatim-hero" aria-labelledby="mabatim-hero-heading">
  <div class="mabatim-hero__inner">                    <!-- מיכל מרכזי -->
    <header class="mabatim-hero__header">
      <h1 class="mabatim-hero__title" id="mabatim-hero-heading">…</h1>
      <h2 class="mabatim-hero__subtitle">ליזמי נדל"ן, חברות בנייה ואדריכלים…</h2>
      <p class="mabatim-hero__lead">…פסקה…</p>
    </header>
    <ul class="mabatim-hero__bullets">
      <li class="mabatim-hero__bullet">…</li> ×3
    </ul>
    <aside class="mabatim-hero__cta mabatim-contact" aria-labelledby="mabatim-hero-form-heading">
      <h2 class="mabatim-contact__title" id="mabatim-hero-form-heading">יש לכם פרויקט שצריך הדמיות אדריכליות?</h2>
      <form class="mabatim-contact__form" …>…</form>
    </aside>
  </div>
</section>
```

**תוכן טקסטואלי (לפי האפיון):**

- **h1:** הדמיות אדריכליות שמקדמות פרויקטים - ולא מעכבות אותם.
- **שורה מתחת ל־h1 (מסוג h2 ויזואלי):** ליזמי נדל"ן, חברות בנייה ואדריכלים שרוצים לדעת שיש מי שמחזיק להם את הגב ברגעים הקריטיים.
- **פסקה:** "מבטים הדמיות" הוא סטודיו המתמחה… (הטקסט המלא מהאפיון).
- **רשימה:** שלוש הנקודות (וועדות/דיירים; משקיעים/מימון; שיווק ומכירות).

**טופס (`mabatim-contact__form`):** שדות מינימליים (שם, טלפון/אימייל, הודעה קצרה), כפתור שליחה; כל שדה עם `<label for="…">` ו־`id` תואם; `aria-describedby` אופציונלי להנחיות.

**היררכיית Hero:** `h1` (מסר ראשי) ואחריו `h2.mabatim-hero__subtitle` (קהל יעד) בתוך `<header>`; כותרת טופס ה־CTA היא `h2` נפרד בתוך `<aside class="mabatim-contact">` — שני ה־`h2` מופרדים למקטעים סמנטיים (לא אחד אחרי השני באותו קונטקסט שטוח בלבד).

---

### Section 2 — Target Audience (`mabatim-audience`)

**תפקיד:** ארבע כרטיסיות בגריד.

```text
<section class="mabatim-audience" id="mabatim-audience" aria-labelledby="mabatim-audience-heading">
  <div class="mabatim-audience__inner">
    <h2 class="mabatim-audience__title" id="mabatim-audience-heading">למי הדמיות של מבטים הכי מתאימות?</h2>
    <div class="mabatim-audience__grid">
      <article class="mabatim-audience-card">…</article> ×4
    </div>
  </div>
</section>
```

**כרטיס (`mabatim-audience-card`):**

```text
<article class="mabatim-audience-card">
  <h3 class="mabatim-audience-card__title">…</h3>
  <p class="mabatim-audience-card__text">…טקסט גוף…</p>
</article>
```

**כותרות h3 (לפי סדר):**

1. יזמי נדל"ן וחברות בנייה  
2. אדריכלים ומנהלי פרויקטים  
3. גופים ציבוריים ומוסדות  
4. מי פחות מתאים?  

---

### Section 3 — Value Proposition (`mabatim-value`)

**תפקיד:** ארבעה פריטי ערך בגריד.

```text
<section class="mabatim-value" id="mabatim-value" aria-labelledby="mabatim-value-heading">
  <div class="mabatim-value__inner">
    <h2 class="mabatim-value__title" id="mabatim-value-heading">מה הדמיות של מבטים עושות עבור הפרויקט שלכם</h2>
    <div class="mabatim-value__grid">
      <article class="mabatim-value-item">…</article> ×4
    </div>
  </div>
</section>
```

**פריט (`mabatim-value-item`):**

```text
<article class="mabatim-value-item">
  <h3 class="mabatim-value-item__title">קיצור תהליכי תכנון ורישוי.</h3>
  <!-- או כותרת קצרה ללא נקודה — לפי עיצוב -->
  <p class="mabatim-value-item__text" hidden>…</p>
  <!-- אם אין טקסט משנה — להשמיט את הפסקה; אם יש הרחבה בעתיד — לא hidden -->
</article>
```

**ארבעת הכותרות (תוכן):**

- קיצור תהליכי תכנון ורישוי.  
- כלי עבודה חזק לשיווק ומכירות.  
- תהליך איטרטיבי שמטייב את התוצאה.  
- ראש שקט מול ספק אחד מנוסה.  

אם פריט הוא רק שורה אחת — מספיק `h3` + עיצוב; אם נדרש פירוט — `p` תחת ה־h3.

---

### Section 4 — Why Us (`mabatim-why`)

**תפקיד:** ארבעה נקודות יתרון.

```text
<section class="mabatim-why" id="mabatim-why" aria-labelledby="mabatim-why-heading">
  <div class="mabatim-why__inner">
    <h2 class="mabatim-why__title" id="mabatim-why-heading">למה יזמים ואדריכלים בוחרים לעבוד עם מבטים</h2>
    <ul class="mabatim-why__list">
      <li class="mabatim-why-card">…</li> ×4
    </ul>
  </div>
</section>
```

**פריט רשימה ככרטיסיה (`mabatim-why-card`):**

```text
<li class="mabatim-why-card">
  <p class="mabatim-why-card__text">ניסיון של 15 שנה</p>
</li>
```

(או מבנה עם `span.mabatim-why-card__label` אם יתווסף אייקון SVG.)

**תוכן ארבעת הפריטים:** ניסיון 15 שנה; הבנה מהירה של התכנון; מחויבות לשביעות רצון; תקשורת נעימה.

---

### Section 5 — Workflow (`mabatim-workflow`)

**תפקיד:** ציר זמן של 6 שלבים.

```text
<section class="mabatim-workflow" id="mabatim-workflow" aria-labelledby="mabatim-workflow-heading">
  <div class="mabatim-workflow__inner">
    <h2 class="mabatim-workflow__title" id="mabatim-workflow-heading">כך נראה תהליך העבודה יחד</h2>
    <ol class="mabatim-workflow__timeline">
      <li class="mabatim-workflow-step">…</li> ×6
    </ol>
  </div>
</section>
```

**שלב (`mabatim-workflow-step`):**

```text
<li class="mabatim-workflow-step">
  <span class="mabatim-workflow-step__index" aria-hidden="true">1</span>
  <h3 class="mabatim-workflow-step__title">שיחת פתיחה</h3>
</li>
```

**סדר השלבים:** 1 שיחת פתיחה → 2 הצעת מחיר → 3 העברת חומרים → 4 סקיצות ראשונות → 5 סבבי תיקונים → 6 הדמיות סופיות.

**נגישות:** `<ol>` שומר על סדר סמנטי; מספרים ויזואליים ב־`aria-hidden` אם כפולים למספר הרשימה.

---

### Section 6 — Gallery & Services (`mabatim-gallery`)

**תפקיד:** קטגוריות טקסטואליות + גריד תמונות (placeholder).

```text
<section class="mabatim-gallery" id="mabatim-gallery" aria-labelledby="mabatim-gallery-heading">
  <div class="mabatim-gallery__inner">
    <h2 class="mabatim-gallery__title" id="mabatim-gallery-heading">סוגי הדמיות ופרויקטים</h2>
    <nav class="mabatim-gallery__categories" aria-label="סוגי הדמיות">
      <ul class="mabatim-gallery__category-list">
        <li class="mabatim-gallery__category-item"><h3 class="mabatim-gallery__category-title">הדמיות מבנים</h3></li>
        …
      </ul>
    </nav>
    <div class="mabatim-gallery__grid" role="list">
      <figure class="mabatim-gallery__item mabatim-gallery__item--placeholder" role="listitem">…</figure>
      <!-- חזרה לפי מספר פרויקטים -->
    </div>
  </div>
</section>
```

**קטגוריות (h3 בתוך פריט רשימה):** הדמיות מבנים; שכונות; תשתיות; סיורים וירטואליים.

**פריט גלריה (`mabatim-gallery__item`):**

- `<figure>` + `<img>` (או `div` עם רקע וטקסט "Placeholder" אם אין URL סופי) + `<figcaption class="mabatim-gallery__caption">` אופציונלי.
- מודיפייר `--placeholder` לסגנון אזהרה/אפור עד החלפת נכסים.

---

### Section 7 — Testimonials (`mabatim-testimonials`)

**תפקיד:** המלצות — קרוסלה או כרטיסיות **ללא ספרייה**.

**מבנה בסיס (עובד בלי JS):**

```text
<section class="mabatim-testimonials" id="mabatim-testimonials" aria-labelledby="mabatim-testimonials-heading">
  <div class="mabatim-testimonials__inner">
    <h2 class="mabatim-testimonials__title" id="mabatim-testimonials-heading">מה אומרים יזמים ואדריכלים שעבדו עם מבטים</h2>
    <div class="mabatim-testimonials__carousel" data-mabatim-carousel>
      <div class="mabatim-testimonials__track" role="region" aria-label="המלצות" tabindex="0">
        <blockquote class="mabatim-testimonial-card" cite="">…</blockquote> ×N
      </div>
      <div class="mabatim-testimonials__controls">
        <button type="button" class="mabatim-testimonials__btn mabatim-testimonials__btn--prev" aria-label="המלצה קודמת">…</button>
        <button type="button" class="mabatim-testimonials__btn mabatim-testimonials__btn--next" aria-label="המלצה הבאה">…</button>
      </div>
    </div>
  </div>
</section>
```

**כרטיס (`mabatim-testimonial-card`):**

```text
<blockquote class="mabatim-testimonial-card" cite="">
  <p class="mabatim-testimonial-card__quote">…</p>
  <footer class="mabatim-testimonial-card__footer">
    <cite class="mabatim-testimonial-card__author">שם, תפקיד</cite>
  </footer>
</blockquote>
```

**יישום קרוסלה:** CSS `scroll-snap` על `.mabatim-testimonials__track` + סקריפט וניל קטן בקובץ עתידי `mabatim-landing.js` (אופציונלי בשלב זה) לכפתורים; ללא JS הגלילה האופקית עדיין נגישה במקלדת אם `tabindex="0"` וגלילה ממוקדת.

---

### Section 8 — FAQ (`mabatim-faq`)

**תפקיד:** אקורדיון שאלות נפוצות.

**אפשרות A (מומלץ לוויל — ללא JS):** `<details>` / `<summary>` לכל פריט.

```text
<section class="mabatim-faq" id="mabatim-faq" aria-labelledby="mabatim-faq-heading">
  <div class="mabatim-faq__inner">
    <h2 class="mabatim-faq__title" id="mabatim-faq-heading">שאלות נפוצות על תהליך העבודה</h2>
    <div class="mabatim-faq__accordion">
      <details class="mabatim-faq-item">
        <summary class="mabatim-faq-item__question">שאלה</summary>
        <div class="mabatim-faq-item__answer">
          <p>תשובה…</p>
        </div>
      </details>
      …
    </div>
  </div>
</section>
```

**אפשרות B (ARIA מלא):** כפתור מורחב/מכווץ + `aria-expanded` + `id` לתשובה — דורש JS; לא חובה אם `details` מספק.

**תוכן:** שאלות על שינויים, זמנים, תמחור (טקסט placeholder בעת פיתוח).

---

### Section 9 — Final CTA (`mabatim-cta-final`)

**תפקיד:** חזרה על קריאה לפעולה + טופס.

```text
<section class="mabatim-cta-final" id="mabatim-cta-final" aria-labelledby="mabatim-cta-final-heading">
  <div class="mabatim-cta-final__inner">
    <h2 class="mabatim-cta-final__title" id="mabatim-cta-final-heading">יש לכם פרויקט שצריך הדמיות אדריכליות?</h2>
    <p class="mabatim-cta-final__text">…טקסט קצר…</p>
    <div class="mabatim-cta-final__contact mabatim-contact">
      <form class="mabatim-contact__form mabatim-contact__form--footer" …>…</form>
    </div>
  </div>
</section>
```

**שיתוף בלוק טופס:** אותו בלוק `mabatim-contact` כמו ב־Hero; מודיפייר `--footer` להבדלי ריווח אם נדרש.

---

## 5. רכיב משותף — טופס יצירת קשר (`mabatim-contact`)

מחלקות מומלצות:

| אלמנט | מחלקה |
|--------|--------|
| עוטף טופס + כותרת | `mabatim-contact` |
| כותרת מעל הטופס | `mabatim-contact__title` |
| טופס | `mabatim-contact__form` (+ `mabatim-contact__form--footer`) |
| שורת שדה | `mabatim-contact__field` |
| תווית | `mabatim-contact__label` |
| קלט | `mabatim-contact__input`, `mabatim-contact__textarea` |
| כפתור שליחה | `mabatim-contact__submit` (או `mabatim-btn mabatim-btn--primary`) |

כפתור ראשי כללי (אם יופיע מחוץ לטופס): בלוק `mabatim-btn`, מודיפיירים `--primary` / `--secondary`.

---

## 6. נקודות רספונסיביות (למימוש ב־CSS)

- **Hero:** עד 768px — מעבר מגריד דו־עמודתי (אם קיים) לעמודה אחת; טופס ברוחב מלא.
- **קהל יעד / ערך:** גריד 4 עמודות → 2 → 1 לפי שבירות.
- **גלריה:** גריד `auto-fill` עם `minmax` לוגי ב־`min()` כדי למנוע גלישה.
- **ציר זמן:** קו אנכי עם `border-inline-start` על המסלול; בנייד — ריווח מוגבר בין שלבים.

---

## 7. צ'קליסט לפני קוד

- [ ] כל הצבעים והצללים דרך `--uob-*` על `.mabatim-landing`
- [ ] אין סלקטורים גלובליים בלי קידומת `.mabatim-landing`
- [ ] מרווחים וגבולות במאפיינים לוגיים
- [ ] `h1` יחיד; `h2` לכותרות סקשנים; `h3` לכרטיסים/שלבים/קטגוריות/שאלות FAQ לפי הסעיפים לעיל
- [ ] טפסים עם labels וקישור `for`/`id`
- [ ] ללא ספריות חיצוניות מלבד Google Fonts בקישור

---

*מסמך זה מהווה מפת דרכים ליצירת `index.html` ו־`styles.css` בשלב הבא, בלי שינוי הכללים במסמך העיצוב.*
