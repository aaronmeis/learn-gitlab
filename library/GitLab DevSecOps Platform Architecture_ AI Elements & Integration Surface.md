# GitLab DevSecOps Platform Architecture: AI Elements & Integration Surface

---

### 1. AI Architecture & Copilot Features

#### 1.1 Copilot Feature Catalog & Data Read/Write Profiles

The platform incorporates artificial intelligence features across its development and security workflow via GitLab Duo and the Duo Agent Platform. The operational capabilities, input context requirements, output destinations, and availability across platform deployment models are detailed in the inventory below.

| Feature Name & Tier Requirement | Context Read (Inputs) | Data Written (Outputs) | Offering Availability |
| :--- | :--- | :--- | :--- |
| **Code Suggestions**<br>*(Duo Core / Pro / Enterprise)* | Source code files, repository context, open file tabs in IDE | In-line code completions and code block generations | GitLab.com, Self-Managed (default), Dedicated Commercial.<br>*Note: Also available on Dedicated for Government and air-gapped Self-Managed when configured via the Self-Hosted AI Gateway under an offline licensing model.* |
| **GitLab Duo Chat**<br>*(Duo Core / Pro / Enterprise)* | File content, Merge Request (MR) diffs, issue descriptions, pipeline failure logs | Conversational responses, code refactoring explanations, vulnerability summaries | GitLab.com, Self-Managed (default), Dedicated Commercial.<br>*Note: Also available on Dedicated for Government and air-gapped Self-Managed when configured via the Self-Hosted AI Gateway under an offline licensing model.* |
| **Merge Request Summary**<br>*(Duo Core / Pro / Enterprise)* | MR diffs, commit history, linked issue descriptions | Generated MR description text and change summaries | GitLab.com, Self-Managed (default), Dedicated Commercial.<br>*Note: Also available on Dedicated for Government and air-gapped Self-Managed when configured via the Self-Hosted AI Gateway under an offline licensing model.* |
| **Duo Agent Platform Foundational Agents**<br>*(Premium / Ultimate with Duo)* | Broader Software Development Lifecycle (SDLC) context, project metadata, repository trees, issue threads | Automated task execution outputs, code edits, orchestration steps | Managed or Self-Hosted AI Gateway; **Not Authorized** on Dedicated for Government under its FedRAMP Moderate boundary. |

---

#### 1.2 Grounding Paths & Model Execution Runtimes

GitLab Duo relies on two primary data routing architectures to ground AI interactions in repository context, along with an instance-local execution mode for IDE tooling.

*   **GitLab-Managed AI Gateway Path**:
    *   This default architecture routes requests from the user application or IDE client through the application layer to the GitLab-managed AI Gateway.
    *   The gateway formats and passes prompts to external third-party vendor Large Language Models (LLMs), including the Anthropic Claude Sonnet family, Codestral, Fireworks/Mistral, Google Gemini, and OpenAI.
    *   This path serves as the baseline for GitLab.com, Self-Managed default configurations, and Dedicated Commercial environments.

*   **Self-Hosted AI Gateway Path**:
    *   Designed for strict regulatory and network isolation, this architecture deploys a customer-operated AI Gateway directly within the customer's authorization boundary.
    *   Prompts are processed locally and routed to customer-managed or cloud-allocated model runtimes (such as vLLM, AWS Bedrock-gov, or Azure-gov OpenAI).
    *   This path is required for air-gapped Self-Managed installations and Dedicated for Government environments where offline licensing applies, ensuring that no prompts or code context cross the tenant boundary to GitLab-managed AI infrastructure.

*   **Local Model Control (MCP Server)**:
    *   For IDE and local developer tooling, the platform supports integration via a local Model Context Protocol (MCP) server.
    *   Operating directly on the developer workstation or Self-Managed instance, this server processes tool requests locally. Context and execution payloads remain entirely within the local runtime, ensuring no data is transmitted to GitLab.com when MCP is operated locally.

---

#### 1.3 Governance, Access Controls & Security Boundaries

*   **Identity & Access Governance**:
    AI grounding requests enforce the user’s active authorization profile. When an AI feature reads repository context (such as files, MRs, or pipeline logs), permission checks verify the user's access rights against the project or group. Context retrieval is strictly bounded by what the authenticated individual is authorized to read through standard role-based access control (RBAC).

*   **Public Sector Authorization Restrictions**:
    Under the FedRAMP Moderate Authority to Operate (ATO) boundary for Dedicated for Government (FR2411959145), the Duo Agent Platform flows and external AI agent integrations are **not authorized**. Because autonomous agentic orchestration involves dynamic tool calls and external system integration, its prohibition in FedRAMP Moderate environments prevents unvetted egress calls and potential prompt injection vectors from reaching unclassified government workloads. Government deployments must restrict AI execution to approved in-boundary paths operating under offline licensing models.

*   **Administrative & Infrastructure Split**:
    The platform enforces a clear separation of operational responsibility. Top-level customer administrators manage application-level security policies, toggle AI features, and configure identity integrations. Infrastructure operators (GitLab personnel in Dedicated environments or customer teams in Self-Managed setups) maintain underlying tenant infrastructure, network routes, and host security without gaining visibility into application-level prompt content.

---

#### 1.4 AI Interaction Logging, Observability & Data Retention

Prompts and completions traverse the application and gateway layers to deliver real-time AI capabilities. System-level interaction events are recorded to maintain application telemetry and audit logs.

> **Mandatory Architectural Silence Note:** The provided source context does not specify exact data retention schedules or durations, physical storage locations or geographic regions for prompt/completion log records, or mechanisms for Data Loss Prevention (DLP) and security label enforcement within AI data flows. These details remain unverified in the source baseline.

---

### 2. Platform Integration Surface Architecture

#### 2.1 API & System Interface Inventory

The platform exposes five primary interfaces for user access, programmatic automation, job execution, and tool integration.

| Interface / API | Purpose & Exchange Payload | Authentication Model | Endpoint / Deployment Constraints |
| :--- | :--- | :--- | :--- |
| **REST API** | Project administration, MR workflows, pipeline triggering, security finding export; JSON payloads | Personal Access Tokens (PAT), OAuth 2.0, Job Tokens | Tenant URL; subject to tier-based rate limits across all deployment models |
| **GraphQL API** | High-efficiency structured queries for SDLC metadata, dashboards, and security inventory; JSON payloads | Personal Access Tokens (PAT), OAuth 2.0, Job Tokens | Tenant URL; subject to tier-based query limits across all deployment models |
| **Job API (Runner)** | Polling for pipeline jobs, streaming build logs, uploading build artifacts and caches | Runner Tokens (polling/registration), Job Tokens (execution scope) | Tenant URL; on Dedicated for Government, runners poll from outside the tenant boundary |
| **Git HTTP / SSH** | Source control operations (clone, fetch, push); Git packfiles and repository diffs | IdP assertions, PAT, SSH Keys / Deploy Keys | Standard HTTPS/SSH ports; handled via Workhorse (HTTP) or GitLab Shell (SSH) to Gitaly |
| **Local MCP Server** | Model Context Protocol integration for local IDEs and agent interfaces | Instance-local authentication | Self-Managed local execution; isolated from public cloud endpoints |

---

#### 2.2 Connector Frameworks & Infrastructure Integration Points

*   **GitLab Runner (Job Plane Interface)**:
    *   The job execution plane operates in a completely separate trust domain from the control plane.
    *   Running untrusted user code or arbitrary CI/CD pipeline scripts directly inside the application control plane poses severe lateral movement and privilege escalation risks. Isolating the job plane ensures that execution occurs on dedicated, non-privileged worker nodes.
    *   Runners authenticate using ephemeral job tokens or runner tokens and poll the central application control plane over the HTTPS Job API to receive job payloads.
    *   In Dedicated for Government environments, hosted runners within the tenant are unavailable; customers are required to deploy and operate self-managed, FIPS-compliant runners in isolated customer-managed environments outside the FedRAMP boundary.

*   **Kubernetes Agent (KAS)**:
    *   The GitLab Agent for Kubernetes (KAS) establishes a bi-directional pull/deploy bridge between customer Kubernetes clusters and the platform control plane.
    *   Using cluster-bound agent tokens over HTTPS, KAS pulls state definitions from Git repositories to drive GitOps deployments without requiring public inbound firewall ports on the target cluster.
    *   *Architectural Silence Note:* Source documentation is silent regarding whether KAS holds a formal Provisional Authorization (PA) under the Dedicated for Government FedRAMP Moderate boundary (FR2411959145).

*   **AWS PrivateLink**:
    *   Enables private network topology for Dedicated Commercial and Dedicated for Government instances.
    *   Supports inbound connections (restricting administrative and user access to customer VPCs) and outbound connections (allowing pipeline jobs to access internal customer resources).
    *   AWS PrivateLink is specifically required during Geo-based tenant migrations to pull repository state and database snapshots privately into Dedicated instances without traversing public endpoints.

*   **Artifact & Container Registries**:
    *   Integrated registries host container images, security scanning utility tools, and package build artifacts.
    *   To prevent Puma/Rails application server bottlenecks during high-volume operations, container image pulls and package artifact uploads bypass the application layer via GitLab Workhorse, streaming object payloads directly to underlying S3-compatible storage.

---

#### 2.3 Identity Integration, SSO & Token Hierarchy

*   **Federated SSO & Government Identity**:
    *   The platform supports federated Single Sign-On (SSO) using SAML 2.0 and OpenID Connect (OIDC).
    *   For Dedicated for Government, compliance mandates hardware token authentication (PIV/CAC). The platform does not operate a native PIV/CAC validation stack; authentication is routed entirely through the agency’s external Identity Provider (IdP), which validates the card credentials and passes secure SAML/OIDC assertions to the platform.

*   **Token Taxonomy & Ephemeral Scopes**:
    Authentication flows down from federated IdP identity assertions into a granular token hierarchy:
    *   *Personal Access Tokens (PAT)*: Tied to user identity and constrained by the user's role permissions. Fine-grained permissions allow restricting PATs to minimal required API scopes.
    *   *Group & Project Access Tokens*: Scoped to specific namespaces or project boundaries for automated integrations, avoiding reliance on individual personal user profiles.
    *   *Runner Tokens*: Used strictly to authenticate the runner agent during registration and job polling. Frequent rotation is required to minimize token exposure risks.
    *   *Job Tokens*: Ephemeral, short-lived tokens dynamically generated for the duration of a single CI/CD job, restricting worker execution access strictly to the resources required for that specific job.

---

### 3. Architectural Silence & Boundary Limits Register

The following register identifies structural limitations, unverified capabilities, and topics omitted from the available technical baseline documentation.

| Area / Surface | Source Silence Note |
| :--- | :--- |
| **AI Log Retention Schedule & Storage Location** | Sources do not state the exact retention period, physical storage region, storage tier, or DLP/security labeling rules applied to AI prompt and completion logs. |
| **Dedicated for Government Hosted FIPS Runners** | GitLab-hosted runners are not available inside the Dedicated for Government tenant boundary. Source docs require customers to operate self-managed FIPS runners externally. |
| **Dedicated for Government KAS Provisional Authorization** | Sources do not confirm whether the Kubernetes Agent Server (KAS) holds a formal FedRAMP Provisional Authorization (PA) under the FR2411959145 boundary. |
| **Slack / Teams Integration Scope** | Webhooks and notification connectors for messaging platforms (Slack/Teams) exist as product features, but sources are silent on their authorization status within the FedRAMP Moderate boundary. |
| **Dedicated for Government Duo Agent Platform Authorization** | Duo Agent Platform flows and external agent orchestration tool calls are explicitly **not authorized** under the Dedicated for Government FedRAMP Moderate ATO. |