# Architecture

**Analysis Date:** 2026-03-13

## Pattern Overview

**Overall:** Monolithic ESM library module for ERC20 log scanning

**Key Characteristics:**
- Single public source file in `src/index.js`
- Stateless execution; all scan state is local to each function call
- Functional design built around small helpers plus one exported scan workflow
- Dependency injection at the provider boundary for testability

## Layers

**Public API Layer:**
- Purpose: expose the library contract that consumers import
- Contains: exported constants and functions in `src/index.js`, mirrored declarations in `src/index.d.ts`
- Depends on: helper functions and external packages
- Used by: package consumers and the local typecheck/test files

**Validation and Normalization Layer:**
- Purpose: reject invalid inputs early and normalize addresses/blocks/options
- Contains: `normalizeAddress`, `resolveBlockNumber`, `resolveDirection`, `toProxyUrl`, `resolveProxyUrl`
- Depends on: `ethers.getAddress`, native `URL`, simple value checks
- Used by: `createRpcProvider` and `scanErc20Transfers`

**RPC Adapter Layer:**
- Purpose: construct a provider or operate against an injected provider contract
- Contains: `createRpcProvider` and the provider interactions inside `scanErc20Transfers`
- Depends on: `ethers.FetchRequest`, `ethers.JsonRpcProvider`, `HttpsProxyAgent`
- Used by: callers that need default network transport

**Transfer Mapping Layer:**
- Purpose: convert raw log objects into stable transfer records
- Contains: `addressToTopic`, `mapTransferLog`, block timestamp enrichment, deduplication for `"both"` direction
- Depends on: provider responses and normalized inputs
- Used by: the exported scan flow

## Data Flow

**Transfer Scan:**

1. Consumer calls `scanErc20Transfers(...)` from `src/index.js`
2. Inputs are normalized: wallet/token addresses, block bounds, and direction
3. The function selects either an injected `provider` or `createRpcProvider(options)`
4. Missing block bounds are resolved using `provider.getBlockNumber()`
5. Log filter topics are built from `ERC20_TRANSFER_TOPIC` and the wallet topic
6. The function calls `provider.getLogs(...)` once for `"in"`/`"out"` or twice for `"both"`
7. Returned logs are optionally deduplicated by transaction hash, log index, and token address
8. Unique block numbers are fetched via `provider.getBlock(...)`
9. Raw logs are transformed into plain transfer objects with `blockTimestamp`
10. The array is returned with no internal persistence or caching

**State Management:**
- Stateless - no database, cache, or file writes
- Per-call in-memory maps are used only for deduplication and timestamp lookup

## Key Abstractions

**Scan Options Object:**
- Purpose: keep the API surface extensible without long positional argument lists
- Examples: `ScanErc20TransfersOptions`, `RpcProviderOptions` in `src/index.d.ts`
- Pattern: options-object API with optional overrides

**Provider Boundary:**
- Purpose: separate business logic from network transport
- Examples: injected `provider` in tests, `createRpcProvider(...)` for default transport
- Pattern: lightweight interface abstraction rather than a custom wrapper class

**Transfer Record:**
- Purpose: provide a stable, normalized shape for consumers
- Examples: `Erc20Transfer` in `src/index.d.ts`
- Pattern: plain object DTO derived from chain logs

## Entry Points

**Package Entry:**
- Location: `src/index.js`
- Triggers: `import { ... } from "scan-erc20-token"`
- Responsibilities: export constants, provider factory, and scan implementation

**Type Entry:**
- Location: `src/index.d.ts`
- Triggers: TypeScript consumers and `npm run typecheck`
- Responsibilities: define the public type contract and injected provider interface

**Verification Entry:**
- Location: `test/scan-erc20.test.js`
- Triggers: `npm test`
- Responsibilities: validate behavior with fake providers and deterministic logs

## Error Handling

**Strategy:** validate synchronously and throw standard `Error` instances with short messages

**Patterns:**
- Invalid user input is rejected before any network call
- Missing blocks from the provider cause explicit failure: `Block ${blockNumber} not found`
- Network/provider failures are allowed to bubble up directly from `ethers` or the injected provider

## Cross-Cutting Concerns

**Logging:**
- None implemented

**Validation:**
- Address normalization uses `ethers.getAddress(...)`
- Block bounds and direction are validated by small helper functions

**Authentication:**
- None in library code; any RPC or proxy credentials are passed through as input values

*Architecture analysis: 2026-03-13*
*Update when major patterns change*
