
Goal: fix the hover-focus behavior so that when any dashboard card is hovered, all non-hovered cards become clearly transparent, matching the client’s expectation.

1. Confirmed root cause
- The dimming logic does exist: `sectionOpacity()` returns `0.15` for non-hovered sections.
- But each section is also a `motion.div` with `animate={{ opacity: 1, y: 0 }}`.
- Framer Motion’s animated `opacity` is overriding the inline `style.opacity`, so the transparency change never visibly applies.
- This matches your screenshot: hover highlights still work, but the rest of the dashboard stays fully opaque.

2. Fix approach
- Keep the entrance animation (`y` movement and fade-in on load).
- Move per-section hover dimming out of the conflicting `animate.opacity` path.
- Update each section wrapper so:
  - initial load still fades/slides in once
  - hover transparency is driven by Framer Motion or plain style consistently, but not both at the same time for `opacity`
- Best implementation path:
  - use `animate={{ opacity: sectionOpacity("..."), y: 0 }}` on each section wrapper
  - or remove animated opacity after mount and let `style.opacity` control hover state
- I’d use the first option because it keeps transitions smooth and centralizes the behavior.

3. Sections to update
All desktop dashboard section wrappers in `src/components/AkeylessDashboard/index.jsx`:
- Agentic Access Overview
- Forensic Traceability
- Identity Authentication Methods in Use
- Enterprise Identity Landscape
- Identity Risk & Exposure Analysis
- External Vault & Secrets Integrations
- Certificate Lifecycle Health
- Dynamic Secrets Issued
- Enterprise Encryption & Key Operations
- Password Health

4. Consistency cleanup
- Replace the outdated code comment that says “dim to 30% opacity” since current logic is `0.15`.
- Make transition timing consistent across all section wrappers so hover dimming feels uniform.
- Verify hovered card remains fully visible while every other card fades equally.

5. Visual tuning
- If `0.15` still feels too subtle on this light UI, reduce non-hovered opacity further to `0.08–0.12`.
- Keep borders/shadows on the active card so focus is obvious even when other cards are faded.

6. Validation steps
- Hover Agentic and confirm every other section fades.
- Hover Forensic, Vault, Secrets, Encryption, Password, etc. and confirm same behavior everywhere.
- Check that tooltips still appear correctly.
- Confirm the initial page-load animation still works.
- Verify that no section gets “stuck” dimmed after mouse leave.

Technical detail
```text
Current conflict:
motion.div animate.opacity = 1
vs
style.opacity = sectionOpacity(...)

Result:
Framer Motion wins, so hover opacity changes are not shown.

Planned correction:
Use one source of truth for section opacity on each wrapper.
Example pattern:
- initial: { opacity: 0, y: 20 }
- animate: { opacity: sectionOpacity("agentic"), y: 0 }

This preserves load animation and enables live hover dimming.
```
