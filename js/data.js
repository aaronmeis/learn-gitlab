window.CONSOLE_DATA = {
  "meta": {
    "title": "GitLab DevSecOps Platform Architecture",
    "subtitle": "Architect Study Console · One Platform, Four Boundaries",
    "version": "2.0",
    "updated": "2026-10-16",
    "author": "Aaron Meis (Expert AI Architect Study)",
    "fedramp": "FR2411959145 (Moderate Authorized)",
    "repoUrl": "https://github.com/aaronmeis/learn-gitlab"
  },
  "sources": [
    {
      "n": 1,
      "id": "S1",
      "t": "GitLab Docs (current)",
      "u": "https://docs.gitlab.com/",
      "type": "docs",
      "trust": "high",
      "b": "1, 8",
      "notes": "Product surface."
    },
    {
      "n": 2,
      "id": "S2",
      "t": "CI/CD pipelines",
      "u": "https://docs.gitlab.com/ci/",
      "type": "docs",
      "trust": "high",
      "b": "1, 6",
      "notes": "`.gitlab-ci.yml`."
    },
    {
      "n": 3,
      "id": "S3",
      "t": "GitLab Runner",
      "u": "https://docs.gitlab.com/runner/",
      "type": "docs",
      "trust": "high",
      "b": "4, 5, 7",
      "notes": "Job plane vs control plane."
    },
    {
      "n": 4,
      "id": "S4",
      "t": "Application security",
      "u": "https://docs.gitlab.com/user/application_security/",
      "type": "docs",
      "trust": "high",
      "b": "5, 7",
      "notes": "Scanners as pipeline jobs."
    },
    {
      "n": 5,
      "id": "S5",
      "t": "Gitaly",
      "u": "https://docs.gitlab.com/administration/gitaly/",
      "type": "docs",
      "trust": "high",
      "b": "2, 3, 4",
      "notes": "Git RPC; Praefect = Self-Managed cluster."
    },
    {
      "n": 6,
      "id": "S6",
      "t": "GitLab Dedicated architecture",
      "u": "https://docs.gitlab.com/administration/dedicated/architecture/",
      "type": "docs",
      "trust": "high",
      "b": "3, 4",
      "notes": "Switchboard, Amp, sharded Gitaly (not Praefect), hosted runners."
    },
    {
      "n": 7,
      "id": "S7",
      "t": "GitLab Dedicated for Government",
      "u": "https://docs.gitlab.com/subscriptions/gitlab_dedicated_for_government/",
      "type": "docs",
      "trust": "high",
      "b": "1, 4, 8",
      "notes": "AWS GovCloud US-West, Ultimate, single-tenant."
    },
    {
      "n": 8,
      "id": "S8",
      "t": "Dedicated for Government shared responsibility",
      "u": "https://docs.gitlab.com/security/dedicated_for_government_shared_responsibility_model/",
      "type": "docs",
      "trust": "high",
      "b": "4, 5, 7",
      "notes": "FedRAMP Moderate. Agency IdP + self-managed runners. Duo Agent Platform flows not authorized."
    },
    {
      "n": 9,
      "id": "S9",
      "t": "Dedicated for Government secure configuration",
      "u": "https://docs.gitlab.com/security/dedicated_for_government_secure_config_guide/",
      "type": "docs",
      "trust": "high",
      "b": "4, 6, 7",
      "notes": "Runners outside tenant; FIPS images."
    },
    {
      "n": 10,
      "id": "S10",
      "t": "FedRAMP Marketplace — FR2411959145",
      "u": "https://marketplace.fedramp.gov/products/FR2411959145/",
      "type": "gov",
      "trust": "high",
      "b": "1, 7, 8",
      "notes": "Desk-check live status. Listing ≠ agency ATO."
    },
    {
      "n": 11,
      "id": "S11",
      "t": "FedRAMP-authorized announcement",
      "u": "https://about.gitlab.com/blog/gitlab-dedicated-for-government-now-fedramp-authorized/",
      "type": "article",
      "trust": "high",
      "b": "1, 8",
      "notes": "2025-05-19. GSA sponsor."
    },
    {
      "n": 12,
      "id": "S12",
      "t": "GitLab Duo Agent Platform",
      "u": "https://docs.gitlab.com/user/duo_agent_platform/",
      "type": "docs",
      "trust": "high",
      "b": "5",
      "notes": "Foundational agents; GitLab-managed models."
    },
    {
      "n": 13,
      "id": "S13",
      "t": "Self-hosted models (Duo)",
      "u": "https://docs.gitlab.com/administration/gitlab_duo_self_hosted/",
      "type": "docs",
      "trust": "high",
      "b": "5, 7",
      "notes": "AI Gateway in-boundary vs GitLab.com Gateway."
    },
    {
      "n": 14,
      "id": "S14",
      "t": "Reference architectures",
      "u": "https://docs.gitlab.com/administration/reference_architectures/",
      "type": "docs",
      "trust": "high",
      "b": "3, 4",
      "notes": "Cloud Native Hybrid: Gitaly HA stays on VMs."
    },
    {
      "n": 15,
      "id": "S15",
      "t": "Gitaly Architectural Overview (Will Chandler)",
      "u": "https://www.youtube.com/watch?v=CnXqh1nNwDw",
      "type": "video",
      "trust": "high",
      "b": "2, 3",
      "notes": "2023-09-14. 53m."
    },
    {
      "n": 16,
      "id": "S16",
      "t": "How Gitaly fits into GitLab: An Overview (James Liu)",
      "u": "https://www.youtube.com/watch?v=FmxgaFMdUjk",
      "type": "video",
      "trust": "high",
      "b": "2, 3",
      "notes": "2023-11-08. 29m."
    },
    {
      "n": 17,
      "id": "S17",
      "t": "GitLab Architecture 101 for Support Engineers",
      "u": "https://www.youtube.com/watch?v=chX8nfV3mUE",
      "type": "video",
      "trust": "high",
      "b": "1, 3, 8",
      "notes": "2022-08-29. 1h22. Puma, Sidekiq, Redis, PostgreSQL, Gitaly, front doors."
    },
    {
      "n": 18,
      "id": "S18",
      "t": "NIST SP 800-204D",
      "u": "https://doi.org/10.6028/nist.sp.800-204d",
      "type": "paper",
      "trust": "high",
      "b": "7",
      "notes": "Chandramouli 2023. Nearby. Not a GitLab eval."
    },
    {
      "n": 19,
      "id": "S19",
      "t": "Oliveira et al. SLATE 2025",
      "u": "https://doi.org/10.4230/OASIcs.SLATE.2025.4",
      "type": "paper",
      "trust": "medium",
      "b": "7",
      "notes": "Cross-platform scanners. Not a GitLab eval."
    },
    {
      "n": 20,
      "id": "S20",
      "t": "Guduru IJSR 2020",
      "u": "https://doi.org/10.21275/sr20127082903",
      "type": "paper",
      "trust": "low",
      "b": "6",
      "notes": "GitLab-named how-to. Low citation."
    }
  ],
  "video": {
    "title": "GitLab DevSecOps Platform — One-Day Mastery",
    "footer": "One-Day Mastery  ·  GitLab DevSecOps Platform",
    "youtube": "PzEIulYVSrA",
    "voice": "IKne3meq5aSn9XLyUdCD",
    "open": "This is the One-Day Mastery narrated cut for GitLab DevSecOps Platform. The cut walks the NotebookLM slides: the control plane versus the job plane, Dedicated for Government, and the AI path that stays inside the customer boundary.",
    "recap": "We covered the ask for Dedicated for Government, the control-plane and job-plane split, Gitaly over Git RPC, customer FIPS runners outside the tenant, agency IdP and PrivateLink, the self-hosted AI Gateway, shared responsibility, and the 90-day start: IdP, runners, first five workloads.",
    "close": "Thank you. Draw the control plane and the job plane from memory. If you can name where runners and Duo live, you have it.",
    "labels": [
      "The Ask",
      "Fragmented toolchains",
      "Target capability",
      "Trust boundary",
      "Request lifecycle",
      "Gitaly RPC",
      "Four offerings",
      "GovCloud tenant",
      "Runners outside tenant",
      "Agency-controlled edge",
      "Self-hosted AI Gateway",
      "Failure modes",
      "Shared responsibility",
      "Shift-left scans",
      "Decision today"
    ],
    "slides": [
      "Slide 1 is the ask. Approve the architectural design and authorize GitLab Dedicated for Government, FedRAMP Moderate listing FR2411959145. The outcome is one governed path from intent to running software. The slide's stakes line: act by Q4 2026 inside the FY26 budget, or un-auditable change records keep compounding.",
      "Slide 2 is the legacy toolchain. Plan, source, CI, SAST, DAST, and registry sit in separate trust domains, with fragile integrations and broken evidence trails. The slide cites consolidation pressure, six-plus security tools, and vulnerabilities found after merge. Security cannot move left while the tools live in different domains.",
      "Slide 3 is the target capability. Developers, reviewers, and security write into one control plane: change records, Git history, pipeline contracts, and findings. The job plane is untrusted execution. The Authorizing Official signs the control plane because it is the system of record for code and pipeline evidence.",
      "Slide 4 is the strict trust boundary. Web traffic hits the HTTP and SSH front door, then the application, job queue, system-of-record database, and Git RPC. The job worker sits outside. If an attacker steals a worker token or a pipeline script, they own a worker in the job plane. The control plane stays the system of record.",
      "Slide 5 is the request lifecycle. NGINX or Workhorse is the front door. Puma enforces a 60-second request timeout. Redis serves hot reads in milliseconds. Long work goes to Sidekiq so the web worker is freed. Cache and offload keep hung requests from cascading.",
      "Slide 6 is Gitaly. Legacy app servers share one repository disk and stall on I/O. GitLab splits the Puma fleet from Gitaly storage nodes and talks Git RPC over gRPC. The web fleet scales without sharing the Git disk.",
      "Slide 7 compares four offerings. GitLab.com is multi-tenant SaaS. Self-Managed puts infra on the customer. Commercial Dedicated is an isolated AWS account with sharded Gitaly, no Praefect, and optional hosted runners. Dedicated for Government is GitLab-operated on AWS GovCloud US-West, isolated GovCloud account, customer FIPS runners outside the tenant, self-hosted AI only, FedRAMP Moderate FR2411959145.",
      "Slide 8 is the government blueprint. Switchboard and Amp sit above a single-tenant customer AWS account: GitLab Ultimate, artifact registry, and sharded Gitaly with no Praefect. Outside the tenant: agency IdP, self-managed FIPS runners, and the customer VPC. GitLab patches the tenant. Isolation is the AWS account.",
      "Slide 9 is why runners stay outside. The GovCloud tenant is the control plane. The agency estate is the job plane. A self-managed FIPS runner clones, runs untrusted pipeline scripts locally, and pushes artifacts over outbound HTTPS with a runner token. That boundary is the linchpin of the FedRAMP authorization.",
      "Slide 10 is the agency-controlled edge. Identity is the agency IdP, SAML or OIDC. PIV and CAC tokens never terminate natively on GitLab. AWS PrivateLink keeps tenant traffic off the public internet. Continuous Monitoring sends outbound evidence for the FR2411959145 listing. Administrators keep authority over who gets in and how traffic routes.",
      "Slide 11 is the AI path. GitLab-managed AI Gateway to commercial LLM vendors is not authorized on Dedicated for Government. The authorized path stays inside the customer boundary: IDE to a self-hosted AI Gateway to customer-approved models, for example Bedrock-gov. Prompts do not leave customer-controlled runtimes.",
      "Slide 12 is three failure modes. Runner token theft shows up as a job on an unauthorized IP; catch it with scoped, rotatable tokens outside the tenant. Puma exhaustion is 502 or Deadline Exceeded; catch it with the 60-second timeout and the worker killer. AI leakage is prompts to external IPs; catch it by pinning the self-hosted gateway. Assume compromise at the edge. Do not let blast radius grow.",
      "Slide 13 is shared responsibility. GitLab manages patching, uptime, geo DR, audit retention, US-CERT incident reporting, and Switchboard. The customer manages agency IdP, FIPS runners, source and access, pipeline policy, and KMS if you bring your own keys. GitLab runs the tenant. The agency owns identity, jobs, and code policy.",
      "Slide 14 is shift-left. Legacy waits on third-party scanners and finds issues in test or prod. GitLab runs SAST, DAST, secret detection, and container scan in the merge request. The slide's claim is fewer standalone scanners and uniform scan policy. Treat that as the exhibit, then check it against the source ledger.",
      "Slide 15 is the decision. Sign the authorization memo for FR2411959145. Target Q4 2026 on FY26 CapEx. Stop renewing legacy CI and standalone SAST and DAST by Q4. Residual risk: will hosted FIPS runners exist? Unknown until a November 2026 roadmap review; mitigate today with self-managed runners. Next 90 days: integrate the agency IdP, provision FIPS runners in the VPC, migrate the first five critical workloads."
    ],
    "cards": [
      {
        "question": "Why do fragmented tools block shift-left?",
        "detail": "Each tool lives in its own trust domain, so evidence and identity do not travel with the change.",
        "why": "A scan that runs after merge cannot gate the merge.",
        "example": "SAST in one product, DAST in another, registry in a third, no single change record."
      },
      {
        "question": "What does the Authorizing Official actually authorize?",
        "detail": "The control plane as the system of record for code changes and pipeline evidence.",
        "why": "The job plane is untrusted execution. The letter is not a blank check on worker hosts.",
        "example": "The AO signs Git history, pipeline contracts, and findings, not the runner that compiles untrusted code."
      },
      {
        "question": "What stays inside the trust boundary if a runner token is stolen?",
        "detail": "The control plane: front door, application, job queue, system-of-record database, and Git RPC.",
        "why": "The worker is designed to be outside. Token theft should not become tenant takeover.",
        "example": "A compromised pipeline script owns that worker. It does not become the Postgres of record."
      },
      {
        "question": "What is the 60-second rule?",
        "detail": "Puma kills a web request that is still running at 60 seconds.",
        "why": "A hung request holds a worker. Enough hung workers and the site returns 502.",
        "example": "A slow Git fetch is written to Redis and Sidekiq instead of occupying Puma."
      },
      {
        "question": "What does Gitaly remove from the app fleet?",
        "detail": "Shared repository disk I/O. App servers talk Git RPC to dedicated Gitaly nodes.",
        "why": "Web capacity and Git storage then scale on different fleets.",
        "example": "Add Puma nodes without adding another mount of the Git disk."
      },
      {
        "question": "Which offering is FedRAMP Moderate single-tenant?",
        "detail": "Dedicated for Government. Not GitLab.com, not Self-Managed, not commercial Dedicated.",
        "why": "GovCloud US-West, isolated account, customer FIPS runners outside, self-hosted AI only.",
        "example": "Listing FR2411959145. Commercial Dedicated is SOC 2 and ISO, not that listing."
      },
      {
        "question": "What sits outside the government tenant?",
        "detail": "Agency IdP, self-managed FIPS runners, and the customer VPC.",
        "why": "Identity and untrusted job execution stay in the agency estate.",
        "example": "Switchboard manages the tenant. The runner that compiles the MR is not in that account."
      },
      {
        "question": "How does a government runner talk to GitLab?",
        "detail": "Outbound HTTPS with a runner token. It clones, runs locally, and pushes artifacts.",
        "why": "The tenant does not reach inbound into the agency job plane.",
        "example": "A FIPS runner in the agency VPC polls GitLab, never the reverse."
      },
      {
        "question": "Where do PIV and CAC tokens terminate?",
        "detail": "At the agency IdP. GitLab consumes SAML or OIDC. It does not handle the hardware token natively.",
        "why": "Identity stays an agency control, not a GitLab control.",
        "example": "PrivateLink plus agency IdP. No public internet hop for tenant traffic."
      },
      {
        "question": "Is GitLab-managed Duo authorized on Dedicated for Government?",
        "detail": "No. GitLab-managed AI Gateway to commercial LLM vendors is not authorized on that offering.",
        "why": "Prompts would leave the customer boundary.",
        "example": "Self-hosted AI Gateway to Bedrock-gov, or no Duo on that path."
      },
      {
        "question": "What is the tell for Puma worker exhaustion?",
        "detail": "502 Bad Gateway or Deadline Exceeded.",
        "why": "Workers are stuck on long requests or memory, so the front door has nothing to hand off.",
        "example": "The 60-second timeout plus the Puma worker killer recycle the process."
      },
      {
        "question": "Who patches FIPS runners?",
        "detail": "The customer. GitLab patches the tenant infrastructure.",
        "why": "Runners are outside the authorized tenant boundary.",
        "example": "GitLab owns Switchboard and geo DR. The agency owns runner images and pipeline policy."
      },
      {
        "question": "Where should a vulnerability show up first?",
        "detail": "In the merge request, from built-in SAST, DAST, secret detection, and container scan.",
        "why": "A finding after deploy is a late control. A finding on the MR is a gate.",
        "example": "Do not wait on a separate scanner farm after CI green."
      },
      {
        "question": "What is the residual risk on hosted FIPS runners?",
        "detail": "UNKNOWN until a November 2026 roadmap review. Mitigate today with self-managed FIPS runners in the VPC.",
        "why": "The FedRAMP boundary currently keeps untrusted execution outside the tenant.",
        "example": "Next 90 days: agency IdP, FIPS runners in the VPC, first five critical workloads."
      }
    ]
  },
  "shorts": [
    {
      "name": "01-what-and-boundary",
      "title": "What it is and its boundary",
      "focus": "Vertical short, clean technical diagram motion graphics. No cinematic B-roll. ONE JOB: what GitLab DevSecOps Platform Architecture does and where its boundary sits, in one breath.",
      "videoUrl": "assets/shorts/The DevSecOps Platform Boundary Explained.mp4"
    },
    {
      "name": "02-conceptual-to-physical",
      "title": "Conceptual to physical",
      "focus": "Vertical short, clean technical diagram motion graphics. No cinematic B-roll. ONE JOB: follow one capability of GitLab DevSecOps Platform Architecture from concept to logical component to named service.",
      "videoUrl": "assets/shorts/How GitLab Isolates Untrusted Code.mp4"
    },
    {
      "name": "03-data-flow",
      "title": "One data flow end to end",
      "focus": "Vertical short, clean technical diagram motion graphics. No cinematic B-roll. ONE JOB: trace one real data flow through GitLab DevSecOps Platform Architecture in four steps max.",
      "videoUrl": "assets/shorts/How GitLab Routes a Pipeline Job.mp4"
    },
    {
      "name": "04-third-party",
      "title": "Third-party integrations",
      "focus": "Vertical short, clean technical diagram motion graphics. No cinematic B-roll. ONE JOB: the external systems GitLab DevSecOps Platform Architecture connects to and the one integration people get wrong.",
      "videoUrl": "assets/shorts/How GitLab Isolates Untrusted Build Jobs.mp4"
    },
    {
      "name": "05-ai-path",
      "title": "AI data path",
      "focus": "Vertical short, clean technical diagram motion graphics. No cinematic B-roll. ONE JOB: how an AI feature in GitLab DevSecOps Platform Architecture reads data and which control stops oversharing.",
      "videoUrl": "assets/shorts/How GitLab Duo Stops AI Oversharing.mp4"
    },
    {
      "name": "06-failure-mode",
      "title": "Failure mode",
      "focus": "Vertical short, clean technical diagram motion graphics. No cinematic B-roll. ONE JOB: the most common GitLab DevSecOps Platform Architecture deployment failure and its tell. One mitigation from the sources.",
      "videoUrl": "assets/shorts/How GitLab Runner Token Theft Works.mp4"
    }
  ],
  "library": [
    {
      "id": "ch-01",
      "title": "Comprehensive Failure Mode and Security Weakness Catalog: GitLab DevSecOps Platform Architecture",
      "filename": "Comprehensive Failure Mode and Security Weakness Catalog_ GitLab DevSecOps Platf.md",
      "html": "library/01-comprehensive-failure-mode-and-security-weakness-catalog_-gitlab-devsecops-platf.html"
    },
    {
      "id": "ch-02",
      "title": "Conceptual Architecture View: Governed DevSecOps Platform Architecture",
      "filename": "Conceptual Architecture View_ Governed DevSecOps Platform Architecture.md",
      "html": "library/02-conceptual-architecture-view_-governed-devsecops-platform-architecture.html"
    },
    {
      "id": "ch-03",
      "title": "Executive Decision Packet: GitLab DevSecOps Platform Architecture Strategy",
      "filename": "Executive Decision Packet_ GitLab DevSecOps Platform Architecture Strategy.md",
      "html": "library/03-executive-decision-packet_-gitlab-devsecops-platform-architecture-strategy.html"
    },
    {
      "id": "ch-04",
      "title": "GitLab DevSecOps Platform Architecture: AI Elements & Integration Surface",
      "filename": "GitLab DevSecOps Platform Architecture_ AI Elements & Integration Surface.md",
      "html": "library/04-gitlab-devsecops-platform-architecture_-ai-elements-integration-surface.html"
    },
    {
      "id": "ch-05",
      "title": "GitLab DevSecOps Platform Architecture: Comprehensive Study Guide",
      "filename": "GitLab DevSecOps Platform Architecture_ Comprehensive Study Guide.md",
      "html": "library/05-gitlab-devsecops-platform-architecture_-comprehensive-study-guide.html"
    },
    {
      "id": "ch-06",
      "title": "GitLab DevSecOps Platform Architecture: TOGAF ADM and DoDAF Crosswalk Report",
      "filename": "GitLab DevSecOps Platform Architecture_ TOGAF ADM and DoDAF Crosswalk Report.md",
      "html": "library/06-gitlab-devsecops-platform-architecture_-togaf-adm-and-dodaf-crosswalk-report.html"
    },
    {
      "id": "ch-07",
      "title": "Logical Architecture Specification: GitLab DevSecOps Platform",
      "filename": "Logical Architecture Specification_ GitLab DevSecOps Platform.md",
      "html": "library/07-logical-architecture-specification_-gitlab-devsecops-platform.html"
    },
    {
      "id": "ch-08",
      "title": "Physical Architecture View: GitLab DevSecOps Platform Architecture",
      "filename": "Physical Architecture View_ GitLab DevSecOps Platform Architecture.md",
      "html": "library/08-physical-architecture-view_-gitlab-devsecops-platform-architecture.html"
    },
    {
      "id": "ch-09",
      "title": "Technical Briefing: GitLab DevSecOps Platform Architecture",
      "filename": "Technical Briefing_ GitLab DevSecOps Platform Architecture.md",
      "html": "library/09-technical-briefing_-gitlab-devsecops-platform-architecture.html"
    },
    {
      "id": "ch-10",
      "title": "Technical Integration Catalog: GitLab DevSecOps Platform Architecture",
      "filename": "Technical Integration Catalog_ GitLab DevSecOps Platform Architecture.md",
      "html": "library/10-technical-integration-catalog_-gitlab-devsecops-platform-architecture.html"
    }
  ],
  "debates": [
    {
      "num": 1,
      "title": "One platform is the point",
      "claimA": "GitLab is one application covering plan, source, CI/CD, security, registry, and deploy, so the merge request is the system of record for change *and* evidence. `[S1]` `[S2]` `[S4]`",
      "claimB": "A GitHub Enterprise + Actions + Advanced Security (or Azure DevOps) toolchain can cover the same stages with tools the org already runs. \"One platform\" is a coupling choice, not a proof that the other stack cannot produce evidence.",
      "evidence": "Docs describe the combined surface `[S1]` `[S2]` `[S4]`. This pack has no head-to-head of GitLab Ultimate versus GitHub Advanced Security on a named repo. Elicit returned no GitLab product eval.",
      "warrant": "**Definitional + analogical.** If source, pipeline, and findings share one project database, then an MR can show the scan without a ticket hop — that supports A. If another vendor's MR/PR can attach the same scan kinds, then \"one platform\" is not unique — that supports B.",
      "hiddenAssumptions": "The org will actually turn the scanners on. Findings in GitLab are the findings the AO will accept. Teams will not keep a second CI.",
      "qualifications": "Teach the single-app shape as GitLab's bet. Do not claim it wins a bake-off this pack did not run.",
      "changingEvidence": "**Support A (unrun):** on a public sample project, one `.gitlab-ci.yml` that writes SAST + container scan into the same MR widget; screenshot the widget. **Support B (unrun):** the same scans on GitHub Advanced Security for the same repo; compare time-to-finding and whether the PR is the system of record. **Weaken both (unrun):** a GitLab project that stores source in GitLab and runs Jenkins; the \"one platform\" story is then a choice, not a fact."
    },
    {
      "num": 2,
      "title": "FedRAMP Moderate is the government placement",
      "claimA": "GitLab Dedicated for Government is a FedRAMP Moderate authorized single-tenant SaaS on AWS GovCloud, GSA-sponsored, Marketplace product FR2411959145. `[S7]` `[S8]` `[S10]` `[S11]`",
      "claimB": "GitLab's ATO authorizes *GitLab's* offering. It is not the agency's ATO to process this data, not IL5, and not FedRAMP High. Handbook future-work still lists High, hosted Gov runners, and multi-cloud Gov. `[S8]` `[S10]`",
      "evidence": "Shared-responsibility page states a FedRAMP Moderate Authorization `[S8]`. Blog 2025-05-19 announces Marketplace listing `[S11]`. Marketplace URL is on the ledger `[S10]`. Live Marketplace status was not captured as a screenshot in this sitting.",
      "warrant": "**Authority, scoped to the authorizing official.** If FedRAMP Moderate is the impact level of the *cloud service*, then agencies with a Moderate need have a candidate SaaS. If the data or the connection path requires High / IL5 / an agency ATO, the same document does not move those bars.",
      "hiddenAssumptions": "FR2411959145 is still Authorized on briefing day. The agency's data is Moderate, not High. The agency will complete its own authorization to *use* the service.",
      "qualifications": "Dedicated for Government is the SaaS candidate at Moderate. Self-Managed in a customer boundary is the path when the agency must own the stack. IL5 is out of this offering today.",
      "changingEvidence": "**Support A (unrun, desk):** open FR2411959145 and record status, impact level, and sponsor as of the sitting date. **Support B (unrun, desk):** find a DISA PA or FedRAMP High package for a *named* GitLab offering; if absent, keep B. **Weaken both (unrun):** an agency ATO letter that names Dedicated for Government for a specific system; that is the agency's authorization, not GitLab's listing."
    },
    {
      "num": 3,
      "title": "Runners sit with the tenant",
      "claimA": "On GitLab Dedicated, hosted runners can live in a GitLab-managed AWS account linked to the tenant (PrivateLink optional). `[S6]` `[S3]`",
      "claimB": "On Dedicated for Government, customers **must** build and manage self-managed runners *outside* the tenant. Those runners are an extension of critical infrastructure connected to the FedRAMP boundary. Duo Agent Platform flows need self-managed runners and are **not authorized** in that offering. `[S8]` `[S9]`",
      "evidence": "Dedicated architecture describes hosted runners `[S6]`. Gov shared-responsibility and secure-config pages require customer runners and FIPS images `[S8]` `[S9]`. No lab in this pack executed a runner.",
      "warrant": "**Definitional, offering-scoped.** If the offering's shared-responsibility table assigns runner operation to GitLab, hosted runners are in. If it assigns them to the customer and forbids Agent Platform flows, then a design that draws runners inside the Gov tenant is wrong.",
      "hiddenAssumptions": "\"Outside the tenant\" still has to meet the agency's own CI boundary. A stolen runner token is a supply-chain event either way.",
      "qualifications": "Never say \"GitLab runners\" without naming the offering. Commercial Dedicated ≠ Dedicated for Government.",
      "changingEvidence": "**Support A (unrun):** Dedicated commercial architecture diagram with the hosted-runner AWS account labeled. **Support B (already in ledger):** S8/S9 sentences on self-managed runners and unauthorized Agent Platform flows. **Weaken both (unrun):** a GitLab doc update that adds hosted FIPS runners for Dedicated for Government; that would move the Gov runner line."
    },
    {
      "num": 4,
      "title": "Duo is in the same boundary as GitLab",
      "claimA": "GitLab Duo / Agent Platform is part of the product on GitLab.com, Self-Managed, and Dedicated, with published default models (Claude Sonnet family, Codestral, Gemini, OpenAI as of the 2026-10 docs). `[S12]`",
      "claimB": "The GitLab-managed AI Gateway sends prompts to vendor models. The in-boundary path is a **self-hosted AI Gateway** (Self-Managed and Dedicated for Government). Agent Platform flows and external agents are not authorized on Dedicated for Government. Elicit found no GitLab Duo eval. `[S13]` `[S8]` `[S18]`",
      "evidence": "Duo Agent Platform docs `[S12]`. Self-hosted models page `[S13]`. Gov shared-responsibility forbids Agent Platform flows `[S8]`. NIST SP 800-204D is a pipeline-security framework, not a Duo paper `[S18]`.",
      "warrant": "**Causal for data path; authority for authorization.** If prompts leave through GitLab.com's AI Gateway, then the AI trust boundary is not the GitLab tenant. If the offering's authorization explicitly excludes a Duo feature, that feature is not in the placement.",
      "hiddenAssumptions": "Default models on a docs table are the models that will run on briefing day. Self-hosted models are actually deployable in the customer's enclave.",
      "qualifications": "Sketch two Duo paths. Do not brief \"GitLab has AI, so Gov gets the same agents.\"",
      "changingEvidence": "**Support A (unrun):** a GitLab.com (or Dedicated commercial) Duo Chat turn whose docs say data stays in-region. **Support B (run 2026-10-16):** Elicit light — no GitLab product/Duo paper; keep S8's unauthorized-flows line. **Weaken both (unrun):** a FedRAMP package that names Duo Agent Platform inside Dedicated for Government."
    }
  ],
  "views": {
    "conceptual": {
      "title": "Conceptual View",
      "altitude": "What and why · Vendor-neutral capabilities and actors",
      "actors": [
        {
          "role": "Developer",
          "goal": "Land a reviewed change",
          "trust": "Low until review"
        },
        {
          "role": "Reviewer",
          "goal": "See tests and scans on the same change record",
          "trust": "Medium"
        },
        {
          "role": "Security",
          "goal": "Set scan policy; enforce findings cannot be waived locally",
          "trust": "High on policy"
        },
        {
          "role": "Platform operator",
          "goal": "Control-plane availability, backups, and identity integration",
          "trust": "High inside tenant"
        },
        {
          "role": "Job operator",
          "goal": "Run isolated, patched, token-rotated pipeline workers",
          "trust": "High, often outside tenant"
        },
        {
          "role": "Identity provider",
          "goal": "Authenticate people (SSO, PIV/CAC)",
          "trust": "High"
        },
        {
          "role": "Authorizing official (AO)",
          "goal": "Sign authorization letter naming this system & boundary",
          "trust": "Highest authority"
        },
        {
          "role": "Auditor",
          "goal": "Reconstruct change history & evidence without a tool tour",
          "trust": "Independent"
        }
      ],
      "capabilities": [
        {
          "id": "C1",
          "name": "Change record",
          "outcome": "Single object holds source diff, discussions, approvals, and gate results",
          "actors": "Developer, Reviewer",
          "src": "[S1] [S2]"
        },
        {
          "id": "C2",
          "name": "Pipeline contract",
          "outcome": "Same change triggers a declared sequence of deterministic jobs",
          "actors": "Developer, Job operator",
          "src": "[S2] [S3]"
        },
        {
          "id": "C3",
          "name": "Job execution",
          "outcome": "Untrusted code runs on an isolated worker, never on the control plane",
          "actors": "Job operator",
          "src": "[S3]"
        },
        {
          "id": "C4",
          "name": "Finding record",
          "outcome": "Security scans write normalized findings directly into the change record",
          "actors": "Security, Reviewer",
          "src": "[S4]"
        },
        {
          "id": "C5",
          "name": "Artifact store",
          "outcome": "Container images, packages, and build outputs co-located with source",
          "actors": "Developer, Job operator",
          "src": "[S1]"
        },
        {
          "id": "C6",
          "name": "Git storage",
          "outcome": "Repository history served exclusively via Git RPC; no app-server disk mount",
          "actors": "Platform operator",
          "src": "[S5]"
        },
        {
          "id": "C7",
          "name": "Offering choice",
          "outcome": "Same capabilities across multi-tenant SaaS, isolated Dedicated, and FedRAMP GovCloud",
          "actors": "AO, Platform operator",
          "src": "[S7] [S8]"
        },
        {
          "id": "C8",
          "name": "Identity handoff",
          "outcome": "Federated identity from customer IdP with hardware token support",
          "actors": "Identity provider",
          "src": "[S8]"
        },
        {
          "id": "C9",
          "name": "AI assistance",
          "outcome": "Models read repo context with strict boundary & offline data paths",
          "actors": "Platform operator, AO",
          "src": "[S12] [S13]"
        }
      ],
      "diagram": "assets/diagrams/01-conceptual.png",
      "framework": {
        "togaf": "Architecture Vision (Phase A) & Business Architecture (Phase B)",
        "dodaf": "OV-1 High-Level Operational Concept, CV-2, DIV-1"
      }
    },
    "logical": {
      "title": "Logical View",
      "altitude": "Which parts and how they talk · Interface and data boundaries",
      "components": [
        {
          "name": "HTTP front door",
          "resp": "TLS termination, routing web and Git-over-HTTP requests",
          "inputs": "Browser, Git HTTP",
          "outputs": "App, Workhorse helper"
        },
        {
          "name": "SSH front door",
          "resp": "Git-over-SSH access control and connection routing",
          "inputs": "Git SSH",
          "outputs": "Git RPC via Git Shell auth"
        },
        {
          "name": "Application",
          "resp": "Projects, MRs, CI configuration, authorization, business logic",
          "inputs": "HTTP / Workhorse",
          "outputs": "Postgres writes, Sidekiq jobs, Git RPC"
        },
        {
          "name": "Job queue",
          "resp": "Asynchronous background work (mail, notifications, imports, fan-out)",
          "inputs": "Application",
          "outputs": "Sidekiq worker queues"
        },
        {
          "name": "Session / cache",
          "resp": "User sessions, job metadata leases, short-lived cache",
          "inputs": "Application, Queue",
          "outputs": "Redis key-value access"
        },
        {
          "name": "System of record DB",
          "resp": "Transactional persistence for projects, MRs, pipelines, vulnerabilities",
          "inputs": "Application",
          "outputs": "PostgreSQL relational rows"
        },
        {
          "name": "Git RPC service",
          "resp": "Read and write Git repository objects via gRPC; no shared disk mount",
          "inputs": "Application, Shell, Runners",
          "outputs": "Git packfiles and objects"
        },
        {
          "name": "Job worker",
          "resp": "Clone repository, run build script, execute scans, publish artifacts",
          "inputs": "Job payload + token",
          "outputs": "Build logs, findings, artifact blobs"
        },
        {
          "name": "Artifact registry",
          "resp": "Container image manifests, OCI layers, generic packages",
          "inputs": "Job worker",
          "outputs": "Pull credentials and binary blobs"
        },
        {
          "name": "Cluster agent (KAS)",
          "resp": "Inbound connection from Kubernetes cluster into control plane for GitOps",
          "inputs": "Kubernetes cluster",
          "outputs": "Deployment status and sync"
        },
        {
          "name": "AI Gateway",
          "resp": "Prompt preparation, model orchestration, completion streaming",
          "inputs": "App / IDE clients",
          "outputs": "LLM completions"
        }
      ],
      "diagram": "assets/diagrams/02-logical.png",
      "framework": {
        "togaf": "Information Systems Architectures (Phase C: Data & Application)",
        "dodaf": "OV-2 Resource Flow, OV-5b Activity Model, SV-1, DIV-2"
      }
    },
    "physical": {
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
        {
          "name": "NGINX + GitLab Workhorse",
          "role": "Reverse proxy & fast HTTP request accelerator (bypasses Puma for Git payloads)",
          "offering": "All"
        },
        {
          "name": "GitLab Shell",
          "role": "Fast Go daemon authenticating and multiplexing SSH Git sessions",
          "offering": "All"
        },
        {
          "name": "GitLab Rails / Puma",
          "role": "Ruby on Rails app server with 60s hard request timeout and worker killer",
          "offering": "All"
        },
        {
          "name": "Sidekiq",
          "role": "Multi-threaded background queue processor backed by Redis",
          "offering": "All"
        },
        {
          "name": "PostgreSQL",
          "role": "System-of-record relational store (Patroni for HA on Self-Managed / RDS on Dedicated)",
          "offering": "All"
        },
        {
          "name": "Redis",
          "role": "Sub-millisecond caching, rate limiting, and Sidekiq work distribution",
          "offering": "All"
        },
        {
          "name": "Gitaly",
          "role": "gRPC service providing Git access. Dedicated uses sharded Gitaly, never Praefect",
          "offering": "All"
        },
        {
          "name": "GitLab Runner",
          "role": "Go execution worker. On GovCloud, MUST be customer-managed outside tenant with FIPS",
          "offering": "All"
        },
        {
          "name": "GitLab KAS",
          "role": "Kubernetes Agent Server handling bidirectional GitOps tunnels to clusters",
          "offering": "All"
        },
        {
          "name": "Container Registry",
          "role": "Integrated Docker/OCI registry connected to cloud object storage (S3)",
          "offering": "All"
        },
        {
          "name": "AI Gateway",
          "role": "FastAPI service routing prompts to self-hosted models or external cloud vendors",
          "offering": "All"
        }
      ],
      "diagram": "assets/diagrams/03-physical.png",
      "framework": {
        "togaf": "Technology Architecture (Phase D) & Solutions (Phase E)",
        "dodaf": "SV-1/SV-2 Systems Interface, SV-4, DIV-3, StdV-1"
      }
    },
    "integration": {
      "title": "Integration and AI Elements",
      "altitude": "External interfaces, boundary crossing, and dual AI data paths",
      "integrations": [
        {
          "system": "Agency IdP (Okta / Entra / Keycloak)",
          "dir": "Inbound",
          "mech": "SAML 2.0 / OIDC",
          "data": "Claims, groups, user identities",
          "auth": "Customer SSO / PIV-CAC",
          "gov": "Mandatory on Dedicated for Government. PIV/CAC handled by IdP."
        },
        {
          "system": "GitLab Runner",
          "dir": "Bidirectional",
          "mech": "Outbound HTTPS poll",
          "data": "Job payload, logs, repo clone, cache",
          "auth": "Scoped runner token",
          "gov": "Customer runs outside tenant. FIPS 140-2 validated images required."
        },
        {
          "system": "Kubernetes Clusters",
          "dir": "Bidirectional",
          "mech": "KAS (gRPC tunnel)",
          "data": "Cluster status, GitOps manifests",
          "auth": "KAS agent token",
          "gov": "Customer operates cluster. Dedicated for Gov KAS PA silent."
        },
        {
          "system": "AWS GovCloud (Tenant)",
          "dir": "Hosting",
          "mech": "GitLab IAM & VPC",
          "data": "All tenant data at rest",
          "auth": "GitLab Operator IAM",
          "gov": "AWS GovCloud US-West. Single-tenant AWS account."
        },
        {
          "system": "Customer VPC",
          "dir": "Optional Bi",
          "mech": "AWS PrivateLink",
          "data": "Web UI, Git SSH/HTTPS, API",
          "auth": "PrivateLink endpoint",
          "gov": "Supported on Dedicated to bypass public internet."
        },
        {
          "system": "Cloud LLMs (Anthropic, OpenAI, etc.)",
          "dir": "Outbound",
          "mech": "GitLab.com AI Gateway",
          "data": "Prompts, code snippets, context",
          "auth": "GitLab vendor key",
          "gov": "NOT authorized on Dedicated for Government (unauthorized data path)."
        },
        {
          "system": "Self-Hosted Model Runtime (vLLM / Bedrock-Gov)",
          "dir": "Bidirectional",
          "mech": "Customer AI Gateway",
          "data": "Prompts, completions, embeddings",
          "auth": "Customer IAM / API Key",
          "gov": "The ONLY authorized AI path on Dedicated for Government & air-gap."
        },
        {
          "system": "FedRAMP Marketplace / GSA ConMon",
          "dir": "Outbound",
          "mech": "Continuous Monitoring",
          "data": "Monthly POA&M, vulnerability reports",
          "auth": "GSA portal",
          "gov": "Listing FR2411959145. GSA sponsored."
        }
      ],
      "aiPaths": [
        {
          "type": "GitLab-Managed Cloud AI Gateway",
          "flow": "IDE / Web -> GitLab App -> GitLab-Managed AI Gateway -> Vendor Model (Claude 3.5 Sonnet / Mistral / OpenAI)",
          "supported": "GitLab.com, Self-Managed (connected), Dedicated Commercial",
          "govAuthorized": false,
          "notes": "Fastest setup but prompts exit customer trust boundary to external inference endpoints."
        },
        {
          "type": "Self-Hosted AI Gateway",
          "flow": "IDE / Web -> GitLab App -> Customer-Hosted AI Gateway -> In-Boundary Model (Bedrock GovCloud / vLLM / Azure Gov OpenAI)",
          "supported": "Self-Managed, Dedicated for Government",
          "govAuthorized": true,
          "notes": "Zero prompt egress. Model runs inside customer AWS GovCloud account or private VPC."
        }
      ],
      "diagram": "assets/diagrams/04-integration-ai.png",
      "framework": {
        "togaf": "Phase C App Interfaces & AI Governance",
        "dodaf": "SV-1/SV-2 external interfaces, SV-6, OV-3, StdV-1"
      }
    }
  },
  "blocks": [
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
        {
          "t": "The Single-Platform Thesis [S1] [S2]",
          "rl": "scope · 100",
          "action": "Contrast GitLab's unified project database against toolchain sprawl (e.g. GitHub + Jenkins + SonarQube + Artifactory).",
          "whyMatters": "Fragmented tools force evidence to hop trust boundaries; GitLab keeps findings attached to the MR."
        },
        {
          "t": "Four Offerings, Four Boundaries [S7] [S8]",
          "rl": "scope · 100",
          "action": "Classify GitLab.com, Self-Managed, Dedicated, and Dedicated for Government by operator and compliance level.",
          "whyMatters": "Buying 'GitLab' without scoping the offering leads to un-authorizable boundary drawings."
        }
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
        {
          "t": "Control Plane vs Job Plane Separation",
          "rl": "conceptual · 100",
          "action": "Explain why compiling code on the control plane is an unacceptable architectural anti-pattern.",
          "whyMatters": "Untrusted pipeline scripts must execute in isolated worker sandboxes outside the database boundary."
        },
        {
          "t": "The Authorizing Official's Letter [S8]",
          "rl": "conceptual · 200",
          "action": "Detail what the AO authorizes: the control plane as the durable audit record, not an open pass for worker machines.",
          "whyMatters": "Confusing a cloud provider's FedRAMP ATO with an agency ATO will stall deployment review."
        }
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
        {
          "t": "Git RPC Abstraction (Gitaly) [S5]",
          "rl": "logical · 200",
          "action": "Trace why application servers must never mount repository storage disks directly via NFS.",
          "whyMatters": "Network file sharing creates I/O contention and file-locking bottlenecks; Gitaly isolates Git execution behind gRPC."
        },
        {
          "t": "The 60-Second Rule & Sidekiq Offloading [S17]",
          "rl": "logical · 200",
          "action": "Trace Puma's request budget: web requests terminate at 60s; all long-running tasks offload to Sidekiq.",
          "whyMatters": "Prevents slow Git commands or heavy webhook fan-outs from exhausting Puma worker threads."
        }
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
        {
          "t": "Sharded Gitaly vs Praefect Cluster [S6]",
          "rl": "physical · 200",
          "action": "Document why GitLab Dedicated operates sharded Gitaly storage nodes rather than Praefect HA clusters.",
          "whyMatters": "Praefect SQL metadata overhead is eliminated in favor of automated tenant-level EBS snapshot recovery."
        },
        {
          "t": "Dedicated for Government Blueprint [S7] [S8]",
          "rl": "physical · 300",
          "action": "Walk the FedRAMP Moderate package FR2411959145: AWS GovCloud US-West, single-tenant account, agency IdP.",
          "whyMatters": "Guarantees zero tenant co-mingling and US citizens on US soil for operational maintenance."
        }
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
        {
          "t": "The Two Duo Paths [S12] [S13]",
          "rl": "AI · 200",
          "action": "Contrast GitLab-managed AI Gateway against the customer self-hosted AI Gateway.",
          "whyMatters": "Prompt context contains source code and sensitive variables; GovCloud strictly forbids external egress."
        },
        {
          "t": "Agency-Controlled Edge & PrivateLink [S6] [S8]",
          "rl": "integration · 300",
          "action": "Route traffic over AWS PrivateLink; integrate agency IdP for PIV/CAC without public internet hops.",
          "whyMatters": "Hardware authentication must terminate at the customer IdP, not on GitLab directly."
        }
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
        {
          "t": "Declarative Security Gating [S2] [S4]",
          "rl": "lab · 200",
          "action": "Configure a pipeline to block merge requests when high/critical vulnerabilities or exposed secrets are detected.",
          "whyMatters": "Removes human forgetfulness from security compliance; the pipeline contract enforces gate policy."
        },
        {
          "t": "Scoped CI/CD Job Tokens [S9]",
          "rl": "lab · 200",
          "action": "Trace how CI_JOB_TOKEN limits worker access strictly to the triggering project.",
          "whyMatters": "Stops lateral privilege escalation across repositories from compromised build scripts."
        }
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
        {
          "t": "Runner Token Compromise [S9]",
          "rl": "security · 300",
          "action": "Analyze what happens if a runner registration token is exfiltrated and how short-lived authentication tokens protect the control plane.",
          "whyMatters": "Attackers can run malicious jobs or impersonate workers; tokens must be rotated and scoped."
        },
        {
          "t": "AI Prompt Egress & Grounding Leakage [S8] [S13]",
          "rl": "security · 300",
          "action": "Audit outbound network egress rules to ensure no prompt data leaves the customer VPC to commercial LLM endpoints.",
          "whyMatters": "Prompt injection or misconfiguration could leak classified or CUI code to external commercial models."
        }
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
        {
          "t": "Defending the Government Blueprint [S7] [S8] [S10]",
          "rl": "review · 300",
          "action": "Articulate why Dedicated for Government is the exact placement for FedRAMP Moderate CUI workloads.",
          "whyMatters": "Proves architectural mastery to sponsors, security officers, and authorizing officials."
        },
        {
          "t": "Shared Responsibility Defense [S8]",
          "rl": "review · 300",
          "action": "Map the boundary: GitLab operates the tenant (patching, OS, database, uptime); Customer operates IdP, runners, and code policy.",
          "whyMatters": "Eliminates ambiguity regarding who responds during an incident or compliance audit."
        }
      ]
    }
  ],
  "glossary": [
    {
      "category": "Control Plane",
      "term": "Control Plane",
      "rung": 100,
      "essential": true,
      "definition": "The governed management layer (NGINX, Workhorse, Puma, Sidekiq, PostgreSQL, Gitaly) holding projects, MRs, and audit evidence.",
      "see_also": "Job Plane, Workhorse",
      "where": "views/01 - Conceptual View.md",
      "source": "S17"
    },
    {
      "category": "Job Plane",
      "term": "Job Plane",
      "rung": 100,
      "essential": true,
      "definition": "The untrusted compute plane of GitLab Runners executing builds, tests, and security scans. Sits outside tenant on GovCloud.",
      "see_also": "Control Plane, GitLab Runner",
      "where": "views/01 - Conceptual View.md",
      "source": "S3, S8"
    },
    {
      "category": "Storage & Data",
      "term": "Gitaly",
      "rung": 200,
      "essential": true,
      "definition": "GitLab's high-performance Git RPC service that isolates repository disk I/O behind a typed gRPC interface, eliminating NFS.",
      "see_also": "Praefect, Git RPC",
      "where": "views/02 - Logical View.md",
      "source": "S5, S15"
    },
    {
      "category": "Storage & Data",
      "term": "Praefect",
      "rung": 200,
      "essential": false,
      "definition": "Gitaly Cluster's SQL-backed coordination router for synchronous Git replication. Used on Self-Managed; omitted on Dedicated.",
      "see_also": "Gitaly, Sharded Gitaly",
      "where": "views/03 - Physical View.md",
      "source": "S5, S6"
    },
    {
      "category": "Storage & Data",
      "term": "Sharded Gitaly",
      "rung": 200,
      "essential": true,
      "definition": "The storage topology used on GitLab Dedicated where repositories are distributed across discrete Gitaly nodes without Praefect SQL overhead.",
      "see_also": "Praefect, Dedicated",
      "where": "views/03 - Physical View.md",
      "source": "S6"
    },
    {
      "category": "Control Plane",
      "term": "GitLab Workhorse",
      "rung": 200,
      "essential": true,
      "definition": "Smart reverse-proxy in Go that handles raw Git HTTP traffic, file uploads, and artifact downloads without consuming Puma Ruby threads.",
      "see_also": "Puma, NGINX",
      "where": "views/02 - Logical View.md",
      "source": "S17"
    },
    {
      "category": "Control Plane",
      "term": "Puma",
      "rung": 100,
      "essential": true,
      "definition": "Multi-threaded Ruby on Rails application server enforcing a strict 60-second request timeout to prevent hung worker cascading failures.",
      "see_also": "Workhorse, Sidekiq",
      "where": "views/02 - Logical View.md",
      "source": "S17"
    },
    {
      "category": "Control Plane",
      "term": "Sidekiq",
      "rung": 100,
      "essential": true,
      "definition": "Multi-threaded background queue daemon backed by Redis, processing emails, webhook dispatch, pipeline scheduling, and imports.",
      "see_also": "Puma, Redis",
      "where": "views/02 - Logical View.md",
      "source": "S17"
    },
    {
      "category": "Job Plane",
      "term": "GitLab Runner",
      "rung": 100,
      "essential": true,
      "definition": "Go application running on isolated virtual machines or Kubernetes that polls GitLab for jobs over outbound HTTPS and executes them.",
      "see_also": "Job Plane, FIPS Runner",
      "where": "views/01 - Conceptual View.md",
      "source": "S3"
    },
    {
      "category": "Job Plane",
      "term": "FIPS Runner",
      "rung": 200,
      "essential": true,
      "definition": "GitLab Runner built using FIPS 140-2 validated cryptographic modules, mandatory for all customer-managed runners on GovCloud.",
      "see_also": "GitLab Runner, Dedicated for Government",
      "where": "views/03 - Physical View.md",
      "source": "S8, S9"
    },
    {
      "category": "Control Plane",
      "term": "KAS (Kubernetes Agent Server)",
      "rung": 200,
      "essential": true,
      "definition": "GitLab daemon maintaining secure inbound gRPC tunnels from agents running in customer Kubernetes clusters for GitOps and telemetry.",
      "see_also": "Control Plane, Kubernetes",
      "where": "views/02 - Logical View.md",
      "source": "S1"
    },
    {
      "category": "Security & Scans",
      "term": "Merge Request (MR)",
      "rung": 100,
      "essential": true,
      "definition": "The central unit of collaboration, governance, and audit; binds code diffs, reviewer approvals, pipeline status, and security findings.",
      "see_also": "Pipeline, Finding",
      "where": "views/01 - Conceptual View.md",
      "source": "S1, S2"
    },
    {
      "category": "Security & Scans",
      "term": "Pipeline Contract",
      "rung": 200,
      "essential": true,
      "definition": "The declarative `.gitlab-ci.yml` schema that binds code commits to an immutable, reproducible sequence of build and verification stages.",
      "see_also": "Merge Request, GitLab Runner",
      "where": "views/01 - Conceptual View.md",
      "source": "S2"
    },
    {
      "category": "Security & Scans",
      "term": "SAST (Static Analysis)",
      "rung": 100,
      "essential": true,
      "definition": "Static application security testing integrated into pipeline jobs, surfacing code vulnerabilities directly inside the MR widget before merge.",
      "see_also": "DAST, Secret Detection",
      "where": "blocks/06-hands-on-lab.md",
      "source": "S4"
    },
    {
      "category": "Security & Scans",
      "term": "DAST (Dynamic Analysis)",
      "rung": 200,
      "essential": false,
      "definition": "Dynamic testing executed against running preview environments to uncover runtime weaknesses, authentication flaws, and injection bugs.",
      "see_also": "SAST, Review App",
      "where": "blocks/06-hands-on-lab.md",
      "source": "S4"
    },
    {
      "category": "Security & Scans",
      "term": "Secret Detection",
      "rung": 100,
      "essential": true,
      "definition": "Automated scanning for leaked API keys, tokens, and certificates in git commits; supports pre-receive commit rejection.",
      "see_also": "SAST, Pipeline Contract",
      "where": "blocks/06-hands-on-lab.md",
      "source": "S4"
    },
    {
      "category": "Offerings & Compliance",
      "term": "GitLab Dedicated for Government",
      "rung": 200,
      "essential": true,
      "definition": "Single-tenant, GitLab-managed SaaS hosted in AWS GovCloud US-West, FedRAMP Moderate Authorized (FR2411959145).",
      "see_also": "Dedicated, FedRAMP Moderate",
      "where": "views/03 - Physical View.md",
      "source": "S7, S8, S10"
    },
    {
      "category": "Offerings & Compliance",
      "term": "FR2411959145",
      "rung": 200,
      "essential": true,
      "definition": "The official FedRAMP Marketplace package identifier for GitLab Dedicated for Government, sponsored by the GSA at Moderate impact.",
      "see_also": "Dedicated for Government, ConMon",
      "where": "reference/source-ledger.md",
      "source": "S10"
    },
    {
      "category": "Offerings & Compliance",
      "term": "Switchboard",
      "rung": 300,
      "essential": true,
      "definition": "GitLab's internal multi-tenant orchestration platform that provisions, configures, and updates isolated single-tenant Dedicated accounts.",
      "see_also": "Dedicated, Amp",
      "where": "views/03 - Physical View.md",
      "source": "S6"
    },
    {
      "category": "Offerings & Compliance",
      "term": "Amp",
      "rung": 300,
      "essential": false,
      "definition": "Automation pipeline and daemon executing maintenance tasks and tenant upgrades within GitLab Dedicated infrastructure.",
      "see_also": "Switchboard, Dedicated",
      "where": "views/03 - Physical View.md",
      "source": "S6"
    },
    {
      "category": "AI & Duo",
      "term": "GitLab Duo",
      "rung": 100,
      "essential": true,
      "definition": "Suite of AI features across the SDLC including Code Suggestions, Duo Chat, Vulnerability Explanation, and Root Cause Analysis.",
      "see_also": "AI Gateway, Self-Hosted AI Gateway",
      "where": "views/04 - Integration and AI Elements.md",
      "source": "S12"
    },
    {
      "category": "AI & Duo",
      "term": "AI Gateway",
      "rung": 200,
      "essential": true,
      "definition": "FastAPI microservice sitting between GitLab clients and LLM backends, responsible for prompt generation, context assembly, and streaming.",
      "see_also": "GitLab Duo, Self-Hosted AI Gateway",
      "where": "views/04 - Integration and AI Elements.md",
      "source": "S12, S13"
    },
    {
      "category": "AI & Duo",
      "term": "Self-Hosted AI Gateway",
      "rung": 200,
      "essential": true,
      "definition": "AI Gateway deployed inside the customer's private enclave routing to local or GovCloud models; mandatory for Dedicated for Government.",
      "see_also": "AI Gateway, Dedicated for Government",
      "where": "views/04 - Integration and AI Elements.md",
      "source": "S13, S8"
    },
    {
      "category": "Offerings & Compliance",
      "term": "Shared Responsibility Model",
      "rung": 200,
      "essential": true,
      "definition": "Clear division of operational duties: GitLab manages infra, OS, patching, and SLA; Customer manages IdP, runners, and project security.",
      "see_also": "Dedicated for Government",
      "where": "views/04 - Integration and AI Elements.md",
      "source": "S8"
    },
    {
      "category": "Storage & Data",
      "term": "Patroni",
      "rung": 300,
      "essential": false,
      "definition": "Template for high-availability PostgreSQL on Self-Managed instances using etcd consensus to handle automated failover.",
      "see_also": "PostgreSQL, PgBouncer",
      "where": "views/03 - Physical View.md",
      "source": "S14"
    },
    {
      "category": "Storage & Data",
      "term": "PgBouncer",
      "rung": 200,
      "essential": false,
      "definition": "Lightweight connection pooler for PostgreSQL deployed in large GitLab reference architectures to conserve database worker threads.",
      "see_also": "PostgreSQL, Puma",
      "where": "views/03 - Physical View.md",
      "source": "S14"
    },
    {
      "category": "Security & Scans",
      "term": "CI_JOB_TOKEN",
      "rung": 200,
      "essential": true,
      "definition": "Short-lived JSON Web Token generated for each pipeline job, tightly scoping runner permissions to prevent cross-repo theft.",
      "see_also": "Runner Token, GitLab Runner",
      "where": "blocks/06-hands-on-lab.md",
      "source": "S9"
    },
    {
      "category": "Security & Scans",
      "term": "Shift-Left",
      "rung": 100,
      "essential": true,
      "definition": "Embedding security scanning into the developer's normal branch workflow so vulnerabilities are surfaced and remediated before merge.",
      "see_also": "Merge Request, SAST",
      "where": "views/01 - Conceptual View.md",
      "source": "S4"
    },
    {
      "category": "Offerings & Compliance",
      "term": "Cloud Native Hybrid",
      "rung": 300,
      "essential": false,
      "definition": "GitLab reference architecture placing stateless web/Sidekiq pods in Kubernetes while maintaining stateful Gitaly and Postgres on VMs.",
      "see_also": "Self-Managed, Gitaly",
      "where": "views/03 - Physical View.md",
      "source": "S14"
    },
    {
      "category": "Offerings & Compliance",
      "term": "AWS PrivateLink",
      "rung": 200,
      "essential": true,
      "definition": "Private AWS VPC endpoint allowing customer traffic to reach GitLab Dedicated without crossing public internet routing.",
      "see_also": "Dedicated for Government, Agency IdP",
      "where": "views/04 - Integration and AI Elements.md",
      "source": "S6, S8"
    },
    {
      "term": "Job token allowlist",
      "category": "Security",
      "rung": 200,
      "essential": true,
      "definition": "Project/group policy that limits which other projects a CI_JOB_TOKEN may access, reducing lateral movement after job compromise.",
      "where": "Security",
      "source": "S9"
    },
    {
      "term": "PrivateLink",
      "category": "Network",
      "rung": 200,
      "essential": true,
      "definition": "AWS private connectivity pattern used so agency networks reach the Dedicated tenant without public internet traversal.",
      "where": "Physical / Network",
      "source": "S8"
    },
    {
      "term": "FIPS runner image",
      "category": "Compliance",
      "rung": 200,
      "essential": true,
      "definition": "Runner OS/runtime built with FIPS-validated crypto modules, required for many GovCloud CI workloads outside the tenant.",
      "where": "Job plane",
      "source": "S8"
    },
    {
      "term": "Authorizing Official (AO)",
      "category": "Compliance",
      "rung": 100,
      "essential": true,
      "definition": "Official who accepts residual risk for the system. For GitLab Gov Dedicated, the letter covers the control plane as system of record—not every job host.",
      "where": "Governance",
      "source": "S8"
    },
    {
      "term": "Shared responsibility (Dedicated Gov)",
      "category": "Compliance",
      "rung": 200,
      "essential": true,
      "definition": "GitLab runs the tenant (OS, DB, DR). Customer runs IdP, runners, network paths, and self-hosted AI gateway.",
      "where": "Governance",
      "source": "S8"
    },
    {
      "term": "Zero-egress AI path",
      "category": "AI",
      "rung": 200,
      "essential": true,
      "definition": "Duo traffic that stays inside the customer estate via a self-hosted AI Gateway to approved models—never GitLab.com’s commercial gateway.",
      "where": "AI",
      "source": "S13"
    },
    {
      "term": "Duo Agent Platform",
      "category": "AI",
      "rung": 200,
      "essential": true,
      "definition": "Autonomous / external-agent Duo flows. Called out as unauthorized on the current Dedicated for Government FedRAMP package.",
      "where": "AI",
      "source": "S8"
    },
    {
      "term": "System of record (SoR)",
      "category": "Architecture",
      "rung": 100,
      "essential": true,
      "definition": "Authoritative store for a capability. For change records and findings, that is the GitLab control-plane database—not a ticket silo.",
      "where": "Conceptual",
      "source": "S1"
    },
    {
      "term": "Trust domain",
      "category": "Architecture",
      "rung": 100,
      "essential": true,
      "definition": "A boundary of shared identity, admin, and blast radius. Control plane and job plane are separate trust domains on Gov Dedicated.",
      "where": "Conceptual",
      "source": "S8"
    },
    {
      "term": "Outbound HTTPS pull (runners)",
      "category": "Network",
      "rung": 200,
      "essential": true,
      "definition": "Runners initiate connections to the tenant to fetch jobs; the tenant does not open inbound SSH to customer VPCs.",
      "where": "Job plane",
      "source": "S9"
    },
    {
      "term": "Container registry (GitLab)",
      "category": "Platform",
      "rung": 100,
      "essential": false,
      "definition": "Built-in image registry integrated with projects and pipelines so build artifacts stay on the same control plane as the MR.",
      "where": "Platform",
      "source": "S1"
    },
    {
      "term": "Shift-left scan",
      "category": "Security",
      "rung": 100,
      "essential": true,
      "definition": "SAST/secret/dependency scans that run in the MR pipeline before merge so findings gate the change record.",
      "where": "Security",
      "source": "S1"
    },
    {
      "term": "Evidence trail",
      "category": "Governance",
      "rung": 200,
      "essential": true,
      "definition": "Linked history of who changed what, which pipeline ran, and which findings attached—usable in an AO package without tool hopping.",
      "where": "Governance",
      "source": "S1"
    }
  ],
  "failureModes": [
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
  ],
  "quizzes": [
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
    },
    {
      "q": "What does the Authorizing Official actually authorize on Dedicated for Government?",
      "options": [
        "Every runner host in the customer VPC",
        "The control plane as the system of record for code, pipelines, and findings",
        "Commercial Duo Agent Platform flows by default",
        "Public GitLab.com shared runners"
      ],
      "answer": 1,
      "category": "Government & Compliance",
      "explain": "The AO signs the control plane: Git history, pipeline contracts, and findings. Job-plane hosts remain untrusted execution outside that letter [S8]."
    },
    {
      "q": "Why is NFS shared mount called out as a failure mode for Gitaly?",
      "options": [
        "NFS is required for Praefect",
        "Shared filesystem mounts break Git RPC consistency and are not the supported Gitaly model",
        "NFS is faster than local disks for Git packs",
        "Dedicated mandates NFS for all storage"
      ],
      "answer": 1,
      "category": "Storage & Data",
      "explain": "Gitaly expects local disks / block volumes with Git over gRPC. Shared NFS mounts are a classic anti-pattern that corrupts availability and consistency [S14, S17]."
    },
    {
      "q": "Which statement best describes CI_JOB_TOKEN scoping?",
      "options": [
        "A long-lived PAT shared across the group",
        "A short-lived per-job token that can be limited with allowlists so a compromised job cannot clone neighbor projects",
        "A root SSH key baked into the runner image",
        "An unbounded token that can call any GitLab API forever"
      ],
      "answer": 1,
      "category": "Security & Governance",
      "explain": "Job token allowlists keep a stolen CI_JOB_TOKEN from becoming a lateral-move key into other private repos [S9]."
    },
    {
      "q": "What is the customer’s 90-day start after choosing Dedicated for Government?",
      "options": [
        "Migrate every historical wiki first",
        "Wire agency IdP, stand up FIPS runners, land the first five critical workloads",
        "Enable commercial AI Gateway and Agent Platform",
        "Move PostgreSQL into the customer VPC"
      ],
      "answer": 1,
      "category": "Architecture Views",
      "explain": "The decision memo’s near-term path is identity, runners, and a thin critical-workload cutover—not boiling the ocean [S8]."
    },
    {
      "q": "How does GitLab Dedicated achieve Git HA without Praefect?",
      "options": [
        "Multi-tenant Gitaly with shared root",
        "Sharded Gitaly plus automated EBS snapshot / cross-region patterns",
        "NFS + Pacemaker",
        "Putting Gitaly only in Kubernetes emptyDir"
      ],
      "answer": 1,
      "category": "Storage & Data",
      "explain": "Dedicated omits Praefect’s SQL coordination and uses sharded Gitaly with cloud snapshot DR [S6]."
    },
    {
      "q": "Which AI feature class is explicitly out of the current FedRAMP Moderate package for Dedicated for Government?",
      "options": [
        "Self-hosted Code Suggestions through a customer AI Gateway",
        "Duo Agent Platform autonomous external-agent flows",
        "SAML login",
        "Container registry pulls inside the tenant"
      ],
      "answer": 1,
      "category": "AI & Duo",
      "explain": "Agent Platform / autonomous external agents are called out as unauthorized on the Gov Dedicated package; keep them off [S8]."
    },
    {
      "q": "What is the correct trust-domain answer for 'Self-Hosted AI Gateway' on Gov Dedicated?",
      "options": [
        "Tenant control plane (GitLab managed)",
        "Customer job plane / customer estate",
        "External unauthorized egress",
        "Amazon shared services only"
      ],
      "answer": 1,
      "category": "Architecture Views",
      "explain": "The self-hosted AI Gateway sits in the customer estate so prompts do not leave through GitLab.com’s commercial gateway [S8, S13]."
    },
    {
      "q": "What does Workhorse protect Puma from?",
      "options": [
        "DNS failures",
        "High-bandwidth Git HTTP and large uploads that would starve Ruby workers",
        "Kubernetes etcd quorum loss",
        "SAML clock skew"
      ],
      "answer": 1,
      "category": "Control Plane",
      "explain": "Workhorse terminates slow/large Git and artifact traffic so Puma threads stay available for interactive app work [S17]."
    },
    {
      "q": "In Cloud Native Hybrid, which pair stays on VMs?",
      "options": [
        "NGINX and Workhorse only",
        "Gitaly and PostgreSQL (stateful)",
        "Only Sidekiq",
        "Only the runner manager"
      ],
      "answer": 1,
      "category": "Storage & Data",
      "explain": "Stateless web/Sidekiq can go to Kubernetes; stateful Gitaly and Postgres stay on VMs for I/O and durability [S14]."
    },
    {
      "q": "Which offering matches single-tenant AWS GovCloud with FedRAMP Moderate listing FR2411959145?",
      "options": [
        "GitLab.com SaaS",
        "GitLab Dedicated for Government",
        "Self-Managed CE on a laptop",
        "GitLab Pages only"
      ],
      "answer": 1,
      "category": "Government & Compliance",
      "explain": "Dedicated for Government is the single-tenant GovCloud placement with that FedRAMP package id [S8]."
    }
  ]
};
