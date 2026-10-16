# Comprehensive Failure Mode and Security Weakness Catalog: GitLab DevSecOps Platform Architecture

---

### 1. Architectural Scope and Assessment Framework

#### 1. System Boundary and Trust Domain Definition

The platform boundary separates centralized application management and state management services from distributed job execution environments. To establish formal audit boundaries and enforce least-privilege security controls, the architecture is partitioned into two non-overlapping trust domains:

*   **Control Plane Trust Domain**: Contains core application services responsible for identity handling, state management, source code persistence, API orchestration, and job scheduling. Components operating strictly within this domain include NGINX (TLS termination/reverse proxy), GitLab Workhorse (smart reverse proxy for large payloads), Rails/Puma (application web server and API layer), Sidekiq (asynchronous background job processor), PostgreSQL (system-of-record relational database), Redis (session state, cache, and background job queue stores), and Gitaly (Git RPC storage service).
*   **Job Plane Trust Domain**: Contains distributed execution environments (GitLab Runner instances) that poll the control plane over HTTPS, retrieve job execution instructions, clone target repositories, execute arbitrary user-defined build scripts, run security scanners, and return pipeline logs and binary artifacts.

Neighbor systems sitting immediately outside the control plane boundary comprise six key external entities:
1.  **Agency / Enterprise Identity Provider (IdP)**: External SAML 2.0 / OpenID Connect (OIDC) identity federations enforcing PIV/CAC smart card authentication and organizational multi-factor authentication (MFA).
2.  **Kubernetes Clusters via KAS**: Customer-managed runtime infrastructure connected inbound to the control plane via the GitLab Agent for Kubernetes (KAS).
3.  **External / Customer VPCs via AWS PrivateLink**: Customer cloud networks interconnected via unidirectional or bidirectional AWS PrivateLink endpoints.
4.  **External LLM Vendor Endpoints**: Third-party artificial intelligence providers (e.g., Anthropic, Google, OpenAI) accessed via the managed AI Gateway path.
5.  **Self-Managed Runner Fleets**: Customer-operated worker fleets (e.g., FIPS-compliant runner images) hosted on customer infrastructure entirely outside the control plane AWS account boundary.
6.  **FedRAMP Continuous Monitoring (ConMon) / GSA Oversight Reporting Endpoints**: Federal governance endpoints receiving continuous monitoring data under FedRAMP Moderate package ID FR2411959145.

**Key Taxonomy Definitions:**
*   **Control Plane Trust Domain**: The administrative and stateful security boundary containing core database, caching, web, and storage components; managed by platform operations staff or Cloud Service Provider (CSP) Site Reliability Engineers (SREs).
*   **Job Plane Trust Domain**: The untrusted execution boundary where user-submitted pipeline code, third-party build tools, and arbitrary script steps are processed on ephemeral or persistent worker nodes.

#### 2. Architectural Views & Assessment Methodology

This catalog evaluates the platform across four explicit architecture views:

1.  **Conceptual View**: Evaluates high-level capabilities, operational actors, compliance boundaries, and governance constraints without referencing specific product implementations or cloud SKUs.
2.  **Logical View**: Analyzes vendor-neutral component relationships, data entity models, worker execution flows, interface contracts, middleware layers, and synchronous versus asynchronous processing queues.
3.  **Physical View**: Assesses concrete infrastructure realizations, tenant isolation boundaries, cloud provider variants (GitLab.com, Self-Managed, Dedicated, Dedicated for Government), storage sub-system IOPS requirements, and licensing/impact-level constraints.
4.  **Integration & AI View**: Evaluates third-party system integration boundaries, identity handoffs, NIST controls, API contracts, and artificial intelligence data paths (Managed vs. Self-Hosted AI Gateway architectures).

**Methodology Constraint & Silence Rule:**
All architectural evaluations, failure modes, and security weaknesses cataloged herein are grounded strictly in verified source documentation. Any technical capability, cloud availability parameter, or security control not explicitly validated by the underlying source context is formally designated as **SILENCE**. No external assumptions, unverified marketing assertions, or unbacked capabilities are inferred.

---

### 2. Conceptual View Failure Modes and Governance Weaknesses

#### 1. Compliance Boundaries & ATO Misinterpretation

> **Failure Mode: Compliance Boundaries & ATO Misinterpretation**
>
> *   **Symptom**: Deployment of sensitive or regulated federal workloads—such as Controlled Unclassified Information (CUI) or Department of Defense (DoD) Impact Level 5 (IL5) / Impact Level 6 (IL6) data—onto unauthorized commercial SaaS or single-tenant offerings (e.g., multi-tenant GitLab.com or commercial GitLab Dedicated) under the invalid assumption that a provider's cloud certification grants blanket organizational authorization.
> *   **Root Cause**: Failure to adhere to the Cloud Shared Responsibility Model, resulting in agency personnel conflating a Cloud Service Provider's (CSP) FedRAMP Marketplace listing (e.g., FedRAMP Moderate Authorization FR2411959145 on AWS GovCloud US-West) with an official agency-level risk acceptance decision.
> *   **View**: Conceptual.
> *   **Blast Radius**: Total regulatory non-compliance, severe spillage of unclassified or classified defense data across unapproved commercial tenant boundaries, immediate suspension or revocation of system authorization, and potential compromise of software supply chain integrity.
> *   **Supported Mitigation**: Mandate that the agency Authorizing Official (AO) issue an explicit, signed System Security Plan (SSP) approval and Authorization Letter specifically naming the selected deployment offering (e.g., Dedicated for Government), the exact tenant impact level, data classification boundaries, and customer-operated controls (such as off-tenant FIPS runners).

#### 2. Control Plane vs. Job Plane Trust Boundary Conflation

> **Failure Mode: Control Plane vs. Job Plane Trust Boundary Conflation**
>
> *   **Symptom**: Execution of arbitrary, untrusted user pipeline scripts within or directly adjacent to administrative control plane networks, exposing management infrastructure and persistent stores to unvetted build execution payloads.
> *   **Root Cause**: Conceptual architecture error that treats pipeline job execution environments as trusted internal extensions of the control plane rather than strictly isolated, untrusted processing domains.
> *   **View**: Conceptual.
> *   **Blast Radius**: Unrestricted lateral movement from a compromised build host into control plane infrastructure, core PostgreSQL relational databases, Redis session/queue stores, or underlying cloud tenant management systems (e.g., Switchboard/Amp).
> *   **Supported Mitigation**: Enforce absolute architectural separation by provisioning job execution runners on isolated infrastructure completely outside the control plane tenant boundary (e.g., deploying customer-managed FIPS-compliant runners within agency-operated AWS VPCs outside the Dedicated for Government AWS GovCloud account).

---

### 3. Logical View Failure Modes and Component Bottlenecks

#### 1. Runner Token Theft and Impersonation

Compromised or broadly scoped runner authentication tokens allow unauthorized entities to register rogue worker nodes, poll internal job queues, read repository source code, and exfiltrate secrets.

| Attribute | Details |
| :--- | :--- |
| **Weakness / Failure Mode** | Runner Token Theft and Impersonation |
| **Architectural View** | Logical |
| **Symptom** | Rogue or unregistered worker instances connect to the application control plane, poll job queues, exfiltrate environment credentials and source code, or inject malicious build artifacts into pipelines. |
| **Root Cause** | Usage of unrotated, broadly scoped (instance-level or group-level) runner registration/authentication tokens stored insecurely in code repositories, unencrypted configuration files, or exposed job logs. |
| **Blast Radius** | Total compromise of pipeline execution integrity, exfiltration of production environment secrets, exposure of proprietary source code, and supply chain poisoning across projects sharing the runner scope. |
| **Supported Mitigation** | Implement fine-grained token scoping, enforce periodic automated token rotation, apply zero-trust network access controls to job polling endpoints, and enforce isolated runner execution flows. |

#### 2. Puma Worker Exhaustion & Ungraceful Termination

Puma serves dynamic HTTP/REST/GraphQL requests for the core Ruby on Rails application stack. Web and API traffic traverses a Rack middleware stack (`Rack::Attack`, `Rack::Timeout`, `OmniAuth`) prior to reaching Rails controllers.

```
Incoming Request ---> [ NGINX / Workhorse ]
                            |
                            v
                    [ Puma Web Server ]
                            |
                            v
                   [ Rack Middleware Stack ]
                   ├── Rack::Attack  (Rate limiting / Throttling)
                   ├── Rack::Timeout (Hard request execution ceiling)
                   └── OmniAuth      (Authentication callbacks)
                            |
                            v (Only unrejected requests reach Rails)
                   [ Rails Application Controllers ]
```

*   **Rack Middleware Execution and Logging Gaps**: `Rack::Attack` enforces IP and user rate limiting, while `Rack::Timeout` enforces request duration limits. If `Rack::Attack` drops a request due to throttling or `Rack::Timeout` aborts execution, request processing halts within the middleware layer *before* reaching Rails. Consequently, these rejected requests **do not log to `production.json`**, though traces appear in NGINX and Workhorse reverse proxy logs.
*   **Memory Dynamics & `puma_worker_killer`**: Dynamic memory allocations during Rails request execution often exceed Ruby garbage collection (GC) rates under heavy traffic. To prevent complete host RAM exhaustion, the `puma_worker_killer` utility monitors worker process memory and forcibly terminates workers exceeding threshold limits. While recycling every 20–30 seconds under heavy load is normal baseline behavior, worker recycling every 5–6 seconds indicates acute RAM starvation per worker.
*   **Puma Thread Configuration Bounds**: Configuring Puma threads per worker beyond **14 to 15 threads** (e.g., setting threads to 16) causes severe process creation and destruction delays during worker recycling, leading to Puma startup timeouts and worker initialization failures.
*   **Resource Thresholds & Scaling Triggers**: Puma request handling is bounded by hard 60-second timeouts across Workhorse, NGINX, and Puma. Web or API requests exceeding 60 seconds are terminated, returning HTTP 502 Bad Gateway or HTTP 500 Internal Server Error responses. Extreme request volumes can also exhaust OS file descriptors due to dynamic Rails template compilation, stalling web traffic processing.

#### 3. Sidekiq / Redis Queue Bottlenecks

Sidekiq processes asynchronous background jobs (e.g., pipeline job fan-outs, email notifications, project imports, and security scan ingestion). Puma enqueues tasks by writing worker classes and arguments into Redis in-memory lists.

```
[ Puma App ] ---> (Enqueue Job Payload) ---> [ Shared Redis Instance ]
                                                    │
        ┌───────────────────────────────────────────┴───────────────────────────────────────────┐
        ▼                                                                                       ▼
[ Memory Eviction Policy: volatile-lru ]                                        [ In-Memory Job Queues: Redis Lists ]
  • Drops ephemeral cache entries under RAM pressure                              • Unpersisted job arguments & payloads
  • High risk of list corruption or dropped payloads during restarts              • Susceptible to queue backlogs under fan-out
        │                                                                                       │
        └───────────────────────────────────────────┬───────────────────────────────────────────┘
                                                    ▼
                                    [ Sidekiq Background Workers ]
```

When a single Redis instance is shared between ephemeral session caching/memoization and persistent Sidekiq job queues, memory pressure introduces severe operational failure modes:
*   **Queue Loss & Memory Eviction Mechanics**: Ephemeral caching typically utilizes LRU eviction policies (e.g., `volatile-lru`). If a single Redis instance handles both caching and Sidekiq queues, memory saturation or host reboots can cause the loss of unpersisted job payloads stored in Redis lists.
*   **Operational Impact**: Shared Redis saturation results in growing background job backlogs, stalled Merge Request status updates, delayed security scan ingestion, and platform-wide latency.
*   **Mitigation**: Architecturally isolate ephemeral caching from persistent background queues by provisioning separate physical or logical Redis instances (**Redis Cache** vs. **Redis Persistent**), scaling RAM, and binding dedicated Sidekiq worker processes to isolated high-priority queues.

---

### 4. Physical View Failure Modes, Deployment Misconfigurations, and Licensing Gaps

#### 1. Gitaly Disk IOPS Exhaustion and Storage Architecture Misconfigurations

Gitaly manages Git repository access via gRPC RPCs. Git operations issue high volumes of small read/write filesystem transactions, making storage IOPS the primary performance bottleneck.

*   **Symptom**: High Git RPC latency, `507 Insufficient Storage` errors, `14 Deadline Exceeded` gRPC timeouts in Puma (where default Gitaly RPC timeouts are set to 57 seconds, representing 95% of Puma's 60-second limit), and repository write failures.
*   **Post-Timeout Backend Execution Mechanics**: When Puma times out at 60 seconds or Gitaly breaches its 57-second RPC deadline, Gitaly on the storage server **may continue executing the underlying `git` process on disk in the background** unless gRPC deadline propagation actively terminates the child process. This causes Gitaly nodes to remain at 100% CPU and IOPS utilization long after end users receive HTTP 502/504 gateway errors.
*   **[ROOT CAUSE: LOW-IOPS STORAGE]**: Deploying Gitaly storage on low-tier disk architectures (e.g., mechanical spinning disks or cloud storage tiers delivering under 7000–8000 IOPS, such as 700–800 IOPS tiers).
*   **[ROOT CAUSE: KUBERNETES GITALY DEPLOYMENT]**: Deploying Gitaly High Availability (HA) inside Kubernetes containers within Cloud Native Hybrid setups, violating explicit architectural requirements mandating that Gitaly HA remain on dedicated Virtual Machines (VMs).
*   **[ROOT CAUSE: PRAEFECT SPLIT-BRAIN & OFFERING MISMATCH]**: Configuring Praefect (Gitaly Cluster) inside single-tenant Dedicated environments (which strictly utilize **sharded Gitaly**, not Praefect), or encountering Praefect quorum loss and split-brain states in misconfigured Self-Managed environments.
*   **Blast Radius**: Total repository read/write outages, stalled CI/CD cloning steps, dropped user sessions, and potential Git object corruption.
*   **Supported Mitigation**: Provision high-performance SSD storage delivering a minimum of 7000–8000 IOPS, maintain Gitaly on dedicated VMs in Cloud Native Hybrid deployments, and enforce sharded Gitaly architecture for Dedicated single-tenant environments.

#### 2. Offering Mismatch & Impact Level Licensing Gaps

Deploying an incompatible platform offering or license SKU can lead to compliance failures, missing capability controls, or accreditation rejection during agency review.

| Offering | Operator | Infrastructure Cloud | Impact Level Target | Architecture Limits / Gaps |
| :--- | :--- | :--- | :--- | :--- |
| **GitLab.com** | GitLab SRE | Commercial AWS (Multi-Tenant) | Commercial / Low Security Baseline | Multi-tenant SaaS platform. Not a FedRAMP Moderate authorized tenant; lacks dedicated infrastructure isolation and customer-operated FIPS runner controls. |
| **Self-Managed** | Customer Operations Staff | Customer Data Center or Customer Cloud VPC | Customer ATO / Air-Gapped / DoD IL5 / IL6 / Secret | Deployed via Omnibus or Helm. Full customer administrative control. The required architecture for air-gapped, DoD IL5, IL6, or Secret data boundaries. |
| **Dedicated** | GitLab SRE (Switchboard + Amp) | Commercial AWS (Single-Tenant AWS Account) | Enterprise Commercial / SOC2 / ISO 27001 | Single-tenant isolation using sharded Gitaly (no Praefect). Deployed in commercial AWS regions; not authorized for US Federal GovCloud workloads. |
| **Dedicated for Government** | GitLab SRE | AWS GovCloud US-West (Isolated AWS Account) | FedRAMP Moderate ATO (FR2411959145) | Single-tenant AWS GovCloud instance running Ultimate tier. **Not authorized for DoD IL5, IL6, or Secret workloads today.** Requires customer self-managed FIPS runners outside tenant. Duo Agent Platform flows unauthorized. |

---

### 5. Integration and AI-Specific Security Weaknesses

#### 1. AI Context Leakage & Oversharing via External Model Routing

GitLab Duo features integrate artificial intelligence across the software development lifecycle, introducing distinct data routing behaviors based on the AI Gateway architecture.

```
====================================================================================
MANAGED AI GATEWAY PATH (Commercial Default - Unauthorized for GovCloud)
====================================================================================
[ User IDE / MR Context ] ---> [ GitLab App ] ---> [ GitLab.com AI Gateway ]
                                                          │
                                                          ▼ (External Egress)
                                           [ Multi-Tenant Vendor LLMs ]
                                           (Anthropic / Google / OpenAI)

====================================================================================
SELF-HOSTED AI GATEWAY PATH (Authorized GovCloud & Self-Managed Pattern)
====================================================================================
[ User IDE / MR Context ] ---> [ GitLab App ] ---> [ Customer In-Boundary AI Gateway ]
                                                          │
                                                          ▼ (In-Boundary Direct Routing)
                                           [ Customer Model Runtimes ]
                                           (AWS Bedrock-Gov / Azure-Gov / Local vLLM)
```

*   **Managed AI Gateway Path**: Context from source code repositories, Merge Requests, issues, and pipeline logs is routed through the central GitLab-managed AI Gateway on commercial endpoints, which forwards prompts to external third-party model providers (e.g., Anthropic Claude, Google Gemini, OpenAI).
    *   *Security Weakness*: Transmits proprietary code and CUI across external vendor endpoints outside the agency's authorization boundary. This path is **unauthorized** on Dedicated for Government.
*   **Self-Hosted AI Gateway Path**: The AI Gateway component is deployed directly within the customer's security boundary (supported on Self-Managed and Dedicated for Government), routing prompts exclusively to customer-managed model runtimes (e.g., AWS Bedrock-Gov, Azure-Gov OpenAI, or local vLLM instances).
    *   *Security Control & Architectural Distinction*: Basic AI interactions (e.g., Code Suggestions, Chat, MR Summaries) use the Self-Hosted AI Gateway path to keep data within the compliance boundary. However, **Duo Agent Platform foundational agents and multi-tool agentic workflows are explicitly unauthorized** on Dedicated for Government.

#### 2. Identity Provider (IdP) Breakage and Break-Glass Account Lockout

Authentication integration failures can result in administrative lockout or non-compliance with federal identity mandates.

*   **Administrative Boundary Split**: Infrastructure management (hypervisor, host OS, AWS account configuration) is managed exclusively by GitLab SREs via Switchboard/Amp. Application governance (users, groups, roles, permissions) is managed exclusively by agency administrators. Agency administrators have no host-level or cloud-console access.
*   **NIST SP 800-53 Control Alignments**:
    *   **AC-2 (Account Management)**: Platform administrators must enforce continuous account reviews and monitor atypical usage via abuse reports and spam logs consolidated in the Admin area.
    *   **AC-7 (Unsuccessful Logic Attempts)**: Dedicated for Government enforces automatic account lockouts after 10 failed login attempts, locking the account for 10 minutes (or until manually unlocked by an administrator).
    *   **IA-5 (Authenticator Management)**: Requires credential change mandates on first login, strict SSH key length enforcement (FIPS-compliant curves), and credentials inventory reviews.
*   **Procedural Mitigations**:
    *   Federate standard user access with the enterprise agency IdP (SAML 2.0 / OIDC) to enforce mandatory PIV/CAC hardware smart card authentication.
    *   Enable built-in **Admin Mode**, requiring administrators to re-authenticate and explicitly elevate their session prior to accessing administrative functions.
    *   Configure the primary local root account as a restricted break-glass account, secured with FIPS-compliant, phishing-resistant WebAuthn hardware tokens (2FA).

#### 3. Explicit Documentation Silence & Unsourced Architectural Gaps

To maintain audit integrity, the following architectural boundaries are explicitly designated as **SILENCE**:

*   **Silence on Slack/Teams Webhooks**: Source documentation does not confirm whether third-party notification webhooks (Slack/Teams) are authorized or compliant inside the FedRAMP boundary for Dedicated for Government.
*   **Silence on Hosted FIPS Runners**: Source context confirms that hosted FIPS runners for Dedicated for Government were designated as a future release; no operational failure data or active implementation specs exist in the current documentation.
*   **Silence on KAS Authorization**: Source context lacks documentation confirming explicit FedRAMP Provisional Authorization (PA) coverage for the GitLab Agent for Kubernetes (KAS) within Dedicated for Government.
*   **Silence on High-Impact Levels**: GitLab Dedicated for Government is explicitly **NOT** authorized for DoD IL5, IL6, or Secret workloads today. Any assertions claiming native higher-impact capabilities are unsourced.
*   **Silence on Praefect in Dedicated**: Dedicated architectures explicitly use sharded Gitaly instead of Praefect (Gitaly Cluster). Failure modes involving Praefect split-brain apply strictly to Self-Managed deployments.

---

### 6. Master Failure Mode and Security Weakness Matrix

| ID | Weakness / Failure Mode | Architectural View | Symptom | Root Cause | Blast Radius | Supported Mitigation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **FM-01** | Compliance Boundary & ATO Misinterpretation | Conceptual | Sensitive workloads (CUI/IL5) deployed on unauthorized commercial SaaS/Dedicated | Conflating CSP FedRAMP listing (FR2411959145) with agency-level ATO decision | Total regulatory non-compliance; data spillage across commercial tenant boundaries | Require explicit AO Authorization Letter and SSP naming exact offering and boundaries |
| **FM-02** | Control/Job Plane Trust Boundary Conflation | Conceptual | Arbitrary user build code executing adjacent to control plane networks | Conceptual flaw treating job execution environments as trusted control plane extensions | Lateral movement from compromised worker host into control plane DB or cloud accounts | Deploy customer-managed FIPS runners on isolated infrastructure outside tenant boundary |
| **FM-03** | Runner Token Theft & Impersonation | Logical | Rogue workers polling queue, exfiltrating code/secrets, injecting bad artifacts | Storage of unrotated, broadly scoped runner tokens in accessible logs or code repos | Pipeline execution compromise; credential exfiltration; source code exposure | Enforce fine-grained token scoping, periodic automated rotation, and zero-trust networks |
| **FM-04** | Puma Worker Exhaustion & Hard Timeouts | Logical | HTTP 502/500 gateway errors; unlogged drops in Rack middleware stack | Dynamic allocations exceeding GC rates; worker killer recycling; threads >15; >60s timeouts | Application downtime, dropped user sessions, failed API/Git operations | Scale RAM per worker, cap threads (<=14), offload >60s requests to Sidekiq |
| **FM-05** | Sidekiq / Redis Queue Bottlenecks | Logical | Growing background job backlogs; delayed MR updates and scan ingestion | Redis memory pressure; shared cache/queue instance; unpersisted queue loss on reboot | Asynchronous workflow stagnation; system latency; job loss on restart | Isolate dedicated Redis instances (Cache vs Persistent); scale RAM; bind Sidekiq queues |
| **FM-06** | Gitaly Disk IOPS Exhaustion & Unhalted Execution | Physical | High Git RPC latency; 507 Insufficient Storage; 14 Deadline Exceeded (57s) errors | Low IOPS storage (<7000 IOPS); running Gitaly HA on K8s; unhalted background `git` commands | Complete Git read/write outage; stalled CI/CD cloning; persistent 100% CPU/IOPS host load | Enforce 7000–8000 IOPS minimum SSDs; retain Gitaly HA on VMs; use sharded Gitaly |
| **FM-07** | Offering & Impact Level Licensing Mismatch | Physical | Accreditation rejection; illegal data placement in commercial cloud regions | Attempting to use SaaS/Dedicated commercial for DoD IL5/IL6/Secret requirements | Operational project halt; regulatory violation; total loss of compliance status | Mandate Self-Managed for air-gap/IL5/IL6/Secret; Dedicated for Gov for FedRAMP Moderate |
| **FM-08** | AI Context Leakage via External Model Routing | Integration & AI | Code snippets, MR context, and CUI egressing to third-party vendor LLM endpoints | Routing AI prompts through commercial GitLab-managed AI Gateway endpoints | Data exfiltration across compliance boundaries; violation of FedRAMP sovereignty | Deploy Self-Hosted AI Gateway with in-boundary model runtimes; disable Duo Agent Platform |
| **FM-09** | IdP Integration Breakage & Admin Lockout | Integration & AI | Platform-wide SSO sign-in failure; loss of CAC/PIV smart card enforcement | Expired IdP certs; bad SAML assertions; lost root break-glass credentials | Administrative lockout; user access denial; violation of NIST AC-2, AC-7, IA-5 controls | Integrate external agency IdP, enable Admin Mode, secure root via WebAuthn 2FA |