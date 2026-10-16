# Learn GitLab DevSecOps Platform Architecture

Architect study console for the GitLab DevSecOps platform pack: conceptual, logical, and physical views; control plane vs job plane; GitLab Dedicated for Government (FedRAMP Moderate FR2411959145 on AWS GovCloud US-West); dual GitLab Duo AI paths (managed cloud vs zero-egress self-hosted AI Gateway); and daily architecture drills.

Same no-build static pattern as [learn-m365-digital-work](https://github.com/aaronmeis/learn-m365-digital-work) and [learn-dcsa](https://github.com/aaronmeis/learn-dcsa).

**Live site:** https://aaronmeis.github.io/learn-gitlab/

---

## What is on the console

- **Today hub.** Question of the day, study streak, and a placement drill that maps components to the GovCloud tenant boundary.
- **Learn (8-block day).** Context and scope through conceptual, logical, physical, integration and AI, lab, failure modes, and design review. Blocks collapse; Block 1 starts open.
- **Architecture views.** One Draw.io slide per view (house black/yellow chrome, Azure-style agnostic icons):
  - Conceptual: capabilities C1–C9 and the OV-1 operational concept
  - Logical: front door → Rails → Sidekiq → Postgres → Gitaly → Runner
  - Physical: four offerings matrix and Dedicated for Government placement
  - Integration and AI: identity handoff, PrivateLink, dual Duo paths
- **Presentation deck.** ODM YouTube cut (`PzEIulYVSrA`) above the 15-slide NotebookLM deck.
- **Claims and debates.** Four live architectural debates with warrants, hidden assumptions, and designed counter-evidence.
- **Practice hub.** 20-question quiz and 43 glossary-backed flashcards (Space flips; arrows navigate).
- **Failure modes.** 16-point matrix with visible tells, root causes, and mitigations.
- **Glossary.** 43 categorized terms across Rungs 100, 200, and 300.
- **Source ledger.** 20 verified high-trust sources.
- **Quick search.** `Ctrl+K` across sections.

Editable diagram sources: `assets/diagrams/drawio/`. Site PNGs: `assets/diagrams/0N-*.png`.

---

## Sources of truth

The maintainer's private research packs (Tech Deep Dive and One-Day Mastery for GitLab) are outside this repo. Set `LEARN_TDD_PACK`, `LEARN_ODM_PACK`, and `LEARN_SHORTS_TOPICS` to point the build script at them.

To regenerate `js/data.js` and `data.json` from the vault:

```powershell
python scripts/build_console_data.py
```

---

## Deploying to GitHub Pages

1. Commit and push to `main` as aaronmeis.
2. Enable GitHub Pages: Settings → Pages → Deploy from a branch → `main` / root.
3. After shell or data changes, bump `CACHE_NAME` in `sw.js` (for example `learn-gitlab-v7`) so clients pick up the new cache.
