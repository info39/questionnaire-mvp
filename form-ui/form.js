alert("form.js נטען");
const formData = {
  "form": {
    "id": "ux-intake-orthopedic",
    "title": "שאלון גילוי — קליניקה אורתופדית",
    "description": "שאלון UX לפרויקט Landing Page לקליניקה אורתופדית מתמחה בפציעות ספורט",
    "language": "he",
    "direction": "rtl",
    "version": "1.0",
    "sections": [
      {
        "id": "business",
        "title": "הבנת העסק",
        "icon": "briefcase",
        "order": 1,
        "fields": [
          {
            "id": "value_proposition",
            "type": "textarea",
            "label": "מה ההבטחה המרכזית של הקליניקה — במשפט אחד?",
            "placeholder": "לא 'מובילים בתחום', אלא הסיבה האמיתית שמטופל יבחר בכם",
            "required": true,
            "rows": 3,
            "ux_purpose": "מגדיר את כותרת הגיבור בעמוד"
          },
          {
            "id": "unique_achievement",
            "type": "textarea",
            "label": "מה ההישג שמתחרים לא יכולים לאמר?",
            "placeholder": "אחוז הצלחה, מספר פרוצדורות, הכשרה בחו\"ל, שיטה ייחודית...",
            "required": true,
            "rows": 3,
            "ux_purpose": "בסיס לסטטיסטיקות וטריגרים של אמון"
          },
          {
            "id": "specialized_conditions",
            "type": "checkbox_group",
            "label": "מצבים רפואיים שמטפלים בהם מעל לממוצע",
            "required": false,
            "options": [
              { "value": "acl", "label": "ACL — קרע ברצועה הצולבת" },
              { "value": "meniscus", "label": "קרע מניסקוס" },
              { "value": "knee_replacement", "label": "החלפת ברך" },
              { "value": "hip_replacement", "label": "החלפת ירך" },
              { "value": "disc_herniation", "label": "בקע דיסק / פריצת דיסק" },
              { "value": "spinal_stenosis", "label": "היצרות תעלת השדרה" },
              { "value": "rotator_cuff", "label": "קרע שרוול מסובב (כתף)" },
              { "value": "cartilage", "label": "שיקום סחוס / PRP" },
              { "value": "fractures", "label": "שברים ופגיעות טראומה" },
              { "value": "rehabilitation", "label": "שיקום לאחר ניתוח" },
              { "value": "other", "label": "אחר" }
            ],
            "ux_purpose": "מגדיר את תצוגת השירותים לפי רלוונטיות"
          }
        ]
      },
      {
        "id": "audience",
        "title": "קהל יעד",
        "icon": "users",
        "order": 2,
        "fields": [
          {
            "id": "primary_audience",
            "type": "radio_group",
            "label": "מי קהל היעד הראשי?",
            "required": true,
            "options": [
              { "value": "athletes_young", "label": "ספורטאים צעירים (25–35) — כדורסל, ריצה, כדורגל" },
              { "value": "active_adults", "label": "מבוגרים פעילים (35–50) — לוחמי סוף שבוע, הורים" },
              { "value": "second_opinion", "label": "מחפשי חוות דעת שנייה לפני ניתוח" },
              { "value": "rehabilitation", "label": "מטופלים בשיקום לאחר פציעה/ניתוח" },
              { "value": "mixed", "label": "כלל הקהלים בשווה" }
            ],
            "ux_purpose": "מגדיר את כותרת הגיבור ואת מבנה השירותים"
          },
          {
            "id": "patient_fears",
            "type": "checkbox_group",
            "label": "מה הפחד הכי גדול של מטופלים בפגישה הראשונה?",
            "required": true,
            "options": [
              { "value": "surgery_fear", "label": "חשש מניתוח מיותר" },
              { "value": "cost", "label": "עלות הטיפול" },
              { "value": "severity", "label": "אי-ידיעה אם המצב 'רציני'" },
              { "value": "recovery_time", "label": "זמן החלמה ארוך" },
              { "value": "trust", "label": "חוסר אמון ברופאים" },
              { "value": "waiting_time", "label": "זמני המתנה ארוכים" }
            ],
            "ux_purpose": "מגדיר את נקודות הפחתת החיכוך ה-UX בעמוד"
          },
          {
            "id": "patient_success_story",
            "type": "textarea",
            "label": "תארו מטופל אחד שהיה הכי מרוצה. מי הוא, מה היה לו, מה השתנה?",
            "placeholder": "דוד, 38, רץ מרתון — קרע ACL, חזר לתחרות אחרי 5 חודשים",
            "required": false,
            "rows": 4,
            "ux_purpose": "חומר גלם לביקורת מרכזית בעמוד"
          }
        ]
      },
      {
        "id": "conversion",
        "title": "מטרות והמרה",
        "icon": "target",
        "order": 3,
        "fields": [
          {
            "id": "primary_cta",
            "type": "radio_group",
            "label": "מה הפעולה הראשית שמבקר צריך לבצע?",
            "required": true,
            "options": [
              { "value": "whatsapp", "label": "שליחת הודעת WhatsApp" },
              { "value": "phone_call", "label": "שיחה טלפונית" },
              { "value": "online_booking", "label": "קביעת תור מקוון (Calendly / מערכת תורים)" },
              { "value": "form", "label": "מילוי טופס פנייה" },
              { "value": "email", "label": "שליחת מייל" }
            ],
            "ux_purpose": "מגדיר את כפתור ה-CTA הראשי ואת ה-Sticky Bar"
          },
          {
            "id": "consultation_fee",
            "type": "radio_group",
            "label": "האם הייעוץ הראשוני בתשלום?",
            "required": true,
            "options": [
              { "value": "free", "label": "חינם" },
              { "value": "paid_hmo", "label": "בתשלום — מכוסה בקופת החולים" },
              { "value": "paid_private", "label": "בתשלום — פרטי בלבד" },
              { "value": "mixed", "label": "תלוי בקופה / בסוג הטיפול" }
            ],
            "ux_purpose": "משפיע על copywriting ב-CTA ועל הפחתת חיכוך"
          },
          {
            "id": "monthly_leads_current",
            "type": "number",
            "label": "כמה פניות חדשות אתם מקבלים כיום בחודש?",
            "placeholder": "לדוגמה: 30",
            "required": false,
            "ux_purpose": "Baseline לבחינת הצלחת הפרויקט"
          },
          {
            "id": "monthly_leads_target",
            "type": "number",
            "label": "כמה פניות בחודש הייתם רוצים לקבל?",
            "placeholder": "לדוגמה: 80",
            "required": false,
            "ux_purpose": "מגדיר את יעד ה-KPI"
          },
          {
            "id": "traffic_sources",
            "type": "checkbox_group",
            "label": "מהיכן מגיעים רוב המטופלים כיום?",
            "required": false,
            "options": [
              { "value": "google_organic", "label": "גוגל אורגני" },
              { "value": "google_ads", "label": "גוגל פרסום ממומן" },
              { "value": "referrals", "label": "הפניות מרופאים" },
              { "value": "word_of_mouth", "label": "פה לאוזן" },
              { "value": "social", "label": "סושיאל מדיה" },
              { "value": "other", "label": "אחר" }
            ],
            "ux_purpose": "מגדיר את ה-intent של הקהל ואת מבנה ה-Trust Signals"
          }
        ]
      },
      {
        "id": "trust_signals",
        "title": "אמינות ואמון",
        "icon": "shield",
        "order": 4,
        "fields": [
          {
            "id": "hmo_coverage",
            "type": "checkbox_group",
            "label": "אילו קופות חולים מקובלות?",
            "required": true,
            "options": [
              { "value": "maccabi", "label": "מכבי" },
              { "value": "clalit", "label": "כללית" },
              { "value": "meuhedet", "label": "מאוחדת" },
              { "value": "leumit", "label": "לאומית" },
              { "value": "private", "label": "פרטי" },
              { "value": "international", "label": "ביטוח בינלאומי" }
            ],
            "ux_purpose": "Trust Bar ורצועת הביטוח בעמוד"
          },
          {
            "id": "doctors_count",
            "type": "number",
            "label": "כמה רופאים להציג בעמוד?",
            "placeholder": "לדוגמה: 3",
            "required": true,
            "ux_purpose": "מגדיר את מבנה קטע הצוות"
          },
          {
            "id": "assets_available",
            "type": "checkbox_group",
            "label": "אילו נכסים קיימים?",
            "required": false,
            "options": [
              { "value": "doctor_photos", "label": "תמונות מקצועיות של רופאים" },
              { "value": "clinic_photos", "label": "תמונות הקליניקה" },
              { "value": "google_reviews", "label": "ביקורות גוגל מאומתות" },
              { "value": "logo_vector", "label": "לוגו בפורמט וקטורי" },
              { "value": "video", "label": "וידאו קיים" },
              { "value": "pdf_guide", "label": "מדריך / PDF להורדה" },
              { "value": "none", "label": "אין כלום עדיין" }
            ],
            "ux_purpose": "מגדיר את scope התוכן שיש לייצר"
          },
          {
            "id": "certifications",
            "type": "textarea",
            "label": "אסמכתאות ותעודות מרכזיות שצריך לציין",
            "placeholder": "חבר האגודה הישראלית לאורתופדיה, פלואושיפ ב-HSS ניו יורק, מוסמך משרד הבריאות...",
            "required": false,
            "rows": 3,
            "ux_purpose": "Trust Bar ופרופיל רופאים"
          }
        ]
      },
      {
        "id": "competitors",
        "title": "מתחרים ורפרנסים",
        "icon": "chart",
        "order": 5,
        "fields": [
          {
            "id": "competitors_list",
            "type": "textarea",
            "label": "ציינו 2–3 קליניקות שאתם מתחרים איתן ישירות",
            "placeholder": "שם + עיר + URL אם ידוע",
            "required": false,
            "rows": 3,
            "ux_purpose": "ניתוח מתחרים ל-differentiation"
          },
          {
            "id": "reference_sites",
            "type": "textarea",
            "label": "אתרים שנראים לכם 'נכונים' (לא חייב רפואי)",
            "placeholder": "URL + מה אוהבים בהם",
            "required": false,
            "rows": 3,
            "ux_purpose": "מגדיר כיוון עיצובי ו-UX"
          },
          {
            "id": "style_preference",
            "type": "radio_group",
            "label": "איזה טון מתאים לקליניקה?",
            "required": true,
            "options": [
              { "value": "premium_luxury", "label": "פרימיום ויוקרתי — כמו מרפאה פרטית בחו\"ל" },
              { "value": "warm_human", "label": "חם ואנושי — מקצועי אבל נגיש" },
              { "value": "clinical_professional", "label": "מדעי ומקצועי — סמכות רפואית" },
              { "value": "sporty_energetic", "label": "ספורטיבי ודינמי — מדבר לספורטאים" }
            ],
            "ux_purpose": "מגדיר כיוון עיצוב, טיפוגרפיה ו-copywriting"
          },
          {
            "id": "avoid",
            "type": "textarea",
            "label": "מה בהחלט לא רוצים? (סגנון, תחושה, אלמנטים)",
            "placeholder": "לדוגמה: לא כחול קלינאי גנרי, לא מראה של קופת חולים...",
            "required": false,
            "rows": 2,
            "ux_purpose": "מגדיר גבולות לעיצוב"
          }
        ]
      },
      {
        "id": "technical",
        "title": "דרישות טכניות",
        "icon": "settings",
        "order": 6,
        "fields": [
          {
            "id": "platform",
            "type": "radio_group",
            "label": "פלטפורמה",
            "required": true,
            "options": [
              { "value": "wordpress_elementor", "label": "WordPress + Elementor" },
              { "value": "wordpress_gutenberg", "label": "WordPress + Gutenberg" },
              { "value": "webflow", "label": "Webflow" },
              { "value": "wix", "label": "Wix" },
              { "value": "custom", "label": "פיתוח מותאם" },
              { "value": "other", "label": "אחר" }
            ],
            "ux_purpose": "מגדיר אפשרויות טכניות ומגבלות"
          },
          {
            "id": "booking_system",
            "type": "text",
            "label": "מערכת ניהול תורים (אם קיימת)",
            "placeholder": "Calendly / Doctoralia / מערכת פנימית / אין",
            "required": false,
            "ux_purpose": "משפיע על ה-Booking Flow"
          },
          {
            "id": "crm",
            "type": "text",
            "label": "CRM קיים",
            "placeholder": "Monday / HubSpot / Zoho / אין",
            "required": false,
            "ux_purpose": "מגדיר אינטגרציה של טופס הפנייה"
          },
          {
            "id": "multilingual",
            "type": "checkbox_group",
            "label": "שפות נדרשות",
            "required": false,
            "options": [
              { "value": "hebrew", "label": "עברית" },
              { "value": "english", "label": "אנגלית" },
              { "value": "russian", "label": "רוסית" },
              { "value": "arabic", "label": "ערבית" }
            ],
            "ux_purpose": "מגדיר scope התרגום"
          },
          {
            "id": "content_manager",
            "type": "radio_group",
            "label": "מי מנהל את האתר לאחר ההשקה?",
            "required": false,
            "options": [
              { "value": "client", "label": "הלקוח עצמו" },
              { "value": "agency", "label": "הסוכנות" },
              { "value": "mixed", "label": "שניהם" }
            ],
            "ux_purpose": "משפיע על בחירת ה-CMS וסיבוכיות המבנה"
          }
        ]
      },
      {
        "id": "success",
        "title": "הגדרת הצלחה",
        "icon": "flag",
        "order": 7,
        "fields": [
          {
            "id": "success_definition",
            "type": "textarea",
            "label": "מה ההצלחה שתגרום לכם לומר שהפרויקט היה שווה את ההשקעה?",
            "placeholder": "תגידו במספרים אם אפשר — פניות לחודש, תורים שנקבעו, אחוז המרה",
            "required": true,
            "rows": 3,
            "ux_purpose": "מגדיר KPI ו-scope לבדיקת הצלחה"
          },
          {
            "id": "timeline",
            "type": "radio_group",
            "label": "מהו לוח הזמנים הרצוי להשקה?",
            "required": false,
            "options": [
              { "value": "2_weeks", "label": "עד שבועיים" },
              { "value": "1_month", "label": "חודש" },
              { "value": "2_months", "label": "חודשיים" },
              { "value": "flexible", "label": "גמיש — איכות על פני מהירות" }
            ],
            "ux_purpose": "מגדיר תכנון פרויקט ו-scope"
          },
          {
            "id": "additional_notes",
            "type": "textarea",
            "label": "יש משהו שחשוב לכם שנדע, שלא שאלנו?",
            "placeholder": "כל מידע נוסף שיעזור לנו להבין את העסק שלכם",
            "required": false,
            "rows": 4,
            "ux_purpose": "Catch-all לתובנות בלתי צפויות"
          }
        ]
      }
    ],
    "metadata": {
      "project_type": "landing_page",
      "industry": "orthopedic_clinic",
      "target_platform": "wordpress_elementor",
      "primary_conversion_goal": "consultation_booking",
      "estimated_completion_time_minutes": 15,
      "created_by": "UX Intelligence Agent",
      "created_date": "2026-04-05",
      "version_notes": "v1.0 — ספציפי לקליניקה אורתופדית עם דגש על פציעות ספורט"
    }
  }
};

const formContainer = document.getElementById("form");
const title = document.getElementById("form-title");
const description = document.getElementById("form-description");
const successMessage = document.getElementById("success-message");
const errorMessage = document.getElementById("error-message");

title.innerText = formData.form.title;
description.innerText = formData.form.description || "";

const sortedSections = [...formData.form.sections].sort((a, b) => (a.order || 0) - (b.order || 0));

sortedSections.forEach(section => {
  const sectionEl = document.createElement("div");
  sectionEl.classList.add("section");
  sectionEl.innerHTML = `<h2>${section.title}</h2>`;

  section.fields.forEach(field => {
    const fieldEl = document.createElement("div");
    fieldEl.classList.add("question");

    const requiredMark = field.required ? `<span class="required-mark">*</span>` : "";
    let input = "";

    if (field.type === "text" || field.type === "number") {
      input = `
        <input
          type="${field.type}"
          name="${field.id}"
          placeholder="${field.placeholder || ""}"
          ${field.required ? "required" : ""}
        />
      `;
    }

    if (field.type === "textarea") {
      input = `
        <textarea
          name="${field.id}"
          rows="${field.rows || 4}"
          placeholder="${field.placeholder || ""}"
          ${field.required ? "required" : ""}
        ></textarea>
      `;
    }

    if (field.type === "radio_group") {
      input = `
        <div class="options-group">
          ${field.options.map(option => `
            <div class="option-item">
              <input
                type="radio"
                id="${field.id}_${option.value}"
                name="${field.id}"
                value="${option.value}"
                ${field.required ? "required" : ""}
              />
              <label for="${field.id}_${option.value}">${option.label}</label>
            </div>
          `).join("")}
        </div>
      `;
    }

    if (field.type === "checkbox_group") {
      input = `
        <div class="options-group">
          ${field.options.map(option => `
            <div class="option-item">
              <input
                type="checkbox"
                id="${field.id}_${option.value}"
                name="${field.id}"
                value="${option.value}"
              />
              <label for="${field.id}_${option.value}">${option.label}</label>
            </div>
          `).join("")}
        </div>
      `;
    }

    fieldEl.innerHTML = `
      <div class="question-label">${requiredMark}${field.label}</div>
      ${input}
    `;

    sectionEl.appendChild(fieldEl);
  });

  formContainer.appendChild(sectionEl);
});

function collectFormData() {
  const data = {};

  document.querySelectorAll("input, textarea").forEach(el => {
    if (el.type === "radio") {
      if (el.checked) data[el.name] = el.value;
    } else if (el.type === "checkbox") {
      if (!data[el.name]) data[el.name] = [];
      if (el.checked) data[el.name].push(el.value);
    } else {
      data[el.name] = el.value.trim();
    }
  });

  return data;
}

function validateForm() {
  const errors = [];

  sortedSections.forEach(section => {
    section.fields.forEach(field => {
      if (!field.required) return;

      if (field.type === "text" || field.type === "number" || field.type === "textarea") {
        const el = document.querySelector(`[name="${field.id}"]`);
        if (!el || !el.value.trim()) {
          errors.push(`יש למלא את השדה: ${field.label}`);
        }
      }

      if (field.type === "radio_group") {
        const checked = document.querySelector(`input[name="${field.id}"]:checked`);
        if (!checked) {
          errors.push(`יש לבחור אפשרות עבור: ${field.label}`);
        }
      }
    });
  });

  return errors;
}

function submitForm() {
  successMessage.style.display = "none";
  errorMessage.style.display = "none";
  errorMessage.innerText = "";

  const errors = validateForm();

  if (errors.length) {
    errorMessage.innerText = errors.join("\n");
    errorMessage.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  const data = collectFormData();
  console.log("Submitted data:", data);

  successMessage.style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function downloadJson() {
  const data = collectFormData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "ux-questionnaire-answers.json";
  a.click();

  URL.revokeObjectURL(url);
}