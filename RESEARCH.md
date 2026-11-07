# MilestoneOS — Hackathon Architecture & Integration Research
**Event:** PayPal AI Hackathon 2026  
**Project:** MilestoneOS  
**Status:** Phase 1 Architectural Blueprint & Documentation  

---

## 1. PayPal Developer Platform & Sandbox Integration

### Official Starting Points
- PayPal Developer Portal: https://developer.paypal.com/docs/
- Orders v2 API Reference: https://developer.paypal.com/docs/api/orders/v2/
- JavaScript SDK Integration: https://developer.paypal.com/sdk/js/
- Sandbox Testing Guide: https://developer.paypal.com/tools/sandbox/

### Authentication & Token Generation
All PayPal API calls are made from isolated server routes (Next.js Server Actions or Route Handlers).
- **Endpoint:** `POST https://api-m.sandbox.paypal.com/v1/oauth2/token`
- **Headers:** `Authorization: Basic base64(CLIENT_ID:CLIENT_SECRET)`
- **Body:** `grant_type=client_credentials`
- **Response:** Bearer access token (valid for 9 hours).

### Order Lifecycle in MilestoneOS
1. **Order Creation:** Client reviews AI report and clicks "Approve & Pay". Frontend calls `/api/paypal/create-order` with `milestoneId` and `amount`.
   - **Endpoint:** `POST https://api-m.sandbox.paypal.com/v2/checkout/orders`
   - **Intent:** `CAPTURE`
   - **Purchase Units:** Includes `reference_id` (milestone identifier), `amount` (currency code e.g. `USD` or `INR`), and custom description.
2. **Client Checkout Modal:** Standard PayPal button component (`@paypal/react-paypal-js`) opens PayPal Sandbox checkout. The buyer authenticates with sandbox buyer credentials.
3. **Capture Execution:** When buyer approves, PayPal triggers `onApprove(data)`. Frontend calls server endpoint `/api/paypal/capture-order` with `orderID`.
   - **Endpoint:** `POST https://api-m.sandbox.paypal.com/v2/checkout/orders/{order_id}/capture`
   - **Verification:** Backend inspects `status === "COMPLETED"` and logs the capture transaction ID.
4. **Milestone State Update:** The database updates milestone status to `PAID` with timestamp and transaction reference.

### Important Marketplace Architecture Note
In real-world freelance marketplaces, handling payments between two independent third parties (client to freelancer) involves regulated escrow or multiparty payouts:
- **PayPal Multiparty Payments / Partner Platform:** Requires PayPal partner approval, onboarding sellers as PayPal merchants, and partner fees.
- **PayPal Payouts API:** Batch or individual payouts to freelancer PayPal email addresses.
- **MilestoneOS Prototype Implementation:** For the hackathon sandbox demonstration, MilestoneOS operates with a configured Sandbox Business receiving account representing the platform treasury, verifying and capturing each milestone payment before marking the deliverable as released.

### Negative Testing Scenarios
PayPal Sandbox supports simulation headers to test edge cases:
- `PayPal-Mock-Response: {"mock_application_codes": "INSTRUMENT_DECLINED"}`
- `PayPal-Mock-Response: {"mock_application_codes": "PAYER_ACTION_REQUIRED"}`
- Error handling in MilestoneOS prevents milestone state changes if capture fails or is aborted.

---

## 2. Gemini AI Integration

### Official Starting Points
- Gemini API Docs: https://ai.google.dev/gemini-api/docs
- Structured Outputs: https://ai.google.dev/gemini-api/docs/structured-output
- Gemini Models: https://ai.google.dev/gemini-api/docs/models/gemini

### Recommended Model: `gemini-2.5-flash`
- **Why Flash?** Sub-second response latency, multimodal input support (code files, commit diffs, UI screenshots, test outputs), and 1M token context window.
- **Structured JSON Schema:** Enforced via `response_mime_type: "application/json"` and `response_schema` so results parse directly into typed TypeScript interfaces.

### Core AI Tasks in MilestoneOS
1. **Requirement Scoping:** Converts ambiguous client text into atomic, testable acceptance criteria during milestone setup.
2. **Deliverable Audit:** Compares GitHub commit diffs, file trees, or screenshots against criteria.
3. **Strict Categorization:**
   - `satisfied`: Clear proof found.
   - `missing`: Required code/asset omitted.
   - `needs_verification`: Partial match requiring human testing (e.g. responsiveness, edge cases).
4. **Constructive Revisions:** Provides specific file and line suggestions for incomplete items.

### Strict AI Boundary Principle
**AI never executes payments or grants final milestone approvals autonomously.** AI produces an objective intelligence report; the human client retains 100% control over fund release.

---

## 3. Supabase Integration (Phase 2 Target)

### Official Starting Points
- Supabase Docs: https://supabase.com/docs
- Supabase Auth: https://supabase.com/docs/guides/auth
- Supabase Database: https://supabase.com/docs/guides/database

### Data Model Plan
- `profiles` (`id`, `email`, `full_name`, `role: 'client' | 'freelancer'`, `created_at`)
- `projects` (`id`, `client_id`, `freelancer_id`, `title`, `description`, `total_amount`, `status`)
- `milestones` (`id`, `project_id`, `sequence_order`, `title`, `amount`, `status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'paid'`, `acceptance_criteria`)
- `submissions` (`id`, `milestone_id`, `deliverable_links`, `notes`, `submitted_at`)
- `ai_audit_reports` (`id`, `submission_id`, `overall_score`, `criteria_results`, `recommendation`, `created_at`)
- `paypal_transactions` (`id`, `milestone_id`, `paypal_order_id`, `paypal_capture_id`, `amount`, `currency`, `status`, `created_at`)

### Security & Row Level Security (RLS)
- Clients can view and manage only projects they created.
- Freelancers can view and submit deliverables only for projects where they are assigned.
- Service role key used strictly inside server actions for verified payment updates.

---

## 4. Hackathon Sponsor / Partner Evaluation

### AG Grid (High Potential)
- **Use Case:** High-density financial audit ledger for client and freelancer dashboards (filtering milestone status, sorting payout amounts, viewing AI confidence scores, exporting transaction receipts to CSV/Excel).
- **Eligibility:** Free Community edition covers core requirements; Enterprise trial available for advanced pivot analytics.

### APIMatic (Workflow Asset)
- **Use Case:** Validating OpenAPI schemas for the MilestoneOS backend routes and PayPal webhook contracts. Useful during development to document server endpoints for hackathon judges.

---

## 5. Security & Secret Management Rules
- `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` must remain in `.env.local` (server-side only).
- `GEMINI_API_KEY` must never be exposed to the browser or committed to Git.
- `NEXT_PUBLIC_` prefixes reserved strictly for client-safe constants.
- `.gitignore` configured to exclude all `.env*` files and secrets.
