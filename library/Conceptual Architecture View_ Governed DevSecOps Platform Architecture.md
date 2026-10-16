# Conceptual Architecture View: Governed DevSecOps Platform Architecture

### 1. Problem Statement & Platform Purpose

Operational friction in enterprise software delivery stems primarily from fragmented systems of record. Source code, pipeline execution configurations, automated security scanning findings, and deployment evidence frequently reside in disconnected tools. This fragmentation prevents stakeholders from establishing a single, verifiable chain of custody for software changes. Without a unified system of record, validating compliance and security posture requires manual cross-tool reconciliation, which increases cycle times and introduces significant auditing blind spots.

Architectural risk is further compounded by trust domain confusion between the application control plane and the job execution plane. When untrusted user code or build scripts execute on machines that lack strict structural boundary isolation from administrative control services, platform integrity is compromised. When these boundaries are absent or blurred, specific operational actors directly suffer: code **Reviewers** are forced to make approval decisions without unified, in-context security scan evidence, while **Authorizing Officials** cannot verify the execution boundaries of job execution workers or state with confidence which machines compiled and packaged operational software.

To resolve these operational and architectural failures, the conceptual architecture establishes an integrated operating model that unites development, security, and operational governance within an explicit trust boundary.

> **Core Platform Purpose:** Establishing a single, fully governed change path from initial human intent to running software, backed by a unified system of record for source code, pipeline evidence, and security findings across explicit control and job execution boundaries.

---

### 2. Operational Actors & Goals

The platform defines explicit roles and trust levels for human and system actors to ensure proper segregation of duties and secure operation across trust boundaries.

| Actor | Role | Operational Goal | Trust Level |
| :--- | :--- | :--- | :--- |
| **Developer** | Produces software changes | Land a reviewed, tested, and compliant software change. | Low until peer review and automated policy validation are complete. |
| **Reviewer** | Approves proposed changes | Verify code quality, test results, and security findings on a unified record prior to approval. | Medium; authorized to approve changes within assigned projects. |
| **Security** | Sets scan and compliance policy | Enforce global scanning policies and ensure findings cannot be bypassed or waived locally. | High regarding policy definition; low regarding direct source code execution. |
| **Platform Operator** | Maintains the control plane | Ensure platform availability, system backups, database integrity, and identity integrations. | High within the administrative control plane tenant boundary. |
| **Job Operator** | Manages execution infrastructure | Provision, patch, and rotate credentials for isolated worker machines executing pipeline jobs. | High within worker execution boundary; isolated from control plane administration. |
| **Identity Provider** | Authenticates user identities | Assert identity assertions, single sign-on (SSO), and hardware token compliance (e.g., PIV/CAC). | High; external authority for identity verification. |
| **Authorizing Official** | Accepts operational residual risk | Issue formal accreditation and authorization letters based on compliance evidence. | Highest; ultimate authority for organizational platform usage. |
| **Auditor** | Evaluates compliance evidence | Reconstruct change histories, pipeline executions, and gate approvals independently. | Independent; read-only access across change records and evidence logs. |

---

### 3. Capability Architecture Taxonomy

The conceptual architecture delivers nine core capabilities (C1 through C9) that form the foundation of a governed DevSecOps platform.

1. **C1. Change Record**
   * **Core Function:** Provides a unified logical record that holds source code diffs, peer discussions, pipeline links, and policy gate results.
   * **Delivered Outcome:** Consolidates source changes and review approvals into a single, traceable object for auditability.
   * **Primary Actors:** Developer, Reviewer.

2. **C2. Pipeline Contract**
   * **Core Function:** Enforces a declared sequence of build, test, and security scanning jobs defined in repository configuration files.
   * **Delivered Outcome:** Guarantees predictable, automated, and policy-driven execution for every submitted change.
   * **Primary Actors:** Developer, Job Operator.

3. **C3. Job Execution**
   * **Core Function:** Runs untrusted compilation, testing, and scanning workloads on dedicated execution workers isolated from the administrative control plane.
   * **Delivered Outcome:** Protects control plane databases and management interfaces from unauthorized access during workload execution.
   * **Primary Actors:** Job Operator.

4. **C4. Finding Record**
   * **Core Function:** Aggregates static, dynamic, dependency, and container security scan results directly into the active change record.
   * **Delivered Outcome:** Delivers immediate security feedback to developers and reviewers before code is merged.
   * **Primary Actors:** Security, Reviewer.

5. **C5. Artifact Store**
   * **Core Function:** Manages versioned storage for binary artifacts, container images, and software packages tied directly to generating pipelines.
   * **Delivered Outcome:** Establishes a verifiable chain of custody from source repository commits to deployable software packages.
   * **Primary Actors:** Developer, Job Operator.

6. **C6. Git Storage**
   * **Core Function:** Serves and manages version control history through dedicated Remote Procedure Call (RPC) services rather than direct application disk access.
   * **Delivered Outcome:** Ensures repository data integrity, abstraction, and high-availability storage management.
   * **Primary Actors:** Platform Operator.

7. **C7. Offering Choice**
   * **Core Function:** Provides identical underlying platform capabilities across distinct deployment operational models and impact levels.
   * **Delivered Outcome:** Enables organizations to align operational control and regulatory compliance requirements without altering core workflow capabilities.
   * **Primary Actors:** Authorizing Official, Platform Operator.

8. **C8. Identity Handoff**
   * **Core Function:** Delegates user authentication and hardware token assertion to enterprise identity infrastructure.
   * **Delivered Outcome:** Enforces centralized access control, single sign-on, and regulatory identity compliance.
   * **Primary Actors:** Identity Provider.

9. **C9. AI Assistance**
   * **Core Function:** Delivers context-aware assistance across the software lifecycle via governed data paths and explicit trust boundaries.
   * **Delivered Outcome:** Enhances engineering productivity while restricting AI model training and data transmission based on organizational governance rules.
   * **Primary Actors:** Platform Operator, Authorizing Official.

#### Enterprise Architecture Framework Mapping

To support formal enterprise architecture governance, the conceptual capabilities map directly to standardized frameworks including TOGAF ADM phases and DoDAF viewpoints:

| Conceptual Capability | TOGAF ADM Alignment | DoDAF Viewpoint Mapping |
| :--- | :--- | :--- |
| **C1. Change Record** | Architecture Vision (Phase A), Business Architecture (Phase B) | OV-1 High-Level Operational Concept, DIV-1 Conceptual Data Model |
| **C2. Pipeline Contract** | Business Architecture (Phase B), Information Systems (Phase C) | OV-5b Operational Activity Model, CV-2 Capability Taxonomy |
| **C3. Job Execution** | Information Systems (Phase C), Technology Architecture (Phase D) | SV-1 Systems Interface Description, OV-2 Operational Resource Flow |
| **C4. Finding Record** | Business Architecture (Phase B), Information Systems (Phase C) | OV-6c State Transition Description, DIV-1 Conceptual Data Model |
| **C5. Artifact Store** | Information Systems Architecture (Phase C: Data) | DIV-2 Logical Data Model, SV-4 Systems Functionality |
| **C6. Git Storage** | Information Systems Architecture (Phase C: Data/App) | SV-1 Systems Interface Description, DIV-1 Conceptual Data Model |
| **C7. Offering Choice** | Architecture Vision (Phase A), Opportunities & Solutions (Phase E) | CV-2 Capability Taxonomy, StdV-1 Standards Profile |
| **C8. Identity Handoff** | Business Architecture (Phase B), Security Architecture | OV-2 Operational Resource Flow, SV-6 Systems Resource Flow |
| **C9. AI Assistance** | Architecture Vision (Phase A), Architecture Governance | CV-2 Capability Taxonomy, OV-3 Operational Resource Flow |

---

### 4. Key Concepts & Conceptual Data Entity Relationships

The platform domain is structured around core conceptual data entities that govern the software lifecycle from initial intent to deployment.

#### Conceptual Entity Definitions

| Concept / Entity | Conceptual Definition & Structural Relationship |
| :--- | :--- |
| **Offering Type** | The operational deployment configuration defining platform ownership boundaries, tenant isolation mechanisms, and regulatory compliance impact levels. Defines the boundary within which Change Records and Pipeline Contracts operate. |
| **Authorization Letter** | The formal accreditation document granted by an Authorizing Official accepting residual operational risk for a specific Offering Type deployment. |
| **Change Record** | The primary unit of change approval. Contains repository diffs, peer discussion threads, pipeline execution statuses, and aggregated security findings. Linked to a Project and triggers a Pipeline Contract. |
| **Pipeline Contract** | The declarative configuration specifying the stages, jobs, and execution environment required to validate a change. Instantiated by a Change Record and dispatches Executable Jobs. |
| **Executable Job** | A discrete execution unit defined within a Pipeline Contract. Dispatched to a worker in the Job Plane using a scoped authentication token; writes back execution logs, findings, and artifacts. |
| **Security Finding** | A normalized vulnerability record generated by security scanning tools during job execution. Attached to the Change Record and evaluated against Security policy rules. |
| **Artifact Store** | A versioned repository for build binaries, container images, and software packages produced by an Executable Job. Linked to the generating Pipeline Contract and Change Record. |
| **Control / Job Planes** | The architectural boundary separating platform management, application logic, and system-of-record storage (Control Plane) from untrusted pipeline script execution machines (Job Plane). |

#### Lifecycle Narrative of a Governed Change

1. **Compliance Boundary Establishment & Intent Submission:** Prior to code entry, the enterprise baseline is established when an Authorizing Official issues an `Authorization Letter` accrediting a specific `Offering Type` for a targeted regulatory impact level. Within this established compliance boundary, a Developer creates a change proposal, instantiating a `Change Record`. This record references a specific source code diff within the Git Storage layer and triggers an initial identity assertion check against the `Identity Provider`.
2. **Pipeline Contract Evaluation:** The Control Plane evaluates the project's repository configuration file to construct a `Pipeline Contract`. The contract breaks the pipeline down into discrete, ordered stages (e.g., build, test, scan) containing individual `Executable Jobs`.
3. **Job Plane Dispatch & Execution:** The Control Plane registers the `Executable Jobs` and issues short-lived, scoped execution tokens. Workers residing in the isolated Job Plane poll for work over secure outbound channels, retrieve job payloads, execute the required build scripts or scanners, and push generated outputs back across the trust boundary.
4. **Finding & Artifact Aggregation:** As `Executable Jobs` complete, worker agents upload compiled packages to the `Artifact Store` and write normalized `Security Finding` entries back to the Control Plane. These findings automatically populate directly within the active `Change Record`.
5. **Review and Policy Enforcement:** The Reviewer evaluates the `Change Record`, reviewing peer discussion threads, automated pipeline statuses, and integrated `Security Finding` entries. Security policies managed in the Control Plane evaluate finding severities to determine whether issues block the merge path or require formal risk waivers.
6. **Authorization and Merge:** Once all pipeline contract gates pass and required reviewer approvals are captured, the `Change Record` is merged into the primary repository branch, generating an immutable audit entry verified against the operational `Authorization Letter`.

---

### 5. Conceptual Operational Model: Control Plane vs. Job Plane

The platform maintains an explicit structural boundary between administrative management services (Control Plane) and arbitrary code execution environments (Job Execution Plane). This separation prevents untrusted workloads from accessing underlying administrative databases or central platform state.

* **Organization Boundary**
  * Human actors (Developers, Reviewers, Security) authenticate against the external Identity Provider using enterprise credentials and hardware tokens (e.g., PIV/CAC).
  * Developers send change intent (version control pushes, change record creations) across the boundary into the Control Plane.
  * Security managers define global compliance policies and required scanner configurations within the Control Plane.

* **Control Plane (System of Record & Management Domain)**
  * **Front Door & Routing Layer:** Authenticates incoming traffic, terminates external TLS connections, and routes web requests and Git RPC calls to internal application services.
  * **Application Core:** Manages project permissions, Change Records, approval workflows, and Security Finding aggregations. Maintains central database state and relational change records.
  * **Git Storage Layer:** Manages repository version histories on dedicated storage media, serving raw Git data exclusively through remote procedure calls (RPC). Abstracting version control behind an RPC service decouples web and application processing servers from direct file-system disk access, completely eliminating local disk coupling and enforcing centralized data access policies.
  * **Job Queue Service:** Receives execution requests from the application core, generates short-lived runner job tokens, and queues Executable Job payloads for retrieval.

* **Job Execution Plane (Worker & Task Execution Domain)**
  * **Worker Nodes:** Isolated physical or virtual execution environments running dedicated worker agents. Workers exist in a distinct trust domain completely separated from the Control Plane.
  * **Payload Retrieval:** Worker agents poll the Control Plane's job queue over secure outbound connections (HTTPS), acquiring queued job payloads and temporary job execution tokens.
  * **Isolated Execution:** Workers clone repository code, download designated execution container images, and execute build scripts, unit tests, and security tools locally within their execution boundary.
  * **Feedback Flow:**
    * **Scan Findings & Logs:** Worker agents stream real-time execution logs and structured scan results back to the Control Plane application core to populate the active Change Record.
    * **Artifact Uploads:** Built packages, container layers, and binaries are uploaded directly from the worker to the Artifact Store.
  * **Token Revocation & Trust Boundary Protection:** Upon job completion or execution timeout, the temporary job token is invalidated, revoking the worker's access to Control Plane endpoints. Limiting worker token scope ensures that even if a worker node is exploited or compromised during arbitrary code execution, the attacker cannot escalate privileges into a Control Plane compromise or gain administrative access to the central System of Record database.

---

### 6. Capability-to-Source Mapping & Silence Register

#### Capability Traceability Matrix

| Capability ID | Capability Name | Supporting Source Anchor(s) | Evidence Summary |
| :--- | :--- | :--- | :--- |
| **C1** | Change Record | `01-mindmap.md`, `20-view-01-conceptual.md` | Single system of record combining source diffs, peer discussions, and pipeline gate results into a unified logical object. |
| **C2** | Pipeline Contract | `01-mindmap.md`, `20-view-01-conceptual.md`, `Get started with GitLab CI/CD` | Standardized execution sequence defining stages, jobs, scripts, and variables via repository configuration files. |
| **C3** | Job Execution | `01-mindmap.md`, `20-view-01-conceptual.md`, `03-source-ledger.md` [S3] | Structural isolation of untrusted build workloads onto dedicated workers distinct from administrative control services. |
| **C4** | Finding Record | `20-view-01-conceptual.md`, `Application security testing` | Automated security scanning embedded into execution pipelines, writing normalized findings directly into active change records. |
| **C5** | Artifact Store | `01-mindmap.md`, `20-view-01-conceptual.md` | Versioned storage for built packages, binaries, and container images linked directly to generating source code repositories. |
| **C6** | Git Storage | `01-mindmap.md`, `20-view-01-conceptual.md`, `03-source-ledger.md` [S5] | Abstraction of repository version control access behind dedicated RPC services to prevent application servers from directly opening repository disks. |
| **C7** | Offering Choice | `01-mindmap.md`, `20-view-01-conceptual.md`, `GitLab Dedicated architecture` | Consistent software capabilities delivered across multi-tenant SaaS, self-managed, dedicated tenant, and government cloud deployment choices. |
| **C8** | Identity Handoff | `20-view-01-conceptual.md`, `Dedicated for Government shared responsibility` | User authentication delegated to external organizational IdPs supporting SAML, OIDC, and mandatory hardware tokens (PIV/CAC). |
| **C9** | AI Assistance | `01-mindmap.md`, `20-view-01-conceptual.md`, `20-view-04-integration-ai.md` | Context-aware developmental assistance delivered via managed or self-hosted gateway model paths with strict data flow boundaries. |

#### Architectural Silence & Unresolved Questions

* **[SOURCE SILENCE]** **Job Plane Operator Assignment Across Regulatory Boundaries:** The source context is explicitly silent regarding who operates the job execution plane across different regulatory impact levels (e.g., distinguishing platform provider hosting from customer self-managed worker execution across high-impact boundaries).
* **[SOURCE SILENCE]** **Agent Platform / External Agent Authorization:** The sources detail self-hosted and managed AI data paths but remain silent on whether automated agent platform flows or external third-party collaboration webhooks (e.g., chat/messaging integrations) are formally authorized within high-impact government compliance boundaries.
* **[SOURCE SILENCE]** **Hosted FIPS Runner Availability:** Source material notes that self-managed FIPS execution workers are required outside high-impact tenant boundaries, but is silent on whether hosted, provider-managed FIPS-compliant execution workers are available or supported.
* **[SOURCE SILENCE]** **AI Model Provider Data Retention:** The sources detail self-hosted AI gateway options but remain silent on exact data payload retention, logging policies, and model training protections enforced by third-party model providers on the public managed execution path.
* **[SOURCE SILENCE]** **External Integration Protocol Authorization:** The sources do not define explicit protocol specifications or authorization boundaries for integrating external third-party webhooks within single-tenant government boundaries.
* **[SOURCE SILENCE]** **Agency Residual Risk Acceptance Templates:** The source text notes that vendor cloud authorization package listings (e.g., FedRAMP Marketplace listings) do not automatically constitute an agency-specific Authorization to Operate (ATO), but is silent on the standardized template or procedure required for agency-level residual risk acceptance.
* **[SOURCE SILENCE]** **Multi-Tenant vs. Single-Tenant Performance Benchmarks:** Peer-reviewed benchmark data comparing system performance and resource overhead across multi-tenant and single-tenant operational models under identical user transaction loads is absent from the provided source context.