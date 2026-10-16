# GitLab DevSecOps Platform Architecture: TOGAF ADM and DoDAF Crosswalk Report

---

### 1. Framework Alignment Strategy & Grounding Rules

This architectural crosswalk report establishes a formal, rigorous mapping between the **GitLab DevSecOps Platform Architecture** and two standard enterprise architecture frameworks: the **TOGAF Architecture Development Method (ADM)** and the **Department of Defense Architecture Framework (DoDAF)**. 

To maintain methodological discipline and fulfill defense information systems governance requirements, this report executes a two-step crosswalk alignment strategy:
1. **TOGAF ADM Phase Alignment**: Platform capabilities, components, system boundaries, and technology realizations are mapped across TOGAF ADM Phase A (Architecture Vision), Phase B (Business Architecture), Phase C (Information Systems Architectures — Data and Application), and Phase D (Technology Architecture).
2. **DoDAF Viewpoint Deconstruction**: Platform structural and operational attributes are operationalized into specific DoDAF viewpoints, encompassing Operational Viewpoints (OV-1, OV-2, OV-5b), System Viewpoints (SV-1, SV-2, SV-4, SV-6), Data and Information Viewpoints (DIV-1, DIV-2, DIV-3), and Standards Viewpoints (StdV-1).

To eliminate architectural ambiguity and prevent boundary confusion between conceptual abstractions and concrete implementations, all analysis is explicitly partitioned across three distinct architectural **altitudes**:

* **Conceptual Altitude**: Vendor-neutral definition of "what" the system accomplishes and "why." It details broad business capabilities, organizational actors, and high-level domain concepts without citing specific product SKUs, commercial software names, execution binaries, physical hardware specs, or cloud hosting regions.
* **Logical Altitude**: Vendor-neutral component decompositions, data entity schemas, system interface boundaries, and operational interaction flows. It defines functional responsibilities, inputs, outputs, data relationships, and synchronicity while retaining abstract, non-proprietary terminology.
* **Physical Altitude**: Concrete, as-built software realizations and deployment topologies. It explicitly identifies physical software binaries and runtime services (e.g., Puma, Workhorse, Sidekiq, Gitaly, PostgreSQL, Redis, Runner, KAS), commercial deployment options (GitLab.com, Self-Managed, Dedicated, Dedicated for Government), cloud provider infrastructure (e.g., AWS GovCloud US-West), and accredited security authorization boundaries (e.g., FedRAMP Moderate ATO FR2411959145).

```
+---------------------------------------------------------------------------------+
|                              ARCHITECTURAL ALTITUDES                            |
+---------------------------------------------------------------------------------+
| CONCEPTUAL ALTITUDE  | Vendor-neutral capabilities, actors, and vision.         |
|                      | (No SKUs, product names, or hosting regions)             |
+----------------------+----------------------------------------------------------+
| LOGICAL ALTITUDE     | System decompositions, data entities, and flows.         |
|                      | (Inputs/outputs, responsibilities, interface bounds)     |
+----------------------+----------------------------------------------------------+
| PHYSICAL ALTITUDE    | As-built binaries, offerings, and security boundaries.   |
|                      | (Puma, Gitaly, PostgreSQL, FedRAMP ATO FR2411959145)    |
+---------------------------------------------------------------------------------+
```

#### Grounding & Source Silence Rules
This report enforces absolute fidelity to the underlying source context `[S1]–[S20]`. Every capability claim, technical attribute, system interface, and compliance statement is grounded strictly in source data. Where the source context does not provide explicit technical specifications or formal mappings to a requested DoDAF viewpoint, TOGAF phase, physical binary, or deployment variant, the missing element is explicitly designated as **`SILENT / UNSUPPORTED IN SOURCES`**. External assumptions, unverified market claims, and extrapolated vendor claims have been systematically excluded.

---

### 2. Master Framework Crosswalk Matrix

The master table below cross-references all functional capabilities, logical data entities, application services, and physical infrastructure components identified in the source context. It maps each element across architectural altitudes, TOGAF ADM phases, DoDAF viewpoints, deployment offering scopes, and primary source anchors.

| Platform Element / Capability / Component | Altitude | TOGAF ADM Phase | DoDAF Viewpoint | Deployment Offering Scope | Source Grounding & Silence Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Governed Software Change Path / Change Record** | Conceptual | Phase A: Architecture Vision, Phase B: Business | OV-1, DIV-1 | All Offerings | Core capability establishing a single system of record for code, pipeline evidence, and security findings `[S1, S2, S4]` |
| **Pipeline Contract & Job Execution Boundary** | Conceptual / Logical | Phase B: Business, Phase C: Application | OV-2, OV-5b, SV-1 | All Offerings | Defines job sequence execution and enforces strict trust separation between Control Plane and Job Plane `[S2, S3]` |
| **Project (Data Entity)** | Logical | Phase C: Data Architecture | DIV-2 | All Offerings | Namespace container owning repositories, pipelines, and compliance rules `[S1, S17]` |
| **Merge Request (Data Entity)** | Logical | Phase C: Data Architecture | DIV-2 | All Offerings | Primary unit of software change containing diffs, review threads, and gate evaluations `[S1, S2]` |
| **Pipeline (Data Entity)** | Logical | Phase C: Data Architecture | DIV-2, SV-6 | All Offerings | Execution contract instantiated for a specific Git SHA commit `[S2]` |
| **Job (Data Entity)** | Logical | Phase C: Data Architecture | DIV-2, SV-6 | All Offerings | Discrete execution task assigned to a worker node `[S2, S3]` |
| **Finding (Data Entity)** | Logical | Phase C: Data Architecture | DIV-2 | All Offerings | Normalized security vulnerability record with severity and location metadata `[S4]` |
| **Runner Token (Data Entity)** | Logical | Phase C: Data Architecture | DIV-2, SV-6 | All Offerings | Scoped authentication credential establishing worker trust with Control Plane `[S3, S9]` |
| **Repo (Data Entity)** | Logical | Phase C: Data Architecture | DIV-2 | All Offerings | Bare Git storage unit mapped to a project `[S5]` |
| **HTTP Front Door (NGINX + Workhorse)** | Physical | Phase D: Technology | SV-1, SV-4, SV-6 | All Offerings | Terminates TLS, handles HTTP/API routing, intercepts long-running requests, offloads artifact uploads directly to S3 `[S17]` |
| **SSH Front Door (GitLab Shell / OpenSSH)** | Physical | Phase D: Technology | SV-1, SV-4, SV-6 | All Offerings | Manages SSH authentication; routes Git SSH traffic to Gitaly via internal API checks `[S17]` |
| **Application Control Plane (Rails / Puma)** | Physical | Phase D: Technology | SV-1, SV-4, SV-6 | All Offerings | Multi-threaded Ruby web application on Puma server; enforces policy, authorization, and UI/API logic `[S17]` |
| **Ruby Rack Middleware (rack-attack, rack-timeout)** | Physical | Phase D: Technology | SV-4 | All Offerings | Middleware layer sitting between Puma and Rails for rate throttling and early request execution termination `[S17]` |
| **Background Job Queue (Sidekiq)** | Physical | Phase D: Technology | SV-4, SV-6 | All Offerings | Asynchronous background task engine executing identical Rails application code `[S17]` |
| **Session & In-Memory Store (Redis)** | Physical | Phase D: Technology | SV-4, SV-6 | All Offerings | High-speed memory store for session state, rate-limiting counters, and Sidekiq job queues `[S17]` |
| **System of Record Database (PostgreSQL)** | Physical | Phase D: Technology | SV-4, DIV-3, SV-6 | All Offerings | Central relational database (`gitlabhq_production`) storing core application entities `[S17]` |
| **Git RPC Service & Storage (Gitaly)** | Physical | Phase D: Technology | SV-1, SV-4, DIV-3, SV-6 | All Offerings | Encapsulates disk access to bare Git repos via gRPC; enforces 57s execution deadline without killing child git processes `[S5, S15, S16, S17]` |
| **Gitaly HA: Praefect Cluster** | Physical | Phase D: Technology | SV-1, SV-4 | Self-Managed Only | High-availability virtual storage router with SQL-backed transaction manager for Self-Managed instances `[S5]` |
| **Gitaly HA: Sharded Gitaly** | Physical | Phase D: Technology | SV-1, SV-4 | Dedicated, Dedicated for Government | Storage architecture deployed on Dedicated platforms; **Praefect is explicitly not used** `[S6, S7]` |
| **Job Execution Plane (GitLab Runner)** | Physical | Phase D: Technology | SV-1, SV-2, SV-4, SV-6 | All Offerings | Isolated execution agent. On Dedicated for Gov, must be customer self-managed FIPS runners *outside* tenant `[S3, S8, S9]` |
| **Artifact & Container Registries** | Physical | Phase D: Technology | SV-1, SV-4, DIV-3 | All Offerings | Native object storage components for container blobs and language packages `[S1, S17]` |
| **Kubernetes Cluster Agent (KAS)** | Physical | Phase D: Technology | SV-1, SV-2 | All Offerings | Inbound cluster-to-control plane agent for GitOps and deployment synchronization `[S1]` *(Gov PA status silent)* |
| **GitLab-Managed AI Gateway** | Physical | Phase D: Technology | SV-1, SV-2 | GitLab.com, Dedicated, Self-Managed | SaaS AI path routing prompts to vendor LLMs (Anthropic, Google, OpenAI) `[S12]` *(Not authorized on Gov)* |
| **Self-Hosted AI Gateway** | Physical | Phase D: Technology | SV-1, SV-2 | Self-Managed, Dedicated for Government | In-boundary AI execution routing prompts to customer-hosted local models `[S13]` |
| **Enterprise / Agency Identity Integration** | Logical / Physical | Phase B: Business, Phase D: Technology | StdV-1, SV-1 | All Offerings | SAML/OIDC federated SSO. PIV/CAC support on Gov is routed via agency IdP, not native PIV stack `[S8, S9]` |

---

### 3. TOGAF ADM Phase Mapping & Detailed Analysis

```
+---------------------------------------------------------------------------------+
|                                 TOGAF ADM PHASES                                |
+----------------------------------------+----------------------------------------+
| Phase A: Architecture Vision           | Phase B: Business Architecture         |
| • Single governed change path          | • Human & organizational actors        |
| • Unified system of record             | • Core capabilities (C1-C9)            |
| • Isolation vs multi-tenant baselines  | • Separation of trust domains          |
+----------------------------------------+----------------------------------------+
| Phase C: Information Systems           | Phase D: Technology Architecture       |
| • Vendor-neutral logical components    | • As-built physical binaries           |
| • Logical data entities & relationships| • Infrastructure execution topologies  |
| • System interface boundaries          | • Middleware & process lifecycle rules |
+----------------------------------------+----------------------------------------+
```

#### 3.1 Phase A: Architecture Vision
Phase A defines the high-level strategic capability requirements and problem domain for enterprise DevSecOps deployment, framed strictly at the conceptual altitude.

##### Problem Statement
In un-integrated enterprise development environments, source control management, continuous integration execution, vulnerability scanning, and package hosting operate in disconnected tool silos. This fragmentation prevents compliance teams and auditors from establishing an immutable change record linking intent to production deployment. Furthermore, build execution engines frequently execute arbitrary code on computing resources outside the immediate control plane, introducing severe risk if the trust boundary between application management and job execution is improperly structured `[S1, S3]`.

##### Strategic Purpose & Value Proposition
The strategic vision of the platform is to establish a **single governed change path from intent to running software** `[S1, S20]`. By unifying source code management, pipeline orchestration, artifact storage, and application security testing into one operational system of record, the platform eliminates toolchain fragmentation, enforces non-bypassable policy gates, and automatically captures supply chain evidence across the software development lifecycle `[S1, S2, S4]`.

##### Baseline Deployment Strategy & Isolation Requirements
Achieving this vision requires matching the platform's operational deployment model to the target enterprise's data classification and compliance governance requirements `[S1, S7, S8]`:
* **Multi-Tenant SaaS Baseline**: Suitable for commercial workloads requiring low operational overhead, where shared infrastructure hosting meets organizational risk acceptance criteria `[S1]`.
* **Single-Tenant Cloud Baseline**: Required for enterprise workloads demanding full network, storage, and computing isolation within a dedicated, managed cloud tenant `[S6, S7]`.
* **Customer-Operated Baseline**: Mandated for air-gapped, high-assurance, or sovereign environments where the operating organization must retain total operational control over infrastructure, keys, and networking `[S1, S14]`.

#### 3.2 Phase B: Business Architecture
Business Architecture defines the enterprise human actors, organizational roles, trust expectations, and core capabilities realized by the platform.

##### Human and Organizational Actors

| Actor | Organizational Role | Core Goal | System Trust Level |
| :--- | :--- | :--- | :--- |
| **Developer** | Authors source code, infrastructure declarations, and pipeline specifications | Land reviewed and compliant code changes into target environments | Low (Untrusted until peer review and policy gate validation) `[S1]` |
| **Reviewer** | Evaluates proposed code modifications | Review code quality, build logs, and security findings on a single change record | Medium `[S1]` |
| **Security Officer** | Defines security policy and compliance rulepacks | Enforce non-bypassable scan policy gates and monitor vulnerability triage | High for policy definition; untrusted for direct production code execution `[S4]` |
| **Platform Operator** | Manages the application control plane | Maintain platform uptime, data persistence, and identity integration | High within the Control Plane tenant boundary `[S9]` |
| **Job Operator** | Provisions infrastructure hosting worker nodes | Maintain isolated, token-rotated, and hardened build execution nodes | High within Job Plane; frequently deployed *outside* Control Plane tenant `[S3, S8, S9]` |
| **Identity Provider (IdP)** | Authenticates user identities and passes assertions | Assert identity, group memberships, and hardware token validation | High external identity authority `[S8]` |
| **Authorizing Official (AO)** | Evaluates risk posture and system compliance | Issue an explicit Authorization to Operate (ATO) letter for the system | Highest enterprise compliance authority `[S10]` |
| **Auditor** | Performs regulatory sampling and compliance verification | Reconstruct historical software change lineage and supply chain evidence | Independent read-only authority `[S1, S9]` |

##### Core Business Capabilities (C1–C9)
* **C1: Change Record Management**: Delivers a single, immutable entity (Merge Request) containing code diffs, review threads, pipeline execution records, and security approvals `[S1, S2]`.
* **C2: Pipeline Contract Execution**: Enforces a declared sequence of stages, jobs, and execution scripts defined in version-controlled YAML specifications (`.gitlab-ci.yml`) `[S2]`.
* **C3: Job Execution Isolation**: Ensures untrusted job code executes strictly on isolated worker infrastructure rather than within the application control plane `[S3]`.
* **C4: Finding Record Management**: Automatically aggregates, triages, and tracks security vulnerabilities generated by static, dynamic, and container scanners `[S4]`.
* **C5: Artifact Storage**: Manages compiled binaries, language packages, and container images co-located with source code references `[S1]`.
* **C6: Git Storage Abstraction**: Mediates repository read/write operations through gRPC interfaces, preventing application web nodes from directly mounting raw repository disks `[S5]`.
* **C7: Offering Choice Realization**: Delivers uniform platform capabilities across multi-tenant SaaS, single-tenant managed cloud, and customer-operated deployments `[S7, S8]`.
* **C8: Identity Handoff**: Integrates with enterprise federated identity infrastructure for single sign-on and hardware token verification `[S8]`.
* **C9: AI-Assisted Development**: Embeds generative AI models into developer workflows governed by explicit data-boundary controls `[S12, S13]`.

#### 3.3 Phase C: Information Systems Architectures (Data and Application)

##### Vendor-Neutral Logical Components
* **HTTP Front Door**: Terminates incoming TLS connections, performs web request routing, and handles Git-over-HTTP requests.
* **SSH Front Door**: Manages SSH connection handshakes, authenticates public keys, and routes Git-over-SSH operations.
* **Application Engine**: Manages project structures, authorization matrices, merge requests, CI logic, and administrative configurations.
* **Job Queue Manager**: Coordinates asynchronous background tasks, notification processing, repository imports, and pipeline job dispatching.
* **Session & Cache Store**: Maintains active user web sessions, transient settings caches, rate-limiting counters, and rapid key-value lookups.
* **System of Record Database**: Persists relational data tables including users, project structures, pipeline statuses, vulnerabilities, and settings.
* **Git RPC Service**: Encapsulates repository storage filesystems; executes Git commands on disk and returns structured responses over RPC interfaces.
* **Job Execution Worker**: Clones repositories, pulls container images, executes build scripts, generates vulnerability reports, and uploads artifacts.
* **Artifact Registry Store**: Holds compiled container blobs, language packages, and pipeline build artifacts.
* **Cluster Agent Service**: Maintains persistent inbound connections from remote Kubernetes clusters for GitOps synchronization and deployment monitoring.
* **AI Gateway Service**: Intercepts AI prompt contexts from user interfaces/IDEs and routes prompts to approved local or external LLMs.

##### Logical Data Entities and Relationships
* **Project**: Core namespace entity owning repositories, pipelines, issues, and security policy sets.
* **Merge Request**: Primary change record unit containing code diffs, peer approvals, and pipeline execution triggers. Linked 1-to-many with Pipelines.
* **Pipeline**: Workflow contract instantiated for a specific Git SHA commit. Linked 1-to-many with Jobs.
* **Job**: Discrete execution task running specified scripts within a container image on an assigned worker node. Linked 1-to-many with Findings.
* **Finding**: Discrete vulnerability record containing severity rating, scanner source, and triage state.
* **Runner Token**: High-security authentication credential scope establishing worker node trust with the Control Plane.
* **Repo**: Bare Git storage filesystem structure mapped directly to a single Project.

#### 3.4 Phase D: Technology Architecture
Technology Architecture details the concrete software binaries, middle-layer execution mechanics, infrastructure topologies, and physical deployment options.

```
+---------------------------------------------------------------------------------+
|                        PHYSICAL CONTROL PLANE TOPOLOGY                          |
|                                                                                 |
|   +-------------------------------------------------------------------------+   |
|   |                        HTTP / SSH FRONT DOORS                           |   |
|   |                  NGINX  |  Workhorse  |  GitLab Shell                   |   |
|   +-------------------------------------------------------------------------+   |
|                                        |                                        |
|                                        v                                        |
|   +-------------------------------------------------------------------------+   |
|   |                       APPLICATION CONTROL PLANE                         |   |
|   |             Puma Rack Server  -->  Ruby Rack Middleware                 |   |
|   |             (rack-attack throttling  |  rack-timeout)                     |   |
|   |                                    |                                        |
|   |                                    v                                        |
|   |                              GitLab Rails                                   |   |
|   +-------------------------------------------------------------------------+   |
|          |                             |                             |          |
|          v                             v                             v          |
|   +--------------+             +---------------+             +--------------+   |
|   |  BACKGROUND  |             |  IN-MEMORY    |             |  SYSTEM OF   |   |
|   |  JOB QUEUE   |             |  CACHE STORE  |             |  RECORD DB   |   |
|   |   Sidekiq    |             |    Redis      |             | PostgreSQL   |   |
|   +--------------+             +---------------+             +--------------+   |
|          |                             |                                        |
|          +-----------------------------+                                        |
|                                        |                                        |
|                                        v                                        |
|   +-------------------------------------------------------------------------+   |
|   |                             GIT RPC SERVICE                             |   |
|   |          Gitaly  (HA: Praefect Cluster OR Sharded Gitaly)               |   |
|   +-------------------------------------------------------------------------+   |
+---------------------------------------------------------------------------------+
```

##### Physical Service Binaries & Middle-Layer Execution Mechanics
* **NGINX Proxy**: External reverse proxy terminating ingress TLS, enforcing web server routing, and forwarding HTTP requests `[S17]`.
* **GitLab Workhorse**: Dedicated Reverse Proxy daemon written in Go sitting between NGINX and Puma. Workhorse intercepts long-running requests, raw file downloads, and heavy HTTP payloads. **Artifact Direct-Upload Bypass**: Workhorse intercepts large runner artifact upload payloads and streams them directly to Object Storage (S3), bypassing the Rails application entirely to prevent blocking multi-threaded Puma web workers `[S17]`.
* **GitLab Shell**: Go component managing SSH connection handshakes, verifying user SSH keys via internal Rails API calls, and piping Git SSH traffic directly to Gitaly `[S17]`.
* **GitLab Rails / Puma Rack Server**: Multi-threaded Ruby on Rails application running on the Puma web server. Puma utilizes the `puma_worker_killer` gem to recycle worker processes when RAM consumption exceeds pre-set thresholds `[S17]`.
* **Ruby Rack Middleware Stack**: Sits directly between Puma and the Rails application framework. Middlewares like `rack-attack` (rate throttling) and `rack-timeout` process incoming HTTP environments early. If `rack-attack` blocks a client due to rate limits, execution halts immediately in middleware, meaning rejected requests do not hit Rails application logic and do not appear in `production_json.log` `[S17]`.
* **Sidekiq**: Multi-threaded background processing engine executing asynchronous tasks using an identical Rails application configuration `[S17]`.
* **Redis**: In-memory key-value data store managing user web session states, settings caches, `rack-attack` counters, and Sidekiq background queues `[S17]`.
* **PostgreSQL**: Relational database maintaining the central `gitlabhq_production` database schema `[S17]`.
* **Gitaly RPC Daemon**: High-performance Go service encapsulating all raw Git disk storage operations over gRPC interfaces `[S5, S15, S16]`.
  * **57-Second Timeout & Child Process Persistence**: Gitaly's gRPC execution deadline is hard-coded to 57 seconds (calculated as exactly 95% of Puma's 60-second request timeout) to prevent runaway Git operations from starving Puma workers. Crucially, when Puma times out after 60s and returns a deadline error to the client, **Gitaly does not terminate the underlying child `git` process on disk**; the child process continues running to completion, which can cause persistent disk I/O load even after the HTTP request is cancelled `[S17]`.

##### Infrastructure Architecture Variants & High Availability Topologies
* **Gitaly High Availability Options**: On **Self-Managed** deployments, high availability is implemented using **Gitaly Cluster with Praefect** (a SQL-backed virtual storage routing daemon) `[S5]`. On **Dedicated** and **Dedicated for Government** cloud platforms, Gitaly is deployed in a **Sharded Gitaly** topology where repositories are distributed across discrete storage VMs; **Praefect is explicitly not used** `[S6, S7]`.
* **Cloud Native Hybrid**: On Self-Managed Kubernetes deployments (Helm), stateless components (Puma, Sidekiq, Workhorse) execute inside Kubernetes pods, while stateful services (**Gitaly and Gitaly Cluster**) must remain deployed on traditional Virtual Machines `[S14]`.

---

### 4. DoDAF Viewpoint Deconstruction

#### 4.1 Operational Viewpoints (OV-1, OV-2, OV-5b)

##### OV-1: High-Level Operational Concept
The operational concept centers on enforcing a rigid separation of trust between administrative policy management and build execution. Developers, Reviewers, and Security Officers interface with the Application Control Plane to manage source code, execute code reviews, and set non-bypassable scan policy gates. The Control Plane dispatches pipeline execution contracts to an external Job Execution Plane. Isolated workers pull source code via RPCs, execute build/security scripts, upload build artifacts directly to Object Storage, and push vulnerability findings back to the Control Plane. External Identity Providers validate human actors, while Authorizing Officials review system evidence to issue operational compliance approvals.

```
+-----------------------------------------------------------------------------------+
|                        OV-1 OPERATIONAL CONCEPT BOUNDARY                          |
|                                                                                   |
|  +--------------------+                                                           |
|  |    ORGANIZATION    |                                                           |
|  |  Developer         |                                                           |
|  |  Reviewer          |----( HTTPS / SAML / OIDC )-----+                          |
|  |  Security Officer  |                                |                          |
|  +--------------------+                                v                          |
|                                              +-------------------+                |
|  +--------------------+                      |   CONTROL PLANE   |                |
|  | IDENTITY PROVIDER  |=====================>|  Change Records   |                |
|  |  Agency IdP / PIV  |                      |  Pipeline Specs   |                |
|  +--------------------+                      |  Security Policy  |                |
|                                              +-------------------+                |
|                                                |               ^                  |
|                                       (Job Contract)      (Findings/Logs)         |
|                                                v               |                  |
|  +--------------------+                      +-------------------+                |
|  |AUTHORIZING OFFICIAL|                      |     JOB PLANE     |                |
|  |   (ATO Approval)   |.....................>| Isolated Workers  |                |
|  +--------------------+                      +-------------------+                |
+-----------------------------------------------------------------------------------+
```

##### OV-2 & OV-5b: Operational Resource Flow and Activity Model
1. **Initiate Change**: Developer authenticates via enterprise IdP and pushes code commits to the HTTP/SSH Front Door.
2. **Evaluate Policy**: Application Control Plane intercepts commit, instantiates Merge Request change record, and evaluates security policy rules.
3. **Dispatch Contract**: Control Plane enqueues pipeline execution contract into Redis / Sidekiq Job Queue.
4. **Acquire Job**: Isolated Execution Worker polls Control Plane, receives job payload alongside a scoped, short-lived job token.
5. **Execute Task**: Worker clones repo via Git RPC, runs compilation/scanners, and generates output artifacts.
6. **Return Evidence**: Worker streams execution logs and writes vulnerability Findings back to Application Control Plane; streams build artifacts directly to Object Storage via Workhorse bypass.
7. **Gate Approval**: Reviewer and Security Officer evaluate unified Merge Request evidence; merge is permitted only if policy conditions pass.

#### 4.2 System Viewpoints (SV-1, SV-2, SV-4, SV-6)

##### SV-1 & SV-2: Systems Interface & Resource Flow Description
The primary structural system boundary exists between the **Application Control Plane** and the **Job Execution Plane**. These domains represent separate trust domains. Workers in the Job Execution Plane must never possess direct administrative access to Control Plane infrastructure, database instances, or underlying repository disks `[S3]`. All communication from workers to the Control Plane occurs outbound over HTTPS/API links using transient job tokens `[S3, S9]`.

##### SV-4: Systems Functionality Description
* **Puma / Rails**: Executes API/UI business logic, evaluates security policies, calculates access authorization matrices.
* **Workhorse**: Offloads long-running HTTP requests, processes Git HTTP traffic, and streams artifact uploads directly to Object Storage.
* **Sidekiq**: Executes asynchronous background tasks (mailers, webhooks, pipeline fan-out).
* **Redis**: Manages transient session state, rate-limiting counters (`rack-attack`), and Sidekiq job queues.
* **PostgreSQL**: Stores central relational data tables in the `gitlabhq_production` schema.
* **Gitaly**: Translates incoming gRPC calls into bare Git disk operations; enforces 57s execution deadlines.
* **Runner**: Executes job shell scripts inside isolated container environments.

##### SV-6: Systems Resource Flow Matrix

| Source System | Destination System | Resource / Flow | Transport Protocol | Authentication Mechanism | Data Exchanged |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **User Browser / IDE** | **HTTP Front Door (NGINX)** | Web & API Requests | HTTPS (TLS) | SAML / OIDC / Personal Access Token | UI navigation, REST/GraphQL requests, code commits `[S8, S12]` |
| **Git Client** | **SSH Front Door (GitLab Shell)** | Git Operations | SSH | Public/Private SSH Key (FIPS compliant) | Git packfiles, object updates `[S9, S17]` |
| **NGINX Proxy** | **Workhorse / Puma** | App Requests | HTTP / Unix Socket | Internal Loopback | Terminated HTTP request streams `[S17]` |
| **Puma Application** | **PostgreSQL** | Database Queries | PostgreSQL Wire | Database Credentials | Entity rows (users, projects, findings) `[S17]` |
| **Puma Application** | **Redis** | Caching & Queues | Redis Protocol | Redis Password | Session keys, Sidekiq job payloads `[S17]` |
| **Puma / Sidekiq** | **Gitaly Service** | Git Data Requests | gRPC over TCP/TLS | Shared Secret Token | Git commit objects, diffs, branch refs `[S5, S17]` |
| **GitLab Runner** | **Puma Application** | Job Polling & Status | HTTPS | Runner Token / Job Token | Job instructions, execution logs, finding payloads `[S3, S9]` |
| **GitLab Runner** | **Gitaly Service** | Repository Clone | HTTPS / gRPC | Transient Job Token | Bare repository source code `[S3, S5]` |
| **GitLab Runner** | **Object Storage (via Workhorse)** | Binary Upload | HTTPS | Transient Job Token | Heavy build artifacts (bypassing Rails) `[S1, S17]` |
| **Application / IDE** | **AI Gateway** | Prompts & Code Context | HTTPS | App Gateway Token | Code snippets, file context, prompt parameters `[S12, S13]` |
| **Customer IdP** | **Puma Application** | Identity Assertions | HTTPS (SAML/OIDC) | IdP Certificate / OAuth Secret | User attributes, group memberships, PIV/CAC assertions `[S8]` |

#### 4.3 Data and Information Viewpoints (DIV-1, DIV-2, DIV-3)

##### DIV-1: Conceptual Data Model
* **Change Record**: High-level governance object unifying proposed code modifications with review history and test results.
* **Pipeline Contract**: Standardized specification declaring automated workflow execution constraints.
* **Job Execution**: Discrete computational task executed within an isolated runtime environment.
* **Security Finding**: Normalized security weakness entity discovered during automated testing.
* **Offering Boundary**: Compliance and operational scope defining data hosting boundaries.

##### DIV-2: Logical Data Model

```
+---------------------------------------------------------------------------------+
|                            LOGICAL DATA MODEL (DIV-2)                           |
|                                                                                 |
|   +-----------------------+                    +----------------------------+   |
|   |        PROJECT        |1                  *|       MERGE REQUEST        |   |
|   |  - project_id (PK)    |-------------------|  - mr_id (PK)               |   |
|   |  - path               |                    |  - source_branch           |   |
|   |  - visibility_level   |                    |  - target_sha              |   |
|   +-----------------------+                    +----------------------------+   |
|               | 1                                            | 1                |
|               |                                              |                  |
|               | 1                                            | *                |
|   +-----------------------+                    +----------------------------+   |
|   |      REPOSITORY       |                    |          PIPELINE          |   |
|   |  - repo_id (PK)       |                    |  - pipeline_id (PK)        |   |
|   |  - storage_shard      |                    |  - commit_sha              |   |
|   +-----------------------+                    |  - status                  |   |
|               | 1                              +----------------------------+   |
|               |                                              | 1                |
|               | *                                            |                  |
|   +-----------------------+                                  | *                |
|   |      GITALY RPC       |                    +----------------------------+   |
|   |  - endpoint_uri       |                    |            JOB             |   |
|   +-----------------------+                    |  - job_id (PK)             |   |
|                                                |  - runner_tag              |   |
|                                                +----------------------------+   |
|                                                   | 1                  | 1      |
|                                                   |                    |        |
|                                                   | *                  | *      |
|                                        +------------------+   +-------------+   |
|                                        |     FINDING      |   |  REGISTRY   |   |
|                                        |  - finding_id    |   |  - blob_uri |   |
|                                        |  - severity      |   +-------------+   |
|                                        +------------------+                     |
+---------------------------------------------------------------------------------+
```

##### DIV-3: Physical Data Model
* **PostgreSQL Schema (`gitlabhq_production`)**: Central database schema containing core relational tables (`projects`, `merge_requests`, `ci_pipelines`, `ci_builds`, `vulnerability_occurrences`, `users`).
* **Redis Key-Space**: In-memory key structures holding Sidekiq queues (`queue:default`), user session hashes, and settings caches.
* **Gitaly Storage Disk**: Block storage filesystems containing bare Git repositories organized by hashed storage paths.
* **Object Storage / AWS S3**: Object buckets storing CI build artifacts, container registry layers, LFS tracking files, and export packages.

#### 4.4 Standards Viewpoint (StdV-1)
* **Authentication Standards**: SAML 2.0, OpenID Connect (OIDC), Hardware Token Integration (PIV/CAC via customer IdP) `[S8]`.
* **Cryptographic Standards**: FIPS 140-2/140-3 validated cryptographic modules for SSH key generation, TLS transport, and database encryption at rest `[S8, S9]`.
* **Email & Domain Protection**: Domain-based Message Authentication, Reporting and Conformance (DMARC) enforced for outgoing application messaging per DHS BOD 18-01 `[S9]`.
* **Supply Chain & Pipeline Security Guidelines**: Alignment with NIST SP 800-204D for software supply chain integration and NIST SP 800-53 controls for configuration management `[S9, S18]`.
* **Government Compliance Certification**: FedRAMP Moderate Authority to Operate (ATO) under listing FR2411959145 `[S8, S10]`.
* **Standards Silence Note**: *Any standard or compliance accreditation not explicitly cited above (such as FedRAMP High, DoD IL4/IL5/IL6 packages, or specific FIPS certificate numbers) is unsupported in the sources and designated as **`SILENT / UNSUPPORTED IN SOURCES`**.*

---

### 5. Offering & Security Boundary Analysis (Physical Realizations)

#### Deployment Offering Comparison Matrix

| Feature / Architecture Dimension | GitLab.com | Self-Managed | Dedicated | Dedicated for Government |
| :--- | :--- | :--- | :--- | :--- |
| **Infrastructure Operator** | GitLab Inc. `[S1]` | Customer Organization `[S1]` | GitLab Inc. (via Switchboard + Amp) `[S6]` | GitLab Inc. (via Switchboard + Amp) `[S7, S8]` |
| **Data Residency & Hosting** | GitLab Multi-Tenant Commercial AWS `[S1]` | Customer-defined (On-Premises or Cloud VPC) `[S1]` | Dedicated Single-Tenant Commercial AWS Account `[S6]` | Dedicated Single-Tenant AWS GovCloud US-West Account `[S7, S8]` |
| **Git Storage Topology** | Multi-tenant Gitaly `[S1]` | Gitaly or Gitaly Cluster (Praefect HA) `[S5]` | **Sharded Gitaly (Praefect NOT used)** `[S6]` | **Sharded Gitaly (Praefect NOT used)** `[S7]` |
| **Runner Execution Boundary** | Shared Multi-Tenant + Customer Self-Managed `[S1]` | Customer Self-Managed `[S1]` | GitLab-Hosted Optional + Customer Self-Managed `[S6]` | **Customer Self-Managed FIPS Runners OUTSIDE tenant boundary** `[S8, S9]` |
| **AI Processing Path** | GitLab-Managed AI Gateway to Vendor LLMs `[S12]` | GitLab-Managed AI Gateway OR Self-Hosted Gateway `[S12, S13]` | GitLab-Managed AI Gateway (Duo on Dedicated) `[S6, S12]` | **Self-Hosted AI Gateway Path ONLY; Duo Agent Platform flows NOT authorized** `[S8, S13]` |
| **Governance / Compliance ATO** | Commercial SOC2 / ISO `[S1]` | Governed by Customer's Organizational ATO `[S1]` | Commercial SOC2 / ISO `[S6]` | **FedRAMP Moderate ATO (FR2411959145, GSA Sponsor)** `[S8, S10]` |

#### Critical Security Boundary Restrictions & Defense Implications

```
+---------------------------------------------------------------------------------+
|                DEDICATED FOR GOVERNMENT BOUNDARY RESTRICTIONS                   |
|                                                                                 |
|  +---------------------------------------------------------------------------+  |
|  |             AWS GOVCLOUD US-WEST (GITLAB-OPERATED TENANT)                 |  |
|  |                                                                           |  |
|  |   +-------------------------------------------------------------------+   |  |
|  |   |                CUSTOMER DEDICATED AWS ACCOUNT                     |   |  |
|  |   |                                                                   |   |  |
|  |   |  • GitLab Control Plane (Puma, Sidekiq, Postgres, Redis)          |   |  |
|  |   |  • Sharded Gitaly Storage                                         |   |  |
|  |   |  • Container & Package Registries                                 |   |  |
|  |   |                                                                   |   |  |
|  |   +-------------------------------------------------------------------+   |  |
|  |                                                                           |  |
|  |   [RESTRICTION 1]: Hosted Runners NOT permitted in tenant boundary      |  |
|  |   [RESTRICTION 2]: Duo Agent Platform external flows NOT authorized       |  |
|  +---------------------------------------------------------------------------+  |
|                                       ^                                         |
|                                       | (Job Token over HTTPS / PrivateLink)    |
|                                       v                                         |
|  +---------------------------------------------------------------------------+  |
|  |                            AGENCY ESTATE                                  |  |
|  |                                                                           |  |
|  |   • Customer-Managed FIPS Runners (Outside Tenant)                        |  |
|  |   • Agency Identity Provider (SAML/OIDC with PIV/CAC)                     |  |
|  |   • Customer-Hosted Local AI Gateway Models                               |  |
|  +---------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------+
```

1. **Job Plane Boundary Isolation**: Hosted runners inside the GitLab-managed tenant account are explicitly unavailable on Dedicated for Government. Government agencies **must** deploy and operate their own self-managed execution runners using published FIPS-validated runner container images on infrastructure residing **outside** the GitLab FedRAMP tenant boundary `[S8, S9]`.
2. **AI Platform Authorization Caps**: While standard self-hosted model gateways are supported, **GitLab Duo Agent Platform foundational agent flows and external agent interactions are NOT authorized** on Dedicated for Government under its FedRAMP Moderate baseline `[S8]`.
3. **Identity Handoff**: Dedicated for Government does not provide a native PIV/CAC card reading stack inside the tenant. Smartcard authentication must be performed at the agency's external Identity Provider, which passes SAML or OIDC assertions to the platform `[S8]`.
4. **Defense Impact Level Disambiguation (IL5 / IL6 / Air-Gap Constraints)**: The Dedicated for Government platform offering holds a FedRAMP Moderate ATO. It **cannot** be deployed for **DoD Impact Level 5 (Controlled Unclassified Information / National Security Systems)**, **Impact Level 6 (SECRET)**, or disconnected air-gapped environments. Defense organizations requiring IL5, IL6, or air-gap execution **cannot** use Dedicated for Government and **must deploy the Self-Managed platform offering** on customer-provisioned and customer-authorized infrastructure `[S1, S14]`.

---

### 6. Formal Architecture Gaps and Source Silence Register

To maintain complete architectural integrity, the register below logs all framework dimensions, requested technical features, or operational deployment attributes where the source context provides incomplete or zero data. In compliance with strict grounding rules, these items are formally classified without extrapolation.

| Framework View / Dimension | Requested Architectural Item | Source Status | Explicit Architecture Gap / Unknown | Impact on Framework Alignment |
| :--- | :--- | :--- | :--- | :--- |
| **DoDAF SV-6 / System Interfaces** | Kubernetes Agent (KAS) Program Authorization Status | **SILENT** | Sources provide zero data on whether the KAS daemon is authorized within the FedRAMP Moderate boundary for Dedicated for Government `[S1, S8]` | SV-6 system resource flow matrix cannot confirm authorized cluster-to-tenant communication paths for government tenants. |
| **TOGAF Phase A / Compliance** | High-Impact & Classified Accreditation Scope | **SILENT** | Sources explicitly state Dedicated for Government is FedRAMP Moderate, but provide no data on DoD IL5, IL6, or SECRET SaaS offerings `[S1]` | Phase A Vision cannot extend Dedicated for Government to classified military defense workloads; Self-Managed is required. |
| **DoDAF StdV-1 / Integration** | Third-Party Notification Integrations (Slack / MS Teams) | **SILENT** | Sources acknowledge webhook notification support generally, but remain silent on whether webhooks to third-party SaaS platforms are authorized inside the FedRAMP ATO `[S8]` | Standards Profile cannot confirm compliance boundaries for outgoing event webhooks. |
| **System Viewpoints (SV)** | Dedicated for Government Hosted FIPS Runner Availability | **PARTIALLY COVERED** | Handbook docs list hosted FIPS runners as a potential roadmap item, but current security guides mandate customer self-managed runners outside the tenant `[S8, S9]` | SV-1/SV-2 system interface diagrams must keep the runner execution plane strictly outside the SaaS tenant boundary. |
| **Performance Benchmarking** | Platform Scanner Benchmark Metrics | **SILENT** | Sources contain no comparative benchmark data, scan throughput numbers, or empirical detection rate comparisons against competing DevSecOps platforms `[S7]` | Quantitative performance attributes cannot be added to DoDAF SV-4 functional descriptions. |
| **DoDAF DIV-3 / Physical Storage** | Database Schema Tables for AI Prompts | **SILENT** | Sources detail high-level AI prompt paths but do not reveal physical PostgreSQL database table schemas or Redis key patterns for AI context storage `[S12, S13]` | Physical Data Model (DIV-3) for AI Gateway features remains limited to logical interface descriptions. |

---

### 7. Document Conclusion & Architectural Compliance Summary

This report establishes a complete architectural crosswalk mapping the **GitLab DevSecOps Platform Architecture** directly into TOGAF ADM phases and DoDAF viewpoints.

* **TOGAF ADM Alignment**: The platform fulfills the lifecycle from **Phase A (Architecture Vision)** by delivering a single system of record for governed software change; **Phase B (Business Architecture)** by formalizing role-based actor boundaries and C1–C9 operational capabilities; **Phase C (Data & Application Architecture)** by establishing vendor-neutral logical entities and RPC storage abstractions; and **Phase D (Technology Architecture)** by realizing these abstractions via concrete binaries (Puma, Workhorse, Sidekiq, Gitaly, PostgreSQL, Redis, Runner, KAS) and middle-layer execution rules (Rack middleware, Workhorse direct-upload bypass, Gitaly 57s execution deadlines).
* **DoDAF Viewpoint Deconstruction**: Platform interactions are fully operationalized across **OV-1, OV-2, OV-5b** (operational change flows), **SV-1, SV-2, SV-4, SV-6** (system boundaries, service functions, and resource flow matrices), **DIV-1, DIV-2, DIV-3** (conceptual, logical, and physical database models), and **StdV-1** (FIPS, SAML/OIDC, and FedRAMP standards profiles).
* **Critical Operational Failure Modes & Security Boundaries**:
  1. *Gitaly Process Persistence*: When Puma times out after 60 seconds (with Gitaly's deadline set at 57 seconds), Gitaly returns a deadline error to Puma but **does not kill the underlying child `git` process on disk**, allowing it to run to completion and potentially cause lingering I/O load `[S17]`.
  2. *Runner Token Exposure*: If a runner token is compromised, the attacker gains job execution privileges within that runner's scope, emphasizing the necessity of runner token rotation and execution boundary isolation `[S3, S9]`.
  3. *Accreditation Boundary Limits*: Organizations deploying under FedRAMP Moderate on **Dedicated for Government** must enforce customer-managed FIPS runners outside the tenant, route smartcard identity through an external agency IdP, and restrict AI execution to self-hosted model gateways (as Duo Agent Platform flows are unauthorized). For **DoD Impact Level 5 (IL5)**, **Impact Level 6 (IL6)**, or air-gapped environments, Dedicated for Government cannot be used, and defense organizations **must deploy the Self-Managed platform offering** `[S1, S8, S14]`.