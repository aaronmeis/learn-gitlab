# Technical Integration Catalog: GitLab DevSecOps Platform Architecture

---

### 1. Document Overview and Scope

This catalog defines the technical integration surface of the GitLab DevSecOps Platform Architecture. It documents all interfaces, mechanisms, data flows, identity boundaries, and operational constraints across external, third-party, and neighbor systems that interact with the platform across its four distinct deployment models:

*   **GitLab.com**: Multi-tenant Software-as-a-Service (SaaS) operated by GitLab on commercial Amazon Web Services (AWS) infrastructure.
*   **Self-Managed**: Single-tenant or multi-node customer-operated deployment installed on customer-provided cloud or on-premises infrastructure (deployed via Omnibus packages or Cloud Native Hybrid Helm charts).
*   **Dedicated**: Single-tenant SaaS managed and hosted by GitLab, isolated in a dedicated customer AWS account and orchestrated via the Switchboard and Amp management control plane.
*   **Dedicated for Government**: Single-tenant SaaS managed and hosted by GitLab within AWS GovCloud US-West, operating under a FedRAMP Moderate Impact Level Authority to Operate (ATO Package ID: `FR2411959145`), sponsored by the General Services Administration (GSA).

The integration perimeter encompasses the core application control plane—comprising NGINX/GitLab Workhorse reverse proxies, GitLab Rails/Puma application servers, Sidekiq background job processing queues, PostgreSQL relational databases, Redis in-memory caches, Gitaly Git RPC storage nodes, and the Container/Package Registry. 

All statements, boundaries, and technical parameters in this catalog are grounded strictly in primary technical source documentation. Any enterprise integration category, protocol standard, or external tooling interface where source documentation provides no technical data is explicitly designated as `[SILENCE / UNDOCUMENTED IN SOURCES]`.

---

### 2. Comprehensive Inventory of External & Third-Party Integrations

| System / Tool Category | Vendor / Provider | Direction | Mechanism | Data Exchanged | Authentication & Authorization | Government-Cloud Support & Known Limits |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Agency / Enterprise Identity Providers** | Customer / Okta / Entra / Agency PIV | Inbound | Native Connector | SAML assertions, OIDC claims, user attributes, group memberships | Single Sign-On (SSO), SAML 2.0 / OIDC tokens, PIV/CAC smartcards via agency IdP handoff | Required on Dedicated for Government. PIV/CAC smartcard authentication must be enforced upstream by customer IdP. |
| **GitLab Runner Execution Plane** | Customer / GitLab | Both | Agent | Job payloads, signed short-lived Job Tokens, build logs, execution caches, repo clones, JSON security findings | Runner Registration Tokens (rotated), short-lived scope-bound Job Tokens (JWT) | Dedicated for Government requires customer self-managed FIPS runners deployed *outside* the tenant boundary. Hosted Gov runners are unauthorized. |
| **Kubernetes Clusters** | Customer / CNCF Ecosystem | Both | Agent | Deployment status, cluster metadata, GitOps pull synchronization payloads | Agent Tokens (KAS agent secret) | Agent binary deployment supported; explicit silence on Dedicated for Government KAS authorization package limits. |
| **AWS Cloud Infrastructure** | Amazon Web Services / GitLab | Inbound | Native Connector | Tenant compute, S3 object storage, managed database feeds, KMS encryption keys | GitLab IAM roles, AWS KMS Customer Managed Keys (BYOK) | AWS GovCloud US-West boundary for Dedicated for Government (FedRAMP Moderate ATO FR2411959145). |
| **Customer VPC & Private Infrastructure** | Customer (AWS) | Both | Native Connector | Git HTTP/SSH traffic, REST/GraphQL API queries, database/repository migration streams | AWS PrivateLink Endpoints, AWS IAM policies | Supported on Dedicated and Dedicated for Government for inbound/outbound private routing and Geo DR migrations. |
| **Managed AI Model Providers** | Anthropic, Fireworks/Mistral, Google, OpenAI | Outbound | Native Connector | Prompts, source code context (MRs, issues, pipelines), model completions | GitLab-to-Vendor TLS, Managed API Service Credentials | **Prohibited / Not Authorized** on Dedicated for Government. Managed AI Gateway path is restricted to commercial tenants. |
| **Self-Hosted / Customer-Managed AI Models** | Customer (vLLM, AWS Bedrock-Gov, Azure-Gov OpenAI) | Both | API | Prompts, local source code context, model completions | Customer-managed API Keys, IAM roles, Local Network Controls | Primary supported AI path for Self-Managed and Dedicated for Government. Offline license validation enforces zero telemetry to GitLab.com. |
| **FedRAMP Marketplace & Governance Oversight** | General Services Administration (GSA) | Outbound | Export | Security control evidence, continuous monitoring (ConMon) data, vulnerability reports | GSA / FedRAMP Governance Protocols | Governs Dedicated for Government under FedRAMP Moderate ATO FR2411959145 (GSA sponsored). |
| **Security Scanning Engine Images** | GitLab / Community (Semgrep, OWASP ZAP, Dependency-Check) | Inbound | Agent | Scanner engine binaries, vulnerability rule definitions, raw finding outputs | Container Image Pull authentication / Runner execution tokens | Scanners execute containerized inside CI/CD runner jobs; findings inject into Rails/PostgreSQL and S3 storage. |
| **Enterprise Collaboration / Webhooks** | Slack / Microsoft Teams | Outbound | Webhook | Event notifications (Merge Requests, pipeline statuses, issue updates) | Webhook App Tokens / Signed Endpoint URLs | Supported via outbound webhooks; explicit silence regarding FedRAMP Moderate / AWS GovCloud boundary authorization status. |

---

### 3. Detailed Architectural Integration Breakdowns

#### 3.1 Identity Providers & Access Control
Identity management establishes enterprise authentication handoffs, enforces session isolation, and implements baseline access controls across the platform.

*   **Federated Authentication & Upstream Hardware Handoff**: Single Sign-On (SSO) is established through standard SAML 2.0 and OpenID Connect (OIDC) protocols. On *Dedicated for Government*, agency PIV/CAC smartcard authentication is not processed by a native platform PIV stack; instead, authentication handoff occurs upstream by redirecting authentication requests to the customer-managed agency Identity Provider (IdP).
*   **Administrative Handoff & Admin Mode**: Initial tenant provisioning establishes a local root top-level administrator account. Once identity federation is established, day-to-day administrative activities transition to privileged user accounts provisioned through the external IdP. To protect elevated sessions against hijacking, the platform enforces **Admin Mode**, a security mechanism requiring privileged administrators to re-authenticate and explicitly elevate their active session before accessing the central Admin Area.
*   **FedRAMP Moderate & NIST Control Enforcement**:
    *   **AC-7 (Unsuccessful Login Attempts)**: Account lockout controls automatically lock local and top-level administrator accounts after 10 failed sign-in attempts. Accounts remain locked for a mandatory 10-minute duration or until explicitly unlocked by an administrator, aligning with NIST SP 800-63B guidelines.
    *   **IA-5 (Authenticator Management)**: Administratively or locally provisioned accounts are forced to change their password upon initial sign-in.
    *   **IA-2 (Two-Factor Authentication)**: Multi-Factor Authentication (MFA/2FA) is mandatory for top-level administrator accounts and recommended across all user accounts. Supported mechanisms include WebAuthn-compliant hardware security keys operating with FIPS-validated cryptographic modules.

#### 3.2 Compute, Execution Plane, and Network Connectivity
The platform architecture maintains a strict structural separation between the **Control Plane** (application logic, state orchestration, and system-of-record storage) and the **Job Plane** (workload execution).

```
+-----------------------------------------------------------------------------------+
|                        CONTROL PLANE (Tenant Boundary)                            |
|                                                                                   |
|   +-----------------------+       Git RPC        +----------------------------+   |
|   | GitLab Workhorse /    |--------------------->| Sharded Gitaly             |   |
|   | Rails (Puma / Sidekiq)|                      | (VM-Local Block Storage)   |   |
|   +-----------------------+                      +----------------------------+   |
|               |                                                                   |
|               | Relational State & Metadata Reads/Writes                          |
|               v                                                                   |
|   +-----------------------+       Object Uploads +----------------------------+   |
|   | PostgreSQL / Redis    |--------------------->| AWS S3 Object Storage      |   |
|   +-----------------------+                      +----------------------------+   |
+---------------+-------------------------------------------------------------------+
                |
                | HTTPS Job API (TCP 443 - Long-Polling, Scoped Job Tokens)
                v
+-----------------------------------------------------------------------------------+
|                     JOB PLANE (Customer Agency Estate)                            |
|                                                                                   |
|   +---------------------------------------------------------------------------+   |
|   | Customer Self-Managed FIPS Runner                                         |   |
|   | (Executes SAST/Semgrep, DAST/ZAP, Dependency-Check in Isolated Containers)|   |
|   +---------------------------------------------------------------------------+   |
+-----------------------------------------------------------------------------------+
```

*   **HTTPS Job API Execution Mechanics**: GitLab Runners operate on the job plane and communicate with the control plane over TCP port 443. Runners long-poll the GitLab Workhorse/Rails HTTPS Job API to request work. Upon job assignment, Workhorse issues a payload containing job scripts and a short-lived, scope-bound **Job Token** (JSON Web Token valid strictly for the job duration). The runner uses this Job Token to clone Git repositories via Git RPC (routed through Workhorse to Gitaly), pull container images, execute build/scan commands, and stream console logs and structured JSON artifacts back to the control plane via HTTP POST requests.
*   **Deployment Model Topology & Gitaly Distinction**:
    *   *Self-Managed High Availability*: High Availability (HA) deployments can utilize *Gitaly Clusters with Praefect* on virtual machines (which must be kept off Kubernetes cluster worker nodes in Cloud Native Hybrid architectures).
    *   *Commercial Dedicated*: Uses **sharded Gitaly** (virtual machine local disks without Praefect). Supports optional hosted runners operated by GitLab in a separate, interconnected AWS cloud account, alongside customer-managed runners.
    *   *Dedicated for Government*: Exclusively uses **sharded Gitaly** (virtual machine local disks without Praefect). Hosted runners inside the GitLab-managed AWS GovCloud tenant are **not authorized**. Customer self-managed FIPS-validated runners must be deployed and operated entirely *outside* the tenant boundary within the agency's private estate.
*   **Network Transport Controls & AWS PrivateLink**:
    *   **Inbound PrivateLink**: Establishes private network endpoints from the customer's Virtual Private Cloud (VPC) into the isolated tenant VPC, routing Git HTTP/SSH operations and web UI traffic without public internet exposure.
    *   **Outbound PrivateLink**: Enables the tenant control plane to initiate outbound connections to private agency resources (such as self-hosted AI Gateways or enterprise logging targets).
    *   **Migration Topology**: AWS PrivateLink is utilized during Geo-based disaster recovery migrations to establish secure database replication and repository synchronization channels when migrating workloads into a Dedicated instance.

#### 3.3 Artificial Intelligence & LLM Runtime Paths
Generative AI processing is architected through two mutually exclusive data paths, enforcing isolation between commercial SaaS models and government compliance perimeters.

| Architectural Dimension | Managed AI Gateway Path | Self-Hosted AI Gateway Path |
| :--- | :--- | :--- |
| **Hosting Model** | Multi-tenant SaaS AI Gateway operated on GitLab.com commercial infrastructure. | Customer-operated AI Gateway deployed locally within the customer security perimeter. |
| **Model Runtime Infrastructure** | Commercial third-party LLM vendors (e.g., Anthropic Claude Sonnet, Codestral, Google Gemini, OpenAI). | Customer-managed runtimes (e.g., local vLLM, AWS Bedrock-Gov, Azure-Gov OpenAI). |
| **Context & Data Path** | Transmits source code snippets, MR diffs, issue context, and pipeline state out to external vendor endpoints. | Routes prompts and context strictly to local or government-cloud model endpoints over private networks. |
| **Dedicated for Government Authorization** | **NOT AUTHORIZED**. Strictly prohibited on government single-tenant instances. | **SUPPORTED**. The required deployment model for Dedicated for Government and air-gapped Self-Managed. |
| **Data Control Baseline** | Governed by vendor legal/privacy terms; offline license validation enforced on self-hosted paths to block outbound calls. | Absolute customer control; model invocation and prompts remain within the agency-approved compliance boundary. |

*   **Duo Agent Platform Exclusions**: Foundational agent execution flows, agentic orchestration loops, and third-party external agent integrations under the *GitLab Duo Agent Platform* are **not authorized** under the Dedicated for Government FedRAMP Moderate baseline.

#### 3.4 Application Security, Scanners, and Supply Chain Tools
Application security testing features execute containerized scanner binaries inside the CI/CD pipeline job plane, feeding structured findings directly into the control plane storage layer.

```
+---------------+      +---------------+      +---------------+      +---------------+      +---------------+
|   1. DETECT   | ---> |   2. TRIAGE   | ---> |  3. ANALYZE   | ---> | 4. REMEDIATE  | ---> |  5. OPTIMIZE  |
+---------------+      +---------------+      +---------------+      +---------------+      +---------------+
 SAST, DAST, SBOM,      Findings parsed        Severity/vector        Branch code fix        Policy tuning,
 Scorecards run in      into MR & DB /         assessed in central    auto-resolves finding  false-positive
 runner job plane       S3 storage             vulnerability dashboard on re-execution        rule reduction
```

1.  **Detect**: Containerized scanner images execute inside CI/CD runner jobs on the job plane:
    *   *Static Application Security Testing (SAST)*: Uses engines such as **Semgrep** to parse source code for pattern-based security weaknesses.
    *   *Dynamic Application Security Testing (DAST)*: Employs tools such as **OWASP ZAP** to conduct automated penetration testing and HTTP fault injection against deployed staging environments.
    *   *Software Bill of Materials (SBOM) & Dependency Scanning*: Integrates engines such as **Dependency-Check** to analyze third-party libraries, generate SBOM structures, and match dependencies against the GitLab Advisory Database.
    *   *Supply Chain Integrity*: Incorporates **SLSA scorecards** and container scanning images to verify build provenance, base image vulnerabilities, and software supply chain posture.
2.  **Triage**: Scanning outputs are generated as standardized JSON reports. The runner uploads these raw JSON artifacts and SBOM files over HTTPS via Workhorse. Rails and Sidekiq background workers process the reports, writing structured finding metadata into the **PostgreSQL** relational database (for finding lifecycle tracking) and storing raw artifact reports in **AWS S3 object storage**. Findings inject directly into the Merge Request UI and central vulnerability dashboards.
3.  **Analyze**: Security teams review findings within the central vulnerability report, evaluating severity scores, vulnerability vectors, and location metadata without leaving the platform.
4.  **Remediate**: Developers apply code fixes directly within topic branches. Re-execution of the CI/CD pipeline automatically verifies the fix and transitions the finding status to resolved in PostgreSQL.
5.  **Optimize**: Security administrators tune compliance policies, scanner rule packs, and execution parameters to reduce false positives across subsequent development cycles.

---

### 4. Analysis of Undocumented, Mentioned, and Silent Integration Surfaces

Where enterprise integration expectations exceed documented product capabilities, the technical source ledger establishes specific boundaries. The following categories denote areas where technical sources maintain formal silence or lack architectural specifications:

*   **SIEM and SOAR Platforms** `[SILENCE / UNDOCUMENTED IN SOURCES]`
    *   While tenant application logs can be consumed by requesting access to underlying AWS S3 log storage buckets, primary technical sources maintain **explicit silence** regarding native SIEM/SOAR connectors, real-time log-streaming sidecars, or pre-built audit export endpoints for platforms like Splunk or Elastic SIEM.
*   **ITSM and Ticketing Systems** `[SILENCE / UNDOCUMENTED IN SOURCES]`
    *   While generic references to external issue tracking platforms (such as Jira) appear in high-level contextual summaries, native, bi-directional Information Technology Service Management (ITSM) workflows (e.g., automated ServiceNow change-request gating or real-time ticket synchronization APIs) are **undocumented in technical sources**.
*   **On-Premises File Shares and External Databases** `[SILENCE / UNDOCUMENTED IN SOURCES]`
    *   Git repository storage is managed strictly via virtual machine local block storage handled by **sharded Gitaly** (on Dedicated and Dedicated for Government) or **Gitaly Clusters using Praefect** (on Self-Managed). Primary sources maintain **explicit silence** on mounting direct NFS/SMB network file shares to application nodes. Furthermore, external, non-bundled database engines (such as Oracle Database or Microsoft SQL Server) are unsupported; the platform relies exclusively on bundled PostgreSQL and Redis instances.
*   **Endpoint & EDR Integrations** `[SILENCE / UNDOCUMENTED IN SOURCES]`
    *   Primary technical documents contain **no architectural specifications** or connector APIs for deploying host-level Endpoint Detection and Response (EDR) agents, security monitoring daemons, or telemetry hooks inside GitLab-managed tenant virtual machines.
*   **Complementary / Competing Governance and Privacy Tools** `[SILENCE / UNDOCUMENTED IN SOURCES]`
    *   While continuous monitoring (ConMon) data exports support FedRAMP compliance oversight, native integration interfaces for third-party enterprise privacy suites or external governance platforms are **undocumented in sources**.
*   **ChatOps & Messaging Authorization Boundaries** `[SILENCE / UNDOCUMENTED IN SOURCES]`
    *   Outbound notification webhooks to platforms such as Slack and Microsoft Teams are natively supported. However, technical documentation maintains **explicit silence** regarding the compliance authorization status of these messaging endpoints within FedRAMP Moderate or AWS GovCloud isolation boundaries.

---

### 5. Government-Cloud (FedRAMP Moderate / AWS GovCloud) Boundary Summary

**GitLab Dedicated for Government** operates under a FedRAMP Moderate Impact Level ATO (Package ID: `FR2411959145`), sponsored by the GSA. Its architectural topology defines exact physical and logical boundaries between the provider-managed cloud tenant and the customer agency estate.

```
+----------------------------------------------------------------------------------+
|                    FEDRAMP MODERATE BOUNDARY (FR2411959145)                      |
|                     AWS GovCloud US-West (GitLab-Operated)                       |
|                                                                                  |
|  +----------------------------------------------------------------------------+  |
|  | Dedicated AWS Cloud Account (Single-Tenant Isolation)                       |  |
|  |                                                                            |  |
|  |  +----------------------------------------------------------------------+  |  |
|  |  | Control Plane Stack                                                  |  |  |
|  |  | (Puma/Rails, Workhorse, Sidekiq, PostgreSQL, Redis, Registry)        |  |  |
|  |  +----------------------------------------------------------------------+  |  |
|  |  | Storage Plane                                                        |  |  |
|  |  | (Sharded Gitaly on VM Local Disks - No Praefect)                     |  |  |
|  |  +----------------------------------------------------------------------+  |  |
|  +----------------------------------------------------------------------------+  |
+----------------------------------------^-----------------------------------------+
                                         |
                                         | Inbound / Outbound AWS PrivateLink
                                         |
+----------------------------------------v-----------------------------------------+
|                               AGENCY ESTATE                                      |
|                                                                                  |
|  +---------------------------+   +------------------------+   +---------------+  |
|  | Agency Identity Provider  |   | Self-Managed Runners   |   | Self-Hosted   |  |
|  | (SAML/OIDC, Upstream      |   | (FIPS-Validated,       |   | AI Gateway    |  |
|  |  PIV/CAC Smartcards)      |   |  Off-Box Execution)    |   | (vLLM/Bedrock)|  |
|  +---------------------------+   +------------------------+   +---------------+  |
+----------------------------------------------------------------------------------+
```

#### Inside the Tenant Boundary (GitLab-Operated AWS GovCloud)
*   **Isolated Cloud Compute**: Dedicated single-tenant AWS account inside AWS GovCloud US-West, orchestrated via GitLab's Switchboard and Amp control plane.
*   **Control Plane Stack**: Stateless GitLab Rails/Puma app servers, Sidekiq background job queues, GitLab Workhorse HTTP reverse proxies, Redis cache nodes, and primary PostgreSQL databases.
*   **Storage Plane**: Sharded Gitaly storage nodes operating on VM-local block storage (Praefect cluster topology is not deployed on Dedicated offerings).
*   **Data Encryption**: All data encrypted at rest and in transit. Supports Customer-Managed Keys (BYOK) via AWS Key Management Service (KMS).
*   **Operational Personnel**: Infrastructure and platform operations restricted exclusively to vetted U.S. Citizens.

#### Outside the Tenant Boundary (Agency-Operated Estate)
*   **Agency Identity Provider**: SAML 2.0 / OIDC Identity Provider handling primary authentication, user lifecycle policies, and physical PIV/CAC card verification.
*   **Execution Plane (Runners)**: Customer-managed, FIPS-compliant GitLab Runners operating on agency infrastructure outside the AWS GovCloud tenant boundary.
*   **Network Perimeter**: Agency VPCs and internal networks connected via AWS PrivateLink endpoints.
*   **Local AI Runtimes**: Customer-hosted AI Gateways and LLM endpoints (e.g., local vLLM, AWS Bedrock-Gov).

#### Upper Regulatory Boundary Limits & Explicit Exclusions
1.  **GitLab-Managed Hosted Runners**: Hosted runners inside the tenant are unavailable and **unauthorized**; all CI/CD execution must occur on customer-hosted runners outside the tenant.
2.  **GitLab-Managed AI Gateway**: Multi-tenant AI Gateway routing to commercial vendor LLMs (Anthropic, OpenAI, Google) is **strictly prohibited**.
3.  **Duo Agent Platform Flows**: Foundational agent flows, agentic orchestration loops, and third-party agent tools under the GitLab Duo Agent Platform are **unauthorized** under the FedRAMP Moderate baseline.
4.  **Higher Classification Impact Levels**: DoD Impact Levels 5 and 6 (IL5/IL6), SECRET / TOP SECRET classified workloads, and fully air-gapped federal networks are **not supported** by Dedicated for Government today (such workloads require customer-managed *Self-Managed* deployments operating on agency-authorized infrastructure).