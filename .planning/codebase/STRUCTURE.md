# Codebase Structure

**Analysis Date:** 2026-03-13

## Directory Layout

```text
test-scan-erc20/
├── .planning/               # GSD planning artifacts (created by this mapping run)
│   └── codebase/            # Generated codebase reference documents
├── src/                     # Published runtime source and declaration files
│   ├── index.js             # Main implementation and package entrypoint
│   └── index.d.ts           # Public TypeScript declarations
├── test/                    # Automated test suite
│   └── scan-erc20.test.js   # Node test runner coverage for scan behavior
├── LICENSE                  # Package license
├── README.md                # Usage and API documentation
├── package.json             # Package manifest, exports, dependencies, scripts
├── test-scan.js             # Ad hoc local script for manual scanning
├── tsconfig.json            # TypeScript typecheck configuration
└── typecheck.ts             # Consumer-style TypeScript verification file
```

## Directory Purposes

**`src/`:**
- Purpose: contains the published library surface
- Contains: runtime implementation and hand-maintained declaration file
- Key files: `src/index.js`, `src/index.d.ts`
- Subdirectories: none at present

**`test/`:**
- Purpose: holds automated behavior tests
- Contains: `*.test.js` files using mocked providers
- Key files: `test/scan-erc20.test.js`
- Subdirectories: none at present

**`.planning/codebase/`:**
- Purpose: stores generated reference docs for future GSD planning/execution
- Contains: `STACK.md`, `ARCHITECTURE.md`, `STRUCTURE.md`, `CONVENTIONS.md`, `TESTING.md`, `INTEGRATIONS.md`, `CONCERNS.md`
- Key files: all seven mapping documents
- Subdirectories: none currently

## Key File Locations

**Entry Points:**
- `src/index.js`: package runtime entrypoint
- `src/index.d.ts`: package type entrypoint

**Configuration:**
- `package.json`: exports, scripts, dependency declarations
- `tsconfig.json`: TypeScript compiler settings for consumer verification

**Core Logic:**
- `src/index.js`: all current business logic, validation helpers, provider setup, and log mapping

**Testing:**
- `test/scan-erc20.test.js`: unit-style behavior tests with fake providers
- `typecheck.ts`: compile-time usage example for declaration validation

**Documentation:**
- `README.md`: install/usage/API notes
- `.planning/codebase/*.md`: internal planning documentation

## Naming Conventions

**Files:**
- `index.js` and `index.d.ts` are used as the single-module package entry
- Test files use `*.test.js` under `test/`
- Root utility scripts use descriptive kebab-case names such as `test-scan.js`

**Directories:**
- Short lowercase directory names: `src`, `test`, `.planning`
- No feature subdirectories yet because the library remains compact

**Special Patterns:**
- Declaration files live beside the runtime entry instead of being generated into `dist/`
- Consumer verification is kept in a root-level `typecheck.ts` rather than in `test/`

## Where to Add New Code

**New Feature:**
- Primary code: `src/` (likely `src/index.js` until the module is split)
- Tests: `test/`
- Config if needed: `package.json` or `tsconfig.json`

**New Module Split:**
- Implementation: create focused files under `src/` such as `src/provider.js` or `src/scan.js`
- Types: mirror declarations in `src/` or generate them as part of a build step
- Tests: add matching `test/*.test.js` coverage

**New Example or Manual Script:**
- Place ad hoc scripts at the repo root or under a future `examples/` directory
- Keep secrets and live RPC URLs out of committed scripts

## Special Directories

**`.planning/codebase/`:**
- Purpose: generated reference material for GSD workflows
- Source: produced by mapping, then updated when structure/stack/patterns change
- Committed: yes, if the team wants planning context versioned with the repo

*Structure analysis: 2026-03-13*
*Update when directory structure changes*
