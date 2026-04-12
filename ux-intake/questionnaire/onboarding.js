/**
 * onboarding.js
 *
 * UX Onboarding Engine — data-driven, questionnaire-agnostic.
 *
 * Public API:
 *   OnboardingEngine(questionnaire, rootEl)  — constructor
 *   .init()                                  — mount and render
 *   .selectMode(mode)                        — "A" | "B"
 *   .submitAnswer(stepId, value)             — commit answer, advance
 *   .back()                                  — go to previous step
 *   .skipStep()                              — skip optional step
 *   .getState()                              — returns a snapshot of current state
 *   .reset()                                 — clear session and restart
 */

(function () {
  'use strict';

  // ─── Complexity rank for resolving conflicts across signals ────────────────
  const COMPLEXITY_RANK = { low: 1, medium: 2, high: 3 };

  // ─── Constructor ──────────────────────────────────────────────────────────
  function OnboardingEngine(questionnaire, rootEl) {
    this.q       = questionnaire;  // the full questionnaire data object
    this.rootEl  = rootEl;         // the .ux-onboarding-app DOM element
    this._state  = null;
    this._saveTimer = null;
  }

  // ─── Init ─────────────────────────────────────────────────────────────────
  OnboardingEngine.prototype.init = function () {
    // Apply direction from questionnaire meta if provided
    if (this.q.meta && this.q.meta.direction) {
      this.rootEl.setAttribute('dir', this.q.meta.direction);
    }

    var saved = this._loadFromStorage();
    // Preserve a resumable session for the explicit resume button; always show intro first.
    this._savedState = (saved && saved.started && !saved.finished) ? saved : null;
    this._state = this._buildInitialState();
    this._render();
  };

  // ─── State factory ────────────────────────────────────────────────────────
  OnboardingEngine.prototype._buildInitialState = function () {
    return {
      mode:     null,
      started:  false,
      finished: false,
      queue:    [],           // ordered step IDs for active session
      history:  [],           // stack of visited indices (for back navigation)
      currentIndex: 0,
      answers:  {},           // { stepId: rawValue }
      progress: this._emptyProgress(),
      projectProfile: {
        features:   [],
        complexity: null,
        siteType:   null,
        tags:       []
      }
    };
  };

  OnboardingEngine.prototype._emptyProgress = function () {
    return {
      total:     0,
      current:   0,
      answered:  0,
      remaining: 0,
      percent:   0,
      byChapter: {}
    };
  };

  // ─── Public: selectMode ──────────────────────────────────────────────────
  OnboardingEngine.prototype.selectMode = function (mode) {
    if (mode !== 'A' && mode !== 'B') return;
    this._state.mode    = mode;
    this._state.started = true;
    // Build the initial queue from the filtered step list
    this._state.queue   = this._buildBaseQueue(mode);
    this._state.currentIndex = 0;
    this._state.history = [];
    this._recomputeProgress();
    this._save();
    this._render();
  };

  // ─── Public: submitAnswer ────────────────────────────────────────────────
  OnboardingEngine.prototype.submitAnswer = function (stepId, value) {
    var previousValue = this._state.answers[stepId]; // capture before overwriting
    this._state.answers[stepId] = value;

    // Accumulate signals from this answer
    var step = this._getStepById(stepId);
    if (step && step.signals) {
      this._accumulateSignals(step, value);
    }

    // Remove stale follow-ups injected by a previous different answer before re-injecting
    if (previousValue !== undefined && step && step.followUps && step.followUps.length) {
      this._removeStaleFollowUps(step, previousValue, value);
    }

    // Resolve conditional follow-ups and inject into queue
    if (step && step.followUps && step.followUps.length) {
      this._injectFollowUps(step, value);
    }

    this._advance();
  };

  // Remove follow-up questions from the queue that were injected by a previous answer
  // but whose triggering condition no longer matches the new answer.
  OnboardingEngine.prototype._removeStaleFollowUps = function (step, oldValue, newValue) {
    var self    = this;
    var aheadOf = this._state.currentIndex + 1;

    step.followUps.forEach(function (rule) {
      if (!self._matchesWhen(rule.when, oldValue)) return; // rule didn't fire before
      if (self._matchesWhen(rule.when, newValue))  return; // rule still fires — keep it
      rule.questions.forEach(function (qid) {
        var idx = self._state.queue.indexOf(qid);
        if (idx >= aheadOf) self._state.queue.splice(idx, 1);
      });
    });
  };

  // ─── Public: back ────────────────────────────────────────────────────────
  OnboardingEngine.prototype.back = function () {
    if (this._state.history.length === 0) return;
    this._state.currentIndex = this._state.history.pop();
    this._recomputeProgress();
    this._save();
    this._render();
  };

  // ─── Public: skipStep ────────────────────────────────────────────────────
  OnboardingEngine.prototype.skipStep = function () {
    this._advance();
  };

  // ─── Public: getState ────────────────────────────────────────────────────
  OnboardingEngine.prototype.getState = function () {
    return JSON.parse(JSON.stringify(this._state));
  };

  // ─── Public: reset ───────────────────────────────────────────────────────
  OnboardingEngine.prototype.reset = function () {
    localStorage.removeItem(this._storageKey());
    this._state = this._buildInitialState();
    this._render();
  };

  // ─── Queue building ───────────────────────────────────────────────────────
  OnboardingEngine.prototype._buildBaseQueue = function (mode) {
    return this.q.steps
      .filter(function (s) { return s.modes && s.modes.indexOf(mode) !== -1; })
      .map(function (s) { return s.id; });
  };

  // Inject follow-up step IDs into the queue immediately after the current step,
  // only if they aren't already queued further ahead.
  OnboardingEngine.prototype._injectFollowUps = function (step, value) {
    var toInject = [];
    var mode     = this._state.mode;

    step.followUps.forEach(function (rule) {
      if (!this._matchesWhen(rule.when, value)) return;
      rule.questions.forEach(function (qid) {
        // Only inject if the step exists, is in this mode, and isn't already in the queue
        var candidate = this._getStepById(qid);
        if (!candidate) return;
        if (!candidate.modes || candidate.modes.indexOf(mode) === -1) return;
        if (this._state.queue.indexOf(qid) !== -1) return;
        toInject.push(qid);
      }, this);
    }, this);

    if (toInject.length) {
      // Insert right after currentIndex
      var insertAt = this._state.currentIndex + 1;
      this._state.queue.splice.apply(
        this._state.queue,
        [insertAt, 0].concat(toInject)
      );
    }
  };

  // ─── Condition matching ───────────────────────────────────────────────────
  OnboardingEngine.prototype._matchesWhen = function (when, value) {
    if (!when || !when.length) return false;
    // Special tokens
    if (when.indexOf('__any__') !== -1 && value !== null && value !== undefined && value !== '') return true;
    if (when.indexOf('__empty__') !== -1 && (value === null || value === undefined || value === '')) return true;
    // Array value (checkbox)
    if (Array.isArray(value)) {
      return value.some(function (v) { return when.indexOf(v) !== -1; });
    }
    // Scalar value (radio, text, etc.)
    return when.indexOf(value) !== -1;
  };

  // ─── Signal accumulation ──────────────────────────────────────────────────
  OnboardingEngine.prototype._accumulateSignals = function (step, value) {
    var signals = step.signals;
    var resolved;

    if (signals.byValue) {
      // For checkbox answers merge signals for each selected value
      if (Array.isArray(value)) {
        resolved = { features: [], complexity: null, siteType: null, tags: [] };
        value.forEach(function (v) {
          var s = signals.byValue[v];
          if (s) this._mergeSignal(resolved, s);
        }, this);
      } else {
        resolved = signals.byValue[value] || signals.default || null;
      }
    } else {
      resolved = signals.default || null;
    }

    if (!resolved) return;
    this._mergeSignal(this._state.projectProfile, resolved);
  };

  OnboardingEngine.prototype._mergeSignal = function (target, source) {
    // features — union
    if (source.features && source.features.length) {
      source.features.forEach(function (f) {
        if (target.features.indexOf(f) === -1) target.features.push(f);
      });
    }
    // complexity — take highest
    if (source.complexity) {
      var currentRank = COMPLEXITY_RANK[target.complexity] || 0;
      var sourceRank  = COMPLEXITY_RANK[source.complexity] || 0;
      if (sourceRank > currentRank) target.complexity = source.complexity;
    }
    // siteType — first non-null wins
    if (source.siteType && !target.siteType) {
      target.siteType = source.siteType;
    }
    // tags — union
    if (source.tags && source.tags.length) {
      source.tags.forEach(function (t) {
        if (target.tags.indexOf(t) === -1) target.tags.push(t);
      });
    }
  };

  // ─── Advance ─────────────────────────────────────────────────────────────
  OnboardingEngine.prototype._advance = function () {
    var next = this._state.currentIndex + 1;
    this._state.history.push(this._state.currentIndex);

    if (next >= this._state.queue.length) {
      this._state.finished = true;
    } else {
      this._state.currentIndex = next;
    }

    this._recomputeProgress();
    this._save();
    this._render();
  };

  // ─── Progress computation ─────────────────────────────────────────────────
  OnboardingEngine.prototype._recomputeProgress = function () {
    var state   = this._state;
    var queue   = state.queue;
    var answers = state.answers;
    var total   = queue.length;

    // Count only question-type steps toward answered
    var answered = 0;
    var questionTotal = 0;
    queue.forEach(function (id) {
      var step = this._getStepById(id);
      if (!step || step.type !== 'question') return;
      questionTotal++;
      if (answers[id] !== undefined) answered++;
    }, this);

    var remaining = questionTotal - answered;
    var percent   = questionTotal > 0 ? Math.round((answered / questionTotal) * 100) : 0;

    // Per-chapter progress
    var byChapter = {};
    this.q.chapters.forEach(function (ch) {
      byChapter[ch.id] = { total: 0, answered: 0, active: false };
    });

    queue.forEach(function (id) {
      var step = this._getStepById(id);
      if (!step || step.type !== 'question') return;
      if (!byChapter[step.chapter]) return;
      byChapter[step.chapter].total++;
      if (answers[id] !== undefined) byChapter[step.chapter].answered++;
    }, this);

    // Mark active chapter
    var currentStep = this._getCurrentStep();
    if (currentStep && byChapter[currentStep.chapter]) {
      byChapter[currentStep.chapter].active = true;
    }

    state.progress = {
      total:     total,
      current:   state.currentIndex + 1,
      answered:  answered,
      remaining: remaining,
      percent:   percent,
      byChapter: byChapter
    };
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────
  OnboardingEngine.prototype._getStepById = function (id) {
    for (var i = 0; i < this.q.steps.length; i++) {
      if (this.q.steps[i].id === id) return this.q.steps[i];
    }
    return null;
  };

  OnboardingEngine.prototype._getCurrentStep = function () {
    var id = this._state.queue[this._state.currentIndex];
    return id ? this._getStepById(id) : null;
  };

  // ─── LocalStorage persistence ─────────────────────────────────────────────
  OnboardingEngine.prototype._storageKey = function () {
    return 'ux_onboarding_' + this.q.meta.id;
  };

  OnboardingEngine.prototype._save = function () {
    var self = this;
    if (self._saveTimer) clearTimeout(self._saveTimer);
    self._saveTimer = setTimeout(function () {
      try {
        localStorage.setItem(self._storageKey(), JSON.stringify(self._state));
      } catch (e) { /* storage quota exceeded — silently ignore */ }
    }, 300);
  };

  OnboardingEngine.prototype._loadFromStorage = function () {
    try {
      var raw = localStorage.getItem(this._storageKey());
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  };

  // ─── Renderer ─────────────────────────────────────────────────────────────
  OnboardingEngine.prototype._render = function () {
    var state = this._state;
    var root  = this.rootEl;

    if (state.finished) {
      root.innerHTML = this._renderSummary();
      this._bindSummaryEvents();
      return;
    }

    if (!state.started) {
      root.innerHTML = this._renderIntro();
      this._bindIntroEvents();
      return;
    }

    var step = this._getCurrentStep();
    if (!step) return;

    root.innerHTML =
      this._renderLayout(
        this._renderSidebar(),
        this._renderMain(step)
      );

    this._bindStepEvents(step);
  };

  // ─── Intro screen ─────────────────────────────────────────────────────────
  OnboardingEngine.prototype._renderIntro = function () {
    var meta = this.q.meta;
    return (
      '<div class="uob-intro">' +
        '<div class="uob-intro__content">' +
          '<h1 class="uob-intro__heading">' + this._esc(meta.intro.heading) + '</h1>' +
          '<p class="uob-intro__body">' + this._esc(meta.intro.body) + '</p>' +
          '<div class="uob-intro__modes">' +
            '<button class="uob-btn uob-btn--primary uob-mode-btn" data-mode="A">' + this._esc(meta.intro.ctaA) + '</button>' +
            '<button class="uob-btn uob-btn--secondary uob-mode-btn" data-mode="B">' + this._esc(meta.intro.ctaB) + '</button>' +
          '</div>' +
          (this._loadFromStorage()
            ? '<button class="uob-btn uob-btn--ghost uob-resume-btn">Resume where I left off</button>'
            : '') +
        '</div>' +
      '</div>'
    );
  };

  OnboardingEngine.prototype._bindIntroEvents = function () {
    var self = this;
    this.rootEl.querySelectorAll('.uob-mode-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        self.selectMode(btn.getAttribute('data-mode'));
      });
    });
    var resumeBtn = this.rootEl.querySelector('.uob-resume-btn');
    if (resumeBtn) {
      resumeBtn.addEventListener('click', function () {
        if (self._savedState) {
          self._state      = self._savedState;
          self._savedState = null;
          self._recomputeProgress();
          self._render();
        }
      });
    }
  };

  // ─── Layout shell ─────────────────────────────────────────────────────────
  OnboardingEngine.prototype._renderLayout = function (sidebar, main) {
    return (
      '<div class="uob-layout">' +
        '<nav class="uob-sidebar">' + sidebar + '</nav>' +
        '<main class="uob-main">' + main + '</main>' +
      '</div>'
    );
  };

  // ─── Sidebar ──────────────────────────────────────────────────────────────
  OnboardingEngine.prototype._renderSidebar = function () {
    var state    = this._state;
    var progress = state.progress;
    var chapters = this.q.chapters;
    var html     = '';

    // Global progress bar
    html += '<div class="uob-sidebar__progress">';
    html +=   '<div class="uob-sidebar__progress-bar" style="width:' + progress.percent + '%"></div>';
    html += '</div>';
    html += '<p class="uob-sidebar__remaining">' +
              (progress.remaining > 0
                ? progress.remaining + ' question' + (progress.remaining !== 1 ? 's' : '') + ' remaining'
                : 'Almost done!') +
            '</p>';

    // Chapter list
    html += '<ol class="uob-chapter-list">';
    chapters.forEach(function (ch) {
      var chProgress = progress.byChapter[ch.id];
      if (!chProgress || chProgress.total === 0) return;

      var isActive    = chProgress.active;
      var isComplete  = chProgress.answered === chProgress.total && chProgress.total > 0;
      var cls = 'uob-chapter' +
                (isActive   ? ' uob-chapter--active'   : '') +
                (isComplete ? ' uob-chapter--complete'  : '');

      html += '<li class="' + cls + '">';
      html +=   '<span class="uob-chapter__indicator"></span>';
      html +=   '<span class="uob-chapter__title">' + this._esc(ch.title) + '</span>';
      html +=   '<span class="uob-chapter__count">' +
                  chProgress.answered + '/' + chProgress.total +
                '</span>';
      html += '</li>';
    }, this);
    html += '</ol>';

    return html;
  };

  // ─── Main step area ───────────────────────────────────────────────────────
  OnboardingEngine.prototype._renderMain = function (step) {
    var html = '<div class="uob-step uob-step--' + step.type + '" data-step-id="' + step.id + '">';

    switch (step.type) {
      case 'question':   html += this._renderQuestion(step);   break;
      case 'info':       html += this._renderInfo(step);       break;
      case 'reflection': html += this._renderReflection(step); break;
      case 'checkpoint': html += this._renderCheckpoint(step); break;
    }

    html += '</div>';
    return html;
  };

  // ─── Question step ────────────────────────────────────────────────────────
  OnboardingEngine.prototype._renderQuestion = function (step) {
    var savedValue = this._state.answers[step.id];
    var html = '';

    html += '<p class="uob-chapter-label">' + this._esc(this._chapterTitle(step.chapter)) + '</p>';
    html += '<h2 class="uob-question">' + this._esc(step.question) + '</h2>';

    // Response bubble (shown if already answered)
    if (savedValue !== undefined && step.response) {
      html += this._renderResponseBubble(step, savedValue);
    }

    // Input
    html += '<div class="uob-input-area">';
    switch (step.inputType) {
      case 'radio':    html += this._renderRadio(step, savedValue);    break;
      case 'checkbox': html += this._renderCheckbox(step, savedValue); break;
      case 'textarea': html += this._renderTextarea(step, savedValue); break;
      case 'text':     html += this._renderTextInput(step, savedValue, 'text'); break;
      case 'number':   html += this._renderTextInput(step, savedValue, 'number'); break;
    }
    html += '</div>';

    // Actions
    html += this._renderActions(step);

    return html;
  };

  OnboardingEngine.prototype._renderRadio = function (step, savedValue) {
    var html = '<div class="uob-options uob-options--radio">';
    step.options.forEach(function (opt) {
      var isChecked = savedValue === opt.value;
      html +=
        '<label class="uob-option' + (isChecked ? ' uob-option--selected' : '') + '">' +
          '<input type="radio" name="' + step.id + '" value="' + this._esc(opt.value) + '"' +
            (isChecked ? ' checked' : '') + '> ' +
          '<span class="uob-option__label">' + this._esc(opt.label) + '</span>' +
        '</label>';
    }, this);
    html += '</div>';
    return html;
  };

  OnboardingEngine.prototype._renderCheckbox = function (step, savedValue) {
    var selected = Array.isArray(savedValue) ? savedValue : [];
    var html = '<div class="uob-options uob-options--checkbox">';
    step.options.forEach(function (opt) {
      var isChecked = selected.indexOf(opt.value) !== -1;
      html +=
        '<label class="uob-option' + (isChecked ? ' uob-option--selected' : '') + '">' +
          '<input type="checkbox" name="' + step.id + '" value="' + this._esc(opt.value) + '"' +
            (isChecked ? ' checked' : '') + '> ' +
          '<span class="uob-option__label">' + this._esc(opt.label) + '</span>' +
        '</label>';
    }, this);
    html += '</div>';
    return html;
  };

  OnboardingEngine.prototype._renderTextarea = function (step, savedValue) {
    return (
      '<textarea class="uob-textarea" name="' + step.id + '" rows="4" ' +
        'placeholder="' + this._esc(step.placeholder || '') + '">' +
        this._esc(savedValue || '') +
      '</textarea>'
    );
  };

  OnboardingEngine.prototype._renderTextInput = function (step, savedValue, type) {
    return (
      '<input class="uob-input" type="' + type + '" name="' + step.id + '" ' +
        'placeholder="' + this._esc(step.placeholder || '') + '" ' +
        'value="' + this._esc(savedValue || '') + '">'
    );
  };

  OnboardingEngine.prototype._renderResponseBubble = function (step, value) {
    var text = (step.response.byValue && step.response.byValue[value])
      ? step.response.byValue[value]
      : step.response.default;
    if (!text) return '';
    return '<p class="uob-response-bubble">' + this._esc(text) + '</p>';
  };

  OnboardingEngine.prototype._renderActions = function (step) {
    var canBack = this._state.history.length > 0;
    var html = '<div class="uob-actions">';

    if (canBack) {
      html += '<button class="uob-btn uob-btn--ghost uob-back-btn">Back</button>';
    }

    if (!step.required) {
      html += '<button class="uob-btn uob-btn--ghost uob-skip-btn">Skip</button>';
    }

    html += '<button class="uob-btn uob-btn--primary uob-next-btn">Next</button>';
    html += '</div>';
    return html;
  };

  // ─── Info step ────────────────────────────────────────────────────────────
  OnboardingEngine.prototype._renderInfo = function (step) {
    var html = '<div class="uob-info-card">';
    html += '<h2 class="uob-info-card__heading">' + this._esc(step.content.heading) + '</h2>';
    html += '<p class="uob-info-card__body">' + this._esc(step.content.body) + '</p>';
    html += '<div class="uob-actions">';
    if (this._state.history.length > 0) {
      html += '<button class="uob-btn uob-btn--ghost uob-back-btn">Back</button>';
    }
    html += '<button class="uob-btn uob-btn--primary uob-info-continue-btn">' +
              this._esc(step.content.cta || 'Continue') +
            '</button>';
    html += '</div>';
    html += '</div>';
    return html;
  };

  // ─── Reflection step ──────────────────────────────────────────────────────
  OnboardingEngine.prototype._renderReflection = function (step) {
    var profile  = this._state.projectProfile;
    var answers  = this._state.answers;
    var html     = '<div class="uob-reflection">';

    html += '<h2 class="uob-reflection__heading">' + this._esc(step.content.heading) + '</h2>';
    html += '<p class="uob-reflection__body">' + this._esc(step.content.body) + '</p>';

    // Summary of signals so far
    html += '<div class="uob-reflection__profile">';

    if (profile.siteType) {
      html += '<div class="uob-signal-row"><span class="uob-signal-label">Site type</span><span class="uob-signal-value">' + this._esc(profile.siteType) + '</span></div>';
    }
    if (profile.complexity) {
      html += '<div class="uob-signal-row"><span class="uob-signal-label">Complexity</span><span class="uob-signal-value">' + this._esc(profile.complexity) + '</span></div>';
    }
    if (profile.features.length) {
      html += '<div class="uob-signal-row"><span class="uob-signal-label">Features detected</span><span class="uob-signal-value">' +
                profile.features.map(function (f) { return this._esc(f.replace(/_/g, ' ')); }, this).join(', ') +
              '</span></div>';
    }

    html += '</div>';

    html += '<div class="uob-actions">';
    if (this._state.history.length > 0) {
      html += '<button class="uob-btn uob-btn--ghost uob-back-btn">Back</button>';
    }
    html += '<button class="uob-btn uob-btn--primary uob-info-continue-btn">' +
              this._esc(step.content.cta || 'Looks right, continue') +
            '</button>';
    html += '</div>';
    html += '</div>';
    return html;
  };

  // ─── Checkpoint step ──────────────────────────────────────────────────────
  OnboardingEngine.prototype._renderCheckpoint = function (step) {
    var html = '<div class="uob-checkpoint">';
    html += '<h2 class="uob-checkpoint__heading">' + this._esc(step.content.heading) + '</h2>';
    html += '<p class="uob-checkpoint__body">' + this._esc(step.content.body) + '</p>';
    html += '<div class="uob-actions">';
    if (this._state.history.length > 0) {
      html += '<button class="uob-btn uob-btn--ghost uob-back-btn">Back</button>';
    }
    html += '<button class="uob-btn uob-btn--primary uob-info-continue-btn">' +
              this._esc(step.content.cta || 'Continue') +
            '</button>';
    html += '</div>';
    html += '</div>';
    return html;
  };

  // ─── Summary screen ───────────────────────────────────────────────────────
  OnboardingEngine.prototype._renderSummary = function () {
    var meta    = this.q.meta;
    var state   = this._state;
    var profile = state.projectProfile;
    var html    = '<div class="uob-summary">';

    html += '<h1 class="uob-summary__heading">' + this._esc(meta.summary.heading) + '</h1>';
    html += '<p class="uob-summary__body">' + this._esc(meta.summary.body) + '</p>';

    // Project profile card
    html += '<div class="uob-summary__profile">';
    html += '<h3 class="uob-summary__section-title">Project profile</h3>';
    if (profile.siteType) {
      html += '<div class="uob-signal-row"><span class="uob-signal-label">Site type</span><span class="uob-signal-value uob-signal-value--tag">' + this._esc(profile.siteType) + '</span></div>';
    }
    if (profile.complexity) {
      html += '<div class="uob-signal-row"><span class="uob-signal-label">Complexity</span><span class="uob-signal-value uob-signal-value--' + profile.complexity + '">' + this._esc(profile.complexity) + '</span></div>';
    }
    if (profile.features.length) {
      html += '<div class="uob-signal-row uob-signal-row--wrap"><span class="uob-signal-label">Features</span><span class="uob-signal-value">';
      profile.features.forEach(function (f) {
        html += '<span class="uob-tag">' + this._esc(f.replace(/_/g, ' ')) + '</span>';
      }, this);
      html += '</span></div>';
    }
    if (profile.tags.length) {
      html += '<div class="uob-signal-row uob-signal-row--wrap"><span class="uob-signal-label">Signals</span><span class="uob-signal-value">';
      profile.tags.forEach(function (t) {
        html += '<span class="uob-tag uob-tag--secondary">' + this._esc(t.replace(/-/g, ' ')) + '</span>';
      }, this);
      html += '</span></div>';
    }
    html += '</div>';

    // Answers grouped by chapter
    html += '<div class="uob-summary__answers">';
    html += '<h3 class="uob-summary__section-title">Your answers</h3>';

    this.q.chapters.forEach(function (ch) {
      // Find answered questions in this chapter
      var chAnswers = state.queue.filter(function (id) {
        var step = this._getStepById(id);
        return step && step.type === 'question' && step.chapter === ch.id && state.answers[id] !== undefined;
      }, this);

      if (!chAnswers.length) return;

      html += '<div class="uob-summary__chapter">';
      html += '<h4 class="uob-summary__chapter-title">' + this._esc(ch.title) + '</h4>';

      chAnswers.forEach(function (id) {
        var step   = this._getStepById(id);
        var answer = state.answers[id];
        var displayAnswer = this._formatAnswerForDisplay(step, answer);

        html += '<div class="uob-summary__qa">';
        html +=   '<p class="uob-summary__q">' + this._esc(step.question) + '</p>';
        html +=   '<p class="uob-summary__a">' + displayAnswer + '</p>';
        html += '</div>';
      }, this);

      html += '</div>';
    }, this);

    html += '</div>'; // answers

    // Submission
    html += '<div class="uob-submit-feedback" aria-live="polite"></div>';
    html += '<div class="uob-summary__actions">';
    html += '<button class="uob-btn uob-btn--primary uob-submit-btn">Send submission</button>';
    html += '<button class="uob-btn uob-btn--secondary uob-export-btn">Export as JSON</button>';
    html += '<button class="uob-btn uob-btn--ghost uob-reset-btn">Start over</button>';
    html += '</div>';

    html += '</div>'; // summary
    return html;
  };

  OnboardingEngine.prototype._formatAnswerForDisplay = function (step, answer) {
    if (!step || answer === undefined || answer === null) return '—';

    if (Array.isArray(answer)) {
      // checkbox — resolve labels
      return answer.map(function (v) {
        var opt = (step.options || []).find(function (o) { return o.value === v; });
        return opt ? this._esc(opt.label) : this._esc(v);
      }, this).join(', ') || '—';
    }

    if (step.inputType === 'radio' && step.options) {
      var opt = step.options.find(function (o) { return o.value === answer; });
      return opt ? this._esc(opt.label) : this._esc(String(answer));
    }

    return this._esc(String(answer));
  };

  // ─── Event binding ────────────────────────────────────────────────────────
  OnboardingEngine.prototype._bindStepEvents = function (step) {
    var self = this;
    var root = this.rootEl;

    // Back
    var backBtn = root.querySelector('.uob-back-btn');
    if (backBtn) backBtn.addEventListener('click', function () { self.back(); });

    // Skip
    var skipBtn = root.querySelector('.uob-skip-btn');
    if (skipBtn) skipBtn.addEventListener('click', function () { self.skipStep(); });

    // Info / reflection / checkpoint continue
    var continueBtn = root.querySelector('.uob-info-continue-btn');
    if (continueBtn) {
      continueBtn.addEventListener('click', function () { self._advance(); });
    }

    // Question next
    var nextBtn = root.querySelector('.uob-next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        var value = self._readInputValue(step);
        if (step.required && !self._hasValue(value)) {
          self._showValidationError(root);
          return;
        }
        if (self._hasValue(value)) {
          self.submitAnswer(step.id, value);
        } else {
          self.skipStep();
        }
      });
    }

    // Radio: auto-highlight selected option label
    root.querySelectorAll('input[type="radio"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        root.querySelectorAll('.uob-option').forEach(function (el) {
          el.classList.remove('uob-option--selected');
        });
        radio.closest('.uob-option').classList.add('uob-option--selected');
      });
    });

    // Checkbox: toggle highlight
    root.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var label = cb.closest('.uob-option');
        if (cb.checked) {
          label.classList.add('uob-option--selected');
        } else {
          label.classList.remove('uob-option--selected');
        }
      });
    });
  };

  OnboardingEngine.prototype._bindSummaryEvents = function () {
    var self = this;
    var root = this.rootEl;

    var submitBtn = root.querySelector('.uob-submit-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', function () {
        self._submitToWordPress(submitBtn);
      });
    }

    var resetBtn = root.querySelector('.uob-reset-btn');
    if (resetBtn) resetBtn.addEventListener('click', function () { self.reset(); });

    var exportBtn = root.querySelector('.uob-export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', function () {
        var data = JSON.stringify(self.getState(), null, 2);
        var blob = new Blob([data], { type: 'application/json' });
        var url  = URL.createObjectURL(blob);
        var a    = document.createElement('a');
        a.href   = url;
        a.download = self.q.meta.id + '-results.json';
        a.click();
        URL.revokeObjectURL(url);
      });
    }
  };

  // ─── Input reading ────────────────────────────────────────────────────────
  OnboardingEngine.prototype._readInputValue = function (step) {
    var root = this.rootEl;
    switch (step.inputType) {
      case 'radio': {
        var checked = root.querySelector('input[type="radio"]:checked');
        return checked ? checked.value : null;
      }
      case 'checkbox': {
        var values = [];
        root.querySelectorAll('input[type="checkbox"]:checked').forEach(function (cb) {
          values.push(cb.value);
        });
        return values.length ? values : null;
      }
      case 'textarea': {
        var ta = root.querySelector('.uob-textarea');
        return ta && ta.value.trim() ? ta.value.trim() : null;
      }
      case 'text':
      case 'number': {
        var inp = root.querySelector('.uob-input');
        return inp && inp.value.trim() ? inp.value.trim() : null;
      }
    }
    return null;
  };

  OnboardingEngine.prototype._hasValue = function (value) {
    if (value === null || value === undefined) return false;
    if (Array.isArray(value)) return value.length > 0;
    return String(value).trim().length > 0;
  };

  OnboardingEngine.prototype._showValidationError = function (root) {
    var existing = root.querySelector('.uob-validation-error');
    if (existing) return;
    var msg = document.createElement('p');
    msg.className = 'uob-validation-error';
    msg.textContent = 'Please answer this question before continuing.';
    var actions = root.querySelector('.uob-actions');
    if (actions) actions.parentNode.insertBefore(msg, actions);
  };

  // ─── WordPress submission ────────────────────────────────────────────────

  // POST the completed session to the Make webhook.
  // Webhook URL can be overridden via window.uxOnboardingConfig.endpoint.
  OnboardingEngine.prototype._submitToWordPress = function (btn) {
    var self     = this;
    var state    = this._state;
    var endpoint = (window.uxOnboardingConfig && window.uxOnboardingConfig.endpoint)
      || 'https://hook.eu1.make.com/2c62xradq05hwlh2o2p6qnq5jnyqqbi4';

    var modeLabel = state.mode === 'B' ? 'Deep Dive' : 'Quick Mode';

    // Extract the client email if the user filled it in
    var clientEmail = (state.answers['client_email'] || '').trim();

    var payload = {
      mode:             state.mode,
      modeLabel:        modeLabel,
      completedAt:      new Date().toISOString(),
      siteUrl:          window.location.href,
      clientEmail:      clientEmail,
      // Pre-formatted plain text — use these directly in Make email bodies
      profileText:      self._buildProfileText(),
      answersText:      self._buildAnswersText(),
      // Structured data — available for any other Make use
      projectProfile:   state.projectProfile,
      answersFormatted: self._buildAnswersPayload()
    };

    // Debug: log exactly what is being sent — remove after confirming
    console.log('[ux-onboarding] payload:', JSON.stringify(payload, null, 2));

    btn.disabled    = true;
    btn.textContent = 'Sending\u2026';

    fetch(endpoint, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload)
    })
    .then(function (res) {
      // Make returns 200 with {"accepted":1} — any 2xx is a success
      if (!res.ok) throw new Error('HTTP ' + res.status);
      btn.style.display = 'none';
      self._showSubmitFeedback(true);
    })
    .catch(function (err) {
      console.error('[ux-onboarding] Submission failed:', err);
      btn.disabled    = false;
      btn.textContent = 'Try again';
      self._showSubmitFeedback(false);
    });
  };

  // Build a clean, label-resolved answers array for the email.
  // Returns: [{ chapter, items: [{ question, answer }] }]
  OnboardingEngine.prototype._buildAnswersPayload = function () {
    var self    = this;
    var state   = this._state;
    var result  = [];

    this.q.chapters.forEach(function (ch) {
      var items = [];
      state.queue.forEach(function (id) {
        var step = self._getStepById(id);
        if (!step || step.type !== 'question' || step.chapter !== ch.id) return;
        var answer = state.answers[id];
        if (answer === undefined) return;
        items.push({
          question: step.question,
          answer:   self._resolveAnswerLabel(step, answer)
        });
      });
      if (items.length) result.push({ chapter: ch.title, items: items });
    });

    return result;
  };

  // Build a plain-text string of all answers grouped by chapter — ready for email.
  // Skips the client_email question itself.
  OnboardingEngine.prototype._buildAnswersText = function () {
    var self  = this;
    var state = this._state;
    var lines = [];
    var sep   = '------------------------------------------------------------';

    this.q.chapters.forEach(function (ch) {
      var chLines = [];
      state.queue.forEach(function (id) {
        if (id === 'client_email') return;
        var step = self._getStepById(id);
        if (!step || step.type !== 'question' || step.chapter !== ch.id) return;
        var answer = state.answers[id];
        if (answer === undefined) return;
        chLines.push('Q: ' + step.question);
        chLines.push('A: ' + self._resolveAnswerLabel(step, answer));
        chLines.push('');
      });
      if (chLines.length) {
        lines.push(sep);
        lines.push(ch.title.toUpperCase());
        lines.push(sep);
        lines.push('');
        lines = lines.concat(chLines);
      }
    });

    return lines.join('\n');
  };

  // Build a plain-text summary of the project profile — ready for email.
  OnboardingEngine.prototype._buildProfileText = function () {
    var profile = this._state.projectProfile;
    var lines   = [];
    if (profile.siteType)                          lines.push('Site type:   ' + profile.siteType);
    if (profile.complexity)                        lines.push('Complexity:  ' + profile.complexity);
    if (profile.features && profile.features.length) lines.push('Features:    ' + profile.features.join(', '));
    if (profile.tags    && profile.tags.length)    lines.push('Signals:     ' + profile.tags.join(', '));
    return lines.join('\n') || 'No profile data.';
  };

  // Resolve a raw answer value to its human-readable label — no HTML escaping.
  OnboardingEngine.prototype._resolveAnswerLabel = function (step, answer) {
    if (answer === undefined || answer === null) return '';
    if (Array.isArray(answer)) {
      return answer.map(function (v) {
        var opt = (step.options || []).find(function (o) { return o.value === v; });
        return opt ? opt.label : v;
      }).join(', ') || '';
    }
    if (step.options) {
      var opt = step.options.find(function (o) { return o.value === answer; });
      return opt ? opt.label : String(answer);
    }
    return String(answer);
  };

  // Show a success or error message in the .uob-submit-feedback element.
  OnboardingEngine.prototype._showSubmitFeedback = function (success) {
    var el = this.rootEl.querySelector('.uob-submit-feedback');
    if (!el) return;
    el.className = 'uob-submit-feedback uob-submit-feedback--' + (success ? 'success' : 'error');
    el.textContent = success
      ? 'Submission received — we\'ll be in touch soon.'
      : 'Something went wrong. Please try again or export your answers as JSON.';
  };

  // ─── Utility ─────────────────────────────────────────────────────────────
  OnboardingEngine.prototype._esc = function (str) {
    if (typeof str !== 'string') return str;
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  OnboardingEngine.prototype._chapterTitle = function (chapterId) {
    var ch = this.q.chapters.find(function (c) { return c.id === chapterId; });
    return ch ? ch.title : chapterId;
  };

  // ─── Bootstrap ────────────────────────────────────────────────────────────
  // Retries up to 10 times (2 seconds total) to handle Elementor's deferred
  // widget rendering. Logs a clear console error if init ultimately fails.
  function autoInit(attempts) {
    var root = document.querySelector('.ux-onboarding-app');

    if (!root) {
      if (attempts > 0) { setTimeout(function () { autoInit(attempts - 1); }, 200); return; }
      console.error('[ux-onboarding] Root element .ux-onboarding-app not found in the DOM.');
      return;
    }

    // Guard against double-init (Elementor editor re-renders widgets on save)
    if (root.dataset.uobInitialised) return;
    root.dataset.uobInitialised = '1';

    if (typeof QUESTIONNAIRE === 'undefined') {
      console.error('[ux-onboarding] QUESTIONNAIRE is not defined. Make sure questions.js is loaded before onboarding.js.');
      return;
    }

    var engine = new OnboardingEngine(QUESTIONNAIRE, root);
    engine.init();
    window.__onboardingEngine = engine; // expose for debugging
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { autoInit(10); });
  } else {
    autoInit(10);
  }

})();
