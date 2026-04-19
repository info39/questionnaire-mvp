# Project instructions

This project is for building a self-contained conversational onboarding questionnaire to embed in a WordPress Elementor page.

Core implementation rules:
- Build the questionnaire as a self-contained component
- Do not rely on Elementor internal DOM classes
- Scope all HTML, CSS, and JS under a single root wrapper
- Use vanilla JavaScript only
- Prefer maintainable structure over quick hacks
- Output code that can be pasted into an Elementor HTML widget, plus separate CSS and JS if needed

Workflow rules:
- First inspect project files before changing anything
- Propose file structure before implementation
- Keep selectors stable and scoped
- Support RTL and responsive layout

---

## COMMAND: \היסטורית שיחה

When the user types `\היסטורית שיחה`:
1. Read `SCRATCHPAD.md` in full
2. Summarize in a `<thought>` block:
   - Connected systems and their status
   - What was completed
   - What is pending
   - Last actions taken
3. Present a concise Hebrew summary to the user: current state, last session, next steps
4. Ask: "מאיפה להמשיך?"

---

## SCRATCHPAD Protocol

After every meaningful action (code change, Make update, Telegram check, decision):
- Append a timestamped entry to `SCRATCHPAD.md` under "לוג שיחות"
- Format: `### YYYY-MM-DD — [נושא]` + bullet list of what was done