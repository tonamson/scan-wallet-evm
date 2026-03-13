---
phase: 03-docs-verification
plan: "01"
subsystem: docs
tags: [readme, native-transfer, package-api, release-notes]
requires:
  - phase: 02-01
    provides: Public native runtime API at the package root
  - phase: 02-02
    provides: Public native typings and root-exported native types
provides:
  - README usage docs for ERC20 and native transfer scanning
  - Release-facing scope boundaries for the native scan feature
affects: [milestone-completion]
tech-stack:
  added: []
  patterns: [additive README expansion, public API documentation]
key-files:
  created: []
  modified: [README.md]
key-decisions:
  - "README stays additive: ERC20 guidance remains while native sections are introduced alongside it"
  - "Native scope boundaries are stated explicitly so users do not infer support for internal trace transfers"
patterns-established:
  - "Public runtime and type surfaces are documented together in the README"
  - "Provider reuse guidance applies consistently across ERC20 and native scans"
requirements-completed: [DOC-01]
duration: 8 min
completed: 2026-03-13
---

# Phase 3 Plan 1: Docs Summary

**README now documents native scanning, provider reuse, API shape, and top-level-only scope boundaries**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-13T05:21:00Z
- **Completed:** 2026-03-13T05:29:00Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Expanded `README.md` from ERC20-only docs into a combined ERC20 + native transfer guide
- Added JavaScript and TypeScript native examples, public API signatures, and `NativeTransfer` result shape documentation
- Added explicit scope notes covering top-level native transfers only and excluding internal trace transfers

## Task Commits

Each task was committed atomically:

1. **Task 1: Add native scan usage docs to README** - `0779476` (docs)
2. **Task 2: Document native scope boundaries and provider notes** - `fc2d56a` (docs)

## Files Created/Modified

- `README.md` - Public usage docs, API reference, and scope boundaries for native scanning

## Decisions Made

- Documented `rpcUrl` as optional when a provider is injected, matching the runtime/type contract
- Kept release-facing language centered on standard RPC behavior instead of chain-specific caveats

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - documentation updates were verified locally with content checks.

## Next Phase Readiness

- README now reflects the shipped native API and its real scope limits
- Phase 3 testing work can align test names and release-readiness checks directly with the docs

## Self-Check: PASSED

Summary backed by committed README updates and passing plan-level README verification commands.

---
*Phase: 03-docs-verification*
*Completed: 2026-03-13*
