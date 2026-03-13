# Roadmap: scan-erc20-token

## Milestones

- ✅ **Legacy baseline** - `v1.0.4` and earlier (shipped 2026-03-12, pre-GSD planning)
- 🚧 **v1.0.5 Native Token Scanning** - Phases 1-3 (planned)

## Overview

This milestone adds native-token transfer scanning to an existing ERC20-focused library without breaking the current package contract. The work is sequenced so core native scan behavior lands first, then the public API and typing surface are aligned, and finally the docs plus verification are tightened for release readiness.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): planned milestone work
- Decimal phases will be reserved for urgent inserted work if needed later
- Because this is the first GSD-managed milestone for a brownfield repository, phase numbering starts at `1`

- [x] **Phase 1: Native Scan Core** - Implement native transfer discovery, direction filtering, and default range handling
- [ ] **Phase 2: Public API & Typings** - Expose a stable native-transfer API with provider-option parity and declarations
- [ ] **Phase 3: Docs & Verification** - Document the feature and close the native-transfer test matrix

## Phase Details

### Phase 1: Native Scan Core
**Goal**: Deliver the core logic that finds top-level native-token transfers for a wallet across an EVM block range.
**Depends on**: Nothing (first tracked phase)
**Requirements**: [NATIVE-01, NATIVE-02, NATIVE-03]
**Success Criteria** (what must be TRUE):
  1. Developer can scan incoming native-token transfers to a wallet across an explicit block range.
  2. Developer can scan outgoing native-token transfers from a wallet across an explicit block range.
  3. Native-token scans use the same default latest-block window behavior as the existing ERC20 scan when block bounds are omitted.
**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md — Build internal native transfer scan core
- [x] 01-02-PLAN.md — Add mocked native transfer behavior coverage

### Phase 2: Public API & Typings
**Goal**: Publish native-transfer support through a clear API that preserves the current ERC20 contract.
**Depends on**: Phase 1
**Requirements**: [NATIVE-04, API-01, API-02]
**Success Criteria** (what must be TRUE):
  1. Developer can call a dedicated native-transfer scan API using the same RPC, proxy, timeout, and provider patterns already supported by the package.
  2. Existing ERC20 consumers continue using `scanErc20Transfers(...)` unchanged.
  3. TypeScript consumers receive typed options and result shapes for native-transfer scanning.
**Plans**: 2 plans

Plans:
- [ ] 02-01-PLAN.md — Expose native runtime API at the package root
- [ ] 02-02-PLAN.md — Add public native typings and typecheck coverage

### Phase 3: Docs & Verification
**Goal**: Make the new native-transfer capability understandable, testable, and ready for release.
**Depends on**: Phase 2
**Requirements**: [DOC-01, DOC-02]
**Success Criteria** (what must be TRUE):
  1. README shows how to scan native-token transfers and states the milestone's scope boundaries.
  2. Automated tests cover native incoming, outgoing, and default-range behavior with mocked providers.
  3. Milestone documentation is ready for the next execution workflow to plan Phase 1.
**Plans**: 2 plans

Plans:
- [ ] 03-01: Update README examples and API notes for native-token scanning
- [ ] 03-02: Finalize the native-transfer test matrix and release-readiness checks

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Native Scan Core | v1.0.5 | 2/2 | Complete | 2026-03-13 |
| 2. Public API & Typings | v1.0.5 | 0/2 | Not started | - |
| 3. Docs & Verification | v1.0.5 | 0/2 | Not started | - |
