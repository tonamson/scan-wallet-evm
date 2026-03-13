# Coding Conventions

**Analysis Date:** 2026-03-13

## Naming Patterns

**Files:**
- Entry module uses `index.js` and `index.d.ts` for the package root export
- Tests use `*.test.js` under `test/`
- Standalone scripts use descriptive kebab-case names such as `test-scan.js`

**Functions:**
- `camelCase` for helpers and exports: `createRpcProvider`, `scanErc20Transfers`, `resolveDirection`
- Async functions do not use a special prefix; intent comes from the verb name
- Small helpers are preferred over large multi-purpose functions

**Variables:**
- `camelCase` for locals and parameters
- `UPPER_SNAKE_CASE` for exported constants such as `ERC20_TRANSFER_TOPIC`
- No `_private` prefix pattern is used

**Types:**
- `PascalCase` for interfaces and aliases in `src/index.d.ts`
- No `I` prefix on interfaces
- String literal unions are derived from exported tuple constants where possible

## Code Style

**Formatting:**
- Double quotes for strings
- Semicolons are consistently present
- Indentation is 2 spaces
- Trailing commas are used in multiline objects/arrays

**Linting:**
- No ESLint or Prettier config is present in the reviewed files
- Style consistency appears to be maintained manually

## Import Organization

**Order:**
1. Node built-ins first in tests, for example `node:assert/strict` and `node:test`
2. Third-party packages next, for example `ethers`
3. Package self-imports or relative/local imports after that
4. `import type` is used in declaration contexts where appropriate

**Grouping:**
- Blank lines separate import groups
- Imports are kept short and explicit rather than gathered into barrels

**Path Aliases:**
- `tsconfig.json` maps `scan-erc20-token` to `./src/index.d.ts` for local type-checking

## Error Handling

**Patterns:**
- Invalid input throws plain `Error` instances with direct messages
- Guard clauses happen early, for example missing `rpcUrl`, invalid `direction`, or negative block numbers
- Async provider failures bubble upward instead of being wrapped

**Error Types:**
- Throw on invalid API usage and impossible provider states
- Return values are reserved for successful transfer results only
- No custom error classes or result objects are used

## Logging

**Framework:**
- None

**Patterns:**
- Library code avoids `console.*`
- Observability is expected to be handled by the consuming application

## Comments

**When to Comment:**
- Public exports and important constants get concise JSDoc
- Internal helpers are mostly left uncommented when the code is already small and direct
- Comments explain API meaning and edge-case behavior more than implementation trivia

**JSDoc/TSDoc:**
- Public API declarations in both `src/index.js` and `src/index.d.ts` are documented
- Option fields and return shapes are described inline for consumers

## Function Design

**Size:**
- Helpers stay focused on one concern: normalization, proxy resolution, topic building, or log mapping
- The main scan function is the only intentionally larger workflow function

**Parameters:**
- Public functions accept an options object
- Helpers typically take one or two focused parameters plus a field name for better errors

**Return Values:**
- Validation helpers return normalized values
- `scanErc20Transfers(...)` returns a plain array of transfer DTOs
- Early returns and early throws are preferred over nested conditionals

## Module Design

**Exports:**
- Named exports only
- Public API is centralized in `src/index.js` and mirrored in `src/index.d.ts`

**Barrel Files:**
- Not needed yet because the package is a single-module library
- If `src/` is split later, keep the package surface centralized behind `src/index.js`

*Convention analysis: 2026-03-13*
*Update when patterns change*
