# SCRATCHPAD — EssenceQuest System Log

> קובץ זה מתעד את כל הפעולות, ההחלטות והשיחות של הפרויקט.
> כתוב הפקודה `\היסטורית שיחה` כדי לסרוק את ההקשר המלא.

---

## מערכות מחוברות

| מערכת | פרטים | סטטוס |
|-------|--------|--------|
| **Telegram Bot** | `@essencequest_bot` (ID: 8627114995) | ✅ פעיל |
| **Telegram Webhook** | `https://hook.eu1.make.com/qb4fzqxgyrcsh3304khyezzlq0bx0orv` | ✅ מחובר |
| **Make Scenario** | "EssenceQuest — Questionnaire Agent" (ID: 5344166) | ✅ פעיל |
| **Make Team** | My Team (ID: 638433) — Essence Studio (org: 5976644) | ✅ |
| **WordPress** | `onboarding.essencesux.com` | ✅ |
| **GitHub** | `github.com/info39/questionnaire-mvp` | ✅ |
| **Datastore** | ID: 115570 — שמירת sessions בין אפיון ל-go | ✅ |

---

## זרימת המערכת (EssenceQuest Flow)

```
[טלגרם] "אפיון: [תיאור לקוח]"
    → Make Webhook
    → Route 1 (filter: starts with "אפיון:")
    → Claude Haiku API → מייצר questionnaire JSON מלא בעברית
    → Datastore: שמירה עם status=pending
    → Telegram: "✅ השאלון מוכן! שלח go לפרסום"

[טלגרם] "go"
    → Make Webhook
    → Route 2 (filter: equals "go")
    → Datastore: שליפת JSON לפי chat_id
    → WordPress REST API: יצירת עמוד חדש
    → Datastore: עדכון status=published
    → Telegram: "🚀 הלינק מוכן: [URL]"
```

---

## Make — System Prompt (Module 3) — עדכון אחרון: 2026-04-19

עודכן לייצר JSON תואם מלא ל-OnboardingEngine:
- `inputType` (radio/checkbox/textarea/text)
- `options` [{value, label}]
- `required` (true/false)
- `signals` {byValue: {value: {features, complexity, siteType, tags}}}
- `response` {default: "Hebrew feedback"}
- `placeholder` (לשדות textarea/text)

---

## סטטוס פרויקט

### הושלם ✅
- OnboardingEngine (`onboarding.js`) — engine מלא עם state, branching, signals
- אנימציות GSAP (`onboarding-animations.js`)
- עיצוב (`onboarding.css`) — dark sidebar, RTL, responsive
- Bundle (`onboarding.bundle.html`) — מוכן ל-Elementor
- Make Scenario — EssenceQuest מחובר לטלגרם + WordPress
- System prompt עודכן לסכמה מלאה

### ממתין לביצוע 🔲
- [ ] טסט end-to-end: אפיון → go → WordPress
- [ ] questionnaire ידני בעברית ל-`data/questions.js` (לשימוש ישיר)
- [ ] אימות שה-WordPress endpoint מקבל את ה-JSON החדש כראוי

---

## לוג שיחות

### 2026-04-19 — Session 1
- סרקנו את הפרויקט מחדש לאחר הפסקה
- גילינו שה-output/mabatim-landing מכיל פרויקט "פורל עד הבית" ולא מבטים
- זיהינו שה-system prompt ב-Make חסר שדות קריטיים
- עדכנו את ה-system prompt
- אימתנו חיבור טלגרם: @essencequest_bot פעיל, webhook מוגדר לכתובת Make

---
