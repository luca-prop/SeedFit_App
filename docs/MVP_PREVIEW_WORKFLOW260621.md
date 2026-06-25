# SeedFit MVP Preview Workflow 260621

## 1. Purpose

This document defines how the 3-month SeedFit MVP work is developed and verified without mixing it with the existing full-spec backlog or the current Vercel Production deployment.

It completes `MVP-002: MVP 브랜치 및 Vercel Preview 운영 규칙 정리`.

## 2. Repository And Project Scope

- GitHub repository: `luca-prop/SeedFit_App`
- Existing full-spec Project: `https://github.com/users/luca-prop/projects/2`
- MVP Project: `https://github.com/users/luca-prop/projects/3`
- MVP workspace folder: `SeedFit_app_mvp`

The full-spec Project remains the historical 89-issue backlog. MVP implementation status is managed only in Project #3.

## 3. Branch Strategy

### Long-lived MVP base branch

- Branch: `mvp/prototype-260621`
- Purpose: integration base for the 3-month MVP prototype
- Rule: do not work directly on this branch except for conflict resolution or controlled integration

### Issue branches

Each MVP issue gets its own branch from `mvp/prototype-260621`.

Naming convention:

```text
mvp/mvp-<issue-number>-<short-slug>
```

Examples:

```text
mvp/mvp-002-preview-workflow
mvp/mvp-003-data-column-contract
mvp/mvp-004-supabase-schema
```

### Merge direction

```text
issue branch -> mvp/prototype-260621 -> main
```

`main` is not the default target for MVP issue PRs. The default target is `mvp/prototype-260621`.

## 4. Pull Request Rules

### Issue PR

Each issue PR should target `mvp/prototype-260621`.

PR title format:

```text
[MVP-002] Define MVP preview workflow
```

PR body must include:

- Related issue
- Scope included
- Scope excluded
- Verification command/output
- Production impact statement

Example:

```markdown
## Summary
- Defines branch and Vercel Preview workflow for the 3-month MVP.
- Keeps Production and the full-spec backlog isolated.

## Related issue
Closes #97

## Test plan
- Documentation-only change.
- Confirmed `.vercel/` is not present in the MVP workspace.

## Production impact
No Production deployment or Vercel setting changes.
```

### MVP integration PR

Only open a PR from `mvp/prototype-260621` to `main` after Sprint 5 smoke testing.

The integration PR must include:

- completed MVP issue list
- known exclusions
- data quality caveats
- Vercel Preview URL
- smoke test result

## 5. Vercel Environment Strategy

### Production

- Vercel project: `https://vercel.com/luca-props-projects/seed-fit-app`
- Branch: `main`
- Purpose: stable public deployment
- Rule: do not change Production settings from an issue branch

### Preview

- Source branch: PR branches based on `mvp/prototype-260621`
- Purpose: verify MVP screens and data flow before any merge to `main`
- Rule: review and user testing happen on Preview URLs, not Production

### Local workspace

The MVP workspace intentionally excludes `.vercel/`.

This prevents copied local Vercel project linkage from silently reusing Production settings.

## 6. Environment Variables

Preview and Production must not share mutable database state.

Recommended split:

- Production: current stable Supabase project or stable schema
- Preview: MVP-only Supabase project or dedicated MVP schema

Required variables for Preview:

```text
DATABASE_URL
DIRECT_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

`SUPABASE_SERVICE_ROLE_KEY` must only be used server-side. It must not be exposed through `NEXT_PUBLIC_*`.

## 7. Deployment Safety Rules

- Do not merge MVP issue PRs directly into `main`.
- Do not modify Vercel Production branch settings from `MVP-002`.
- Do not commit `.vercel/`.
- Do not reuse Production Supabase write credentials for Preview imports.
- Do not add B2B, Verified Listing, chat, or Admin full-dashboard work to the MVP Preview branch.

## 8. Issue Progression

Initial Project #3 progression:

1. `MVP-001`: Done
2. `MVP-002`: In Progress while this document is reviewed
3. `MVP-003`: Ready after `MVP-002` PR is opened
4. `MVP-004` and later: Backlog until Sprint 0 is complete

WIP limit:

- maximum two `MVP Status = In Progress`
- only one implementation issue at a time
- documentation/planning issue may run in parallel when needed

## 9. Verification Checklist

Before closing `MVP-002`, verify:

- current branch is an issue branch, not `main`
- issue branch tracks `origin`
- `mvp/prototype-260621` exists on remote
- `.vercel/` is absent from the MVP workspace
- PR target is `mvp/prototype-260621`
- Production impact is explicitly stated as none

## 10. Next Step

After `MVP-002` is merged into `mvp/prototype-260621`, start `MVP-003` on:

```text
mvp/mvp-003-data-column-contract
```

`MVP-003` should define the canonical CSV/XLSX-to-DB column contract before schema or import scripts are implemented.
