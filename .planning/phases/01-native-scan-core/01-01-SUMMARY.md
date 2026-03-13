---
phase: 01-native-scan-core
plan: "01"
subsystem: api
tags: [evm, native-transfer, ethers, rpc]
requires: []
provides:
  - Internal native transfer scan core for top-level value-bearing transactions
  - Direction-aware native transfer record mapping with ERC20-style block fallback behavior
affects: [phase-02-public-api, phase-03-docs-verification]
tech-stack:
  added: []
  patterns: [provider-driven block iteration, receipt-based status filtering]
key-files:
  created: [src/native.js]
  modified: []
key-decisions:
  - "Positive-value contract calls count as native transfers in Phase 1"
  - "Internal scan remains package-internal until Phase 2 adds the public API"
patterns-established:
  - "Native scan uses injected provider methods instead of public exports"
  - "Receipt status filtering happens before native transfer mapping"
requirements-completed: [NATIVE-01, NATIVE-02, NATIVE-03]
duration: 8 min
completed: 2026-03-13
---

# Phase 1 Plan 1: Native Scan Core Summary

**Internal native transfer scanning over EVM blocks with receipt filtering and explicit direction records**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-13T03:40:00Z
- **Completed:** 2026-03-13T03:48:00Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Added `src/native.js` as the internal Phase 1 native-transfer scan module
- Implemented top-level positive-value transfer detection with `in` / `out` / `both` semantics
- Matched ERC20-style block fallback and invalid-range validation while keeping the API internal

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement provider-driven native scan module** - `e6d399e` (feat)
2. **Task 2: Normalize native transfer records and provider expectations** - `841b9a8` (refactor)

## Files Created/Modified
- `src/native.js` - Internal native transfer scan logic and provider contract for Phase 1

## Decisions Made
- Kept Phase 1 native scanning internal so public exports and typings remain deferred to Phase 2
- Used receipt status checks to filter failed transactions before emitting native transfer records

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Native scan core is ready for direct mocked coverage in `test/scan-native.test.js`
- Public API/export wiring is intentionally deferred to Phase 2

## Self-Check: PASSED

Summary backed by committed `src/native.js` implementation and passing plan-level verification commands.

---
*Phase: 01-native-scan-core*
*Completed: 2026-03-13*
