# Technical Briefing: GitLab DevSecOps Platform Architecture

## Executive Summary

This briefing document provides an architectural analysis of the GitLab DevSecOps Platform based on official technical documentation, architecture specifications, government compliance guides, and technical deep-dives. 

The GitLab DevSecOps Platform provides a single governed change path from intent to running software, consolidating source code management, continuous integration and delivery (CI/CD), continuous security testing, binary artifact registries, and operational deployment. The architecture maintains a strict separation between the **Control Plane** (application logic, policy enforcement, database, and system of record) and the **Job Plane** (untrusted worker environments executing user code).

GitLab is delivered across four distinct deployment offerings: **GitLab.com** (multi-tenant SaaS), **Self-Managed** (customer-orchestrated via Omnibus or Helm), **GitLab Dedicated** (single-tenant managed SaaS in isolated AWS accounts), and **GitLab Dedicated for Government** (single-tenant managed SaaS in AWS GovCloud US-West holding a FedRAMP Moderate Authorization). 

Architectural decisions regarding platform deployment hinge on data impact levels, operational jurisdiction, runner isolation, and artificial intelligence (AI) telemetry pathways. While commercial offerings support hosted runners and managed AI gateways connecting to third-party Large Language Model (LLM) vendors, strict regulatory environments (such as FedRAMP Moderate) require self-managed FIPS-validated runners situated outside the tenant boundary and self-hosted AI Gateways operating entirely in-boundary.

---

## Detailed Analysis of Key Themes

### 1. Conceptual Boundaries and Trust Domains: Control Plane vs. Job Plane

The platform establishes a single system of record for source repositories, merge request approvals, build evidence, and vulnerability findings. A foundational concept of the architecture is the delineation of two distinct trust domains:

*   **Control Plane:** Hosts the core application services (Rails/Puma), background job orchestration (Sidekiq/Redis), metadata state store (PostgreSQL), and Git repository interface (Gitaly). The platform operator manages availability, backups, data residency, and identity integrations inside the tenant.
*   **Job Plane:** Comprises the worker nodes (**GitLab Runners**) that clone repositories, run arbitrary user scripts, build container images, and execute security scanners. Because pipeline code is inherently untrusted, the job plane resides in a isolated execution boundary.

```
+-------------------------------------------------------------------+
|                        CONTROL PLANE                              |
|  +------------------+   +-------------------+   +--------------+  |
|  | NGINX / Workhorse|   | Application (Puma)|   |  PostgreSQL  |  |
|  +--------+---------+   +---------+---------+   +-------+------+  |
|           |                       |                     |         |
|           v                       v                     |         |
|  +------------------+   +-------------------+           |         |
|  |  Git RPC (Gitaly)|   | Job Queue (Redis) |           |         |
|  +------------------+   +---------+---------+           |         |
+-----------------------------------|-----------------------|-------+
                                    |                       |
                                    v (Job Payload / Token) | (Findings / Logs)
+-----------------------------------|-----------------------|-------+
|                                   v                       v       |
|                             JOB WORKER PLANE                      |
|                       +--------------------------+                |
|                       |  GitLab Runner (Worker)  |                |
|                       +--------------------------+                |
+-------------------------------------------------------------------+
```

#### Primary Platform Actors and Responsibilities
*   **Developer:** Produces code changes, submits Merge Requests (MRs), and reviews build feedback.
*   **Reviewer:** Validates code diffs, pipeline outputs, and security findings within a unified change record prior to approval.
*   **Security Manager:** Establishes global security scanner policies and compliance pipelines that cannot be bypassed or waived locally by project teams.
*   **Platform Operator:** Operates control plane services, oversees identity provider integration, applies system patches, and manages infrastructure backups.
*   **Job Operator:** Provisions, patches, and rotates tokens for isolated runner build machines located inside or outside the cloud tenant boundary.
*   **Authorizing Official (AO):** Evaluates platform security controls and grants an agency-specific Authority to Operate (ATO).

---

### 2. Deployment Models & Government Compliance Matrix

GitLab operates across four physical deployment models to align with varying security, compliance, and infrastructure management demands:

| Deployment Attribute | GitLab.com | Self-Managed | GitLab Dedicated (Commercial) | GitLab Dedicated for Government |
| :--- | :--- | :--- | :--- | :--- |
| **Infrastructure Operator** | GitLab Inc. | Customer (Omnibus / Helm) | GitLab (via Switchboard / Amp) | GitLab (via Switchboard / Amp) |
| **Cloud Environment** | Multi-tenant AWS | Customer Datacenter / Cloud | Customer-dedicated AWS Account | AWS GovCloud US-West (Isolated) |
| **Git Storage Engine** | Gitaly | Gitaly / Gitaly Cluster (Praefect) | Sharded Gitaly (*No Praefect*) | Sharded Gitaly (*No Praefect*) |
| **Runner Infrastructure** | Shared + Self-Managed | Customer Self-Managed | Optional Hosted + Customer | **Customer Self-Managed FIPS Outside Tenant** |
| **AI Integration Default** | Managed AI Gateway (Vendor LLMs) | Managed Gateway or Self-Hosted | Managed Gateway or Self-Hosted | **Self-Hosted AI Gateway Path Only** |
| **Compliance / Impact Level** | Commercial SaaS | Defined by Customer ATO (IL5/Air-gap path) | SOC 2, ISO 27001 | **FedRAMP Moderate ATO (FR2411959145)** |

#### Architectural Deep-Dive: GitLab Dedicated for Government
Achieving FedRAMP Moderate Authorization (listed as Authorized on the FedRAMP Marketplace under Package ID `FR2411959145`, sponsored by the General Services Administration), Dedicated for Government enforces specific architectural constraints:

1.  **Tenant Isolation:** Each customer environment is provisioned inside an isolated AWS GovCloud US-West account managed by GitLab via control applications named **Switchboard** (global multi-tenant management) and **Amp** (tenant account provisioning and environment lifecycle).
2.  **External Job Plane:** Hosted runners within the GitLab-managed tenant are not provided. Federal agencies must build, deploy, and operate their own FIPS-validated runners *outside* the tenant boundary within their own agency network or VPC.
3.  **Identity & PIV/CAC Handoff:** Authentication is delegated to the agency’s Identity Provider (IdP) via SAML 2.0 or OIDC. PIV/CAC hardware token enforcement occurs entirely at the agency IdP level prior to session assertion.
4.  **Storage Architecture:** Repository data uses **sharded Gitaly** across virtual machines rather than a Praefect-orchestrated Gitaly Cluster. Customer-managed encryption keys via AWS Key Management Service (KMS) are supported for data at rest.
5.  **Private Networking:** Optional inbound and outbound private connectivity is established using AWS PrivateLink, eliminating public internet exposure for the control plane.
6.  **Impact Boundary Limits:** Dedicated for Government is authorized for FedRAMP Moderate / CUI workloads. It is **not** authorized for DoD IL5/IL6, Secret, or air-gapped environments today; those impact levels require Self-Managed installations on customer-authorized infrastructure.

---

### 3. Core Runtime Services & Component Interaction

The underlying execution stack of the GitLab application control plane relies on specialized open-source and custom components:

```
[ Incoming Web / Git Traffic ]
              |
       +------+------+
       |             |
       v             v
   [ NGINX ]    [ GitLab Shell (SSH) ]
       |             |
       v             +---------------------------+
[ Workhorse Proxy ]                              |
       |                                         |
       +-----------------------+                 |
       |                       |                 |
       v                       v                 v
[ Puma (Rails App) ] ---> [ Sidekiq ] ---> [ Gitaly (Git RPC) ]
       |                       |                 |
       +-----------+-----------+                 |
                   |                             |
                   v                             v
           [ PostgreSQL ]                  [ Storage / Disks ]
                   ^
                   |
            [ Redis Cache ]
```

#### Component Responsibilities and Internal Mechanics

*   **NGINX:** The outer entry reverse proxy terminating TLS, routing web traffic, and enforcing outer rate limits.
*   **GitLab Workhorse:** A custom Go-based reverse proxy sitting between NGINX and Puma. Workhorse offloads long-running or high-volume traffic from the Rails application—such as Git HTTP push/pull operations, large file downloads, and CI/CD build artifact uploads directly to object storage.
*   **GitLab Shell:** Handles SSH-based Git authentication and command execution, invoking internal authorization APIs before dispatching requests to Gitaly.
*   **Puma (Rails Application Engine):** Runs the main Ruby on Rails web framework. Puma processes HTTP requests, enforces authorization, renders views, and handles REST/GraphQL API queries.
    *   *Rack Stack & Middleware:* Requests pass through Rack middleware including `Rack::Timeout` and `Rack::Attack` (rate-limiting/throttling) before reaching Rails routing.
    *   *Puma Worker Killer:* A memory management daemon that monitors memory consumption per worker process. Because Ruby web applications allocate memory faster than garbage collection reclaims it under heavy load, the Puma Worker Killer recycles individual Puma workers when memory limits are exceeded.
*   **Sidekiq:** An asynchronous background processing engine running the same Rails codebase as Puma. It executes queued, non-blocking tasks such as sending notification emails, processing webhooks, calculating repository statistics, and fanning out CI pipeline jobs.
*   **Redis:** An in-memory key-value data store utilized for three primary roles: Sidekiq job queues, application caching (e.g., memoized application settings), and session storage.
*   **PostgreSQL:** The core relational database serving as the platform's system of record for metadata, including user profiles, group permissions, merge request states, pipeline jobs, and security vulnerability records.
    *   *Connection Pooling:* To prevent performance degradation from frequent database process forking, client-side connection pooling is implemented inside Rails/Puma/Sidekiq, supplemented by **PgBouncer** in multi-node scaled topologies.
*   **Gitaly:** A dedicated Go RPC service that manages file-system level access to Git repositories via gRPC. Application nodes never access Git repository disks directly; all Git operations are encapsulated by Gitaly commands executing local Git binaries.

#### System Guardrails and Request Timeouts
To prevent worker thread starvation and application crashes:
1.  **Puma 60-Second Timeout:** Web requests hitting Puma are strictly capped at 60 seconds. Requests exceeding this threshold are killed, returning a 502/500 error to the client to preserve worker capacity for other traffic.
2.  **Gitaly 57-Second Timeout:** Gitaly operations initiated by web requests enforce an overall 57-second deadline (95% of the Puma timeout). If exceeded, Gitaly raises a `Deadline Exceeded` error.
3.  **Gitaly Internal API Loopback:** When Gitaly receives an RPC command, it issues an internal HTTP call back to the Rails API (`/api/v4/internal/allowed`) to verify user access permissions. Consequently, a single Git operation over HTTP/SSH can temporarily consume capacity across both Gitaly and Puma threads simultaneously.

---

### 4. Application Security Testing & Vulnerability Management

The platform embeds security scanning directly into the CI/CD pipeline, executing automated tests upon every code push or Merge Request.

```
       [ Vulnerability Management Cycle ]
                     
                       +--------+
                  +--->| Detect |---+
                  |    +--------+   |
                  |                 v
             +----------+      +--------+
             | Optimize |      | Triage |
             +----------+      +--------+
                  ^                 |
                  |    +--------+   |
                  +----|Remediate|<-+
                       +--------+
```

#### Native Security Capabilities & Tooling
*   **Static Application Security Testing (SAST):** Scans source code for security vulnerabilities using analyzers such as Semgrep.
*   **Dynamic Application Security Testing (DAST):** Performs runtime vulnerability testing against deployed test applications using OWASP ZAP.
*   **Software Bill of Materials (SBOM) & Dependency Scanning:** Identifies vulnerable open-source dependencies and generates supply chain inventories via analyzers like Dependency-Check.
*   **Container Scanning:** Inspects application container images for OS and package vulnerabilities prior to registry push.
*   **Secret Detection:** Scans code commits and pipeline variables for committed passwords, API tokens, and private keys.
*   **Infrastructure as Code (IaC) Scanning:** Analyzes Terraform, Ansible, CloudFormation, and Kubernetes manifests for misconfigurations.
*   **Fuzz Testing:** Supports both API fuzzing and coverage-guided fuzz testing to detect edge-case stability and memory flaws.

#### Software Supply Chain Security Standards
In accordance with academic and government frameworks (such as NIST SP 800-204D for DevSecOps supply chain security):
*   Pipelines output standardized SAST/DAST/SBOM reports directly to the Merge Request interface.
*   Security policies enforce approval gates, preventing code from merging if high-severity vulnerabilities or unapproved license types are introduced.
*   SLSA (Supply-chain Levels for Software Artifacts) scorecards and Kubernetes admission controllers (e.g., Kyverno, OPA Gatekeeper) consume pipeline build metadata to block non-compliant container builds at the deployment gateway.

---

### 5. AI Architecture & Integration Surface (GitLab Duo)

GitLab embeds generative AI capabilities across the software development lifecycle under the **GitLab Duo** architecture, utilizing two distinct operational pathways:

```
+---------------------------------------------------------------------------------+
| PATHWAY 1: MANAGED AI GATEWAY (Commercial SaaS / Standard Self-Managed)        |
|                                                                                 |
|  [ IDE / UI ] ---> [ GitLab App ] ---> [ Managed AI Gateway ] ---> [ Third-Party|
|                                                                    LLM Vendors ]|
+---------------------------------------------------------------------------------+

+---------------------------------------------------------------------------------+
| PATHWAY 2: SELF-HOSTED AI GATEWAY (Dedicated for Government / Air-Gap)          |
|                                                                                 |
|  [ IDE / UI ] ---> [ GitLab App ] ---> [ In-Boundary AI Gateway ] ---> [ Self-Hosted
|                                                                         Models ]|
+---------------------------------------------------------------------------------+
```

#### Dual AI Data Paths
1.  **GitLab-Managed AI Gateway (Cloud Path):** Code prompts and context (file diffs, issue descriptions) are transmitted through a GitLab-hosted AI Gateway to third-party vendor LLM endpoints (including Anthropic Claude, Google Gemini, Codestral, and OpenAI). 
2.  **Self-Hosted AI Gateway (In-Boundary Path):** Intended for air-gapped, Self-Managed, and Dedicated for Government environments. Prompts stay entirely within the customer's security boundary, connecting to customer-operated model endpoints (e.g., vLLM, AWS Bedrock GovCloud, or Azure Government OpenAI).

#### Governance and Government Authorization Restrictions
*   **Data Oversharing Control:** Context indexing is restricted by project access control policies. Prompts are not used by third-party model providers for model re-training.
*   **Dedicated for Government Silence/Restriction:** The standard GitLab Duo Agent Platform flows and external cloud-hosted agent orchestrations are **not authorized** under the FedRAMP Moderate baseline for Dedicated for Government. Offline licenses combined with self-hosted AI Gateways must be utilized to maintain compliance boundaries.

---

### 6. Architectural Failure Modes and Security Risks

| View | Failure Mode | First Visible Tell / Symptom | Root Cause / Mechanism | Architectural Control / Mitigation |
| :--- | :--- | :--- | :--- | :--- |
| **Conceptual** | ATO Scope Confusion | AO rejects system accreditation during audit. | Treating GitLab's FedRAMP Moderate ATO as a turnkey ATO for the customer's overall application. | Shared Responsibility Model mapping; AO must issue an agency-specific ATO covering agency-managed runners and IdP integrations. |
| **Logical** | Runner Token Theft | Unauthorized jobs executing outside expected project scopes; untrusted worker registration. | Stolen or unrotated long-lived runner registration tokens used to register rogue workers. | Token expiration policies; frequent token rotation; scoping runner tokens strictly to specific project/group IDs. |
| **Physical** | Gitaly Disk Exhaustion | `500 Internal Server Error` on Git RPCs; `Deadline Exceeded` in logs. | High IOPS/storage load on Gitaly nodes causing thread starvation or disk fill. | Provision high-IOPS storage (SSD 7000+ IOPS); separate Gitaly off Kubernetes onto dedicated VMs; monitor storage weights. |
| **Physical** | Puma Worker Exhaustion | Intermittent `502 Bad Gateway` errors served by NGINX / Workhorse. | Long-running web requests holding Puma threads until killed by Puma Worker Killer. | Keep Puma timeout at 60s; offload file/git operations to Workhorse; scale Puma memory/workers; offload tasks to Sidekiq. |
| **Integration**| AI Context Oversharing | Sensitive source code or secret data leaving the agency boundary. | Routing AI prompts through the managed cloud AI Gateway instead of an in-boundary self-hosted gateway. | Enforce Self-Hosted AI Gateway configuration; disable external agent integrations on Dedicated for Government. |

---

## Important Quotes with Context

### Quote 1: On Application Runtime & Memory Recycling

> *"Puma worker killer basically detects when each puma worker is consuming memory beyond the limits then it kills that worker and then basically the worker will restart on its own... Garbage collection happens slower than requests come in... Memory allocation increases over time. The reason why we want to kill puma workers before they consume too much memory is because we want the memory consumption to be relatively within the known range."*
> — **GitLab Engineering Architecture 101**

*   **Architectural Context:** This quote explains the necessity of the `Puma Worker Killer` daemon in the runtime environment. Ruby on Rails web applications accumulate uncollected memory objects during high-frequency endpoint requests. Rather than allowing memory leaks to trigger OS out-of-memory (OOM) faults or degrade system-wide performance, Puma periodically recycles worker processes. If worker recycling occurs too frequently (e.g., every 5 seconds instead of every 20–30 seconds), it signals inadequate per-worker memory allocation and leads to dropped client connections (502 errors).

---

### Quote 2: On Thread Starvation and Request Guardrails

> *"If you have two or three requests that take let's say two minutes each and you have four of those and you only have four workers that are serving requests essentially you have encountered worker exhaustion... The reason why we have a 60 second timeout... It seems to be a good middle ground between allowing the web server to run... Versus not having so many extremely long requests that you end up with a situation where there's a high chance that all of the workers will be busy at the same time."*
> — **GitLab Engineering Architecture 101**

*   **Architectural Context:** Highlights the rationale behind enforcing a strict 60-second execution cap on web requests entering the application server. Without this limit, long-running transactions (such as deep Git diff calculations or large file parsing) would consume all available Puma threads, resulting in total denial of service for incoming HTTP traffic. Long-running tasks must be designed asynchronously to run via Sidekiq queues or handled via proxy offloading in Workhorse.

---

### Quote 3: On Gitaly RPC Authorization Loopback

> *"Every time a gRPC request is made, Gitaly actually sends out a request back to Rails to an internal API (`/api/v4/internal/allowed`)... It does this to actually check that the person or the user that is making that request actually has the permissions to view that repository... In some cases Gitaly requests can actually occupy up to two Puma threads at the same time."*
> — **GitLab Engineering Architecture 101**

*   **Architectural Context:** Demonstrates the internal coupled dependency between the Git RPC store (Gitaly) and the control plane application (Rails/Puma). Because Gitaly does not maintain its own access control database, it relies on real-time permission checks back to Rails over an internal loopback API. Systems architects sizing single-node or reference architectures must account for this dual-thread consumption during concurrent user operations.

---

### Quote 4: On Government Security Boundaries and Runner Isolation

> *"Dedicated for Government customers must build and manage their own self-managed runners outside of their tenant... Deploy runners in isolated, hardened environments outside of the Dedicated boundary. Manage access to runner authentication tokens securely, following zero trust principles, and rotate them regularly."*
> — **GitLab Dedicated for Government Secure Configuration Guide**

*   **Architectural Context:** Defines the physical boundary line for FedRAMP Moderate compliance under `FR2411959145`. While the control plane SaaS is hosted and managed by GitLab in AWS GovCloud, the job execution domain is explicitly excluded from the tenant managed boundary. Federal agencies bear full operational responsibility for provisioning, hardening (FIPS 140 compliance), and maintaining the build infrastructure executing pipeline scripts.

---

### Quote 5: On Toolchain Consolidation & Zero Trust Security

> *"Toolchain management continues to be a significant challenge for DevSecOps teams... 63% reported using six or more tools... This proliferation of tools results in unnecessary expenditure and introduces complexities and vulnerabilities that increase the risk of cyber attacks. GitLab Dedicated for Government unites DevSecOps teams on a single platform with a unified workflow... Supporting zero trust architecture implementation by centralizing access control."*
> — **GitLab Dedicated for Government FedRAMP Authorization Announcement**

*   **Architectural Context:** Articulates the strategic rationale for adopting a single DevSecOps platform versus integrating disparate point solutions. Consolidating source control, CI/CD, SAST/DAST, and container registries reduces the attack surface associated with multi-vendor token handoffs, fragmented audit logs, and inconsistent access control policies across the software supply chain.

---

## Actionable Insights & Implementation Decision Rules

### Architectural Decision Rules

1.  **Data Categorization & Impact Level Selection:**
    *   *Rule:* If target workloads contain Controlled Unclassified Information (CUI) requiring FedRAMP Moderate compliance, **select GitLab Dedicated for Government**.
    *   *Rule:* If target workloads require DoD IL5/IL6, Secret, or complete physical air-gap isolation, **do not select GitLab Dedicated for Government**; choose **Self-Managed** installed on customer-authorized cloud or on-premise infrastructure.
    *   *Rule:* If standard commercial compliance (SOC 2, ISO 27001) with single-tenant isolation is required, **select GitLab Dedicated (Commercial)**.

2.  **Git Storage Topology Selection:**
    *   *Rule:* If deploying **GitLab Dedicated** or **Dedicated for Government**, do not architect for Praefect / Gitaly Cluster; the managed service strictly utilizes **sharded Gitaly**.
    *   *Rule:* If deploying a high-availability **Self-Managed** environment using Kubernetes (Helm), maintain Gitaly and Gitaly Cluster nodes on dedicated Virtual Machines or physical servers outside the Kubernetes cluster as required by reference architectures.

3.  **Runner Execution Plane Design:**
    *   *Rule:* For **Dedicated for Government**, provision customer-managed FIPS-validated runner images inside the agency's external VPC. Implement automated token rotation and restrict runner network egress.
    *   *Rule:* Isolate runner execution hosts from the control plane network so that compromised pipeline jobs cannot access internal platform administrative interfaces.

4.  **AI Deployment Governance (GitLab Duo):**
    *   *Rule:* For FedRAMP or strict data-sovereignty deployments, **disable the default managed AI Gateway route**. Deploy the **Self-Hosted AI Gateway** pointing to approved, in-boundary LLM endpoints (e.g., AWS Bedrock GovCloud) to prevent prompt telemetry exfiltration.

---

### Implementation & Hardening Checklist for Administrators

```
+-----------------------------------------------------------------------------------+
|                            ADMINISTRATOR CHECKLIST                                |
+-----------------------------------------------------------------------------------+
| [ ] Integrate Agency Identity Provider (IdP)                                      |
|     - Configure SAML 2.0 or OIDC with mandatory PIV/CAC hardware enforcement.    |
|                                                                                   |
| [ ] Enforce Administrative Session Controls                                       |
|     - Enable 'Admin Mode' requiring re-authentication for elevated privileges.    |
|     - Set session inactivity timeouts and enforce 2FA/WebAuthn for all admins.    |
|                                                                                   |
| [ ] Hardened External Runner Provisioning                                         |
|     - Build self-managed runner infrastructure using FIPS 140-validated binaries.   |
|     - Restrict runner registration tokens and implement automated token rotation.  |
|                                                                                   |
| [ ] Configure In-Boundary AI Telemetry                                            |
|     - Deploy Self-Hosted AI Gateway for Duo features.                            |
|     - Verify that external cloud agent orchestrations are toggled OFF.            |
|                                                                                   |
| [ ] Enforce Supply Chain Security Gates                                           |
|     - Mandate SAST, DAST, Dependency Scanning, and Secret Detection in CI/CD.    |
|     - Configure Merge Request approval policies blocking unmitigated vulnerabilities.|
+-----------------------------------------------------------------------------------+
```