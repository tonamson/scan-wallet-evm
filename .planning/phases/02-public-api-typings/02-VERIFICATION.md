---
phase: 02-public-api-typings
verified: 2026-03-13T05:06:16Z
status: passed
score: 9/9 must-haves verified
---

# Phase 2: Public API & Typings Verification Report

**Phase Goal:** Publish native-transfer support through a clear API that preserves the current ERC20 contract.
**Verified:** 2026-03-13T05:06:16Z
**Status:** passed

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | JavaScript consumers can import `scanNativeTransfers(...)` directly from the package root. | ✓ VERIFIED | Runtime import check passes and `test/scan-native.test.js` exercises `scanNativeTransfers` via `scan-erc20-token` |
| 2 | The public native API accepts the same `rpcUrl`, proxy, timeout, and injected-provider style as the ERC20 API. | ✓ VERIFIED | `src/index.js` routes native scans through `createRpcProvider(...)`, and runtime coverage passes with provider-style options |
| 3 | Existing ERC20 consumers continue using `scanErc20Transfers(...)` unchanged after the native export lands. | ✓ VERIFIED | ERC20 runtime tests still pass, and root import verification checks `scanErc20Transfers` remains exported |
| 4 | TypeScript consumers can import `scanNativeTransfers`, `NativeTransfer`, and `ScanNativeTransfersOptions` from the package root. | ✓ VERIFIED | `src/index.d.ts` exports the native runtime API and the new native types, and `typecheck.ts` compiles against them |
| 5 | Native result and option types stay aligned with the runtime surface and preserve the locked public shape. | ✓ VERIFIED | Declarations expose `direction`, `amount: bigint`, provider/transport fields, and root-exported helper constants that match runtime behavior |
| 6 | Existing ERC20 declarations still compile without consumer-facing changes. | ✓ VERIFIED | `typecheck.ts` continues compiling `scanErc20Transfers` and `Erc20Transfer` imports unchanged |
| 7 | Public native runtime coverage exercises the package-root export instead of the internal module. | ✓ VERIFIED | `test/scan-native.test.js` imports from `scan-erc20-token` and no longer depends on `../src/native.js` |
| 8 | The package root exports a small native helper surface without introducing a noisy namespace. | ✓ VERIFIED | Only `scanNativeTransfers` and `NATIVE_TRANSFER_DIRECTIONS` were added publicly in `src/index.js` / `src/index.d.ts` |
| 9 | Runtime and typing verification both pass after the Phase 2 changes. | ✓ VERIFIED | `node --input-type=module ...`, `npm test`, and `npm run typecheck` all pass |

**Score:** 9/9 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/index.js` | Package-root native runtime export and helper constant | ✓ EXISTS + SUBSTANTIVE | Exports `scanNativeTransfers` and `NATIVE_TRANSFER_DIRECTIONS` while preserving ERC20 runtime exports |
| `test/scan-native.test.js` | Runtime regression coverage through the public package API | ✓ EXISTS + SUBSTANTIVE | Tests import from `scan-erc20-token` and cover public native runtime behavior plus compatibility |
| `src/index.d.ts` | Public native declarations and exported native types | ✓ EXISTS + SUBSTANTIVE | Declares `scanNativeTransfers`, native direction/constants, native provider types, and native result/options types |
| `typecheck.ts` | Consumer-style compile-time coverage for the public native API | ✓ EXISTS + SUBSTANTIVE | Imports the native API/types from the package root and compiles alongside the ERC20 example |

**Artifacts:** 4/4 verified

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/index.js` | `src/native.js` | package-root wrapper delegates to internal native scan core | ✓ WIRED | `scanNativeTransfers(...)` forwards to `scanNativeTransfersWithProvider(...)` |
| `src/index.js` | `createRpcProvider(...)` | transport/provider parity with the ERC20 API | ✓ WIRED | Public native API builds a provider only when one is not injected |
| `test/scan-native.test.js` | `src/index.js` | package self-reference runtime verification | ✓ WIRED | Tests import `scanNativeTransfers`, `scanErc20Transfers`, and `NATIVE_TRANSFER_DIRECTIONS` from `scan-erc20-token` |
| `src/index.d.ts` | `src/index.js` | declaration parity for public native exports | ✓ WIRED | Declarations mirror `scanNativeTransfers` and `NATIVE_TRANSFER_DIRECTIONS` |
| `typecheck.ts` | `src/index.d.ts` | consumer-style compile-time verification | ✓ WIRED | TS compile path imports `scanNativeTransfers`, `NativeTransfer`, and `ScanNativeTransfersOptions` from the package root |

**Wiring:** 5/5 connections verified

## Requirements Coverage

| Requirement | Status | Blocking Issue |
|-------------|--------|----------------|
| `NATIVE-04`: Developer can reuse the current `rpcUrl`, proxy, timeout, and injected-provider options when scanning native-token transfers | ✓ SATISFIED | - |
| `API-01`: Developer can call a dedicated native-transfer scanning API without changing existing ERC20 call sites | ✓ SATISFIED | - |
| `API-02`: TypeScript consumers receive declared options and result types for native-token transfer scanning | ✓ SATISFIED | - |

**Coverage:** 3/3 requirements satisfied

## Anti-Patterns Found

None

## Human Verification Required

None — all Phase 2 checks were verified programmatically.

## Gaps Summary

**No gaps found.** Phase goal achieved. Ready to proceed.

## Verification Metadata

**Verification approach:** Goal-backward using Phase 2 plan `must_haves` and package-root runtime/type evidence
**Must-haves source:** `02-01-PLAN.md` and `02-02-PLAN.md`
**Automated checks:** 3 passed (`node --input-type=module ...`, `npm test`, `npm run typecheck`), 0 failed
**Human checks required:** 0
**Total verification time:** 7 min

---
*Verified: 2026-03-13T05:06:16Z*
*Verifier: Codex*
