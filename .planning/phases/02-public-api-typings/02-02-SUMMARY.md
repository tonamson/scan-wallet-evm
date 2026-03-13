---
phase: 02-public-api-typings
plan: "02"
subsystem: typing
tags: [typescript, declarations, package-exports, typecheck]
requires:
  - phase: 02-01
    provides: Public native runtime API at the package root
provides:
  - Public TypeScript declarations for `scanNativeTransfers(...)`
  - Consumer-style type coverage for native options, results, and helper constants
affects: [phase-03-docs-verification]
tech-stack:
  added: []
  patterns: [root declaration parity, consumer-style typecheck fixtures]
key-files:
  created: []
  modified: [src/index.d.ts, typecheck.ts]
key-decisions:
  - "Native types stay explicit and separate instead of overloading ERC20 declarations"
  - "The public result type keeps `direction` and `amount: bigint` while remaining close to `Erc20Transfer`"
patterns-established:
  - "Runtime exports and declaration exports stay aligned at the package root"
  - "Type regressions are checked through consumer-style imports in `typecheck.ts`"
requirements-completed: [NATIVE-04, API-02]
duration: 8 min
completed: 2026-03-13
---

# Phase 2 Plan 2: Public Typings Summary

**Public TypeScript surface for native transfer scanning with compile-time package-consumer coverage**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-13T04:50:00Z
- **Completed:** 2026-03-13T04:58:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added root-exported native declarations and native-specific public types in `src/index.d.ts`
- Declared provider, block, receipt, direction, and result types needed to use the new native API from TypeScript
- Extended `typecheck.ts` so package consumers can import native runtime APIs and types without affecting the existing ERC20 path

## Task Commits

Each task was committed atomically:

1. **Task 1: Add native public declarations and exported types** - `8877b16` (feat)
2. **Task 2: Add consumer-style type usage coverage** - `828ce5f` (test)

## Files Created/Modified

- `src/index.d.ts` - Public native declarations, helper constants, and exported types
- `typecheck.ts` - Consumer-style compile-time coverage for native and ERC20 imports together

## Decisions Made

- Exported native-specific provider and transaction helper interfaces so callers can type injected providers without touching internals
- Kept the ERC20 declaration surface unchanged rather than refactoring it into a generic abstraction mid-milestone

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- A parallel `git add` / `git commit` attempt briefly recreated `.git/index.lock`; rerunning the commit sequentially resolved it cleanly

## User Setup Required

None - compile-time verification used the repo's existing `tsconfig.json`.

## Next Phase Readiness

- The package now exposes a coherent runtime + type surface for native scans
- Phase 3 can focus on README/docs and broader verification instead of API design

## Self-Check: PASSED

Summary backed by committed declaration changes and passing `npm run typecheck`.

---
*Phase: 02-public-api-typings*
*Completed: 2026-03-13*
