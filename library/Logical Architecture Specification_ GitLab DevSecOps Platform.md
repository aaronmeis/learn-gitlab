# Logical Architecture Specification: GitLab DevSecOps Platform

---

## 1. System Boundary & Architectural Altitude

### 1.1 Logical Boundary Definition
The logical architecture of the DevSecOps platform establishes an immutable boundary separating the **Control Plane** from the **Job Plane**. This structural division guarantees that system state, security policies, identity context, and governance logic remain strictly isolated from untrusted, arbitrary user code execution.

```
+-----------------------------------------------------------------------------------+
|                                   CONTROL PLANE                                   |
|                                                                                   |
|  +-----------------------+     REST / HTTPS     +------------------------------+  |
|  |   HTTP / SSH Front    |--------------------->|    Application Controller    |  |
|  |         Doors         |                      |            / Core            |  |
|  +-----------------------+                      +--------------+---------------+  |
|              |                                                 |                  |
|              | gRPC / Internal API                             | SQL Reads/Writes |
|              v                                                 v                  |
|  +-----------------------+                      +------------------------------+  |
|  |    Git RPC Service    |                      |     System of Record DB      |  |
|  +-----------------------+                      +------------------------------+  |
|                                                                |                  |
|                                                                | Enqueue Tasks    |
|                                                                v                  |
|                                                 +------------------------------+  |
|                                                 |          Job Queue           |  |
|                                                 +------------------------------+  |
+----------------------------------------|------------------------------------------+
                                         |
                                         | gRPC / HTTP REST
                                         | (Token-Authenticated, Short-Lived)
                                         v
+-----------------------------------------------------------------------------------+
|                                     JOB PLANE                                     |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                                 Job Worker                                  |  |
|  |     (Isolated Execution Environment: Build, Scan, Test, Package, Artifact)  |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

*   **Control Plane:** Houses the central governance engine, administrative interface, user identity management, change metadata repository, pipeline orchestration system, vulnerability tracking database, and Git repository RPC interface. It maintains overall system state and enforces access controls across all platform capabilities.
*   **Job Plane:** Consists of ephemeral, isolated execution contexts (workers) dedicated to executing workload jobs defined in software repositories. The Job Plane compiles source code, evaluates test suites, executes static and dynamic security scanners, and constructs binary software packages.

To preserve proper architectural altitude, this specification operates on the principle of **vendor-neutrality**. Platform capability, component responsibilities, data structures, and operational flows are defined by their logical behavior and interface contracts. Physical software realizations (such as Puma, Workhorse, Sidekiq, PostgreSQL, Redis, Gitaly, GitLab Shell, or GitLab Runner) are cited exclusively as illustrative physical deployments grounded in source material.

### 1.2 Trust Domains & Boundary Rules
The logical platform is segmented into distinct trust domains, establishing explicit boundaries across actors, management services, and workload agents:

#### Logical Actors
*   **Developer:** Land code changes, author pipeline configurations, and view job feedback within scoped project boundaries. (Low trust prior to peer review).
*   **Reviewer:** Approves code proposals, inspects automated test/vulnerability results, and authorizes merges into protected branches. (Medium trust).
*   **Security Teams:** Defines organization-wide security compliance policies, scan mandates, and vulnerability approval gates. (High trust over security policy; low trust over arbitrary repository code).
*   **Platform Operator:** Manages the operational health, scaling, backups, database schema, and identity integrations of the Control Plane. (High operational trust within the tenant boundary).
*   **Job Operator:** Provisions, patches, and isolates the execution machines forming the Job Plane. (High operational trust over runner infrastructure, operating logically *outside* or adjacent to the Control Plane boundary).
*   **Identity Provider (IdP):** Asserts user identity, single sign-on (SSO), and hardware-backed multi-factor credentials (SAML/OIDC, PIV/CAC). (External authoritative trust).
*   **Authorizing Official (AO):** Evaluates overall platform security compliance and issues legal Authority to Operate (ATO) decisions based on system risk profiles. (Highest administrative trust).
*   **Auditor:** Inspects system change logs, security finding records, approval histories, and compliance evidence without operational edit privileges. (Independent read-only trust).

#### Logical Trust Domains
1.  **User / External Trust Domain:** Contains external users, integrated IDEs, browser interfaces, agency identity providers, and API clients accessing the platform over public or enterprise networks.
2.  **Control Plane Trust Domain:** Comprises the stateless web servers, asynchronous task queues, session caches, core relational databases, and abstracted Git storage services. Components in this domain operate inside a secured, high-trust security boundary with direct access to the System of Record DB.
3.  **Job Plane Trust Domain:** Encompasses untrusted, short-lived worker instances running customer-written compilation scripts, dependency installs, and dynamic binary execution.

#### Security Isolation Rules
*   **Untrusted Code Isolation:** Job workers process arbitrary, user-submitted code and must never reside within the same logical trust domain as the Control Plane database or raw repository filesystems.
*   **Prohibition of Direct Database Access:** Job workers are explicitly blocked from initiating direct network, IPC, or SQL connections to the System of Record DB, Session & Cache Store, or internal administrative APIs.
*   **Token-Gated Control Plane Ingress:** Any communication originating from the Job Plane into the Control Plane must pass through public-facing or internal API proxies using short-lived, cryptographically hashed, explicitly scoped execution credentials (Runner Tokens and Job Tokens).
*   **Credential and Scope Containment:** Compromise of an individual Job Worker or job token exposes only the local execution context and ephemeral build artifacts assigned to that specific job. It grants no lateral read, write, or administrative rights across unrelated repository shards, database records, or Control Plane services.

---

## 2. Logical Component Architecture

### 2.1 Component Responsibility Matrix

| Logical Component | Core Responsibilities | Conceptual Capability Realized | Inputs & Source | Outputs & Destination |
| :--- | :--- | :--- | :--- | :--- |
| **HTTP Front Door** | Enforces TLS termination, performs URI and API route dispatching, reverse-proxies web/API traffic, handles Git-over-HTTP traffic ingress. | Change Record, Identity Handoff | Client HTTPS connections (Web UI, API, Git-over-HTTP) | Application Controller/Core, Git RPC Service (via HTTP helper logic) |
| **SSH Front Door** | Manages Git-over-SSH connection ingress, terminates SSH transport layers, maps SSH public keys to platform identities. | Git Storage | Client Git SSH streams | Git RPC Service (following synchronous internal authorization checks) |
| **Application Controller/Core** | Orchestrates project/MR lifecycles, parses `.gitlab-ci.yml` configurations, enforces RBAC/security policies, processes business logic, and serves internal validation APIs. | Change Record, Finding Record, Offering Choice | External HTTP requests via Front Door, internal API callback queries | System of Record DB, Job Queue, Git RPC Service, AI Gateway |
| **Job Queue** | Manages asynchronous background processing, handles transactional mailers, processes imports/exports, and coordinates CI pipeline job fan-out distribution. | Pipeline Contract | Asynchronous task creation events from Application Controller | Queued task payloads evaluated by background processing routines |
| **Session & Cache Store** | Provides high-speed key-value caching, maintains user session states, stores rate-limiting counters, and holds ephemeral background queue metadata in memory. | Change Record, Pipeline Contract | Application Controller state writes, Job Queue scheduling tasks | Cached system settings, active session keys, background job metadata |
| **System of Record DB** | Serves as the authoritative persistent relational store for user identities, access permissions, project hierarchies, pipeline execution states, and vulnerability findings. | Change Record, Finding Record | Relational SQL reads/writes from Application Controller | Structured record rows, entity relationship states |
| **Git RPC Service** | Encapsulates repository access by abstracting all Git read/write operations behind gRPC interfaces, strictly isolating application nodes from disk IOPS. | Git Storage | High-level gRPC remote procedure requests from Application Controller or Front Doors | Streaming Git object trees, commit logs, packfiles, diff payloads |
| **Job Worker** | Ephemeral, isolated worker agent polling for tasks; clones repositories, executes compilation scripts, runs security scanners, and posts execution telemetry. | Job Execution, Finding Record, Artifact Store | Ephemeral job payload and short-lived execution tokens from Application Controller | Execution logs, vulnerability finding arrays, compiled package binaries |
| **Artifact Registry** | Stores and indexes binary artifacts, container image layers, and package bundles generated during pipeline execution. | Artifact Store | Binary streams, container image layers, and package manifests from Job Worker | Downloadable package payloads, container image pulls |
| **Cluster Agent** | Maintains stateful, inbound connections from Kubernetes management clusters to the Control Plane for deployment tracking and pull-based GitOps operations. | Job Execution, Pipeline Contract | Inbound cluster status updates, deployment events, Kubernetes API states | Deployment telemetry updates dispatched to Application Controller |
| **AI Gateway** | Handles prompt construction, context window parsing, user identity propagation, and request routing across external or self-hosted LLM backends. | AI Assistance | User prompts and code context payloads from Application Controller or IDE extensions | Generated code completions, vulnerability explainers, automated chat responses |

### 2.2 Storage & Subsystem Abstractions
The platform's logical architecture strictly forbids direct repository filesystem access by the *Application Controller*, enforcing total decoupling through the *Git RPC Service*.

```
+-----------------------------------------------------------------------------------+
|                              APPLICATION TIER (STATELESS)                         |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                           Application Controller                            |  |
|  |        (Processes Business Logic, Dynamic Views, Policy Evaluation)         |  |
|  +-----------------------------------------------------------------------------+  |
+------------------------------------------|----------------------------------------+
                                           |
                                           | Pure gRPC Protocol
                                           | (No Direct File / NFS Access)
                                           v
+-----------------------------------------------------------------------------------+
|                               STORAGE SUBSYSTEM LAYER                             |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                           Git RPC Service Layer                             |  |
|  |           (Encapsulates Repository Access, Manages Disk Threads)            |  |
|  +-----------------------------------------------------------------------------+  |
|                                          |                                        |
|                                          | Native POSIX File System I/O           |
|                                          v                                        |
|  +-----------------------------------------------------------------------------+  |
|  |                           Physical Block Storage / Disk                     |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

#### Architectural Rationale for Storage Abstraction
1.  **Elimination of Thread-Blocking I/O Contention:** Dynamic application processes (realized physically by Ruby on Rails running under Puma workers) are optimized for low-latency memory execution and network I/O. When web application processes issue direct, synchronous POSIX calls (`open`, `read`, `fork`, `exec`) against Git repository disk structures, long-running Git packfile traversals block web worker threads. Under high concurrency, this leads to rapid thread exhaustion, elevated I/O wait states, and system-wide request starvation.
2.  **Abolition of Shared Network Filesystems (NFS):** Distributing raw Git repository disks across web server pools using Network File System (NFS) mounts introduces severe file-locking latency, race conditions, and RPC timeouts. Decoupling storage behind a dedicated gRPC abstraction layer eliminates NFS requirements, enabling stateless web nodes to scale independently of storage hardware.
3.  **Encapsulation and Concurrency Control via gRPC:** The *Git RPC Service* (realized physically by Gitaly) isolates all Git operations behind defined gRPC contracts. The service manages local process forks, optimizes memory caching of Git objects, and enforces process-level concurrency limits directly on the storage node.
4.  **Storage Topology Flexibility:** Encapsulating repository operations behind an RPC layer allows the underlying storage architecture to be reconfigured—transitioning between sharded disk arrays and virtual storage clusters—without requiring application-level code modifications or breaking boundary security controls.

---

## 3. Logical Data Entities & Domain Model

### 3.1 Logical Data Model Specification

| Entity Name | Key Attributes | Primary Relationships | Data Classification |
| :--- | :--- | :--- | :--- |
| **Project** | `id`, `path`, `visibility_level`, `security_policy_set` | Belongs to Group; owns Repo, Merge Requests, and Pipelines | Organization Metadata |
| **Merge Request** | `id`, `source_branch`, `target_branch`, `commit_sha`, `approval_status` | Belongs to Project; triggers Pipeline; aggregates Findings | Software Change Record |
| **Pipeline** | `id`, `commit_sha`, `status`, `ref`, `stage_graph` | Triggered by Merge Request/commit; owns discrete Jobs | Compliance & Process Evidence |
| **Job** | `id`, `container_image`, `script_definition`, `runner_tag`, `status` | Belongs to Pipeline; assigned to Job Worker; emits Findings | Runtime Execution Context |
| **Finding** | `id`, `scanner_type`, `severity`, `cve_identifier`, `file_location` | Emitted by Job; linked to Merge Request and Security Policy | Vulnerability Metadata |
| **Runner Token** | `token_hash`, `scope_level`, `expiration_timestamp`, `revocation_state` | Authenticates Job Worker; scoped to Instance, Group, or Project | Authentication Secret |
| **Repo** | `storage_shard_locator`, `relative_path`, `head_commit_sha` | Owned by Project; accessed exclusively via Git RPC Service | Source Code Repository |

### 3.2 Entity Relationship & Lifecycle Dynamics

```
+---------------+ 1         1..* +-----------------+ 1         1..* +--------------+
|    Project    |----------------|  Merge Request  |----------------|   Pipeline   |
+---------------+                +-----------------+                +--------------+
  |            |                          |                                |
  | 1          | 1                        | 1..*                           | 1..*
  v            v                          v                                v
+---------------+                       +------------------+        +--------------+
|     Repo      |                       |     Finding      |<-------|     Job      |
+---------------+                       +------------------+ (emits)+--------------+
  |                                                                        |
  | accessed via gRPC                                                      | executed by
  v                                                                        v
+---------------+                                                   +--------------+
|  Git RPC Svc  |                                                   |  Job Worker  |
+---------------+                                                   +--------------+
                                                                           ^
                                                                           | authenticated by
                                                                    +--------------+
                                                                    | Runner Token |
                                                                    +--------------+
```

#### Change Lifecycle Traceability Sequence
1.  **Project Provisioning & Storage Binding:** A **Project** is instantiated within an organizational namespace, establishing global governance parameters and binding to a physical repository path (**Repo**) managed by the *Git RPC Service*.
2.  **Change Initiation (Merge Request):** A developer pushes code modifications and submits a **Merge Request**. The Merge Request records target branch constraints, records the commit `SHA`, and attaches required code-owner and security approval gates.
3.  **Pipeline Construction & Execution Contract:** The creation or update of a Merge Request triggers the Application Controller to parse the repository configuration file at the target `SHA`. This constructs a **Pipeline** entity, establishing an immutable execution contract containing an ordered graph of **Job** entities.
4.  **Worker Context Validation:** An isolated **Job Worker** polls the Control Plane, presenting a hashed **Runner Token**. The Application Controller validates token scope, confirms worker authorization, assigns a pending **Job**, and returns a short-lived, job-scoped execution token.
5.  **Execution & Repository Cloning:** The **Job Worker** uses the job token to execute a gRPC clone request against the **Git RPC Service**, fetching source code at the specified commit `SHA`. The worker then executes configured build scripts and security scanning engines.
6.  **Finding Ingestion & Change Governance:** Vulnerability results generated during scanning are parsed and posted back to the Application Controller as **Finding** entities. Findings are automatically attached to the **Merge Request**, allowing reviewers and security teams to inspect vulnerabilities, enforce compliance rules, and evaluate approval blocks before merging code into protected repository branches.

---

## 4. Main Logical Integration & Data Flows

### 4.1 System Interaction Summary Table

| Flow Name | Triggering Event | Source -> Destination Components | Payload / Content | Execution Pattern (Synchronous vs. Asynchronous) |
| :--- | :--- | :--- | :--- | :--- |
| **Change Ingress & Pipeline Fan-Out** | Developer Git push or Merge Request submission | Client -> Front Door -> Application Controller -> System of Record DB -> Job Queue | Git packfiles, commit SHAs, author identity, `.gitlab-ci.yml` YAML payload | Asynchronous (Push receipt acknowledged synchronously; pipeline compilation and job fan-out queued asynchronously) |
| **Job Dispatch & Finding Ingestion** | Job Worker polls for execution tasks | Job Worker <-> Application Controller <-> Git RPC Service / Artifact Registry | Runner token, job payload, gRPC repo clone, build telemetry, JSON finding streams, binary blobs | Asynchronous (Worker polls via discrete HTTP calls; execution runs independently off-plane) |
| **Synchronous Git RPC Authorization Check Loop** | Inbound Git read/write operation over SSH or HTTP | Git RPC Service -> Application Controller Internal API (`/api/v4/internal/allowed`) -> Git RPC Service | User public key ID, project path, requested action (`git-upload-pack` or `git-receive-pack`), protocol | Synchronous Loopback (Hard blocking check before storage access is granted) |
| **AI Prompt & Grounding Flow** | User or IDE action requesting AI assistance | User Client / IDE -> Application Controller -> AI Gateway -> Model Runtime | Prompt text, contextual code snippets, user identity metadata, streamed model response completion | Synchronous / Streaming (Blocking or streaming HTTP connection maintained throughout inference) |

### 4.2 Detailed Sequence Tracing

#### Flow 1: Change Ingress & Pipeline Fan-Out Flow
```
User Client           Front Door         Application Controller     System of Record DB       Job Queue
    |                     |                        |                        |                     |
    |-- HTTPS/SSH Push -->|                        |                        |                     |
    |   (Git Packfile)    |-- REST/Internal Pass ->|                        |                     |
    |                     |   (Auth & Payload)     |-- Update Commits/MR -->|                     |
    |                     |                        |   (SQL Transaction)    |                     |
    |                     |                        |<-- Confirm State ------|                     |
    |                     |                        |                                              |
    |                     |                        |-- Enqueue Pipeline Fan-Out Tasks ----------->|
    |                     |                        |   (JSON Job Payloads)                        |
    |<-- Push Accepted ---|<-- Ack Receipt --------|                                              |
```
1.  **Ingress Handling:** A developer issues a Git push or updates a Merge Request. Connections terminate at the *HTTP Front Door* or *SSH Front Door* using HTTPS or SSH protocols.
2.  **Context Resolution:** The Front Door routes request parameters to the *Application Controller*, which validates user credentials against identity rules.
3.  **State Persistence:** The *Application Controller* updates commit pointers and Merge Request tracking states inside the *System of Record DB* via transactional SQL queries.
4.  **Configuration Parsing:** The *Application Controller* retrieves `.gitlab-ci.yml` file contents at the commit `SHA` via the *Git RPC Service*, compiling the pipeline stage dependency graph.
5.  **Asynchronous Job Fan-Out:** The *Application Controller* inserts discrete *Job* records into the *System of Record DB* and dispatches asynchronous job distribution tasks into the *Job Queue* (pushing job keys into the *Session & Cache Store* for worker retrieval).

#### Flow 2: Job Dispatch & Finding Ingestion Flow
```
Job Worker            Application Controller         Git RPC Service            Artifact Registry
    |                           |                           |                           |
    |-- HTTP REST Poll -------->|                           |                           |
    |   (Runner Token Hash)     |                           |                           |
    |<- Return Job Payload -----|                           |                           |
    |   (Scoped Job Token)      |                           |                           |
    |                           |                           |                           |
    |-- gRPC Stream Clone Request ------------------------->|                           |
    |   (Job Token Auth)        |<-- Synchronous Auth Check-|                           |
    |                           |    (/api/v4/internal)     |                           |
    |<-- gRPC Stream Git Packfile Data ---------------------|                           |
    |                           |                           |                           |
    | [Executes Scanners/Build] |                           |                           |
    |                           |                           |                           |
    |-- HTTP REST Post ---------|                           |                           |
    |   (Findings & Logs)       |                           |                           |
    |                           |                           |                           |
    |-- HTTP REST Push Binary Artifacts ----------------------------------------------->|
```
1.  **Worker Polling:** An isolated *Job Worker* initiates an HTTP REST polling request to the *Application Controller*, presenting a hashed *Runner Token*.
2.  **Payload Assignment:** The *Application Controller* validates token scope, claims a queued job from the *Session & Cache Store*, generates a short-lived execution job token, and returns the job specification (environment variables, container image targets, execution scripts) to the worker.
3.  **Code Fetching:** The *Job Worker* establishes a gRPC connection directly to the *Git RPC Service*, presenting the job token to stream repository objects at the targeted commit `SHA`.
4.  **Scanning Execution:** The worker pulls required scanning tools or container images, compiles code, and runs security analyzers (SAST, DAST, dependency analysis, secret detection).
5.  **Finding Ingestion:** Upon execution completion, the worker formats vulnerability results into structured JSON schemas, posting them back to the *Application Controller* via HTTP REST. The Application Controller parses findings and writes them to the *System of Record DB* (linking them to the *Merge Request*).
6.  **Artifact Offloading:** Compiled binary packages and container layers are uploaded over HTTP/REST directly from the *Job Worker* to the *Artifact Registry*.

#### Flow 3: Synchronous Git RPC Authorization Check Loop
```
Git RPC Service                 Application Controller Internal API
      |                                        |
      |-- Inbound gRPC Request Received -------|
      |   (User Key ID, Repo Path, Action)     |
      |                                        |
      |-- Synchronous HTTP REST Loopback ----->|
      |   GET /api/v4/internal/allowed         |
      |                                        |-- (Evaluates Permissions,
      |                                        |    IP Rules, Protected Branches
      |                                        |    in System of Record DB)
      |                                        |
      |<-- Synchronous JSON Response ----------|
      |    (Allowed: true/false, Key ID)       |
      |                                        |
      | [Process Stream or Abort Request]      |
```
1.  **Storage Interception:** The *Git RPC Service* receives a gRPC call from an ingress front-door component requesting repository object access (`git-upload-pack` for reads or `git-receive-pack` for writes).
2.  **Synchronous Loopback Initiation:** Before executing any POSIX disk operation or modifying Git objects, the *Git RPC Service* suspends execution and issues a synchronous HTTP REST call back to the *Application Controller Internal API* at `/api/v4/internal/allowed`.
3.  **Permission Evaluation:** The *Application Controller* inspects request parameters—checking user identity, SSH key signatures, project visibility levels, access control lists, and protected branch rules against the *System of Record DB*.
4.  **Authorization Response:** The Internal API returns a synchronous JSON response (`allowed: true` or `allowed: false`) alongside repository shard location metadata.
5.  **Stream Execution or Termination:** If authorized, the *Git RPC Service* executes the native Git storage operation and streams object packfiles back to the requester. If authorization is denied, the operation terminates immediately and emits an access error.

##### Operational Risk: Thread and Concurrency Dependencies
Under high Git concurrency (e.g., massive CI worker fan-out or enterprise push events), this loopback mechanism introduces severe operational risk. *Because every inbound Git RPC request requires a synchronous HTTP REST check against `/api/v4/internal/allowed`, each active Git stream temporarily locks worker and thread capacity on BOTH the Git RPC Service and the Application Controller simultaneously.* If web application thread pools (such as Puma worker threads) become saturated, the loopback endpoints experience high queue latency. This creates a cascade effect where Git RPC storage threads block while waiting for internal API approvals, rapidly causing thread starvation, connection pool exhaustion, and system 502/504 gateway failures across the entire Control Plane.

#### Flow 4: AI Prompt & Grounding Flow
```
User Client / IDE        Application Controller           AI Gateway             Model Endpoint
        |                          |                          |                        |
        |-- Prompts / Context ---->|                          |                        |
        |   (HTTPS REST/gRPC)      |-- Assemble Context ----->|                        |
        |                          |   (Files, Diffs, Policy) |                        |
        |                          |   (HTTPS / gRPC)         |-- Transmit Prompt ---->|
        |                          |                          |   (REST API Payload)   |
        |                          |                          |<-- Return Completion --|
        |                          |<-- Stream Completion ----|                        |
        |<-- Stream AI Response ---|    (HTTPS / gRPC)         |                        |
```
1.  **User Request Initiation:** A user triggers an AI capability (such as Duo Code Suggestions, Chat, or Merge Request Summarization) via the web interface or an integrated IDE extension over HTTPS/gRPC.
2.  **Context Grounding:** The *Application Controller* intercepts the request, retrieves local repository context (file contents, active diffs, issue descriptions, or error logs), sanitizes credentials, and appends identity metadata.
3.  **Gateway Routing:** The *Application Controller* routes the enriched contextual payload over HTTPS/gRPC to the *AI Gateway*.
4.  **Model Execution:** The *AI Gateway* parses the context window and forwards the prompt payload to the configured model runtime (either a vendor-managed cloud LLM or a customer-hosted local inference backend).
5.  **Streaming Response Delivery:** The generated model response streams back through the *AI Gateway* to the *Application Controller*, which validates response payload structure and streams the completion back to the client interface.

##### Agentic AI & Government Cloud Boundary Constraints
The platform strictly distinguishes between standard context-grounded AI requests (Code Suggestions, Chat, Summarization) and **Agentic AI Workflows** (e.g., Duo Agent Platform foundational agents executing autonomous SDLC tasks). *In high-compliance or government cloud boundaries (such as Dedicated for Government), agentic AI workflows and external agent orchestrations are strictly unauthorized and blocked at the Control Plane boundary.* In these regulated environments, AI capabilities must be completely isolated to self-hosted AI Gateways communicating exclusively with customer-managed, in-boundary model runtimes (such as Bedrock GovCloud or self-hosted vLLM endpoints).

---

## 5. Architectural Silence, Gaps, and Boundary Assumptions

### 5.1 Explicit Silence Register

| Architectural Area | Observed Silence / Missing Detail | Impact on Logical Modeling |
| :--- | :--- | :--- |
| **Front Door Traffic Control** | Rate-limiting algorithms, bucket depth parameters, and exact quota metrics at the logical front door (e.g., specific HTTP, REST, or SSH request-per-minute thresholds). | Prevents formal mathematical modeling of maximum burst capacity limits, denial-of-service throttling thresholds, and client queuing backpressure algorithms at the network edge. |
| **Cluster Agent Protocols** | Explicit payload schemas, transaction envelope structures, and micro-transaction message specifications for the Cluster Agent (KAS) inbound communication stream. | Leaves the precise logical data structures and state-machine transitions for Kubernetes pull-based GitOps deployment tracking partially undefined. |
| **AI Integration Timeouts** | Exact synchronous execution timeout thresholds, retry backoff metrics, and circuit-breaker trigger configurations for external AI model calls across commercial versus air-gapped/government variants. | Precludes deterministic timing analysis for prompt/completion blocking calls in latency-sensitive, air-gapped, or highly restricted network deployment environments. |
| **Slack / Teams Integration Boundaries** | Absence of formal specification defining whether third-party notification webhooks (e.g., Slack or Microsoft Teams) fall within Authorized FedRAMP Moderate cloud compliance boundaries. | Forces systems architects to treat external chat notification integrations as out-of-boundary, untrusted egress flows in regulated government deployments. |
| **Hosted FIPS Runner Availability** | Lack of definitive specification confirming whether cloud-hosted FIPS-validated runner SKUs exist natively within government cloud tenant boundaries. | Mandates the architectural assumption that government tenants must deploy and manage external, customer-hosted FIPS runner fleets outside the primary Control Plane boundary. |

### 5.2 Boundary Assumptions & Constraints

Enforced strictly by the underlying source context, the platform's logical architecture relies on the following structural assumptions and system constraints:

1.  **Job Plane Security Isolation Rule:** Job Workers process untrusted code and must remain logically and physically isolated from the Control Plane trust domain. Workers are strictly barred from holding direct network access to the System of Record DB (PostgreSQL), Session & Cache Store (Redis), or internal raw repository storage mounts.
2.  **Secret Scope and Rotation Constraint:** Runner Tokens and job execution tokens utilized by worker agents must be cryptographically hashed, scoped strictly to specific project/pipeline execution contexts, short-lived, and regularly rotated to prevent token-theft privilege escalation.
3.  **Mandatory Internal Auth Loopback:** The Git RPC Service cannot grant repository access autonomously. It must synchronously query the Application Controller Internal API (`/api/v4/internal/allowed`) for every Git read or write operation prior to processing POSIX storage requests.
4.  **Decoupled Repository Access:** Web application controllers are prohibited from mounting repository disks directly or invoking raw filesystem commands. All repository access must pass through encapsulated gRPC abstractions managed by the Git RPC Service.
5.  **Agentic AI & Government Cloud Boundary Rules:** On government cloud boundaries (such as Dedicated for Government), managed AI paths to external vendor LLMs and Duo Agent Platform foundational agent workflows are strictly unauthorized. AI integrations must be hard-isolated to self-hosted AI Gateways connected to approved in-boundary model runtimes.
6.  **Storage Topology Isolation Constraint:** While Self-Managed deployment architectures may employ virtual storage clustering using Praefect (Gitaly Cluster) for repository high-availability, Dedicated cloud offerings (including Dedicated for Government) explicitly mandate **Sharded Git RPC storage without Praefect**, distributing repositories across independent storage nodes without virtual cluster abstraction layers.