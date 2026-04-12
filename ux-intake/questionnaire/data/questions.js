/**
 * questions.js
 *
 * Generic demo questionnaire for the UX Onboarding Engine.
 * Replace this file to swap in any questionnaire — the engine is data-driven.
 *
 * Schema reference:
 *   Each step is either type:"question" or type:"info"|"reflection"|"checkpoint"
 *   Mode filtering: steps with modes:["A","B"] appear in both; modes:["B"] only in deep mode.
 *   Branching: followUps fire only when the answer matches the `when` array.
 *   Signals: mapped per answer value into features / complexity / siteType / tags.
 */

var QUESTIONNAIRE = {

  // ─── Meta ───────────────────────────────────────────────────────────────────
  meta: {
    id: "ux-onboarding-generic-v1",
    title: "Let's understand your project",
    language: "en",
    direction: "ltr",
    intro: {
      heading: "Before we start building, let's get aligned.",
      body: "This short conversation helps us understand your business, your users, and what success looks like. It takes about 5–10 minutes.",
      ctaA: "Quick mode — 5 min",
      ctaB: "Deep dive — 10 min"
    },
    summary: {
      heading: "Here's what we learned",
      body: "Based on your answers, we've put together an initial project profile. We'll use this as the foundation for everything that follows."
    }
  },

  // ─── Chapters ────────────────────────────────────────────────────────────────
  chapters: [
    { id: "intro",      title: "Intro",         icon: "wave",      order: 0 },
    { id: "business",   title: "The Business",  icon: "briefcase", order: 1 },
    { id: "audience",   title: "Your Users",    icon: "users",     order: 2 },
    { id: "goals",      title: "Goals",         icon: "target",    order: 3 },
    { id: "site",       title: "The Site",      icon: "layout",    order: 4 },
    { id: "wrap",       title: "Final Details", icon: "flag",      order: 5 }
  ],

  // ─── Steps ───────────────────────────────────────────────────────────────────
  steps: [

    // ── Chapter: intro ────────────────────────────────────────────────────────

    {
      id: "intro_step",
      chapter: "intro",
      modes: ["A", "B"],
      type: "question",
      inputType: "radio",
      question: "Ready to get started?",
      options: [
        { value: "yes", label: "Let's go" }
      ],
      required: true,
      response: {
        default: "Great — let's build something good."
      },
      followUps: [],
      signals: {
        default: { features: [], complexity: null, siteType: null, tags: [] }
      }
    },

    // ── Chapter: business ─────────────────────────────────────────────────────

    {
      id: "business_type",
      type: "question",
      chapter: "business",
      modes: ["A", "B"],
      question: "What kind of business are we building this for?",
      inputType: "radio",
      required: true,
      options: [
        { value: "service",       label: "Service business (agency, clinic, consultant, freelancer)" },
        { value: "ecommerce",     label: "Online store / e-commerce" },
        { value: "saas",          label: "Software product / SaaS" },
        { value: "content",       label: "Content, media, or community" },
        { value: "nonprofit",     label: "Nonprofit or institution" },
        { value: "other",         label: "Something else" }
      ],
      response: {
        default: "Got it — that shapes quite a few decisions.",
        byValue: {
          service:   "Service businesses need trust and a clear path to contact. Makes sense.",
          ecommerce: "E-commerce brings its own complexity — we'll dig into that.",
          saas:      "SaaS sites are about clarity and conversion. Good.",
          content:   "Content sites are about audience and engagement. Noted.",
          nonprofit:  "Nonprofits need to inspire action. We'll keep that in mind."
        }
      },
      followUps: [
        {
          when: ["ecommerce"],
          questions: ["ecommerce_scale"]
        },
        {
          when: ["saas"],
          questions: ["saas_stage"]
        }
      ],
      signals: {
        byValue: {
          service:   { features: ["contact_form", "about", "services"],          complexity: "low",    siteType: "service",    tags: ["trust", "local"] },
          ecommerce: { features: ["product_catalog", "cart", "checkout", "search"], complexity: "high",   siteType: "ecommerce",  tags: ["conversion", "catalog"] },
          saas:      { features: ["pricing", "features_page", "signup", "demo"],  complexity: "high",   siteType: "saas",       tags: ["conversion", "product"] },
          content:   { features: ["blog", "newsletter", "categories"],            complexity: "medium", siteType: "content",    tags: ["engagement", "seo"] },
          nonprofit: { features: ["donation", "about", "impact", "contact"],      complexity: "medium", siteType: "nonprofit",  tags: ["trust", "mission"] },
          other:     { features: [],                                               complexity: "medium", siteType: null,         tags: [] }
        },
        default: { features: [], complexity: "low", siteType: null, tags: [] }
      }
    },

    // Conditional follow-up: ecommerce only
    {
      id: "ecommerce_scale",
      type: "question",
      chapter: "business",
      modes: ["A", "B"],
      question: "How many products are you planning to list?",
      inputType: "radio",
      required: true,
      options: [
        { value: "small",    label: "Under 50 products" },
        { value: "medium",   label: "50 – 500 products" },
        { value: "large",    label: "500+ products" }
      ],
      response: {
        default: "That helps us think about catalog structure and performance.",
        byValue: {
          large: "A large catalog means search, filtering, and performance will matter a lot."
        }
      },
      followUps: [],
      signals: {
        byValue: {
          small:  { features: [],                              complexity: "low",    siteType: null, tags: ["small-catalog"] },
          medium: { features: ["filtering"],                   complexity: "medium", siteType: null, tags: ["medium-catalog"] },
          large:  { features: ["filtering", "search", "pagination"], complexity: "high", siteType: null, tags: ["large-catalog"] }
        },
        default: { features: [], complexity: "low", siteType: null, tags: [] }
      }
    },

    // Conditional follow-up: saas only
    {
      id: "saas_stage",
      type: "question",
      chapter: "business",
      modes: ["A", "B"],
      question: "What stage is the product at?",
      inputType: "radio",
      required: false,
      options: [
        { value: "pre_launch", label: "Pre-launch / coming soon" },
        { value: "launched",   label: "Live — growing users" },
        { value: "scaling",    label: "Scaling — post product-market fit" }
      ],
      response: {
        default: "Good to know — that changes what the site needs to communicate.",
        byValue: {
          pre_launch: "Pre-launch sites are about building anticipation and capturing early interest.",
          scaling:    "At scale, the site needs to support self-serve onboarding and reduce support load."
        }
      },
      followUps: [],
      signals: {
        byValue: {
          pre_launch: { features: ["waitlist", "coming_soon"],       complexity: "low",    siteType: null, tags: ["pre-launch"] },
          launched:   { features: ["signup", "demo", "case_studies"], complexity: "medium", siteType: null, tags: ["growth"] },
          scaling:    { features: ["signup", "demo", "docs", "pricing", "case_studies"], complexity: "high", siteType: null, tags: ["scaling", "self-serve"] }
        },
        default: { features: [], complexity: "low", siteType: null, tags: [] }
      }
    },

    {
      id: "business_value",
      type: "question",
      chapter: "business",
      modes: ["A", "B"],
      question: "In one sentence — what makes this business the right choice for its customers?",
      inputType: "textarea",
      placeholder: "Not 'we're the best' — the real reason someone would choose you over anyone else.",
      required: true,
      response: {
        default: "That's the core of everything we'll build. We'll make sure it comes through."
      },
      followUps: [],
      signals: {
        default: { features: [], complexity: null, siteType: null, tags: ["value-prop-defined"] }
      }
    },

    // ── Transition: business → audience ───────────────────────────────────────

    {
      id: "transition_to_audience",
      type: "info",
      chapter: "audience",
      modes: ["A", "B"],
      content: {
        heading: "Now let's talk about the people who'll visit the site.",
        body: "The clearer we are about who we're designing for, the better every decision gets.",
        cta: "Continue"
      }
    },

    // ── Chapter: audience ─────────────────────────────────────────────────────

    {
      id: "audience_primary",
      type: "question",
      chapter: "audience",
      modes: ["A", "B"],
      question: "Who is the primary visitor this site needs to speak to?",
      inputType: "radio",
      required: true,
      options: [
        { value: "consumers",     label: "Individual consumers (B2C)" },
        { value: "businesses",    label: "Other businesses or teams (B2B)" },
        { value: "mixed",         label: "Both — different sections for different audiences" },
        { value: "community",     label: "A community or niche group" }
      ],
      response: {
        default: "Understood. That tells us a lot about tone, structure, and trust signals.",
        byValue: {
          businesses: "B2B sites need to earn trust fast and make the ROI obvious.",
          mixed:      "Serving multiple audiences adds complexity — we'll plan for that."
        }
      },
      followUps: [
        {
          when: ["businesses", "mixed"],
          questions: ["b2b_decision_maker"]
        }
      ],
      signals: {
        byValue: {
          consumers:  { features: [],                         complexity: "low",    siteType: null, tags: ["b2c"] },
          businesses: { features: ["case_studies", "pricing"], complexity: "medium", siteType: null, tags: ["b2b"] },
          mixed:      { features: ["case_studies"],            complexity: "high",   siteType: null, tags: ["b2b", "b2c"] },
          community:  { features: ["forum", "newsletter"],     complexity: "medium", siteType: null, tags: ["community"] }
        },
        default: { features: [], complexity: "low", siteType: null, tags: [] }
      }
    },

    // Conditional follow-up: B2B only
    {
      id: "b2b_decision_maker",
      type: "question",
      chapter: "audience",
      modes: ["A", "B"],
      question: "Who typically makes the decision to buy or engage?",
      inputType: "radio",
      required: false,
      options: [
        { value: "individual",  label: "One person decides independently" },
        { value: "committee",   label: "A team or committee decides together" },
        { value: "unknown",     label: "Not sure yet" }
      ],
      response: {
        default: "That affects how we structure the persuasion flow.",
        byValue: {
          committee: "Committee decisions mean multiple pages and angles — not just one CTA."
        }
      },
      followUps: [],
      signals: {
        byValue: {
          committee: { features: ["case_studies", "roi_calculator", "comparison"], complexity: "medium", siteType: null, tags: ["committee-buy"] }
        },
        default: { features: [], complexity: "low", siteType: null, tags: [] }
      }
    },

    {
      id: "audience_pain",
      type: "question",
      chapter: "audience",
      modes: ["A", "B"],
      question: "What is the main problem or frustration your visitors come with?",
      inputType: "textarea",
      placeholder: "What are they anxious about, unsure of, or trying to solve?",
      required: true,
      response: {
        default: "That's the tension the site needs to resolve — we'll put it front and center."
      },
      followUps: [],
      signals: {
        default: { features: [], complexity: null, siteType: null, tags: ["pain-defined"] }
      }
    },

    {
      id: "audience_awareness",
      type: "question",
      chapter: "audience",
      modes: ["B"],
      question: "How aware are visitors of your solution when they arrive?",
      inputType: "radio",
      required: false,
      options: [
        { value: "unaware",      label: "They don't know this type of solution exists" },
        { value: "problem_aware", label: "They know they have a problem, not the solution" },
        { value: "solution_aware", label: "They know solutions exist, comparing options" },
        { value: "ready",        label: "They know you — they just need to confirm" }
      ],
      response: {
        default: "Awareness level shapes how much explaining the site needs to do.",
        byValue: {
          unaware:       "An unaware audience needs education before persuasion — longer pages, more context.",
          ready:         "If they already know you, the site's job is to confirm trust and make action easy."
        }
      },
      followUps: [],
      signals: {
        byValue: {
          unaware:       { features: ["explainer", "blog", "faq"], complexity: "medium", siteType: null, tags: ["education-needed"] },
          problem_aware: { features: ["faq", "explainer"],         complexity: "medium", siteType: null, tags: ["problem-aware"] },
          solution_aware:{ features: ["comparison", "case_studies"], complexity: "medium", siteType: null, tags: ["comparison-needed"] },
          ready:         { features: ["contact_form", "booking"],   complexity: "low",    siteType: null, tags: ["high-intent"] }
        },
        default: { features: [], complexity: "low", siteType: null, tags: [] }
      }
    },

    // ── Reflection: mid-point check-in ────────────────────────────────────────

    {
      id: "reflection_midpoint",
      type: "reflection",
      chapter: "goals",
      modes: ["B"],
      content: {
        heading: "Here's what we understand so far.",
        body: "Before we go deeper — let's make sure we're aligned.",
        cta: "Looks right, continue"
      }
    },

    // ── Chapter: goals ────────────────────────────────────────────────────────

    {
      id: "goals_primary_action",
      type: "question",
      chapter: "goals",
      modes: ["A", "B"],
      question: "What is the single most important action a visitor should take on this site?",
      inputType: "radio",
      required: true,
      options: [
        { value: "contact",   label: "Get in touch (call, email, WhatsApp)" },
        { value: "booking",   label: "Book a meeting or appointment" },
        { value: "purchase",  label: "Make a purchase" },
        { value: "signup",    label: "Sign up or register" },
        { value: "download",  label: "Download something (guide, app, report)" },
        { value: "subscribe", label: "Subscribe (newsletter, updates)" }
      ],
      response: {
        default: "Good. Everything on the site should make that one action feel inevitable.",
        byValue: {
          purchase:  "Purchases need friction removed at every step — speed, trust, and clarity.",
          booking:   "Booking flows live or die by how easy the first step is."
        }
      },
      followUps: [
        {
          when: ["purchase"],
          questions: ["purchase_avg_value"]
        },
        {
          when: ["booking"],
          questions: ["booking_system"]
        }
      ],
      signals: {
        byValue: {
          contact:   { features: ["contact_form", "sticky_cta"],          complexity: "low",    siteType: null, tags: ["lead-gen"] },
          booking:   { features: ["booking", "calendar", "sticky_cta"],   complexity: "medium", siteType: null, tags: ["lead-gen", "booking"] },
          purchase:  { features: ["cart", "checkout", "trust_badges"],    complexity: "high",   siteType: null, tags: ["conversion", "ecommerce"] },
          signup:    { features: ["signup", "onboarding_flow"],            complexity: "medium", siteType: null, tags: ["acquisition"] },
          download:  { features: ["lead_magnet", "landing_page"],          complexity: "low",    siteType: null, tags: ["lead-gen"] },
          subscribe: { features: ["newsletter_signup"],                     complexity: "low",    siteType: null, tags: ["retention"] }
        },
        default: { features: [], complexity: "low", siteType: null, tags: [] }
      }
    },

    // Conditional follow-up: purchase
    {
      id: "purchase_avg_value",
      type: "question",
      chapter: "goals",
      modes: ["A", "B"],
      question: "What is the typical order value?",
      inputType: "radio",
      required: false,
      options: [
        { value: "low",    label: "Under $50" },
        { value: "medium", label: "$50 – $500" },
        { value: "high",   label: "Over $500" }
      ],
      response: {
        default: "Order value affects how much reassurance and social proof the page needs.",
        byValue: {
          high: "High-value purchases need reviews, guarantees, and clear return policies front and centre."
        }
      },
      followUps: [],
      signals: {
        byValue: {
          high: { features: ["reviews", "guarantee", "return_policy"], complexity: "medium", siteType: null, tags: ["high-aov"] }
        },
        default: { features: [], complexity: "low", siteType: null, tags: [] }
      }
    },

    // Conditional follow-up: booking
    {
      id: "booking_system",
      type: "question",
      chapter: "goals",
      modes: ["A", "B"],
      question: "Do you already have a booking or scheduling tool?",
      inputType: "radio",
      required: false,
      options: [
        { value: "calendly",  label: "Calendly" },
        { value: "acuity",    label: "Acuity / Squarespace Scheduling" },
        { value: "cal_com",   label: "Cal.com" },
        { value: "internal",  label: "Custom / internal system" },
        { value: "none",      label: "No — we need to choose one" }
      ],
      response: {
        default: "Good to know — we'll make sure the integration is seamless.",
        byValue: {
          none: "No booking tool yet — we'll recommend the best fit for your workflow."
        }
      },
      followUps: [],
      signals: {
        byValue: {
          none: { features: ["booking_tool_selection"], complexity: "medium", siteType: null, tags: ["needs-booking-tool"] }
        },
        default: { features: ["booking_integration"], complexity: "low", siteType: null, tags: [] }
      }
    },

    {
      id: "goals_success",
      type: "question",
      chapter: "goals",
      modes: ["A", "B"],
      question: "How will you know if the site is working? What does success look like in 3 months?",
      inputType: "textarea",
      placeholder: "Try to be specific — leads per month, conversion rate, revenue, signups…",
      required: false,
      response: {
        default: "We'll use this as the north star for every design and content decision."
      },
      followUps: [],
      signals: {
        default: { features: [], complexity: null, siteType: null, tags: ["kpi-defined"] }
      }
    },

    // ── Chapter: site ─────────────────────────────────────────────────────────

    {
      id: "transition_to_site",
      type: "info",
      chapter: "site",
      modes: ["A", "B"],
      content: {
        heading: "Almost there — let's talk about the site itself.",
        body: "A few quick questions about structure, timeline, and content.",
        cta: "Continue"
      }
    },

    {
      id: "site_pages",
      type: "question",
      chapter: "site",
      modes: ["A", "B"],
      question: "What pages does this site need?",
      inputType: "checkbox",
      required: true,
      options: [
        { value: "home",      label: "Home / landing page" },
        { value: "about",     label: "About / team" },
        { value: "services",  label: "Services or products" },
        { value: "portfolio", label: "Portfolio / case studies" },
        { value: "blog",      label: "Blog / articles" },
        { value: "pricing",   label: "Pricing" },
        { value: "contact",   label: "Contact" },
        { value: "faq",       label: "FAQ" },
        { value: "other",     label: "Other" }
      ],
      response: {
        default: "Noted. We'll structure the sitemap around these."
      },
      followUps: [
        {
          when: ["blog"],
          questions: ["blog_frequency"]
        },
        {
          when: ["portfolio"],
          questions: ["portfolio_count"]
        }
      ],
      signals: {
        byValue: {
          blog:      { features: ["cms", "blog"], complexity: "medium", siteType: null, tags: ["content-heavy"] },
          pricing:   { features: ["pricing"],     complexity: "low",    siteType: null, tags: ["pricing-page"] },
          portfolio: { features: ["portfolio"],   complexity: "medium", siteType: null, tags: ["visual-heavy"] }
        },
        default: { features: [], complexity: "low", siteType: null, tags: [] }
      }
    },

    // Conditional: blog frequency
    {
      id: "blog_frequency",
      type: "question",
      chapter: "site",
      modes: ["B"],
      question: "How often do you plan to publish new content?",
      inputType: "radio",
      required: false,
      options: [
        { value: "daily",           label: "Daily or almost daily" },
        { value: "few_times_week",  label: "A few times a week" },
        { value: "weekly",          label: "Weekly" },
        { value: "monthly",         label: "Monthly or less" }
      ],
      response: {
        default: "Content frequency shapes the CMS requirements and editorial workflow.",
        byValue: {
          daily:          "Daily publishing means you'll want a fast, streamlined CMS — we'll factor that in.",
          few_times_week: "That pace works well with most CMS setups."
        }
      },
      followUps: [],
      signals: {
        byValue: {
          daily:          { features: ["advanced_cms", "scheduling"], complexity: "high",   siteType: null, tags: ["editorial"] },
          few_times_week: { features: ["cms"],                        complexity: "medium", siteType: null, tags: ["editorial"] },
          weekly:         { features: ["cms"],                        complexity: "low",    siteType: null, tags: ["editorial"] },
          monthly:        { features: [],                             complexity: "low",    siteType: null, tags: [] }
        },
        default: { features: [], complexity: "low", siteType: null, tags: [] }
      }
    },

    // Conditional: portfolio count
    {
      id: "portfolio_count",
      type: "question",
      chapter: "site",
      modes: ["B"],
      question: "How many portfolio or case study items do you want to show?",
      inputType: "radio",
      required: false,
      options: [
        { value: "few",  label: "3–6 items" },
        { value: "many", label: "7–20 items" },
        { value: "lots", label: "20+ items (needs filtering)" }
      ],
      response: {
        default: "That tells us whether we need filtering and pagination."
      },
      followUps: [],
      signals: {
        byValue: {
          lots: { features: ["filtering", "pagination"], complexity: "medium", siteType: null, tags: ["large-portfolio"] }
        },
        default: { features: [], complexity: "low", siteType: null, tags: [] }
      }
    },

    {
      id: "site_content_ready",
      type: "question",
      chapter: "site",
      modes: ["A", "B"],
      question: "How much content do you have ready to go?",
      inputType: "radio",
      required: true,
      options: [
        { value: "all_ready",    label: "Most copy, images, and assets are ready" },
        { value: "partial",      label: "Some things are ready, some still need work" },
        { value: "nothing",      label: "Starting from scratch — nothing ready yet" }
      ],
      response: {
        default: "That helps us plan what's in scope and what needs to be produced.",
        byValue: {
          nothing: "Starting from scratch is fine — we'll guide you through what's needed.",
          all_ready: "Having content ready means we can move fast."
        }
      },
      followUps: [],
      signals: {
        byValue: {
          nothing:   { features: ["copywriting", "photography"], complexity: "high",   siteType: null, tags: ["content-production"] },
          partial:   { features: ["copywriting"],                complexity: "medium", siteType: null, tags: ["partial-content"] },
          all_ready: { features: [],                             complexity: "low",    siteType: null, tags: ["content-ready"] }
        },
        default: { features: [], complexity: "low", siteType: null, tags: [] }
      }
    },

    {
      id: "site_timeline",
      type: "question",
      chapter: "site",
      modes: ["A", "B"],
      question: "When do you need the site to be live?",
      inputType: "radio",
      required: false,
      options: [
        { value: "asap",       label: "As soon as possible" },
        { value: "1_month",    label: "Within a month" },
        { value: "2_3_months", label: "2–3 months" },
        { value: "flexible",   label: "Flexible — quality over speed" }
      ],
      response: {
        default: "Got it. We'll shape the scope around that timeline.",
        byValue: {
          asap:    "A fast turnaround means we'll need to be ruthless about scope.",
          flexible: "Flexible timelines let us do things properly — great."
        }
      },
      followUps: [],
      signals: {
        byValue: {
          asap:       { features: [], complexity: "low",  siteType: null, tags: ["urgent", "mvp"] },
          flexible:   { features: [], complexity: "low",  siteType: null, tags: ["quality-first"] }
        },
        default: { features: [], complexity: "low", siteType: null, tags: [] }
      }
    },

    // ── Chapter: wrap ─────────────────────────────────────────────────────────

    {
      id: "checkpoint_before_wrap",
      type: "checkpoint",
      chapter: "wrap",
      modes: ["B"],
      content: {
        heading: "One last section.",
        body: "These final questions help us understand the bigger picture — and make sure nothing important gets missed.",
        cta: "Let's finish"
      }
    },

    {
      id: "wrap_inspiration",
      type: "question",
      chapter: "wrap",
      modes: ["B"],
      question: "Are there any websites — in any industry — that feel right to you? What do you like about them?",
      inputType: "textarea",
      placeholder: "URL or name + what specifically feels right (layout, tone, vibe, trust…)",
      required: false,
      response: {
        default: "References like this are worth a thousand words. We'll study them."
      },
      followUps: [],
      signals: {
        default: { features: [], complexity: null, siteType: null, tags: ["references-provided"] }
      }
    },

    {
      id: "wrap_avoid",
      type: "question",
      chapter: "wrap",
      modes: ["B"],
      question: "Is there anything you definitely don't want — style, tone, or approach?",
      inputType: "textarea",
      placeholder: "E.g. no stock photos, no corporate tone, no cluttered layouts…",
      required: false,
      response: {
        default: "Knowing what to avoid is just as valuable as knowing what to aim for."
      },
      followUps: [],
      signals: {
        default: { features: [], complexity: null, siteType: null, tags: ["constraints-defined"] }
      }
    },

    {
      id: "wrap_open",
      type: "question",
      chapter: "wrap",
      modes: ["A", "B"],
      question: "Is there anything important we haven't asked about?",
      inputType: "textarea",
      placeholder: "Anything that would help us understand your project better.",
      required: false,
      response: {
        default: "Thank you — we'll make sure nothing gets lost."
      },
      followUps: [],
      signals: {
        default: { features: [], complexity: null, siteType: null, tags: [] }
      }
    },

    {
      id: "client_email",
      type: "question",
      chapter: "wrap",
      modes: ["A", "B"],
      question: "Would you like to receive a summary of your answers by email?",
      inputType: "text",
      placeholder: "your@email.com",
      required: false,
      response: {
        default: "Great — we'll send you a copy straight away."
      },
      followUps: [],
      signals: {
        default: { features: [], complexity: null, siteType: null, tags: [] }
      }
    }

  ] // end steps

}; // end QUESTIONNAIRE
