# Physical Architecture View: GitLab DevSecOps Platform Architecture

---

### 1. Executive Physical Architecture Overview & System Boundary

#### 1.1 Platform Scope and High-Level Architecture

* **Platform Scope:** The GitLab Development, Security, and Operations (DevSecOps) Platform provides a unified, governed software change path across the full software development lifecycle (SDLC)—spanning planning, source code management (SCM), continuous integration and continuous deployment (CI/CD), application security testing, container/package artifact registries, and environment deployment. The physical implementation of the platform is instantiated across four distinct deployment offerings:
  * Multi-Tenant Software as a Service (SaaS) (`GitLab.com`)
  * Self-Managed (customer-deployed on private infrastructure or commercial clouds)
  * Single-Tenant Managed SaaS (`GitLab Dedicated`)
  * Federal Single-Tenant Managed SaaS (`GitLab Dedicated for Government`)
* **Control Plane vs. Job Execution Plane Split:** The physical architecture enforces an explicit structural separation between two primary operational domains:
  * **Control Plane:** Responsible for user authentication, request routing, state management, relational metadata persistence, Git repository operations, and pipeline orchestration. Bounded strictly by Puma's default 60-second request timeout, synchronous Hypertext Transfer Protocol (HTTP) and Secure Shell (SSH) user interactions are decoupled from heavy workloads.
  * **Job Execution Plane:** Responsible for compiling code, executing customer pipeline scripts, running static and dynamic application security scanners, and processing untrusted customer workloads. Operates independently from control plane application servers to prevent resource starvation.
* **System Boundary Definition:**
  * **Inside Primary Tenant Boundary:** Front-end reverse proxies (NGINX, GitLab Workhorse), SSH gateways (GitLab Shell), primary web application servers (GitLab Rails / Puma), background job queues (Sidekiq), relational databases (PostgreSQL), in-memory cache/session stores (Redis), source code storage services (Gitaly), and artifact container/package registries.
  * **Outside Primary Tenant Boundary:** External agency Identity Providers (IdPs using Security Assertion Markup Language [SAML] 2.0 / OpenID Connect [OIDC] / Personal Identity Verification [PIV] / Common Access Card [CAC]), customer-managed Kubernetes clusters, customer-managed pipeline execution infrastructure (GitLab Runners deployed on-premises or in customer Virtual Private Clouds [VPCs]), external Large Language Model (LLM) endpoints (when using self-hosted or third-party artificial intelligence [AI] gateways), and government compliance reporting portals (FedRAMP Marketplace / Continuous Monitoring [ConMon]).

#### 1.2 Dual Administrative Layering

The platform physical architecture implements two distinct administrative operational layers to maintain separation of duties, operational safety, and audit boundaries:

| Operational Layer | Operator / Authority | Primary Responsibilities | Access Scope & Account Management |
| :--- | :--- | :--- | :--- |
| **Infrastructure Management Layer** | Managed by GitLab Site Reliability Engineers (SREs) / Dedicated Engineers (for `GitLab.com`, `GitLab Dedicated`, and `GitLab Dedicated for Government`) OR Customer Platform Operators (for `Self-Managed`). | Provisioning cloud infrastructure, cloud account management (Amazon Web Services [AWS] / AWS GovCloud), underlying Virtual Machine (VM) / Operating System (OS) maintenance, network routing, storage volume scaling, database backups, disaster recovery (GitLab Geo), infrastructure-level Key Management Service (KMS) encryption keys, and system-level OS patching. | Restricted strictly to infrastructure management control planes (e.g., Switchboard and Amp for Dedicated offerings), cloud provider Identity and Access Management (IAM), and hypervisors. Operators at this layer have zero application-level administrative visibility into customer source code, database rows, or project memberships. |
| **Application Administration Layer** | Controlled strictly by Customer Top-Level Administrators (e.g., Agency Administrators or Enterprise Platform Owners). | User provisioning/deprovisioning, top-level group/project hierarchy creation, role-based access control (RBAC), security policy enforcement, branch protection rules, SAML/OIDC/PIV/CAC identity integration, credentials inventory auditing, and pipeline job token security rules. | Managed exclusively via the GitLab Admin Area User Interface (UI) and Representational State Transfer (REST) / GraphQL Application Programming Interfaces (APIs). Access is granted via integrated SAML/OIDC Single Sign-On (SSO) with administrative elevation controls (e.g., Admin Mode requiring explicit re-authentication). Initial root accounts are converted to break-glass accounts post-configuration. |

---

### 2. Logical-to-Physical Component Mappings

#### 2.1 Control Plane Services and Service Realizations

Logical control plane capabilities map directly to physical service binaries, specific execution environments, and operational boundaries.

| Logical Component | Physical Realization / Binary | Execution Environment / Process Details | Licensing Tier Requirement | Source Reference |
| :--- | :--- | :--- | :--- | :--- |
| **HTTP Front Door & Proxy** | NGINX + GitLab Workhorse | Operates as a reverse proxy pair. NGINX terminates Transport Layer Security (TLS); Workhorse (a specialized Go binary) intercepts long-running HTTP requests, Git-over-HTTP operations, and direct object storage artifact uploads to bypass application server thread saturation. | Free / Premium / Ultimate (Bundled) | *GitLab Architecture 101 Video*, *GitLab Core Architecture Docs* |
| **SSH Front Door** | GitLab Shell | Go-based service handling Git-over-SSH connections. Authenticates SSH keys against the internal Rails API (`/api/v4/internal/allowed`) and proxies Git Remote Procedure Call (RPC) traffic directly to Gitaly. Operates via standard OpenSSH daemon or native Go SSHD implementation. | Free / Premium / Ultimate (Bundled) | *GitLab Architecture 101 Video* |
| **Application Core** | GitLab Rails / Puma | Web application server executing Ruby on Rails on top of the Puma rack server. Processes business logic, UI rendering, REST/GraphQL APIs, and security authorization checks. Bounded by a 60-second request timeout; worker memory is recycled via `puma_worker_killer` upon reaching defined RAM thresholds. | Free / Premium / Ultimate | *GitLab Architecture 101 Video* |
| **Job Queue & Asynchronous Tasks** | Sidekiq | Multithreaded Ruby background processing service. Pulls asynchronous job payloads from Redis queues to process background tasks including mail delivery, repository imports, pipeline job fan-out, webhooks, and security scan ingestion. | Free / Premium / Ultimate (Bundled) | *GitLab Architecture 101 Video* |
| **Kubernetes Cluster Integration** | GitLab Agent for Kubernetes (KAS) | Go service providing secure, inbound-only communication from external Kubernetes clusters back to the GitLab control plane for GitOps deployments and real-time cluster monitoring. | Free / Premium / Ultimate (Bundled) | *GitLab Agent for Kubernetes Docs* |

#### 2.2 Core Data Stores and Storage Persistence Architecture

##### PostgreSQL (System of Record Database)
* **Data Type Stored:** User accounts, project/group metadata, merge request discussions, pipeline definitions, security scan findings, issue boards, and access control mappings. Database name defaults to `gitlabhq_production`.
* **Physical Service:** PostgreSQL relational database instance.
* **High-Availability Configuration:** Managed PostgreSQL instances (e.g., AWS Relational Database Service [RDS] / Aurora) or clustered PostgreSQL nodes. For Linux package / Omnibus self-managed deployments, connection pooling is managed via `pg_bouncer` to prevent process-forking overhead and connection exhaustion during high concurrency.
* **Deployment Constraints:** Strict relational schema integrity enforced by Rails database migrations.

##### Redis (Session, Cache, and Queue Store)
* **Data Type Stored:** User session states, web application cache, feature flag states, rate-limiting metadata (`rack-attack`), and Sidekiq background job execution queues.
* **Physical Service:** Redis in-memory key-value data structure store.
* **High-Availability Configuration:** Single or multi-node Redis cluster configurations. Highly performant as data resides entirely in Random Access Memory (RAM); periodically persists snapshots to disk to withstand service restarts.
* **Deployment Constraints:** Scaled primarily based on available host RAM. In enterprise high-availability deployment topologies, Redis Cache and Redis Persistent queues can be split into separate dedicated physical instances.

##### Gitaly / Git RPC Store (Bare Repository Storage)
* **Data Type Stored:** Bare Git repositories (source code history, branches, tags, and commit objects).
* **Physical Service:** Gitaly service (a Go-based RPC service executing native Git commands on disk over gRPC).
* **Internal API Callback Loop & Thread Protection:** When Gitaly processes Git RPC operations, it executes an internal authorization callback to the Rails application via `/api/v4/internal/allowed` to verify user permissions. In constrained single-node deployments, this callback loop consumes an additional Puma worker thread per Git operation. To prevent thread exhaustion, Puma timeouts are enforced, and long-running Git RPCs are strictly isolated to Gitaly.
* **High-Availability Configuration:**
  * **Self-Managed High Availability:** Deploys **Gitaly Cluster** utilizing **Praefect** as a high-availability gRPC proxy and router with strong consistency logging across virtual storage nodes.
  * **GitLab Dedicated & Dedicated for Government:** Implements a **Sharded Gitaly** architecture on dedicated virtual machines (**without Praefect or Gitaly Cluster**). Repository storage weights are managed automatically across isolated storage shards.
* **Deployment Constraints:** Requires high Disk Input/Output Operations Per Second (IOPS)—recommended Solid State Drive (SSD) or Non-Volatile Memory Express (NVMe) performance (~7,000–8,000 IOPS baseline). In Cloud Native Hybrid architectures, Gitaly **must remain hosted on Virtual Machines** and cannot be deployed inside Kubernetes containers.

##### Object Storage / AWS S3 (Unstructured Blob Storage)
* **Data Type Stored:** CI/CD build artifacts, Large File Storage (LFS) objects, Container Registry images, Package Registry binaries, raw pipeline logs, and database export backups.
* **Physical Service:** AWS Simple Storage Service (S3) buckets (or S3-compatible API object stores).
* **High-Availability Configuration:** Native cloud-provider storage redundancy (e.g., multi-Availability Zone S3 bucket replication).
* **Deployment Constraints:** GitLab Workhorse handles direct-to-S3 offloading for uploads and downloads, bypassing Puma memory allocation entirely. Encrypted at rest using Server-Side Encryption (SSE-S3) or Customer-Managed KMS keys.

#### 2.3 Job Execution Plane and On-Premises Connectors

The Job Execution Plane is physically realized by the **GitLab Runner** binary, a lightweight, Go-based application deployed independently of the control plane.

```
+-------------------------------------------------------------------------+
|                          CONTROL PLANE TENANT                           |
|  [NGINX / Workhorse] <---> [GitLab Rails / Puma] <---> [Gitaly / S3]   |
+-------------------------------------------------------------------------+
                                     ^
                                     | (Inbound HTTPS API Polling over TLS 1.2/1.3)
                                     v
+-------------------------------------------------------------------------+
|                          JOB EXECUTION PLANE                            |
|        [GitLab Runner Binary / Customer Execution Environment]          |
|   |--> Authenticates via Scoped Runner Token                            |
|   |--> Clones Repository via Short-Lived JSON Web Token (JWT)           |
|   |--> Executes Pipeline Scripts & Security Scanners inside Isolation   |
|   |--> Posts Artifacts & Scan Findings back to Control Plane API        |
+-------------------------------------------------------------------------+
```

* **Runner Authentication & Execution Flow:**
  1. Runners authenticate to the GitLab control plane using scoped **Runner Authentication Tokens**.
  2. The runner polls the control plane REST API over HTTPS (Port 443) for pending CI/CD jobs.
  3. Upon receiving a job payload, the runner uses a short-lived, job-scoped JSON Web Token (JWT) to clone the bare Git repository from Gitaly via Workhorse.
  4. The runner executes build steps inside designated isolation environments (e.g., Docker containers, Kubernetes pods, or shell instances).
  5. Scanners (Static Application Security Testing [SAST], Dynamic Application Security Testing [DAST], Container Scanning, Dependency Scanning) output findings and build artifacts, which the runner posts back to the Control Plane API and S3 Object Storage via Workhorse.
* **Deployment Models:**
  * **Hosted Runners:** Available natively on `GitLab.com` and offered as an optional managed add-on for commercial `GitLab Dedicated` (hosted in a separate GitLab-managed AWS account connected via AWS PrivateLink or public endpoints).
  * **Customer-Managed / On-Premises Runners:** Mandatory for `Self-Managed` and `GitLab Dedicated for Government`. Customers deploy, patch, and maintain runner fleets inside their own network boundaries.

> [!NOTE]
> The Job Execution Plane operates as an isolated trust domain entirely separate from the Control Plane. Untrusted pipeline code is executed exclusively within the runner environment. If a runner token or runner host is compromised, the breach is isolated to that worker's execution domain and does not grant administrative access to the primary control plane, internal database, or underlying cloud infrastructure.

---

### 3. Deployment Offerings & Physical Environment Comparison

#### 3.1 Multi-Tenant SaaS (GitLab.com) and Self-Managed

##### Multi-Tenant SaaS (GitLab.com)
`GitLab.com` is hosted on commercial AWS multi-tenant infrastructure managed entirely by GitLab. All customers share the underlying control plane application stack, with logical data isolation enforced at the application tier via database scoping and namespace pathing. Shared runner fleets process jobs across multi-tenant worker pools. It is unsuitable for workloads requiring single-tenant physical isolation, custom cloud encryption keys, or FedRAMP Moderate compliance.

##### Self-Managed
Self-Managed instances are deployed by the customer onto customer-authorized cloud infrastructure (AWS, Google Cloud Platform [GCP], Microsoft Azure) or physical on-premises data centers using the Linux Package (Omnibus) or Kubernetes Helm charts.
* **Cloud Native Hybrid Architecture Rule:** For high-availability enterprise scale, GitLab mandates a hybrid deployment topology: stateless application components (GitLab Rails/Puma, Sidekiq, Workhorse) run inside a Kubernetes cluster, while stateful data stores—specifically **Gitaly**—**must be hosted on dedicated Virtual Machines** or bare-metal OS installs. Gitaly High Availability (via Praefect) is not supported running natively inside Kubernetes containers.

#### 3.2 Single-Tenant Managed Infrastructure (GitLab Dedicated)

`GitLab Dedicated` is a fully managed, single-tenant SaaS offering hosted on commercial AWS infrastructure.

```
+-------------------------------------------------------------------+
|                  GitLab Management Domain                         |
|  [Switchboard API] <---> [Amp Orchestration Engine]               |
+-------------------------------------------------------------------+
                                 | (Provisions & Operates)
                                 v
+-------------------------------------------------------------------+
|               Isolated Customer AWS Cloud Account                 |
|  +-------------------------------------------------------------+  |
|  | Single Customer Virtual Private Cloud (VPC)                 |  |
|  |  [Puma / Sidekiq] <---> [Sharded Gitaly VMs]               |  |
|  |  [PostgreSQL]     <---> [Redis] <---> [AWS S3 Buckets]    |  |
|  +-------------------------------------------------------------+  |
|            ^                                    ^                 |
|            | (AWS PrivateLink)                  |                 |
+------------|------------------------------------|-----------------+
             |                                    |
+--------------------------+       +--------------------------------+
| Customer Corporate VPC   |       | GitLab-Managed AWS Account     |
| [Self-Managed Runners]   |       | [Optional Hosted Runners]      |
+--------------------------+       +--------------------------------+
```

* **Tenant Isolation:** Every customer receives a completely dedicated, isolated AWS account and VPC with unique resource quotas and zero co-mingling of data or computing resources with other tenants.
* **Control Plane Orchestration:** Automated provisioning, configuration, zero-downtime maintenance, and platform upgrades are driven by GitLab’s internal operational management platforms: **Switchboard** (global tenant configuration management) and **Amp** (tenant-level role, policy, and infrastructure provisioning engine).
* **Storage Topology:** Implements a **Sharded Gitaly** setup across dedicated virtual machines (**not** Gitaly Cluster with Praefect), avoiding Praefect cluster complexity while maintaining storage isolation. Disaster recovery is provided via a GitLab **Geo** secondary site in an active-passive configuration.
* **Connectivity & Execution:** Supports optional inbound and outbound **AWS PrivateLink** connections for private networking to customer enterprise VPCs. Pipeline execution can use optional GitLab-hosted runners in an isolated AWS account or customer-managed runners.

#### 3.3 Federal / Public Sector Managed Infrastructure (GitLab Dedicated for Government)

`GitLab Dedicated for Government` is an isolated, federal-grade single-tenant managed SaaS built specifically for U.S. government agencies and defense contractors.

* **Infrastructure & Region:** Deployed exclusively inside **AWS GovCloud (US-West)**. Physical and logical access is restricted strictly to U.S. citizens acting as GitLab Dedicated SRE operations personnel.
* **Tenant Isolation & ATO:** Operates under a **FedRAMP Moderate Authority to Operate (ATO)** (FedRAMP Marketplace ID: `FR2411959145`, sponsored by the General Services Administration [GSA]). Requires the **Ultimate** licensing tier. Each customer environment is isolated within its own dedicated AWS GovCloud account.
* **Runner Boundary:** GitLab **does not provide hosted runners** within the `Dedicated for Government` tenant boundary. Customers **must deploy and manage their own self-managed runners** outside the tenant boundary within their own agency network or VPC. Runners must be built using official **Federal Information Processing Standards (FIPS)-compliant container images** published by GitLab.
* **Identity & Authentication:** Direct local password login is restricted for standard users. Authentications must route through an integrated agency Identity Provider (IdP) via SAML 2.0 / OIDC, enabling mandatory **PIV/CAC smart card authentication** and hardware-based Multi-Factor Authentication (MFA).

> [!NOTE]
> **CSP ATO Scope vs. Agency ATO Responsibility:**
> A FedRAMP Moderate Cloud Service Provider (CSP) authorization at the platform level (`FR2411959145`) covers only the infrastructure and control plane services within the GitLab-operated AWS GovCloud tenant boundary. Because customer-managed FIPS runners and agency Identity Providers operate *outside* the CSP tenant boundary, agency platform security teams must issue an Agency-Specific ATO accepting residual risks across the complete hybrid integration boundary.

#### 3.4 Cross-Offering Physical Architecture Matrix

| Offering | Infrastructure Operator | Host Cloud / Region | Data Residency | Git Storage Topology | Runner Execution Location | Impact Level / Security ATO |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Multi-Tenant SaaS (`GitLab.com`)** | GitLab | Commercial AWS Multi-Tenant | Shared Commercial AWS Storage | Multi-Tenant Gitaly Shards | Shared SaaS Runners or Customer-Managed | Commercial SOC 2 Type II / ISO 27001 (Not FedRAMP Moderate) |
| **Self-Managed** | Customer Platform Team | Customer-Selected (Cloud or On-Premises) | Customer Data Center / Customer Account | Gitaly / Gitaly Cluster (Praefect HA) | Customer-Managed Infrastructure | Customer Agency ATO (Path for DoD IL5 / Air-Gapped) |
| **Single-Tenant Managed SaaS (`GitLab Dedicated`)** | GitLab (Switchboard & Amp) | Commercial AWS (Isolated Customer Account) | Customer-Dedicated AWS Cloud Account | Sharded Gitaly (Dedicated VMs, No Praefect) | Optional GitLab-Hosted Runners or Customer-Managed | Commercial SOC 2 Type II / ISO 27001 |
| **Managed Government SaaS (`Dedicated for Government`)** | GitLab (U.S. Citizen SRE Personnel) | AWS GovCloud US-West (Isolated Account) | Dedicated AWS GovCloud US-West Account | Sharded Gitaly (Dedicated VMs, No Praefect) | **Customer Self-Managed Outside Tenant Boundary (FIPS)** | **FedRAMP Moderate ATO (ID: FR2411959145)** |

---

### 4. Government & Security Cloud Impact Levels (GCC, GCC High, DoD, Secret)

#### 4.1 FedRAMP Moderate & AWS GovCloud Baseline

`GitLab Dedicated for Government` establishes its physical security baseline on AWS GovCloud US-West under a FedRAMP Moderate ATO. Cryptographic integrity is maintained via FIPS 140-2 / 140-3 validated cryptographic modules across data-at-rest encryption (AWS KMS using customer-supplied keys or AWS-managed keys) and data-in-transit TLS pipelines. System access follows National Institute of Standards and Technology (NIST) Special Publication (SP) 800-53 Rev. 5 controls, enforcing agency IdP routing for CAC/PIV credentialing, inactive session lockouts, and strict administrative session elevation.

#### 4.2 Impact Level Analysis & Explicit Cloud Silence Notes

Federal authorizations are specific to defined infrastructure environments and operational boundaries. The table below details platform availability across federal impact levels and highlights explicit documentation gap mappings:

##### Government Cloud / Impact Level Availability & Silence Mapping

| Cloud / Impact Level Target | Offering Availability Status | Physical Deployment Path | Silence / Gap Analysis Note |
| :--- | :--- | :--- | :--- |
| **FedRAMP Moderate (Civilian / CUI)** | **Available** | `GitLab Dedicated for Government` | Fully authorized under FedRAMP Marketplace ID `FR2411959145` (AWS GovCloud US-West baseline). |
| **Microsoft GCC / GCC High** | **Not Applicable as Managed SaaS** | `Self-Managed` (Deployed in Azure Government) | GitLab Dedicated is engineered natively on AWS GovCloud, not Azure Government. Azure-hosted federal workloads require customer-deployed `Self-Managed` instances. |
| **DoD Impact Level 4 / 5 (IL4 / IL5)** | **Unavailable as Managed SaaS** | `Self-Managed` | `GitLab Dedicated for Government` is **strictly FedRAMP Moderate today**. Department of Defense (DoD) IL5 Controlled Unclassified Information (CUI) environments require customer-deployed `Self-Managed` instances on IL5-authorized cloud infrastructure. |
| **DoD Impact Level 6 (IL6 / Secret / Top Secret)** | **Unavailable as Managed SaaS** | `Self-Managed` | Managed SaaS offerings do not exist in classified cloud enclaves. Customers must deploy `Self-Managed` binaries via Omnibus Linux packages or Helm charts into air-gapped classified cloud networks. |
| **Air-Gapped / Disconnected Networks** | **Unavailable as Managed SaaS** | `Self-Managed` (Offline License) | Managed SaaS offerings require continuous monitoring (ConMon) connected to FedRAMP/GSA endpoints. Air-gapped environments require `Self-Managed` deployments with offline license activation keys. |

---

### 5. Integration Surface, Hybrid Networking, & AI Physical Data Paths

#### 5.1 Hybrid Networking, Identity, and On-Premises Connectors

External software systems, developers, and build infrastructure integrate with the platform control plane through defined network protocols and authentication standards:

| Integration / Connector | Directionality | Protocol / Mechanism | Authentication Model | Government Cloud Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Agency Identity Provider (IdP)** | Inbound | SAML 2.0 / OIDC over HTTPS | Single Sign-On (SSO) / PIV/CAC Smart Cards | Mandatory for `Dedicated for Government`. PIV/CAC smart card authentication is processed through the agency IdP, not a native GitLab PIV stack. |
| **AWS PrivateLink** | Bi-directional | AWS PrivateLink VPC Endpoints | AWS IAM / Private IP Routing | Fully supported on `GitLab Dedicated`. Enables secure private routing between agency corporate VPCs and the tenant VPC without internet exposure. |
| **GitLab Runner** | Bi-directional | HTTPS REST API Polling (Port 443) | Scoped Runner Authentication Tokens (JWT) | `Dedicated for Government` requires customer-hosted FIPS runners deployed **outside** the FedRAMP tenant boundary. |
| **Kubernetes Agent (KAS)** | Bi-directional | gRPC over HTTPS (Inbound connection from cluster) | Agent Secret Tokens | Connects customer Kubernetes clusters back to GitLab. Documentation is silent regarding KAS Provisional Authorization (PA) status on `Dedicated for Government`. |
| **External Webhooks (Slack/Teams)** | Outbound | HTTPS Webhook Callbacks | Webhook Secret Tokens | **Documentation Silence:** Official documentation does not confirm whether third-party notification webhooks (e.g., Slack / Microsoft Teams) fall within the FedRAMP Moderate boundary. |

#### 5.2 AI Gateway Physical Deployment and Data Pathing

GitLab Duo generative AI features are physically instantiated through two distinct deployment topologies:

```
+-----------------------------------------------------------------------------------+
| PATH 1: GITLAB-MANAGED AI GATEWAY (Commercial SaaS & Default Self-Managed)        |
|                                                                                   |
| [GitLab Control Plane] ---> [GitLab.com AI Gateway] ---> [Commercial Vendor LLMs] |
|                                                           (Claude, Gemini, etc.)  |
+-----------------------------------------------------------------------------------+

+-----------------------------------------------------------------------------------+
| PATH 2: SELF-HOSTED AI GATEWAY (Self-Managed & Dedicated for Government Path)     |
|                                                                                   |
| [GitLab Control Plane] ---> [Customer-Hosted AI Gateway] ---> [Local/Gov Cloud LLMs]|
|                                                               (vLLM, Bedrock Gov) |
+-----------------------------------------------------------------------------------+
```

##### Path 1: GitLab-Managed AI Gateway (Commercial SaaS & Default Self-Managed)
* **Data Flow:** Telemetry, prompt context (source code snippets, diffs, issue descriptions), and user inputs flow from the GitLab instance to the multi-tenant `GitLab.com AI Gateway`.
* **Model Processing:** The GitLab-managed gateway routes inference requests to third-party commercial LLM vendor endpoints (such as Anthropic Claude, Google Gemini, Fireworks/Mistral, and OpenAI).
* **Boundaries & Data Protection:** Data is encrypted in transit via TLS. Vendor agreements enforce zero-data-retention for prompts and completions. However, data egresses the primary customer tenant boundary to commercial vendor clouds.

##### Path 2: Self-Hosted AI Gateway (Self-Managed & Dedicated for Government Path)
* **Data Flow:** Prompts and code context remain entirely within customer-controlled infrastructure or agency security boundaries.
* **Model Processing:** The customer hosts the **GitLab AI Gateway binary** within their private network and routes inference calls directly to customer-operated, in-boundary model runtimes (e.g., local `vLLM` instances, AWS Bedrock GovCloud endpoints, or Azure Government OpenAI instances).
* **Compliance Control:** Eliminates prompt and code data egress to external commercial SaaS endpoints, maintaining full data sovereignty for regulated public sector and air-gapped environments.

> [!WARNING]
> **Unauthorized AI Capabilities in Government Environments:**
> While basic code suggestions and chat features via a Self-Hosted AI Gateway are supported, **GitLab Duo Agent Platform flows and external agentic AI capabilities are explicitly NOT AUTHORIZED** for use on `GitLab Dedicated for Government` under its current FedRAMP Moderate baseline.

---

### 6. Physical Architecture Gap Register & Technical Silence Notes

#### 6.1 Architecture Silence & Unknowns Register

Where technical documentation lacks explicit verification, architectural parameters are cataloged in accordance with strict factual grounding rules:

| Architecture Area / Feature | Documented Status / Claim | Explicit Gap / Silence Note | Impact on Physical Design |
| :--- | :--- | :--- | :--- |
| **Hosted FIPS Runners for Government** | Listed as a roadmap target in product handbooks. | **UNKNOWN** — Documentation confirms current government deployments require self-managed runners outside the tenant, but lacks an official release date for hosted FIPS runners within the tenant boundary. | Customer architects must budget, deploy, and maintain external runner infrastructure (EC2/EKS in customer AWS accounts). |
| **Slack / Teams Integration ATO Boundary** | Webhook notifications supported by the Rails application. | **UNKNOWN** — Documentation is silent on whether egressing payload data to external Slack/Teams webhooks invalidates or breaches the FedRAMP Moderate boundary. | Security architects must treat webhooks as untrusted egress points until cleared by the agency Authorizing Official (AO). |
| **Kubernetes Agent (KAS) FedRAMP PA** | Binary bundled with the GitLab control plane stack. | **UNKNOWN** — Explicit documentation gap regarding whether KAS endpoints are fully included within the FedRAMP Moderate Provisional Authorization (PA) boundary. | Agencies conducting GitOps deployments via KAS must verify cluster agent endpoint authorization with the GitLab Dedicated SecOps team. |
| **Hosted Model Fallback Restrictions** | Self-Hosted AI Gateway configuration option. | Official documentation confirms offline licenses block GitLab-managed model fallbacks, but lacks explicit runtime verification details for partially connected networks. | Egress firewall rules must explicitly block outgoing connection paths to `cloud.gitlab.com` to prevent unintentional prompt leakage. |