# HRIS - Phase 2 - Trust & Biometrics Implementation Plan (PRD v5.0) (9 sprint)

# Phase 2 — HRIS Trust & Biometrics Implementation Plan (PRD v5.0)

## Context

Phase 1 (Q3 2026, 7 sprints) delivers the HRIS foundation: employee DB, RBAC, org chart, GPS attendance, leave, basic payroll, attendance export, turnover analytics, onboarding/offboarding, multi-tenancy, and CI/CD. Sprint 1 is committed on feat/hris-sprint1.

Phase 2 (Q4 2026, 9 sprints / 13 weeks) adds trust, biometrics, and platform maturity — delivering PRD sections S4, S5, S6, S7, S11, S20, S24, S26. It introduces four new infrastructure components: Redis/Asynq (background jobs), Python face-service (biometrics), Solidity smart contracts (blockchain identity), and S3-compatible object storage (documents).

Prerequisite: All 7 Phase 1 sprints must be complete before Phase 2 begins. Phase 2 migrations will start after Phase 1’s last migration number.

---

## Architectural Decisions (Phase 2)

ADR-009: Redis + Asynq for background jobs
Why: ADR-006 deferred this to Phase 2; needed for document scanning, blockchain tx, large exports
Apply: All async work (scan, anchor, export) goes through Asynq tasks, replacing Phase 1 goroutines

ADR-010: Python face-service as separate microservice
Why: ArcFace/FASNet need ONNX Runtime + GPU; doesn’t belong in Go monolith
Apply: Go backend calls face-service via HTTP; docker-compose adds the service

ADR-011: S3Store implements existing storage.Store interface
Why: server-go/internal/storage/storage.go already defines the interface; S3 adapter slots in
Apply: Config switch STORAGE_PROVIDER=s3 routes to S3Store; MinIO for local dev

ADR-012: Blockchain writes are async (Asynq tasks)
Why: Polygon tx confirmation takes seconds; can’t block HTTP responses
Apply: Handler enqueues anchor/attest task; frontend polls status via blockchain_anchors table

ADR-013: All new tables include company_id + multi-tenant queries
Why: Consistent with Phase 1 pattern; RLS already planned for defense-in-depth
Apply: Every new handler extracts companyId from gin context (set by RBAC middleware)

---

## Sprint 1 (W1-2): Infrastructure Foundation + Document Management (S20)

Goal: Stand up Redis/Asynq, S3/MinIO, ClamAV and deliver the document management module. Unblocks all subsequent sprints.

### Migration: P2-001_documents.sql

Tables:
- documents — id, company_id, employee_id, category (enum: identity/contract/certificate/payslip/tax/other), original_filename, storage_key, sha256_hash, mime_type, file_size, scan_status (enum: pending/clean/infected/error), blockchain_anchor_tx, uploaded_by, created_at
- document_access_log — id, document_id, accessed_by, action, ip_address, created_at
- export_jobs — id, company_id, type, status, file_url, requested_by, created_at, completed_at
- New permissions: documents.upload, documents.delete, documents.audit_log

### Backend

New packages:
- internal/storage/s3.go — S3Store implementing existing Store interface
- internal/documents/ — service.go (CRUD + SHA-256 hashing + access control), handler.go (upload/download/list/delete endpoints), scanner.go (ClamAV TCP integration)
- internal/queue/ — queue.go (Asynq client/server setup), tasks.go (document scan, export tasks)

Modified files:
- internal/config/config.go — add RedisURL, S3Bucket, S3Region, S3Endpoint, ClamAVAddr
- docker-compose.yml — add Redis 7, MinIO, ClamAV services
- internal/webhook/service.go — migrate goroutines to Asynq tasks

### Endpoints

POST /hris/documents [documents.upload]
GET /hris/documents [documents.view]
GET /hris/documents/:id/download [documents.view]
DELETE /hris/documents/:id [documents.delete]
GET /hris/documents/audit-log [documents.audit_log]

### Frontend (3 pages)

- Documents — list with filters (employee, category, date), scan status badges
- UploadModal — drag-and-drop upload with category selection
- DocumentViewer — in-browser PDF/image preview via pre-signed URL
- Add documents tab to EmployeeDetail page

### New dependencies

- Go: hibiken/asynq, redis/go-redis/v9, aws/aws-sdk-go-v2 (S3)
- Docker: Redis 7, MinIO, ClamAV

---

## Sprint 2 (W3-4): Face Recognition Service + Enrollment (S5 partial)

Goal: Deploy Python face-service and build face enrollment flow. No clock-in yet.

### Migration: P2-002_face_enrollments.sql

Tables:
- face_enrollments — id, employee_id, embedding_vector BYTEA, liveness_score, enrolled_at, is_active, enrolled_by
- face_verification_logs — id, employee_id, action, match_score, liveness_score, passed, ip_address, user_agent, created_at

### Python face-service (face-service/)

- FastAPI app with ArcFace (ONNX) + FASNet liveness
- POST /enroll — accept image, return embedding + liveness score
- POST /verify — accept image + stored embedding, return match score + liveness
- Dockerfile: Python 3.12, ONNX Runtime, model weights

### Backend

New packages:
- internal/face/ — client.go (HTTP client to face-service), service.go (enrollment flow + embedding storage), handler.go (enroll/status endpoints)

Modified files:
- internal/config/config.go — add FaceServiceURL

### Endpoints

POST /hris/face/enroll [face.enroll]
GET /hris/face/status [face.view]
GET /hris/face/enrollment/:id [face.admin]

### Frontend (2 pages + components)

- FaceEnrollment — camera capture with step-by-step guide (look straight, turn left, turn right)
- FaceCapture — reusable webcam component (MediaDevices API)
- LivenessGuide — visual instructions component
- Face enrollment status badge on EmployeeDetail

---

## Sprint 3 (W5-6): Face Clock-In/Out + Blockchain Infrastructure (S5 complete, S4 partial)

Goal: Wire face verification into attendance clock-in and set up Solidity contract infrastructure.

### Migration: P2-003_attendance_face.sql

- ALTER attendance_logs ADD face_verification_id, face_match_score

### Migration: P2-004_blockchain_infra.sql

Tables:
- blockchain_anchors — id, entity_type, entity_id, tx_hash, block_number, chain_id, contract_address, anchor_data_hash, status, created_at, confirmed_at
- did_identities — id, employee_id, did_string (unique), public_key, created_at, revoked_at
- credential_attestations — id, did_id, credential_type, issuer_did, subject_data_hash, tx_hash, issued_at, expires_at, revoked_at

### Solidity contracts (contracts/)

- SkillPassDID.sol — DID registry: register, resolve, revoke
- CredentialAttestation.sol — attest, revoke, verify (view function, free)
- Hardhat config for Polygon mainnet + Amoy testnet
- Full test suite + deployment scripts

### Backend

New packages:
- internal/blockchain/ — client.go (go-ethereum, contract bindings), service.go (anchor + attest + verify), did.go (DID generation: did:skillpass:polygon:), tasks.go (Asynq tasks for async tx)

Modified files:
- Phase 1 attendance package — integrate face verification into clock-in: call face-service verify, store match_score, reject if < 0.82, flag 0.70-0.81

### Frontend

- Modify Phase 1 ClockIn page — add face capture step (4-step flow: camera -> capture -> verify liveness -> submit with GPS)

### New dependencies

- Go: ethereum/go-ethereum
- NPM (contracts): hardhat, @openzeppelin/contracts, ethers

---

## Sprint 4 (W7-8): Payroll PPh21 + BPJS Full (S11)

Goal: Enhance Phase 1 basic payroll with complete Indonesian tax/social security calculations. Independent of face/blockchain track.

### Migration: P2-005_payroll_enhanced.sql

Tables:
- payroll_components — company-level earnings/deductions with calculation types
- pph21_brackets — DJP tax brackets (seeded for 2026)
- bpjs_config — per-company BPJS rates with salary caps (JHT, JKK, JKM, JP, Kesehatan with employer/employee splits)
- Enhance payroll_runs with totals (gross, net, tax, bpjs_company, bpjs_employee)
- Enhance payslips with full breakdown (all BPJS components, PPh21, components JSON)
- bank_transfers — per-employee per-run bank transfer records

### Backend

New/enhanced packages:
- internal/hris/payroll/ — service.go (payroll run engine), tax.go (PPh21 TER with bracket tables, PTKP lookup), bpjs.go (all component calcs with salary caps), export.go (bank CSV for BCA/Mandiri/BNI/BRI, SPT Masa, Form 1721-A1)
- Extensive unit tests for tax.go and bpjs.go — these are the highest-risk calculations

### Endpoints

GET/PUT /hris/payroll/config [payroll.manage]
CRUD /hris/payroll/components [payroll.manage]
POST /hris/payroll/runs [payroll.run]
POST /hris/payroll/runs/:id/calculate [payroll.run]
GET /hris/payroll/runs/:id/diff [payroll.view]
PUT /hris/payroll/runs/:id/approve [payroll.approve]
GET /hris/payroll/runs/:id/export/bank?format=bca|mandiri|bni|bri [payroll.export]
GET /hris/payroll/runs/:id/export/spt-masa [payroll.export]
GET /hris/payslips/me [employee self-service]
GET /hris/payslips/:id/pdf [payroll.view]

### Frontend (6 pages)

- PayrollDashboard — runs list, current period status
- PayrollRun — step wizard: Select Period -> Calculate -> Review Diff -> Approve
- PayslipDetail — individual payslip with earnings/deductions breakdown
- PayrollComponents — manage per-company earnings and deductions
- TaxConfig — PPh21 method and BPJS rate configuration
- PayrollExports — download bank CSV, SPT Masa, 1721-A1

### New dependency

- Go: jung-kurt/gofpdf (payslip PDF generation, if not already added in Phase 1)

---

## Sprint 5 (W8-9): ATS Full Pipeline (S7)

Goal: Full ATS with configurable pipeline, scorecards, interview scheduling, offer letters, e-signature, and ATS->HRIS auto-create.

### Migration: P2-006_ats_full.sql

Tables:
- ats_pipelines + ats_pipeline_stages — configurable stage sequences per company
- Stage types enum: screening, phone_screen, technical, hr_interview, final, offer, hired
- ats_candidates — tracks candidate progress through pipeline stages
- ats_scorecards — per-evaluator structured feedback with scores JSON
- ats_interviews — scheduling with calendar event tracking
- ats_offer_letters + ats_offer_templates — template-based offer generation with e-signature tracking

### Backend

New packages:
- internal/hris/ats/ — service.go (pipeline + candidate management), handler.go (CRUD), interview.go (scheduling), offer.go (generation + e-signature), onboard.go (ATS->HRIS auto-create employee on offer acceptance)

Modified files:
- Bridge existing internal/application/ into ATS pipeline
- Add interview/offer notifications to internal/notification/

### Endpoints

CRUD /hris/ats/pipelines [ats.manage]
GET/POST /hris/ats/candidates [ats.view]
PUT /hris/ats/candidates/:id/move [ats.manage]
CRUD /hris/ats/scorecards [ats.scorecard]
CRUD /hris/ats/interviews [ats.interview]
POST /hris/ats/offers [ats.offer]
POST /hris/ats/offers/:id/accept [public — candidate]
CRUD /hris/ats/offer-templates [ats.manage]

### Frontend (7 pages)

- Pipeline — Kanban board with drag-and-drop stage transitions
- PipelineConfig — configure stages per pipeline
- CandidateDetail — full candidate view with activity timeline
- Scorecard — structured evaluation form for interviewers
- InterviewScheduler — calendar picker with interviewer selection
- OfferLetter — generate and send offer, track signature
- OfferTemplates — manage offer letter templates with merge fields

---

## Sprint 6 (W9-10): Blockchain Identity + Document Anchoring (S4 complete, S6 partial)

Goal: Wire blockchain to production flows. Anchor documents, issue DIDs, attest skill scores, integrate Dukcapil/PDDikti verification.

### Migration: P2-007_skill_attestations.sql

Tables:
- skill_attestations — employee_id, skill_name, score, evaluation_id, tx_hash, attestation_hash
- skill_passport_public — employee_id, public_url_slug (unique), is_public, settings JSON

### Migration: P2-008_identity_verification.sql

Tables:
- identity_verifications — employee_id, provider (enum: dukcapil/pddikti/manual), response_status, verified_at

### Backend

New packages:
- internal/blockchain/anchor.go — document anchoring: hash -> contract -> store tx_hash on documents table
- internal/blockchain/attestation.go — skill score attestation after evaluation
- internal/identity/ — dukcapil.go (KTP/NIK verification), pddikti.go (education verification), handler.go
- internal/passport/blockchain.go — public Skill Passport with on-chain verification links

Modified files:
- internal/documents/service.go — enqueue blockchain anchor after clean scan for eligible categories
- internal/evaluation/ — optionally attest skill scores on-chain

### Frontend (4 pages + components)

- IdentityDashboard — Dukcapil/PDDikti verification status per employee
- BlockchainBadge — reusable component showing anchor status with Polygon tx link
- SkillPassport (public) — skill passport page with blockchain verification badges
- VerifyCredential — standalone page for third-party on-chain verification
- Add blockchain anchor badge to document list items

---

## Sprint 7 (W10-11): Proctored Evaluation (S6 complete) + API Gateway (S24)

Goal: AI-proctored skill evaluation with face verification, and developer API platform.

### Migration: P2-009_proctored_evaluations.sql

Tables:
- proctored_sessions — evaluation_type, face_check_interval, checks passed/total, violations JSON, status (enum: in_progress/completed/terminated/suspicious)

### Migration: P2-010_api_gateway.sql

Tables:
- api_clients — company_id, client_id (unique), client_secret_hash, scopes, rate_limit_rpm
- api_request_logs — client_id, method, path, status_code, response_time_ms (partitioned monthly)
- webhook_subscriptions — company_id, api_client_id, event_types[], url, secret

### Backend

New packages:
- internal/proctor/ — service.go (session management, periodic face checks), handler.go (start session, submit evaluation)
- internal/gateway/ — middleware.go (API key auth + rate limiting), service.go (client CRUD + key rotation), handler.go (developer portal API), webhooks.go (subscription-based event filtering)

Modified files:
- internal/evaluation/ — wrap evaluation in proctored session when requested
- Serve OpenAPI 3.0 spec at /api/v1/docs

### Frontend (6 pages)

- ProctoredEval — evaluation UI with persistent webcam feed and face check indicators
- ProctorMonitor — admin view of active proctored sessions
- APIGateway — developer portal: API keys, usage stats dashboard
- CreateKey — create API key with scope selection
- Documentation — embedded Swagger UI / Redoc
- WebhookSubscriptions — manage subscriptions with event type filtering

---

## Sprint 8 (W11-12): Privacy Compliance UU PDP (S26)

Goal: Cross-cutting privacy compliance: consent management, data retention, biometric deletion, breach notification, DPO dashboard.

### Migration: P2-011_privacy_compliance.sql

Tables:
- consent_records — employee_id, consent_type (enum: biometric_collection/data_processing/data_sharing/marketing/analytics), purpose, granted, timestamps, version
- data_retention_policies — company_id, data_category, retention_days, auto_delete
- data_deletion_requests — employee_id, request_type (enum: biometric/personal_data/full_erasure), status, timestamps
- breach_notifications — company_id, breach_type, affected_count, detected_at, notified_at, remediation
- privacy_audit_log — actor_id, action, entity_type, entity_id, details JSON
- New permissions: privacy.view, privacy.manage, privacy.dpo, privacy.breach_notify, privacy.deletion_approve
- New seeded role: DPO (Data Protection Officer)

### Backend

New packages:
- internal/privacy/ — consent.go (collect/withdraw/audit), retention.go (policy engine + Asynq scheduled deletion), deletion.go (right-to-erasure: biometric deletion + data anonymization), breach.go (notification workflow with 72h deadline), handler.go (DPO dashboard API), audit.go (privacy audit middleware)

Cross-cutting modifications:
- internal/face/service.go — require biometric consent before enrollment; implement biometric template deletion
- internal/documents/service.go — apply retention policies, auto-delete expired docs
- internal/hris/employee/service.go — anonymize employee data on full erasure
- Add privacy audit logging middleware for sensitive endpoints

### Frontend (6 pages + component)

- PrivacyDashboard — DPO overview: consent stats, pending deletions, breach log
- ConsentManagement — view/manage consent records per employee
- RetentionPolicies — configure retention periods per data category
- DeletionRequests — review and process deletion requests
- BreachNotification — create and track breach notifications with 72h deadline
- AuditLog — privacy-specific audit trail viewer
- ConsentBanner — modal shown to employees on first login or policy update
- Modify FaceEnrollment to include consent step before capture

---

## Sprint 9 (W13): Integration Testing + Hardening + Polish

Goal: End-to-end testing, performance hardening, security audit, documentation.

No new migrations.

### Integration test scenarios

1. Full hiring flow: ATS pipeline -> offer accepted -> employee auto-created -> face enrolled -> first face clock-in -> payroll run includes new employee
2. Document lifecycle: upload -> ClamAV scan -> blockchain anchor -> on-chain verification -> retention expiry -> deletion
3. Privacy flow: consent -> enrollment -> processing -> withdrawal -> biometric deletion -> audit trail
4. API gateway: external client authenticates -> fetches data -> webhook fires on payroll completion

### Performance hardening

- Load test payroll run with 500+ employees
- Load test concurrent face verification (simulating 08:00 WIB clock-in rush)
- Asynq queue burst handling (100+ document scans)
- Missing index audit based on slow query log

### Security audit

- Biometric data encrypted at rest, no API endpoint exposes raw embeddings
- API key secrets hashed (not plaintext)
- Document download via time-limited pre-signed URLs only
- Blockchain private key in vault (not env var in production)
- Face-service: image injection and replay attack testing
- Webhook SSRF protections (existing pattern in internal/webhook/service.go)

---

## Cross-Sprint Concerns

### HRISSidebar growth (organize into collapsible groups)

- People: Employees, Org Chart
- HR Operations: Attendance, Leave, Payroll, Documents
- Recruitment: ATS Pipeline
- Trust & Security: Face ID, Identity Verification, Privacy
- Developer: API Gateway
- Settings: Roles, Config

### Files modified every sprint

- server-go/cmd/server/main.go — new route groups + service initialization
- server-go/internal/config/config.go — new config fields
- server-go/internal/rbac/rbac.go — new permissions + role mappings
- web/src/App.tsx — new lazy routes
- web/src/components/hris/HRISSidebar.tsx — new nav links

### New Go dependencies across sprints

- Sprint 1: hibiken/asynq, redis/go-redis/v9, aws/aws-sdk-go-v2
- Sprint 3: ethereum/go-ethereum
- Sprint 4: jung-kurt/gofpdf

### New infrastructure (docker-compose)

- Sprint 1: Redis 7, MinIO (S3-dev), ClamAV
- Sprint 2: Python face-service container
- Sprint 7: Asynqmon (job queue dashboard, dev-only)

### Sprint dependency graph

Sprint 1 (Docs + Infra) —+—> Sprint 3 (Face Clock-in + Blockchain)
Sprint 2 (Face Service) —+ |
+—> Sprint 6 (Blockchain Identity + Anchoring)
Sprint 4 (Payroll) [independent] | |
Sprint 5 (ATS) [independent] ——–+ +—> Sprint 7 (Proctored Eval + API Gateway)
|
+—> Sprint 8 (Privacy - cross-cutting)
|
+—> Sprint 9 (Integration + Polish)

Sprints 4 (Payroll) and 5 (ATS) are independent of the face/blockchain track and can be developed in parallel by separate team members.

---

## Verification (per sprint)

1. docker compose up db redis minio clamav -d then bun run db:migrate — verify migration applies
2. bun run db:generate — regenerate go-jet types
3. go -C server-go test -p 1 ./… — backend tests pass (especially tax.go, bpjs.go)
4. bun –cwd web typecheck — no type errors
5. bun –cwd web test — frontend tests pass
6. bun run dev — start dev server, manually test new features in browser
7. bun run lint — no lint errors
8. Smart contract tests: cd contracts && npx hardhat test (sprints 3, 6)
9. Face-service tests: cd face-service && pytest (sprints 2, 3)