# Learn GitLab DevSecOps Platform Architecture

Architect study console for the GitLab DevSecOps platform architecture pack: conceptual, logical, and physical views, the control-plane versus job-plane split, GitLab Dedicated for Government (FedRAMP Moderate FR2411959145 on AWS GovCloud US-West), the dual GitLab Duo AI paths (managed cloud vs zero-egress self-hosted AI Gateway), and daily architecture challenges. 

Same no-build static pattern as [learn-m365-digital-work](https://github.com/aaronmeis/learn-m365-digital-work) and [learn-dcsa](https://github.com/aaronmeis/learn-dcsa).

**Live Site:** https://aaronmeis.github.io/learn-gitlab/

---

## Architecture Console Features

- **⚡ Today Hub**: Question of the day from the video cut, daily study streak, and the interactive placement drill mapping components to the GovCloud tenant boundary.
- **📚 Learn (8-Block Day)**: Structured curriculum from Context and Scope (Block 1) through Conceptual (Block 2), Logical (Block 3), Physical (Block 4), Integration & AI (Block 5), Hands-on Lab (Block 6), Failure Modes (Block 7), and Design Review (Block 8).
- **📐 Architecture Views**: High-resolution diagrams and tables for:
  - **Conceptual View**: Capabilities C1–C9, Actors, and the OV-1 Operational Concept.
  - **Logical View**: NGINX/Workhorse, Puma, Sidekiq, PostgreSQL, Redis, Gitaly Git RPC, and Worker data flows.
  - **Physical View**: Four offerings matrix (GitLab.com, Self-Managed, Dedicated, Dedicated for Government) and single-tenant AWS GovCloud blueprint.
  - **Integration & AI Elements**: Identity (SAML/OIDC & PIV/CAC termination at agency IdP), PrivateLink, and the dual Duo AI paths.
- **📽 Presentation Deck**: 15-slide NotebookLM presentation player with synchronized speaker notes and question cards.
- **⚖ Claims & Debates**: Four live architectural debates evaluating warrants, hidden assumptions, and designed counter-evidence.
- **🎯 Practice Hub**: 10-question retrieval assessment with instant feedback, plus 3D interactive flashcards.
- **🛡 Failure Modes**: 16-point failure matrix detailing visible tells, root causes, and verified mitigations.
- **📖 Glossary**: 30+ categorized terms with Rungs 100, 200, and 300 ratings and source tags.
- **🔗 Source Ledger**: 20 verified high-trust sources with direct documentation and paper references.
- **🔍 Global Quick Search**: `Ctrl + K` instant keyboard-driven search across all sections.

---

## Sources of Truth

The maintainer's private research packs (Tech Deep Dive and One-Day Mastery for GitLab). They are not part of this repo. Set `LEARN_TDD_PACK`, `LEARN_ODM_PACK` and `LEARN_SHORTS_TOPICS` to point the build script at them.

To regenerate `js/data.js` and `data.json` from the vault:

```powershell
python scripts/build_console_data.py
```

---

## Deploying to GitHub Pages

1. Initialize git and commit:
   ```powershell
   git init
   git add .
   git commit -m "feat: initial release of GitLab DevSecOps study console"
   ```
2. Create repository and push:
   ```powershell
   gh repo create learn-gitlab --public --source=. --remote=origin --push
   ```
3. Enable GitHub Pages in repo Settings (`Deploy from a branch` -> `main` / `root`).
