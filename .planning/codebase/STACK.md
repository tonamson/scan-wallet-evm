# Technology Stack

**Analysis Date:** 2026-03-13

## Languages

**Primary:**
- JavaScript (ES modules) - Runtime implementation in `src/index.js`

**Secondary:**
- TypeScript declaration syntax - Public type surface in `src/index.d.ts` and verification in `typecheck.ts`
- Markdown - User-facing package documentation in `README.md`

## Runtime

**Environment:**
- Node.js - Required by the ESM package entrypoint and the built-in `node:test` suite
- No browser runtime is implemented or tested in this repository

**Package Manager:**
- npm or Yarn - `package.json` defines standard scripts and the README uses `yarn add`
- Lockfile: none committed, so the exact package manager/version is not pinned in-repo

## Frameworks

**Core:**
- `ethers` `^6.16.0` - JSON-RPC provider creation, address normalization, topic hashing, bigint helpers
- No application framework; this is a small library module rather than a server or CLI

**Testing:**
- Node built-in test runner - executed by `node --test test/*.test.js`
- `node:assert/strict` - assertion API used in `test/scan-erc20.test.js`

**Build/Dev:**
- TypeScript `^5.9.3` - used for declaration/type-check validation only, with `noEmit`
- Native ESM via `"type": "module"` in `package.json`

## Key Dependencies

**Critical:**
- `ethers` `^6.16.0` - every public API depends on its provider, address, and log utilities
- `https-proxy-agent` `^8.0.0` - optional proxy support for outbound JSON-RPC traffic

**Infrastructure:**
- `typescript` `^5.9.3` - verifies that the published declaration file matches intended consumption

## Configuration

**Environment:**
- No `.env` handling exists in this package
- Runtime configuration is provided entirely through function options such as `rpcUrl`, `wallet`, `proxy`, `fromBlock`, and `toBlock`

**Build:**
- `package.json` exposes the package as `scan-erc20-token` with `src/index.js` and `src/index.d.ts`
- `tsconfig.json` is configured for `NodeNext`, `strict`, and `noEmit`

## Platform Requirements

**Development:**
- Any platform that can run modern Node.js with ESM support
- Network access is only needed when calling a real RPC endpoint; tests are offline by default

**Production:**
- Suitable for back-end scripts, services, or CLIs that need ERC20 transfer scanning
- Consumers must supply a working EVM JSON-RPC endpoint and optionally an HTTP(S) proxy

## Notes For `src`

- The entire public implementation currently lives in `src/index.js`
- The package exports a minimal surface: `ERC20_TRANSFER_TOPIC`, `ERC20_TRANSFER_DIRECTIONS`, `createRpcProvider`, and `scanErc20Transfers`
- Any future dependency or runtime changes should be reflected here because downstream GSD planning will treat this file as the stack source of truth

*Stack analysis: 2026-03-13*
*Update after major dependency changes*
