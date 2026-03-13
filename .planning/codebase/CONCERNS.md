# Codebase Concerns

**Analysis Date:** 2026-03-13

## Tech Debt

**Single-file implementation in `src/index.js`:**
- Issue: validation helpers, provider construction, scan orchestration, and mapping all live in one module
- Why: the package is still small enough to manage without splitting
- Impact: future features such as pagination, retries, or multi-token workflows will make the file harder to reason about
- Fix approach: split `src/` into provider, validation, and scan-focused modules while preserving the current public export surface

**Hand-maintained declarations in `src/index.d.ts`:**
- Issue: runtime JS and type declarations must be kept in sync manually
- Why: there is no TypeScript build step that emits declarations from source
- Impact: API drift is possible if behavior changes without matching declaration edits
- Fix approach: either migrate source to TypeScript or add stronger declaration-focused tests and release checks

## Known Bugs

**No confirmed production bug is documented in-repo:**
- Symptoms: none explicitly recorded in the reviewed files
- Trigger: not applicable
- Workaround: rely on the current test suite plus consumer validation
- Root cause: not applicable

## Security Considerations

**Proxy and RPC credential handling:**
- Risk: credentials may be embedded directly in `rpcUrl` or proxy URLs passed by consumers
- Current mitigation: this library does not log connection settings
- Recommendations: keep secrets outside committed scripts and avoid exposing full URLs in upstream logs or thrown errors

**Untrusted endpoint behavior:**
- Risk: malicious or broken RPC providers could return malformed log data or inconsistent block responses
- Current mitigation: address normalization and missing-block checks catch some invalid states
- Recommendations: add stronger shape validation for provider responses if this package will be used against untrusted infrastructure

## Performance Bottlenecks

**Large scan ranges:**
- Problem: the code issues one or two `getLogs(...)` calls across the requested block span and then fetches each unique block timestamp individually
- Measurement: no benchmarks are present in-repo
- Cause: there is no chunked scanning, batching, or cache reuse across calls
- Improvement path: split large ranges into chunks, cache block timestamps, and consider provider-specific batching where available

**`"both"` direction scans:**
- Problem: incoming and outgoing filters are queried separately, then merged and deduplicated in memory
- Measurement: no benchmarks are present in-repo
- Cause: EVM topic filtering cannot express both directions in one simple query with the current approach
- Improvement path: keep the current behavior for correctness, but add chunking and optional streaming for high-volume wallets

## Fragile Areas

**Topic parsing in `mapTransferLog(...)`:**
- Why fragile: the function assumes standard ERC20 `Transfer` log topics are present at indexes 1 and 2
- Common failures: malformed provider data or non-standard events can cause invalid address parsing
- Safe modification: preserve explicit validation around topic count/shape if the parser is expanded
- Test coverage: happy-path parsing is covered; malformed topic arrays are not

**Provider compatibility contract:**
- Why fragile: the library relies on consumers providing a provider whose methods match the documented interface
- Common failures: custom providers may accept slightly different filter shapes or return missing fields
- Safe modification: keep the `ScanProvider` contract tight and add compatibility tests before broadening accepted provider types
- Test coverage: custom fake providers are covered, but only against the interface expected by the current tests

## Scaling Limits

**RPC rate limits:**
- Current capacity: depends entirely on the upstream RPC provider
- Limit: wide block ranges or wallets with many unique transfer blocks can trigger rate limits through repeated `getBlock(...)` calls
- Symptoms at limit: throttling, request failures, or very slow scans
- Scaling path: add retries, backoff, chunked scans, and optional timestamp caching

## Dependencies at Risk

**`ethers` major-version coupling:**
- Risk: provider internals and helper APIs changed significantly across major versions
- Impact: `FetchRequest`, filter types, or provider construction could break on a future major upgrade
- Migration plan: pin/test against the current major and treat any `ethers` major bump as an architecture-level change

## Missing Critical Features

**Chunked or resumable scanning:**
- Problem: the current API expects one block window per call
- Current workaround: consumers must manually loop over ranges
- Blocks: robust scanning of very large wallets or strict-rate-limit providers
- Implementation complexity: medium

**Retry and backoff policy:**
- Problem: transient RPC failures are not handled inside the library
- Current workaround: consumers catch and retry externally
- Blocks: resilient unattended batch scanning
- Implementation complexity: medium

## Test Coverage Gaps

**Transport-layer provider creation:**
- What's not tested: `createRpcProvider(...)` behavior around proxy wiring and timeout validation in a realistic transport scenario
- Risk: regressions may only surface when consumers hit live RPC endpoints
- Priority: Medium
- Difficulty to test: Low to medium with a focused stub around `FetchRequest`

**Malformed external data handling:**
- What's not tested: short topic arrays, invalid addresses in logs, and partially broken provider responses
- Risk: unexpected third-party data may produce confusing failures
- Priority: Medium
- Difficulty to test: Low

*Concerns audit: 2026-03-13*
*Update as issues are fixed or new ones discovered*
