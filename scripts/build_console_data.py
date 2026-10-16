"""
build_console_data.py
Parses the GitLab Obsidian Tech Deep Dive pack and emits js/data.js and js/data.json.
Enriches the study console with comprehensive terms, failure modes, quiz bank, and drills.
"""

import json
import os
import re
from pathlib import Path

SITE_ROOT = Path(__file__).resolve().parent.parent
PACK_TDD = Path(os.environ.get("LEARN_TDD_PACK", "packs/tech-deep-dive/gitlab"))
PACK_ODM = Path(os.environ.get("LEARN_ODM_PACK", "packs/one-day-mastery/gitlab"))

def parse_markdown_table(text: str):
    """Simple parser for markdown tables into list of dicts."""
    lines = [l.strip() for l in text.strip().splitlines() if l.strip().startswith("|")]
    if len(lines) < 3:
        return []
    headers = [c.strip() for c in lines[0].strip("|").split("|")]
    rows = []
    for line in lines[2:]:
        cells = [c.strip() for c in line.strip("|").split("|")]
        if len(cells) == len(headers):
            rows.append(dict(zip(headers, cells)))
    return rows

def load_sources():
    ledger_path = PACK_TDD / "reference" / "source-ledger.md"
    if not ledger_path.exists():
        return []
    text = ledger_path.read_text(encoding="utf-8")
    table_match = re.search(r"(\| # \| Title \|.*?\n(?:\|.*?\n)+)", text)
    if not table_match:
        return []
    raw_rows = parse_markdown_table(table_match.group(1))
    sources = []
    for r in raw_rows:
        num = r.get("#", "")
        title = r.get("Title", "")
        url = r.get("URL", "")
        stype = r.get("Type", "docs")
        trust = r.get("Trust", "high")
        blocks = r.get("Blocks", "")
        notes = r.get("Notes", "")
        if num.isdigit():
            sources.append({
                "n": int(num),
                "id": f"S{num}",
                "t": title,
                "u": url,
                "type": stype,
                "trust": trust,
                "b": blocks,
                "notes": notes
            })
    return sources

def load_video_cut():
    cut_path = PACK_TDD / "video" / "cut-script.json"
    if cut_path.exists():
        return json.loads(cut_path.read_text(encoding="utf-8"))
    return {}

def load_debates():
    claims_path = PACK_TDD / "CLAIMS-AND-DEBATES.md"
    if not claims_path.exists():
        return []
    text = claims_path.read_text(encoding="utf-8")
    debates = []
    
    sections = re.split(r"### Debate\s+(\d+)\s+—\s+([^\n]+)", text)
    for i in range(1, len(sections), 3):
        deb_num = int(sections[i])
        deb_title = sections[i+1].strip()
        body = sections[i+2]
        
        table_match = re.search(r"(\| Cell \| Content \|.*?\n(?:\|.*?\n)+)", body)
        cells = {}
        if table_match:
            for row in parse_markdown_table(table_match.group(1)):
                cells[row.get("Cell", "")] = row.get("Content", "")
                
        debates.append({
            "num": deb_num,
            "title": deb_title,
            "claimA": cells.get("Claim A", ""),
            "claimB": cells.get("Claim B", ""),
            "evidence": cells.get("Evidence on the table", ""),
            "warrant": cells.get("Warrant", ""),
            "hiddenAssumptions": cells.get("Hidden assumptions", ""),
            "qualifications": cells.get("Qualifications", ""),
            "changingEvidence": cells.get("Evidence that would change the picture", "")
        })
    return debates

def load_views():
    views = {}
    
    # 01 Conceptual
    v1_path = PACK_TDD / "views" / "01 - Conceptual View.md"
    if v1_path.exists():
        t1 = v1_path.read_text(encoding="utf-8")
        views["conceptual"] = {
            "title": "Conceptual View",
            "altitude": "What and why · Vendor-neutral capabilities and actors",
            "actors": [
                {"role": "Developer", "goal": "Land a reviewed change", "trust": "Low until review"},
                {"role": "Reviewer", "goal": "See tests and scans on the same change record", "trust": "Medium"},
                {"role": "Security", "goal": "Set scan policy; enforce findings cannot be waived locally", "trust": "High on policy"},
                {"role": "Platform operator", "goal": "Control-plane availability, backups, and identity integration", "trust": "High inside tenant"},
                {"role": "Job operator", "goal": "Run isolated, patched, token-rotated pipeline workers", "trust": "High, often outside tenant"},
                {"role": "Identity provider", "goal": "Authenticate people (SSO, PIV/CAC)", "trust": "High"},
                {"role": "Authorizing official (AO)", "goal": "Sign authorization letter naming this system & boundary", "trust": "Highest authority"},
                {"role": "Auditor", "goal": "Reconstruct change history & evidence without a tool tour", "trust": "Independent"}
            ],
            "capabilities": [
                {"id": "C1", "name": "Change record", "outcome": "Single object holds source diff, discussions, approvals, and gate results", "actors": "Developer, Reviewer", "src": "[S1] [S2]"},
                {"id": "C2", "name": "Pipeline contract", "outcome": "Same change triggers a declared sequence of deterministic jobs", "actors": "Developer, Job operator", "src": "[S2] [S3]"},
                {"id": "C3", "name": "Job execution", "outcome": "Untrusted code runs on an isolated worker, never on the control plane", "actors": "Job operator", "src": "[S3]"},
                {"id": "C4", "name": "Finding record", "outcome": "Security scans write normalized findings directly into the change record", "actors": "Security, Reviewer", "src": "[S4]"},
                {"id": "C5", "name": "Artifact store", "outcome": "Container images, packages, and build outputs co-located with source", "actors": "Developer, Job operator", "src": "[S1]"},
                {"id": "C6", "name": "Git storage", "outcome": "Repository history served exclusively via Git RPC; no app-server disk mount", "actors": "Platform operator", "src": "[S5]"},
                {"id": "C7", "name": "Offering choice", "outcome": "Same capabilities across multi-tenant SaaS, isolated Dedicated, and FedRAMP GovCloud", "actors": "AO, Platform operator", "src": "[S7] [S8]"},
                {"id": "C8", "name": "Identity handoff", "outcome": "Federated identity from customer IdP with hardware token support", "actors": "Identity provider", "src": "[S8]"},
                {"id": "C9", "name": "AI assistance", "outcome": "Models read repo context with strict boundary & offline data paths", "actors": "Platform operator, AO", "src": "[S12] [S13]"}
            ],
            "diagram": "assets/diagrams/01-conceptual-1.png",
            "framework": {"togaf": "Architecture Vision (Phase A) & Business Architecture (Phase B)", "dodaf": "OV-1 High-Level Operational Concept, CV-2, DIV-1"}
        }

    # 02 Logical
    v2_path = PACK_TDD / "views" / "02 - Logical View.md"
    if v2_path.exists():
        views["logical"] = {
            "title": "Logical View",
            "altitude": "Which parts and how they talk · Interface and data boundaries",
            "components": [
                {"name": "HTTP front door", "resp": "TLS termination, routing web and Git-over-HTTP requests", "inputs": "Browser, Git HTTP", "outputs": "App, Workhorse helper"},
                {"name": "SSH front door", "resp": "Git-over-SSH access control and connection routing", "inputs": "Git SSH", "outputs": "Git RPC via Git Shell auth"},
                {"name": "Application", "resp": "Projects, MRs, CI configuration, authorization, business logic", "inputs": "HTTP / Workhorse", "outputs": "Postgres writes, Sidekiq jobs, Git RPC"},
                {"name": "Job queue", "resp": "Asynchronous background work (mail, notifications, imports, fan-out)", "inputs": "Application", "outputs": "Sidekiq worker queues"},
                {"name": "Session / cache", "resp": "User sessions, job metadata leases, short-lived cache", "inputs": "Application, Queue", "outputs": "Redis key-value access"},
                {"name": "System of record DB", "resp": "Transactional persistence for projects, MRs, pipelines, vulnerabilities", "inputs": "Application", "outputs": "PostgreSQL relational rows"},
                {"name": "Git RPC service", "resp": "Read and write Git repository objects via gRPC; no shared disk mount", "inputs": "Application, Shell, Runners", "outputs": "Git packfiles and objects"},
                {"name": "Job worker", "resp": "Clone repository, run build script, execute scans, publish artifacts", "inputs": "Job payload + token", "outputs": "Build logs, findings, artifact blobs"},
                {"name": "Artifact registry", "resp": "Container image manifests, OCI layers, generic packages", "inputs": "Job worker", "outputs": "Pull credentials and binary blobs"},
                {"name": "Cluster agent (KAS)", "resp": "Inbound connection from Kubernetes cluster into control plane for GitOps", "inputs": "Kubernetes cluster", "outputs": "Deployment status and sync"},
                {"name": "AI Gateway", "resp": "Prompt preparation, model orchestration, completion streaming", "inputs": "App / IDE clients", "outputs": "LLM completions"}
            ],
            "diagrams": ["assets/diagrams/02-logical-1.png", "assets/diagrams/02-logical-2.png"],
            "framework": {"togaf": "Information Systems Architectures (Phase C: Data & Application)", "dodaf": "OV-2 Resource Flow, OV-5b Activity Model, SV-1, DIV-2"}
        }

    # 03 Physical
    v3_path = PACK_TDD / "views" / "03 - Physical View.md"
    if v3_path.exists():
        views["physical"] = {
            "title": "Physical View",
            "altitude": "What is actually deployed and where · Services, runtimes, and four offerings",
            "offerings": [
                {
                    "name": "GitLab.com",
                    "operator": "GitLab (Multi-tenant SaaS)",
                    "residency": "Multi-tenant cloud",
                    "gitStorage": "GitLab-managed Gitaly",
                    "runners": "Shared SaaS runners + Customer self-managed",
                    "aiDefault": "GitLab-managed AI Gateway (Cloud LLMs)",
                    "compliance": "SOC 2, ISO 27001. Commercial only. Not FedRAMP Moderate."
                },
                {
                    "name": "GitLab Self-Managed",
                    "operator": "Customer (Omnibus or Cloud-Native Helm)",
                    "residency": "Customer data center or private VPC",
                    "gitStorage": "Gitaly nodes; optional Praefect Gitaly Cluster",
                    "runners": "Customer-managed runners on private hosts",
                    "aiDefault": "GitLab.com Gateway or Self-hosted AI Gateway",
                    "compliance": "Customer's own ATO boundary. Path for DoD IL5, IL6, air-gap."
                },
                {
                    "name": "GitLab Dedicated",
                    "operator": "GitLab (Switchboard & Amp automation)",
                    "residency": "Dedicated single-tenant AWS account",
                    "gitStorage": "Sharded Gitaly (explicitly NOT Praefect)",
                    "runners": "Hosted runners (GitLab AWS account) + Customer runners",
                    "aiDefault": "GitLab Duo on Dedicated (managed path)",
                    "compliance": "SOC 2 Type II, ISO 27001, HIPAA. Isolated commercial account."
                },
                {
                    "name": "GitLab Dedicated for Government",
                    "operator": "GitLab (Switchboard on AWS GovCloud)",
                    "residency": "AWS GovCloud US-West (Isolated single-tenant account)",
                    "gitStorage": "Sharded Gitaly (NOT Praefect)",
                    "runners": "Customer self-managed FIPS runners OUTSIDE tenant",
                    "aiDefault": "Self-hosted AI Gateway ONLY; Agent Platform not authorized",
                    "compliance": "FedRAMP Moderate Authorized (FR2411959145), GSA Sponsor."
                }
            ],
            "services": [
                {"name": "NGINX + GitLab Workhorse", "role": "Reverse proxy & fast HTTP request accelerator (bypasses Puma for Git payloads)", "offering": "All"},
                {"name": "GitLab Shell", "role": "Fast Go daemon authenticating and multiplexing SSH Git sessions", "offering": "All"},
                {"name": "GitLab Rails / Puma", "role": "Ruby on Rails app server with 60s hard request timeout and worker killer", "offering": "All"},
                {"name": "Sidekiq", "role": "Multi-threaded background queue processor backed by Redis", "offering": "All"},
                {"name": "PostgreSQL", "role": "System-of-record relational store (Patroni for HA on Self-Managed / RDS on Dedicated)", "offering": "All"},
                {"name": "Redis", "role": "Sub-millisecond caching, rate limiting, and Sidekiq work distribution", "offering": "All"},
                {"name": "Gitaly", "role": "gRPC service providing Git access. Dedicated uses sharded Gitaly, never Praefect", "offering": "All"},
                {"name": "GitLab Runner", "role": "Go execution worker. On GovCloud, MUST be customer-managed outside tenant with FIPS", "offering": "All"},
                {"name": "GitLab KAS", "role": "Kubernetes Agent Server handling bidirectional GitOps tunnels to clusters", "offering": "All"},
                {"name": "Container Registry", "role": "Integrated Docker/OCI registry connected to cloud object storage (S3)", "offering": "All"},
                {"name": "AI Gateway", "role": "FastAPI service routing prompts to self-hosted models or external cloud vendors", "offering": "All"}
            ],
            "diagram": "assets/diagrams/03-physical-1.png",
            "framework": {"togaf": "Technology Architecture (Phase D) & Solutions (Phase E)", "dodaf": "SV-1/SV-2 Systems Interface, SV-4, DIV-3, StdV-1"}
        }

    # 04 Integration and AI
    v4_path = PACK_TDD / "views" / "04 - Integration and AI Elements.md"
    if v4_path.exists():
        views["integration"] = {
            "title": "Integration and AI Elements",
            "altitude": "External interfaces, boundary crossing, and dual AI data paths",
            "integrations": [
                {"system": "Agency IdP (Okta / Entra / Keycloak)", "dir": "Inbound", "mech": "SAML 2.0 / OIDC", "data": "Claims, groups, user identities", "auth": "Customer SSO / PIV-CAC", "gov": "Mandatory on Dedicated for Government. PIV/CAC handled by IdP."},
                {"system": "GitLab Runner", "dir": "Bidirectional", "mech": "Outbound HTTPS poll", "data": "Job payload, logs, repo clone, cache", "auth": "Scoped runner token", "gov": "Customer runs outside tenant. FIPS 140-2 validated images required."},
                {"system": "Kubernetes Clusters", "dir": "Bidirectional", "mech": "KAS (gRPC tunnel)", "data": "Cluster status, GitOps manifests", "auth": "KAS agent token", "gov": "Customer operates cluster. Dedicated for Gov KAS PA silent."},
                {"system": "AWS GovCloud (Tenant)", "dir": "Hosting", "mech": "GitLab IAM & VPC", "data": "All tenant data at rest", "auth": "GitLab Operator IAM", "gov": "AWS GovCloud US-West. Single-tenant AWS account."},
                {"system": "Customer VPC", "dir": "Optional Bi", "mech": "AWS PrivateLink", "data": "Web UI, Git SSH/HTTPS, API", "auth": "PrivateLink endpoint", "gov": "Supported on Dedicated to bypass public internet."},
                {"system": "Cloud LLMs (Anthropic, OpenAI, etc.)", "dir": "Outbound", "mech": "GitLab.com AI Gateway", "data": "Prompts, code snippets, context", "auth": "GitLab vendor key", "gov": "NOT authorized on Dedicated for Government (unauthorized data path)."},
                {"system": "Self-Hosted Model Runtime (vLLM / Bedrock-Gov)", "dir": "Bidirectional", "mech": "Customer AI Gateway", "data": "Prompts, completions, embeddings", "auth": "Customer IAM / API Key", "gov": "The ONLY authorized AI path on Dedicated for Government & air-gap."},
                {"system": "FedRAMP Marketplace / GSA ConMon", "dir": "Outbound", "mech": "Continuous Monitoring", "data": "Monthly POA&M, vulnerability reports", "auth": "GSA portal", "gov": "Listing FR2411959145. GSA sponsored."}
            ],
            "aiPaths": [
                {
                    "type": "GitLab-Managed Cloud AI Gateway",
                    "flow": "IDE / Web -> GitLab App -> GitLab-Managed AI Gateway -> Vendor Model (Claude 3.5 Sonnet / Mistral / OpenAI)",
                    "supported": "GitLab.com, Self-Managed (connected), Dedicated Commercial",
                    "govAuthorized": False,
                    "notes": "Fastest setup but prompts exit customer trust boundary to external inference endpoints."
                },
                {
                    "type": "Self-Hosted AI Gateway",
                    "flow": "IDE / Web -> GitLab App -> Customer-Hosted AI Gateway -> In-Boundary Model (Bedrock GovCloud / vLLM / Azure Gov OpenAI)",
                    "supported": "Self-Managed, Dedicated for Government",
                    "govAuthorized": True,
                    "notes": "Zero prompt egress. Model runs inside customer AWS GovCloud account or private VPC."
                }
            ],
            "diagrams": ["assets/diagrams/04-integration-ai-1.png", "assets/diagrams/04-integration-ai-2.png"],
            "framework": {"togaf": "Phase C App Interfaces & AI Governance", "dodaf": "SV-1/SV-2 external interfaces, SV-6, OV-3, StdV-1"}
        }
        
    return views

def load_curriculum_blocks():
    return [
        {
            "n": 1,
            "title": "Context and Scope",
            "time": "45 min",
            "rungs": "100",
            "lib": "block-01-context-and-scope",
            "opener": "One DevSecOps platform, four distinct operational boundaries. GitLab unifies planning, source, CI/CD, security scans, artifact storage, and deployment into a single application so the Merge Request is the sole system of record for change and evidence.",
            "obj": "Draw the boundary: what is inside (Rails, Workhorse, Gitaly, PostgreSQL, Redis, Container Registry) and what is outside (Agency IdP, CI/CD Runners on GovCloud, and Customer VPC).",
            "deliv": "Written boundary statement with at least five external neighbor systems correctly placed across the boundary line.",
            "mods": [
                {"t": "The Single-Platform Thesis [S1] [S2]", "rl": "scope · 100", "action": "Contrast GitLab's unified project database against toolchain sprawl (e.g. GitHub + Jenkins + SonarQube + Artifactory).", "whyMatters": "Fragmented tools force evidence to hop trust boundaries; GitLab keeps findings attached to the MR."},
                {"t": "Four Offerings, Four Boundaries [S7] [S8]", "rl": "scope · 100", "action": "Classify GitLab.com, Self-Managed, Dedicated, and Dedicated for Government by operator and compliance level.", "whyMatters": "Buying 'GitLab' without scoping the offering leads to un-authorizable boundary drawings."}
            ]
        },
        {
            "n": 2,
            "title": "Conceptual View",
            "time": "60 min",
            "rungs": "100-200",
            "lib": "view-01-conceptual",
            "opener": "Conceptual architecture means what and why, independent of product names. We trace 9 core capabilities (C1-C9) and 8 distinct actors across the software change lifecycle.",
            "obj": "Separate the Control Plane (the system of record for code, MRs, and evidence) from the Job Plane (untrusted worker execution).",
            "deliv": "OV-1 high-level operational concept diagram with the Authorizing Official's signature boundary explicitly marked.",
            "mods": [
                {"t": "Control Plane vs Job Plane Separation", "rl": "conceptual · 100", "action": "Explain why compiling code on the control plane is an unacceptable architectural anti-pattern.", "whyMatters": "Untrusted pipeline scripts must execute in isolated worker sandboxes outside the database boundary."},
                {"t": "The Authorizing Official's Letter [S8]", "rl": "conceptual · 200", "action": "Detail what the AO authorizes: the control plane as the durable audit record, not an open pass for worker machines.", "whyMatters": "Confusing a cloud provider's FedRAMP ATO with an agency ATO will stall deployment review."}
            ]
        },
        {
            "n": 3,
            "title": "Logical View",
            "time": "60 min",
            "rungs": "200",
            "lib": "view-02-logical",
            "opener": "Logical architecture maps responsibilities and communication paths. Front doors, application routing, asynchronous job distribution, and Git RPC abstraction.",
            "obj": "Trace the lifecycle of a commit and a pipeline trigger through Workhorse, Puma, Sidekiq, Redis, PostgreSQL, and Gitaly.",
            "deliv": "Component relationship diagram and logical data model showing the relationship between Projects, MRs, Pipelines, and Findings.",
            "mods": [
                {"t": "Git RPC Abstraction (Gitaly) [S5]", "rl": "logical · 200", "action": "Trace why application servers must never mount repository storage disks directly via NFS.", "whyMatters": "Network file sharing creates I/O contention and file-locking bottlenecks; Gitaly isolates Git execution behind gRPC."},
                {"t": "The 60-Second Rule & Sidekiq Offloading [S17]", "rl": "logical · 200", "action": "Trace Puma's request budget: web requests terminate at 60s; all long-running tasks offload to Sidekiq.", "whyMatters": "Prevents slow Git commands or heavy webhook fan-outs from exhausting Puma worker threads."}
            ]
        },
        {
            "n": 4,
            "title": "Physical View",
            "time": "60 min",
            "rungs": "200-300",
            "lib": "view-03-physical",
            "opener": "Physical architecture maps components to running processes, AWS GovCloud infrastructure, and isolated tenant boundaries.",
            "obj": "Detail the Dedicated for Government blueprint: Switchboard, isolated AWS account in GovCloud US-West, sharded Gitaly, and off-box FIPS runners.",
            "deliv": "Topology drawing proving why Praefect is omitted on Dedicated and how FIPS runners connect via outbound HTTPS.",
            "mods": [
                {"t": "Sharded Gitaly vs Praefect Cluster [S6]", "rl": "physical · 200", "action": "Document why GitLab Dedicated operates sharded Gitaly storage nodes rather than Praefect HA clusters.", "whyMatters": "Praefect SQL metadata overhead is eliminated in favor of automated tenant-level EBS snapshot recovery."},
                {"t": "Dedicated for Government Blueprint [S7] [S8]", "rl": "physical · 300", "action": "Walk the FedRAMP Moderate package FR2411959145: AWS GovCloud US-West, single-tenant account, agency IdP.", "whyMatters": "Guarantees zero tenant co-mingling and US citizens on US soil for operational maintenance."}
            ]
        },
        {
            "n": 5,
            "title": "Integration and AI Elements",
            "time": "60 min",
            "rungs": "200-300",
            "lib": "view-04-integration-ai",
            "opener": "External systems, SAML/OIDC federations, PrivateLink tunnels, and the strict dual-path architecture of GitLab Duo.",
            "obj": "Establish the architectural boundary for AI: why the GitLab-managed AI Gateway is prohibited on GovCloud and how the Self-Hosted AI Gateway operates.",
            "deliv": "Dual data path diagram comparing public cloud LLM inference against in-boundary Bedrock/vLLM inference.",
            "mods": [
                {"t": "The Two Duo Paths [S12] [S13]", "rl": "AI · 200", "action": "Contrast GitLab-managed AI Gateway against the customer self-hosted AI Gateway.", "whyMatters": "Prompt context contains source code and sensitive variables; GovCloud strictly forbids external egress."},
                {"t": "Agency-Controlled Edge & PrivateLink [S6] [S8]", "rl": "integration · 300", "action": "Route traffic over AWS PrivateLink; integrate agency IdP for PIV/CAC without public internet hops.", "whyMatters": "Hardware authentication must terminate at the customer IdP, not on GitLab directly."}
            ]
        },
        {
            "n": 6,
            "title": "Hands-On Lab: The Pipeline Contract",
            "time": "60 min",
            "rungs": "200",
            "lib": "block-06-hands-on-lab",
            "opener": "Step through a declarative `.gitlab-ci.yml` pipeline contract. Execute SAST, Secret Detection, Container Scanning, and verify findings flow directly into the MR widget.",
            "obj": "Verify the shift-left security loop: scanners execute on runner workers and produce standardized SARIF/JSON artifacts for the MR.",
            "deliv": "Demonstrated pipeline run with test results, security findings, and artifact generation logged without secrets exposure.",
            "mods": [
                {"t": "Declarative Security Gating [S2] [S4]", "rl": "lab · 200", "action": "Configure a pipeline to block merge requests when high/critical vulnerabilities or exposed secrets are detected.", "whyMatters": "Removes human forgetfulness from security compliance; the pipeline contract enforces gate policy."},
                {"t": "Scoped CI/CD Job Tokens [S9]", "rl": "lab · 200", "action": "Trace how CI_JOB_TOKEN limits worker access strictly to the triggering project.", "whyMatters": "Stops lateral privilege escalation across repositories from compromised build scripts."}
            ]
        },
        {
            "n": 7,
            "title": "Failure Modes and Security",
            "time": "45 min",
            "rungs": "300",
            "lib": "block-07-failure-modes-and-security",
            "opener": "What breaks, what leaks, and how controls stop catastrophic failure. Analyzing runner token theft, Puma thread starvation, Gitaly split-brain, and unauthorized AI egress.",
            "obj": "Build a comprehensive failure mode matrix covering Conceptual, Logical, Physical, and AI layers.",
            "deliv": "16-point failure modes table with visible tells, root causes, and verified mitigations.",
            "mods": [
                {"t": "Runner Token Compromise [S9]", "rl": "security · 300", "action": "Analyze what happens if a runner registration token is exfiltrated and how short-lived authentication tokens protect the control plane.", "whyMatters": "Attackers can run malicious jobs or impersonate workers; tokens must be rotated and scoped."},
                {"t": "AI Prompt Egress & Grounding Leakage [S8] [S13]", "rl": "security · 300", "action": "Audit outbound network egress rules to ensure no prompt data leaves the customer VPC to commercial LLM endpoints.", "whyMatters": "Prompt injection or misconfiguration could leak classified or CUI code to external commercial models."}
            ]
        },
        {
            "n": 8,
            "title": "Design Review and Teach-Back",
            "time": "30 min",
            "rungs": "300",
            "lib": "block-08-design-review",
            "opener": "Defend the GitLab DevSecOps Platform architecture in a formal design review. Articulate the single-tenant GovCloud placement, runner isolation, and shared responsibility.",
            "obj": "Pass the retrieval assessment without notes and deliver a 10-minute executive briefing defending the architecture.",
            "deliv": "Successful completion of all 15 retrieval questions and the architectural decision record.",
            "mods": [
                {"t": "Defending the Government Blueprint [S7] [S8] [S10]", "rl": "review · 300", "action": "Articulate why Dedicated for Government is the exact placement for FedRAMP Moderate CUI workloads.", "whyMatters": "Proves architectural mastery to sponsors, security officers, and authorizing officials."},
                {"t": "Shared Responsibility Defense [S8]", "rl": "review · 300", "action": "Map the boundary: GitLab operates the tenant (patching, OS, database, uptime); Customer operates IdP, runners, and code policy.", "whyMatters": "Eliminates ambiguity regarding who responds during an incident or compliance audit."}
            ]
        }
    ]

def enrich_glossary():
    return [
        {"category": "Control Plane", "term": "Control Plane", "rung": 100, "essential": True, "definition": "The governed management layer (NGINX, Workhorse, Puma, Sidekiq, PostgreSQL, Gitaly) holding projects, MRs, and audit evidence.", "see_also": "Job Plane, Workhorse", "where": "views/01 - Conceptual View.md", "source": "S17"},
        {"category": "Job Plane", "term": "Job Plane", "rung": 100, "essential": True, "definition": "The untrusted compute plane of GitLab Runners executing builds, tests, and security scans. Sits outside tenant on GovCloud.", "see_also": "Control Plane, GitLab Runner", "where": "views/01 - Conceptual View.md", "source": "S3, S8"},
        {"category": "Storage & Data", "term": "Gitaly", "rung": 200, "essential": True, "definition": "GitLab's high-performance Git RPC service that isolates repository disk I/O behind a typed gRPC interface, eliminating NFS.", "see_also": "Praefect, Git RPC", "where": "views/02 - Logical View.md", "source": "S5, S15"},
        {"category": "Storage & Data", "term": "Praefect", "rung": 200, "essential": False, "definition": "Gitaly Cluster's SQL-backed coordination router for synchronous Git replication. Used on Self-Managed; omitted on Dedicated.", "see_also": "Gitaly, Sharded Gitaly", "where": "views/03 - Physical View.md", "source": "S5, S6"},
        {"category": "Storage & Data", "term": "Sharded Gitaly", "rung": 200, "essential": True, "definition": "The storage topology used on GitLab Dedicated where repositories are distributed across discrete Gitaly nodes without Praefect SQL overhead.", "see_also": "Praefect, Dedicated", "where": "views/03 - Physical View.md", "source": "S6"},
        {"category": "Control Plane", "term": "GitLab Workhorse", "rung": 200, "essential": True, "definition": "Smart reverse-proxy in Go that handles raw Git HTTP traffic, file uploads, and artifact downloads without consuming Puma Ruby threads.", "see_also": "Puma, NGINX", "where": "views/02 - Logical View.md", "source": "S17"},
        {"category": "Control Plane", "term": "Puma", "rung": 100, "essential": True, "definition": "Multi-threaded Ruby on Rails application server enforcing a strict 60-second request timeout to prevent hung worker cascading failures.", "see_also": "Workhorse, Sidekiq", "where": "views/02 - Logical View.md", "source": "S17"},
        {"category": "Control Plane", "term": "Sidekiq", "rung": 100, "essential": True, "definition": "Multi-threaded background queue daemon backed by Redis, processing emails, webhook dispatch, pipeline scheduling, and imports.", "see_also": "Puma, Redis", "where": "views/02 - Logical View.md", "source": "S17"},
        {"category": "Job Plane", "term": "GitLab Runner", "rung": 100, "essential": True, "definition": "Go application running on isolated virtual machines or Kubernetes that polls GitLab for jobs over outbound HTTPS and executes them.", "see_also": "Job Plane, FIPS Runner", "where": "views/01 - Conceptual View.md", "source": "S3"},
        {"category": "Job Plane", "term": "FIPS Runner", "rung": 200, "essential": True, "definition": "GitLab Runner built using FIPS 140-2 validated cryptographic modules, mandatory for all customer-managed runners on GovCloud.", "see_also": "GitLab Runner, Dedicated for Government", "where": "views/03 - Physical View.md", "source": "S8, S9"},
        {"category": "Control Plane", "term": "KAS (Kubernetes Agent Server)", "rung": 200, "essential": True, "definition": "GitLab daemon maintaining secure inbound gRPC tunnels from agents running in customer Kubernetes clusters for GitOps and telemetry.", "see_also": "Control Plane, Kubernetes", "where": "views/02 - Logical View.md", "source": "S1"},
        {"category": "Security & Scans", "term": "Merge Request (MR)", "rung": 100, "essential": True, "definition": "The central unit of collaboration, governance, and audit; binds code diffs, reviewer approvals, pipeline status, and security findings.", "see_also": "Pipeline, Finding", "where": "views/01 - Conceptual View.md", "source": "S1, S2"},
        {"category": "Security & Scans", "term": "Pipeline Contract", "rung": 200, "essential": True, "definition": "The declarative `.gitlab-ci.yml` schema that binds code commits to an immutable, reproducible sequence of build and verification stages.", "see_also": "Merge Request, GitLab Runner", "where": "views/01 - Conceptual View.md", "source": "S2"},
        {"category": "Security & Scans", "term": "SAST (Static Analysis)", "rung": 100, "essential": True, "definition": "Static application security testing integrated into pipeline jobs, surfacing code vulnerabilities directly inside the MR widget before merge.", "see_also": "DAST, Secret Detection", "where": "blocks/06-hands-on-lab.md", "source": "S4"},
        {"category": "Security & Scans", "term": "DAST (Dynamic Analysis)", "rung": 200, "essential": False, "definition": "Dynamic testing executed against running preview environments to uncover runtime weaknesses, authentication flaws, and injection bugs.", "see_also": "SAST, Review App", "where": "blocks/06-hands-on-lab.md", "source": "S4"},
        {"category": "Security & Scans", "term": "Secret Detection", "rung": 100, "essential": True, "definition": "Automated scanning for leaked API keys, tokens, and certificates in git commits; supports pre-receive commit rejection.", "see_also": "SAST, Pipeline Contract", "where": "blocks/06-hands-on-lab.md", "source": "S4"},
        {"category": "Offerings & Compliance", "term": "GitLab Dedicated for Government", "rung": 200, "essential": True, "definition": "Single-tenant, GitLab-managed SaaS hosted in AWS GovCloud US-West, FedRAMP Moderate Authorized (FR2411959145).", "see_also": "Dedicated, FedRAMP Moderate", "where": "views/03 - Physical View.md", "source": "S7, S8, S10"},
        {"category": "Offerings & Compliance", "term": "FR2411959145", "rung": 200, "essential": True, "definition": "The official FedRAMP Marketplace package identifier for GitLab Dedicated for Government, sponsored by the GSA at Moderate impact.", "see_also": "Dedicated for Government, ConMon", "where": "reference/source-ledger.md", "source": "S10"},
        {"category": "Offerings & Compliance", "term": "Switchboard", "rung": 300, "essential": True, "definition": "GitLab's internal multi-tenant orchestration platform that provisions, configures, and updates isolated single-tenant Dedicated accounts.", "see_also": "Dedicated, Amp", "where": "views/03 - Physical View.md", "source": "S6"},
        {"category": "Offerings & Compliance", "term": "Amp", "rung": 300, "essential": False, "definition": "Automation pipeline and daemon executing maintenance tasks and tenant upgrades within GitLab Dedicated infrastructure.", "see_also": "Switchboard, Dedicated", "where": "views/03 - Physical View.md", "source": "S6"},
        {"category": "AI & Duo", "term": "GitLab Duo", "rung": 100, "essential": True, "definition": "Suite of AI features across the SDLC including Code Suggestions, Duo Chat, Vulnerability Explanation, and Root Cause Analysis.", "see_also": "AI Gateway, Self-Hosted AI Gateway", "where": "views/04 - Integration and AI Elements.md", "source": "S12"},
        {"category": "AI & Duo", "term": "AI Gateway", "rung": 200, "essential": True, "definition": "FastAPI microservice sitting between GitLab clients and LLM backends, responsible for prompt generation, context assembly, and streaming.", "see_also": "GitLab Duo, Self-Hosted AI Gateway", "where": "views/04 - Integration and AI Elements.md", "source": "S12, S13"},
        {"category": "AI & Duo", "term": "Self-Hosted AI Gateway", "rung": 200, "essential": True, "definition": "AI Gateway deployed inside the customer's private enclave routing to local or GovCloud models; mandatory for Dedicated for Government.", "see_also": "AI Gateway, Dedicated for Government", "where": "views/04 - Integration and AI Elements.md", "source": "S13, S8"},
        {"category": "Offerings & Compliance", "term": "Shared Responsibility Model", "rung": 200, "essential": True, "definition": "Clear division of operational duties: GitLab manages infra, OS, patching, and SLA; Customer manages IdP, runners, and project security.", "see_also": "Dedicated for Government", "where": "views/04 - Integration and AI Elements.md", "source": "S8"},
        {"category": "Storage & Data", "term": "Patroni", "rung": 300, "essential": False, "definition": "Template for high-availability PostgreSQL on Self-Managed instances using etcd consensus to handle automated failover.", "see_also": "PostgreSQL, PgBouncer", "where": "views/03 - Physical View.md", "source": "S14"},
        {"category": "Storage & Data", "term": "PgBouncer", "rung": 200, "essential": False, "definition": "Lightweight connection pooler for PostgreSQL deployed in large GitLab reference architectures to conserve database worker threads.", "see_also": "PostgreSQL, Puma", "where": "views/03 - Physical View.md", "source": "S14"},
        {"category": "Security & Scans", "term": "CI_JOB_TOKEN", "rung": 200, "essential": True, "definition": "Short-lived JSON Web Token generated for each pipeline job, tightly scoping runner permissions to prevent cross-repo theft.", "see_also": "Runner Token, GitLab Runner", "where": "blocks/06-hands-on-lab.md", "source": "S9"},
        {"category": "Security & Scans", "term": "Shift-Left", "rung": 100, "essential": True, "definition": "Embedding security scanning into the developer's normal branch workflow so vulnerabilities are surfaced and remediated before merge.", "see_also": "Merge Request, SAST", "where": "views/01 - Conceptual View.md", "source": "S4"},
        {"category": "Offerings & Compliance", "term": "Cloud Native Hybrid", "rung": 300, "essential": False, "definition": "GitLab reference architecture placing stateless web/Sidekiq pods in Kubernetes while maintaining stateful Gitaly and Postgres on VMs.", "see_also": "Self-Managed, Gitaly", "where": "views/03 - Physical View.md", "source": "S14"},
        {"category": "Offerings & Compliance", "term": "AWS PrivateLink", "rung": 200, "essential": True, "definition": "Private AWS VPC endpoint allowing customer traffic to reach GitLab Dedicated without crossing public internet routing.", "see_also": "Dedicated for Government, Agency IdP", "where": "views/04 - Integration and AI Elements.md", "source": "S6, S8"}
    ]

def enrich_failure_modes():
    return [
        {
            "id": "FM-01",
            "title": "Compiling Untrusted Code on Control Plane",
            "view": "Conceptual",
            "src": "S3",
            "bad": "Tell: Pipeline scripts or builds executing directly on Rails/Puma app hosts.",
            "good": "Strictly isolate build compute to GitLab Runners in the Job Plane.",
            "mitigation": "Configure runner executors in containers/VMs; disable shell executors on control plane hosts."
        },
        {
            "id": "FM-02",
            "title": "Conflating Provider FedRAMP with Agency ATO",
            "view": "Conceptual",
            "src": "S8, S10",
            "bad": "Tell: Briefing the room that GitLab's FR2411959145 replaces the agency's Authority to Operate.",
            "good": "GitLab's package covers cloud infra; the agency must still issue an ATO for their specific use and connection boundary.",
            "mitigation": "Draft an explicit Agency System Security Plan (SSP) leveraging GitLab's FedRAMP Moderate package."
        },
        {
            "id": "FM-03",
            "title": "Drawing Runners Inside GovCloud Tenant",
            "view": "Physical",
            "src": "S8, S9",
            "bad": "Tell: Architecture diagram showing hosted runners inside GitLab Dedicated for Government AWS account.",
            "good": "Dedicated for Government requires customer-managed FIPS runners deployed outside the tenant in customer VPC.",
            "mitigation": "Redraw architecture boundary: GovCloud tenant holds control plane only; runners sit in customer enclave."
        },
        {
            "id": "FM-04",
            "title": "NFS Mounts for Git Repository Storage",
            "view": "Logical",
            "src": "S5, S15",
            "bad": "Tell: Puma app servers mounting repository storage over shared network file systems (NFS).",
            "good": "Route all Git operations through Gitaly nodes over typed gRPC connections.",
            "mitigation": "Deprecate NFS mounts entirely; deploy standalone or sharded Gitaly nodes."
        },
        {
            "id": "FM-05",
            "title": "Puma Thread Exhaustion (60-Second Kill)",
            "view": "Logical",
            "src": "S17",
            "bad": "Tell: Web UI returning HTTP 502 or Deadline Exceeded during heavy Git clones or API calls.",
            "good": "Offload long-running operations to Sidekiq; route raw Git transport via GitLab Workhorse.",
            "mitigation": "Tune Puma worker killers; verify Workhorse accelerates Git HTTP traffic; scale Sidekiq queues."
        },
        {
            "id": "FM-06",
            "title": "Praefect Deployed on GitLab Dedicated",
            "view": "Physical",
            "src": "S6",
            "bad": "Tell: Attempting to deploy Praefect clustering on single-tenant GitLab Dedicated.",
            "good": "GitLab Dedicated utilizes sharded Gitaly backed by automated AWS EBS volume snapshots.",
            "mitigation": "Follow Dedicated reference architecture: omit Praefect SQL overhead and rely on native sharding."
        },
        {
            "id": "FM-07",
            "title": "Runner Registration Token Exfiltration",
            "view": "Security",
            "src": "S9",
            "bad": "Tell: Unauthorized runner instances registering from unexpected external IP addresses.",
            "good": "Enforce project-scoped, short-lived runner authentication tokens with automated rotation.",
            "mitigation": "Revoke instance-level registration tokens; mandate group/project token scopes with expiry."
        },
        {
            "id": "FM-08",
            "title": "Unauthorized AI Prompt Egress to Commercial Vendors",
            "view": "Integration / AI",
            "src": "S8, S12, S13",
            "bad": "Tell: Developer prompts and source code egressing GovCloud to commercial LLM APIs.",
            "good": "Dedicated for Government strictly permits self-hosted AI Gateways targeting in-boundary models.",
            "mitigation": "Disable GitLab-managed AI Gateway; route all Duo features through an internal customer AI Gateway."
        },
        {
            "id": "FM-09",
            "title": "PIV/CAC Termination Directly on GitLab",
            "view": "Integration",
            "src": "S8",
            "bad": "Tell: Attempting to configure direct PKI/smartcard reader drivers inside GitLab Dedicated.",
            "good": "Hardware tokens (PIV/CAC) terminate at the agency IdP, passing SAML 2.0 or OIDC assertions to GitLab.",
            "mitigation": "Configure agency SSO provider (Entra ID, Keycloak, Okta) to handle client certificate validation."
        },
        {
            "id": "FM-10",
            "title": "Non-FIPS Runners on Regulated Workloads",
            "view": "Physical",
            "src": "S9",
            "bad": "Tell: Running standard community runner images on CUI/FedRAMP pipeline jobs.",
            "good": "Deploy official GitLab FIPS-validated runner container images or RHEL-FIPS worker hosts.",
            "mitigation": "Audit runner images; update pipeline orchestration to mandate `gitlab-runner:fips` tags."
        },
        {
            "id": "FM-11",
            "title": "Broad CI_JOB_TOKEN Cross-Project Leaks",
            "view": "Security",
            "src": "S9",
            "bad": "Tell: Compromised pipeline in Project A using CI_JOB_TOKEN to read confidential Project B repos.",
            "good": "Enable job token allowlisting to restrict which projects can authenticate with one another.",
            "mitigation": "Activate 'Limit access to this project' toggle in CI/CD settings across all production repositories."
        },
        {
            "id": "FM-12",
            "title": "Public Internet Egress for Dedicated Tenant Traffic",
            "view": "Physical",
            "src": "S6, S8",
            "bad": "Tell: Internal developer traffic crossing the public internet to reach the Dedicated instance.",
            "good": "Establish AWS PrivateLink endpoints between the agency VPC and the GitLab-operated account.",
            "mitigation": "Deploy VPC endpoint connections; bind internal DNS zones to PrivateLink interface IPs."
        },
        {
            "id": "FM-13",
            "title": "Scanners Running After Merge in Siloed Tools",
            "view": "Conceptual",
            "src": "S1, S4",
            "bad": "Tell: Security vulnerabilities detected days after release by disconnected third-party scans.",
            "good": "Execute SAST, container scans, and secret detection inside the MR pipeline before branch merge.",
            "mitigation": "Include standard GitLab security templates (`Security/SAST.gitlab-ci.yml`) in default pipeline templates."
        },
        {
            "id": "FM-14",
            "title": "Unmonitored Redis Memory Growth",
            "view": "Logical",
            "src": "S17",
            "bad": "Tell: Redis evicting keys or crashing under heavy Sidekiq queue backlog during mass push events.",
            "good": "Split Redis into dedicated instances for Sessions, Cache, and Sidekiq Queues on large instances.",
            "mitigation": "Implement separate Redis socket endpoints for cache and persistent queues with Prometheus alerts."
        },
        {
            "id": "FM-15",
            "title": "Duo Agent Platform Deployed on GovCloud",
            "view": "Integration / AI",
            "src": "S8",
            "bad": "Tell: Enabling autonomous external agents on GitLab Dedicated for Government.",
            "good": "Duo Agent Platform flows are explicitly NOT authorized under the current FedRAMP Moderate package.",
            "mitigation": "Keep Agent Platform toggles disabled; restrict AI usage to self-hosted Code Suggestions and Chat."
        },
        {
            "id": "FM-16",
            "title": "Gitaly Clustered on Kubernetes",
            "view": "Physical",
            "src": "S14",
            "bad": "Tell: Running stateful Gitaly HA nodes inside Kubernetes without persistent block storage guarantees.",
            "good": "Cloud Native Hybrid architecture mandates keeping stateful Gitaly on dedicated VMs.",
            "mitigation": "Follow Cloud Native Hybrid reference design: run Rails/Sidekiq on K8s, Gitaly on managed EC2/VMs."
        }
    ]

def enrich_quizzes():
    return [
        {
            "q": "Which logical component realizes Capability C1 (Change Record), and which physical service executes it?",
            "options": [
                "HTTP Front Door realized by NGINX",
                "Application realized by GitLab Rails / Puma",
                "Job Worker realized by GitLab Runner",
                "Git Storage realized by Gitaly"
            ],
            "answer": 1,
            "category": "Architecture Views",
            "explain": "Capability C1 (Change Record) manages MRs, diffs, approvals, and comments. In the logical view this is the Application component, physically realized by GitLab Rails running under the Puma application server [S1, S17]."
        },
        {
            "q": "Why is Praefect cluster omitted from GitLab Dedicated, and what is used instead?",
            "options": [
                "Dedicated does not support Git repositories",
                "Dedicated uses NFS shared mounts instead of Gitaly",
                "Dedicated uses sharded Gitaly with automated EBS snapshot backups, avoiding Praefect SQL overhead",
                "Dedicated runs Gitaly inside multi-tenant Kubernetes"
            ],
            "answer": 2,
            "category": "Storage & Data",
            "explain": "GitLab Dedicated replaces complex Praefect SQL clustering with sharded Gitaly nodes. Availability and DR are provided by automated AWS EBS volume snapshots and cross-region replication [S6]."
        },
        {
            "q": "Where must CI/CD Runners be deployed in a GitLab Dedicated for Government architecture?",
            "options": [
                "Inside the GitLab-managed AWS GovCloud tenant account",
                "In the public GitLab.com multi-tenant shared pool",
                "Outside the tenant in customer-managed VPCs using FIPS-validated images",
                "Directly on the PostgreSQL database instances"
            ],
            "answer": 2,
            "category": "Government & Compliance",
            "explain": "Under the FedRAMP Moderate shared responsibility model for Dedicated for Government, customers MUST build and manage their own runners outside the tenant, pulling jobs via outbound HTTPS and using FIPS-validated images [S8, S9]."
        },
        {
            "q": "What is the authorized data path for GitLab Duo AI features on GitLab Dedicated for Government?",
            "options": [
                "Direct connection to Anthropic Claude 3.5 Sonnet via public internet",
                "Self-Hosted AI Gateway routing prompts to customer-controlled models in GovCloud or private VPCs",
                "GitLab-managed commercial AI Gateway with default cloud models",
                "AI features are completely impossible to run in any form"
            ],
            "answer": 1,
            "category": "AI & Duo",
            "explain": "The GitLab-managed AI Gateway to commercial models is NOT authorized on Dedicated for Government. The only authorized path is the Self-Hosted AI Gateway routing to customer-approved local or GovCloud runtimes (e.g. Bedrock GovCloud) [S8, S13]."
        },
        {
            "q": "How does GitLab Puma protect against cascading web server thread starvation?",
            "options": [
                "It queues web requests indefinitely in PostgreSQL",
                "It enforces a strict 60-second request timeout and worker killer, offloading long tasks to Sidekiq",
                "It disables SSL encryption for heavy requests",
                "It restarts the physical host whenever memory exceeds 50%"
            ],
            "answer": 1,
            "category": "Control Plane",
            "explain": "Puma enforces a hard 60-second request execution ceiling. Long-running or heavy background tasks are immediately offloaded to Sidekiq queues, and raw Git traffic is accelerated by GitLab Workhorse [S17]."
        },
        {
            "q": "How are hardware identity tokens (PIV / CAC) integrated into GitLab Dedicated for Government?",
            "options": [
                "Terminated directly on GitLab Rails via a custom smartcard plugin",
                "Terminated at the agency IdP, with identity asserted to GitLab via SAML 2.0 or OIDC",
                "Hardware tokens are not supported on government installations",
                "By sharing the runner registration token with users"
            ],
            "answer": 1,
            "category": "Government & Compliance",
            "explain": "GitLab does not natively terminate hardware cryptographic tokens on Dedicated. PIV/CAC cards authenticate against the customer agency IdP, which then passes SAML/OIDC assertions to GitLab [S8]."
        },
        {
            "q": "What is the primary architectural purpose of GitLab Workhorse?",
            "options": [
                "To execute unit tests and compile C++ code",
                "To handle high-bandwidth requests (Git HTTP, artifact uploads/downloads) without tying up Puma Ruby threads",
                "To manage PostgreSQL read replicas and Patroni failover",
                "To orchestrate Kubernetes clusters"
            ],
            "answer": 1,
            "category": "Control Plane",
            "explain": "GitLab Workhorse is a specialized reverse proxy written in Go that acts as a front door filter, taking slow Git HTTP pulls and large binary uploads away from Ruby Puma threads [S17]."
        },
        {
            "q": "Under the FedRAMP Moderate Shared Responsibility Model for Dedicated for Government, who is responsible for OS patching and database backup?",
            "options": [
                "The customer agency's internal IT department",
                "GitLab (via Switchboard and Amp automation)",
                "Amazon Web Services shared account teams",
                "The Authorizing Official"
            ],
            "answer": 1,
            "category": "Government & Compliance",
            "explain": "GitLab operates the single-tenant GovCloud infrastructure, taking full responsibility for operating system patching, PostgreSQL backups, geo-redundancy, and tenant uptime [S8]."
        },
        {
            "q": "What mechanism prevents a compromised CI/CD job from accessing source code in other private repositories?",
            "options": [
                "A shared root password across all repositories",
                "Scoped CI_JOB_TOKEN with job token allowlist enforcement",
                "Running all runners under root privileges",
                "Allowing anonymous read access across groups"
            ],
            "answer": 1,
            "category": "Security & Governance",
            "explain": "GitLab generates a transient, short-lived CI_JOB_TOKEN for each job. By enabling job token scoping and allowlists, the token cannot be used to clone unauthorized neighboring projects [S9]."
        },
        {
            "q": "In the GitLab Cloud Native Hybrid architecture, which components remain on VMs rather than Kubernetes?",
            "options": [
                "NGINX and Workhorse",
                "Stateful components: Gitaly storage nodes and PostgreSQL",
                "Sidekiq queue processors and Puma app pods",
                "All components must run in Kubernetes"
            ],
            "answer": 1,
            "category": "Storage & Data",
            "explain": "GitLab's official Cloud Native Hybrid architecture places stateless Rails and Sidekiq pods in Kubernetes, but keeps stateful Gitaly storage nodes and PostgreSQL on dedicated virtual machines for I/O performance and reliability [S14]."
        }
    ]

def build():
    print("Parsing sources...")
    srcs = load_sources()
    print(f"Loaded {len(srcs)} sources.")
    
    print("Loading video cut script...")
    video_cut = load_video_cut()
    
    print("Loading debates...")
    debates = load_debates()
    print(f"Loaded {len(debates)} debates.")
    
    print("Loading architecture views...")
    views = load_views()
    
def load_shorts():
    topics_file = Path(os.environ.get("LEARN_SHORTS_TOPICS", "packs/shorts-topics.json"))
    topics = {}
    if topics_file.exists():
        topics = json.loads(topics_file.read_text(encoding="utf-8"))
    
    video_map = {
        "01-what-and-boundary": "assets/shorts/The DevSecOps Platform Boundary Explained.mp4",
        "02-conceptual-to-physical": "assets/shorts/How GitLab Isolates Untrusted Code.mp4",
        "03-data-flow": "assets/shorts/How GitLab Routes a Pipeline Job.mp4",
        "04-third-party": "assets/shorts/How GitLab Isolates Untrusted Build Jobs.mp4",
        "05-ai-path": "assets/shorts/How GitLab Duo Stops AI Oversharing.mp4",
        "06-failure-mode": "assets/shorts/How GitLab Runner Token Theft Works.mp4"
    }

    shorts = []
    for item in topics.get("items", []):
        name = item.get("name")
        shorts.append({
            "name": name,
            "title": item.get("title"),
            "focus": item.get("focus"),
            "videoUrl": video_map.get(name, "")
        })
    return shorts

def load_library():
    lib_dir = SITE_ROOT / "library"
    chapters = []
    if not lib_dir.exists():
        return []
        
    for md_file in sorted(lib_dir.glob("*.md")):
        raw_text = md_file.read_text(encoding="utf-8")
        title_match = re.search(r"^#\s+(.+)$", raw_text, re.MULTILINE)
        title = title_match.group(1).strip() if title_match else md_file.stem
        title = title.replace("GitLab DevSecOps Platform Architecture:", "").replace("GitLab DevSecOps Platform Architecture_", "").strip()
        
        clean_body = re.sub(r"^#.*$", "", raw_text, flags=re.MULTILINE).strip()
        excerpt = clean_body[:240].replace("\n", " ").strip() + "..."
        slug = md_file.stem.lower().replace(" ", "-").replace("_", "-")[:40]
        
        chapters.append({
            "id": slug,
            "title": title,
            "filename": md_file.name,
            "excerpt": excerpt,
            "content": raw_text
        })
    return chapters

def build():
    print("Parsing sources...")
    srcs = load_sources()
    print(f"Loaded {len(srcs)} sources.")
    
    print("Loading video cut script...")
    video_cut = load_video_cut()
    
    print("Loading debates...")
    debates = load_debates()
    print(f"Loaded {len(debates)} debates.")
    
    print("Loading architecture views...")
    views = load_views()
    
    print("Loading curriculum blocks...")
    blocks = load_curriculum_blocks()
    
    print("Loading shorts and library...")
    shorts = load_shorts()
    library = load_library()
    print(f"Loaded {len(shorts)} shorts and {len(library)} library chapters.")
    
    print("Enriching glossary, failure modes, and quiz...")
    glossary = enrich_glossary()
    failures = enrich_failure_modes()
    quizzes = enrich_quizzes()
    
    console_data = {
        "meta": {
            "title": "GitLab DevSecOps Platform Architecture",
            "subtitle": "Architect Study Console · One Platform, Four Boundaries",
            "version": "2.0",
            "updated": "2026-10-16",
            "author": "Aaron Meis (Expert AI Architect Study)",
            "fedramp": "FR2411959145 (Moderate Authorized)",
            "repoUrl": "https://github.com/aaronmeis/learn-gitlab"
        },
        "sources": srcs,
        "video": video_cut,
        "shorts": shorts,
        "library": library,
        "debates": debates,
        "views": views,
        "blocks": blocks,
        "glossary": glossary,
        "failureModes": failures,
        "quizzes": quizzes
    }
    
    # Write js/data.js
    data_js_path = SITE_ROOT / "js" / "data.js"
    js_content = f"// Auto-generated console data from Obsidian GitLab packs\nwindow.CONSOLE_DATA = {json.dumps(console_data, indent=2, ensure_ascii=False)};\n"
    data_js_path.write_text(js_content, encoding="utf-8")
    print(f"Wrote {data_js_path} ({len(js_content)} bytes).")
    
    # Write data.json
    json_path = SITE_ROOT / "data.json"
    json_path.write_text(json.dumps(console_data, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote {json_path}.")

if __name__ == "__main__":
    build()

