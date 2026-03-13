# Changelog

All notable changes to this project will be documented in this file.

## [1.0.6] - 2026-03-13

### Changed

- Renamed the project/package from `scan-erc20-token` to `scan-wallet-evm` so the name matches the current scope: scanning EVM wallets for both native token transfers and ERC20 token activity.

## [1.0.5] - 2026-03-13

### Added

- Added native token transfer scanning for EVM wallets via `scanNativeTransfers(...)`.
- Added public TypeScript types for native scanning, including `NativeTransfer`, `NativeScanProvider`, and `ScanNativeTransfersOptions`.
- Added `NATIVE_TRANSFER_DIRECTIONS` to the package root exports.

### Changed

- Aligned native scan options with the existing ERC20 API, including `direction`, block-range options, proxy support, timeout support, and injected provider support.
- Expanded the README with native transfer examples for JavaScript and TypeScript users.
- Expanded the mocked native test matrix for incoming, outgoing, and default-range scans.

### Fixed

- Fixed native scanning for `ethers` block responses that expose full transaction objects through `prefetchedTransactions`.
- Fixed the public type surface so `rpcUrl` is optional when a custom `provider` is supplied.

## [1.0.4] - 2026-03-12

### Added

- ERC20 transfer scanning with block-range filters, proxy support, and TypeScript declarations.
