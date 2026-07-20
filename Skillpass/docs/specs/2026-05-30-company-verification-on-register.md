# Inline Company Verification on Registration

**Date:** 2026-05-30
**Status:** Draft
**Scope:** Phase 1 enhancement

## Problem

The current `Register.tsx` form uses identical fields for both jobseekers and companies (name, username, email, password). Company verification lives on a separate `CompanyVerification.tsx` page accessed post-registration. A shadow company can register with fake details and there's no friction at signup to deter fraud.

## Solution

Expand the registration form so when a user selects "Company", additional verification fields appear inline. All data submits in a single registration request. The company record is created with `verificationStatus: 'pending'` and `verificationDocs` populated immediately — removing the need to visit a separate verification page just to submit initial documents.

## User Flow

```
Register page
  ├─ Select "Jobseeker" → standard form (name, username, email, password)
  └─ Select "Company"    → expands with:
                              • Company Name (replaces "Full Name" label)
                              • Business Registration Number
                              • Company Website
                              • Office Address
                              • Contact Person & Title
                              • Info banner about verification timeline
       ↓ submit
  POST /api/v1/auth/register (extended payload with company fields)
       ↓ server
  Creates users row + companies row (verificationDocs populated, status=pending)
       ↓ redirect
  Company dashboard → "Pending Verification" state
       ↓ admin approves
  Company can post jobs, search candidates
```

## Data Changes

### Register request body (company role)

```json
{
  "email": "hr@acmecorp.com",
  "username": "acmecorp",
  "password": "...",
  "role": "company",
  "companyName": "Acme Corporation",
  "businessRegistration": "REG-2024-001234",
  "website": "https://acmecorp.com",
  "address": "123 Business Park, Suite 400, Jakarta",
  "contact": "Jane Doe, HR Director"
}
```

### What gets stored

- `users` row: email, username, passwordHash, role='company', name=companyName
- `companies` row: companyName, website, industry (default until profile updated), verificationStatus='pending', verificationDocs=`{ businessRegistration, website, address, contact }`

No DB schema changes needed — `verificationDocs` (jsonb) already exists on the `companies` table.

## File Changes

| File | Change |
|---|---|
| `web/src/lib/schemas/index.ts` | `registerSchema` → discriminated union on `role`. Company variant requires `companyName`, `businessRegistration`, `website`, `address`, `contact`. |
| `web/src/pages/Register.tsx` | Conditional rendering: when `role === 'company'`, show 5 additional fields below account details. Update `onSubmit` types. |
| `web/src/lib/api.ts` | Widen `register()` parameter type to accept company fields. |
| `web/src/hooks/useAuth.tsx` | Widen `register()` callback type to accept company fields. |
| `server/src/routes/auth.ts` | Register route body schema extended. On company registration, store verification fields in `verificationDocs` jsonb. |
| `web/src/pages/CompanyVerification.tsx` | Simplify: becomes a "check status" or "resubmit" page for already-registered companies. Remove the submit form (verification docs already submitted at registration). |

### Unchanged

- `server/src/db/schema.ts` — no schema migration needed
- `server/src/routes/companies.ts` — `/verification-status` and `/verification` endpoints remain for status checks and resubmission
- `server/src/routes/jobs.ts` — job posting gate (`verificationStatus === 'verified'`) unchanged
- `web/src/pages/CompanyProfile.tsx` — unaffected

## Zod Schema (Flat object + superRefine)

A flat schema with `.superRefine()` is used instead of `z.discriminatedUnion()` because react-hook-form's type inference does not narrow `FieldErrors` correctly on discriminated unions. All fields always exist on the form type; validation is conditional based on `role`.

```ts
export const registerSchema = z
  .object({
    role: z.enum(['jobseeker', 'company']),
    email: z.string().email('Invalid email address'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().optional(),
    companyName: z.string().optional(),
    businessRegistration: z.string().optional(),
    website: z.string().optional(),
    address: z.string().optional(),
    contact: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === 'jobseeker') {
      if (!data.name || data.name.length < 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Name is required', path: ['name'] });
      }
    } else {
      // Company-specific required fields
      if (!data.companyName || data.companyName.length < 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Company name is required', path: ['companyName'] });
      }
      if (!data.businessRegistration || data.businessRegistration.length < 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Business registration is required', path: ['businessRegistration'] });
      }
      if (data.website && data.website.length > 0) {
        // Validate URL format if provided
        try { z.string().url().parse(data.website); } catch {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid URL', path: ['website'] });
        }
      }
      if (!data.address || data.address.length < 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Office address is required', path: ['address'] });
      }
      if (!data.contact || data.contact.length < 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Contact person is required', path: ['contact'] });
      }
    }
  });
```

## UI States

### Default (role=jobseeker)
Standard form with name, username, email, password. No verification section.

### Company selected
Same account fields + verification section:
- "Company Name" replaces "Full Name" label
- Business Registration Number (text input)
- Company Website (url input)
- Office Address (textarea)
- Contact Person & Title (text input)
- Info banner: "Verification is required before you can post jobs. We review submissions within 48 hours."

### Loading / Error / Success
- Submit button shows `LoadingSpinner` during request
- Server errors (409 duplicate email, validation) displayed as `role="alert"` error text
- On success: tokens stored, redirect to `/` (existing behavior)

## Edge Cases

- **Duplicate email**: Server returns 409, form displays error — no change from current behavior.
- **Empty optional fields**: `website` accepts empty string via `.or(z.literal(''))`; all other company fields are required.
- **Role switch mid-form**: If user fills company fields then switches to jobseeker, the company fields are hidden but remain in form state. On submit, only the role-relevant fields are validated (handled by discriminated union).
- **Re-verification**: If a company is rejected, they can resubmit through the existing `CompanyVerification.tsx` page or `POST /api/v1/company/verification` endpoint.

## Future Enhancements (Phase 3+)

Per `docs/superpowers/specs/2026-05-22-skillpass-phase3-design.md`:

- **Email domain verification**: Validate company email domain matches website domain
- **Document upload**: Business license PDF/image upload
- **Phone/SMS verification**: Verify contact number via OTP
- **Company Rep Score**: Community ratings add a second fraud prevention layer

## Testing

### Frontend (vitest)
- Render Register form, toggle to Company, verify 5 additional fields appear
- Toggle back to Jobseeker, verify company fields hidden
- Submit with empty company fields, verify Zod validation errors shown
- Submit with valid company data, verify `authRegister()` called with correct payload

### Server (bun test)
- `POST /api/v1/auth/register` with company role + verification fields → 201, company row has verificationDocs populated
- `POST /api/v1/auth/register` with company role, missing businessRegistration → 422 validation error
- Existing jobseeker registration unchanged