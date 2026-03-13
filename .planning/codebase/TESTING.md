# Testing Patterns

**Analysis Date:** 2026-03-13

## Test Framework

**Runner:**
- Node built-in test runner via `node --test`
- Config is implicit; there is no separate Jest/Vitest config file

**Assertion Library:**
- `node:assert/strict`
- Assertions are mostly `equal(...)` and `deepEqual(...)`

**Run Commands:**
```bash
npm test                 # Run all runtime tests
node --test test/*.test.js
npm run typecheck        # Validate the declaration surface with TypeScript
```

## Test File Organization

**Location:**
- Runtime tests live in `test/`
- Type-only verification lives in root-level `typecheck.ts`

**Naming:**
- Unit-style behavior tests use `*.test.js`
- There are no separate integration or e2e naming patterns yet

**Structure:**
```text
src/
  index.js
  index.d.ts
test/
  scan-erc20.test.js
typecheck.ts
```

## Test Structure

**Suite Organization:**
```js
test("scanErc20Transfers maps ERC20 transfer logs and block timestamps", async () => {
  // arrange fake provider + log data
  // act by calling the exported API
  // assert on provider calls and returned transfer objects
});
```

**Patterns:**
- Direct `test(...)` blocks instead of nested `describe(...)`
- Each test covers one behavior slice with explicit mock inputs
- Assertions validate both outputs and how the provider was called

## Mocking

**Framework:**
- No mocking library is used
- Tests use handwritten fake providers that implement `getBlock`, `getBlockNumber`, and `getLogs`

**Patterns:**
```js
function createMockProvider({ logs, blockTimestamps, latestBlock = 0 }) {
  return {
    provider: {
      async getBlock(blockNumber) { /* fake */ },
      async getBlockNumber() { /* fake */ },
      async getLogs(filter) { /* fake */ },
    },
  };
}
```

**What to Mock:**
- RPC provider behavior
- Returned logs and block timestamps
- Direction-specific responses when `"both"` requires multiple queries

**What NOT to Mock:**
- Pure transformation logic inside the library
- `ethers` helpers for address normalization and hex conversion

## Fixtures and Factories

**Test Data:**
- Log payloads are created inline per test for readability
- Shared provider builders such as `createMockProvider(...)` and `createDirectionalMockProvider(...)` act as lightweight factories

**Location:**
- Factories live directly in `test/scan-erc20.test.js`
- No separate fixtures directory exists yet

## Coverage Observations

**Covered Well:**
- Input-bound scan behavior for `in`, `out`, and default range cases
- Token filtering and latest-block fallback logic
- Deduplication-sensitive dual-direction scanning
- Block timestamp enrichment and missing block failures

**Gaps:**
- `createRpcProvider(...)` is not exercised against a real or stubbed `FetchRequest` transport
- Proxy credential edge cases are not tested
- Malformed log/topic shapes from non-compliant providers are not explicitly covered

## How To Add Tests

- Add runtime behavior tests to `test/*.test.js`
- Prefer injected fake providers over live RPC calls
- Keep assertions focused on one scenario and verify both filter construction and mapped results
- If new TypeScript surface is added, extend `typecheck.ts` so declaration regressions fail in CI/local checks

*Testing analysis: 2026-03-13*
*Update when test patterns change*
