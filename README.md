<div align="center">

# Scan Wallet EVM

Wallet scanner for native token and ERC20 transfers on EVM networks.

[![npm version](https://img.shields.io/npm/v/scan-wallet-evm)](https://www.npmjs.com/package/scan-wallet-evm)
[![license](https://img.shields.io/github/license/tonamson/scan-wallet-evm)](./LICENSE)
[![typescript](https://img.shields.io/badge/TypeScript-ready-3178C6?logo=typescript&logoColor=white)](./src/index.d.ts)
[![ethers](https://img.shields.io/badge/ethers-v6-3c3c3d)](https://github.com/ethers-io/ethers.js/)

</div>

`Scan Wallet EVM` is a small EVM wallet activity scanner.

It is built for two common jobs:

- Scan native coin transfers for a wallet on EVM chains such as ETH, BNB, MATIC, AVAX, and similar networks
- Scan ERC20 `Transfer(address,address,uint256)` events for a wallet, with an optional token contract filter

The package is useful when you want to inspect wallet inflow and outflow without writing your own log filters, block walkers, proxy handling, or `ethers` provider setup.

## What This Package Scans

### Native token scan

Use `scanNativeTransfers()` to find successful top-level transactions where the wallet sends or receives the chain's native token.

- Supports `in`, `out`, or `both`
- Supports custom block ranges
- Returns raw amount as `bigint`
- Works with custom RPC, proxy, or injected provider

Important: native scanning covers top-level native transfers only. It does not decode internal transactions from traces.

### ERC20 scan

Use `scanErc20Transfers()` to scan ERC20 `Transfer` logs involving a wallet.

- Supports `in`, `out`, or `both`
- Can scan all ERC20 contracts or a single `tokenAddress`
- Supports custom block ranges
- Returns raw amount as `bigint`
- Works with custom RPC, proxy, or injected provider

## Feature Summary

| Capability | ERC20 | Native |
| --- | --- | --- |
| Incoming / outgoing / both | Yes | Yes |
| Custom block range | Yes | Yes |
| Custom RPC URL | Yes | Yes |
| Proxy support | Yes | Yes |
| Injected provider | Yes | Yes |
| Single token contract filter | Yes | No |
| Raw amount as `bigint` | Yes | Yes |

## Installation

```bash
yarn add scan-wallet-evm
```

## Requirements

- Node.js with ESM support
- An EVM-compatible JSON-RPC endpoint

## Quick Start

### 1. Scan native token transfers

```js
import { scanNativeTransfers } from "scan-wallet-evm";

const nativeTransfers = await scanNativeTransfers({
  rpcUrl: "https://your-evm-rpc.example.com",
  wallet: "0xYourWalletAddress",
  direction: "both",
  fromBlock: 74229500,
  toBlock: 74229520,
});

console.log(nativeTransfers[0]);
```

Example record:

```js
{
  from: "0x...",
  to: "0x...",
  amount: 24259569238705576n,
  tx: "0x...",
  block: 74229500,
  blockTimestamp: 1767674408,
  transactionIndex: 99,
  direction: "in"
}
```

### 2. Scan ERC20 transfers

```js
import { scanErc20Transfers } from "scan-wallet-evm";

const erc20Transfers = await scanErc20Transfers({
  rpcUrl: "https://your-evm-rpc.example.com",
  wallet: "0xYourWalletAddress",
  tokenAddress: "0xYourTokenContractAddress",
  direction: "both",
  fromBlock: 100,
  toBlock: 200,
});

console.log(erc20Transfers[0]);
```

Example record:

```js
{
  token: "0x...",
  from: "0x...",
  to: "0x...",
  amount: 29688142670000000000n,
  tx: "0x...",
  block: 85570465,
  blockTimestamp: 1773052865,
  logIndex: 216,
  transactionIndex: 71,
  data: "0x..."
}
```

## Default Block Range Behavior

For both scan functions:

- If `fromBlock` and `toBlock` are both omitted, the package scans from `latestBlock - 100` to `latestBlock`
- If only `fromBlock` is omitted, it uses `toBlock` as a single-block scan
- If only `toBlock` is omitted, it scans from `fromBlock` to the latest block

## Proxy Support

Pass a proxy as a full URL:

```js
const transfers = await scanNativeTransfers({
  rpcUrl: "https://your-evm-rpc.example.com",
  wallet: "0xYourWalletAddress",
  proxy: "http://user:pass@proxy.example.com:8080",
});
```

Or pass a structured config:

```js
const transfers = await scanErc20Transfers({
  rpcUrl: "https://your-evm-rpc.example.com",
  wallet: "0xYourWalletAddress",
  direction: "out",
  proxy: {
    url: "http://proxy.example.com:8080",
    username: "my-user",
    password: "my-pass",
  },
});
```

`proxy` and `proxyUrl` are interchangeable aliases.

## Reuse a Provider

Use one shared provider across multiple scans:

```js
import {
  createRpcProvider,
  scanErc20Transfers,
  scanNativeTransfers,
} from "scan-wallet-evm";

const provider = createRpcProvider({
  rpcUrl: "https://your-evm-rpc.example.com",
  timeoutMs: 10_000,
});

const nativeTransfers = await scanNativeTransfers({
  provider,
  wallet: "0xYourWalletAddress",
  direction: "both",
  fromBlock: 74229500,
  toBlock: 74229520,
});

const erc20Transfers = await scanErc20Transfers({
  provider,
  wallet: "0xYourWalletAddress",
  tokenAddress: "0xYourTokenContractAddress",
  direction: "both",
  fromBlock: 100,
  toBlock: 200,
});

console.log(nativeTransfers.length, erc20Transfers.length);
```

## TypeScript

```ts
import {
  scanErc20Transfers,
  scanNativeTransfers,
  type Erc20Transfer,
  type NativeTransfer,
} from "scan-wallet-evm";

const nativeTransfers: NativeTransfer[] = await scanNativeTransfers({
  rpcUrl: "https://your-evm-rpc.example.com",
  wallet: "0xYourWalletAddress",
  direction: "both",
});

const erc20Transfers: Erc20Transfer[] = await scanErc20Transfers({
  rpcUrl: "https://your-evm-rpc.example.com",
  wallet: "0xYourWalletAddress",
  direction: "in",
});
```

## API Overview

### `scanNativeTransfers(options)`

Scans successful top-level native token transfers for a wallet.

| Option | Type | Notes |
| --- | --- | --- |
| `wallet` | `string` | Required wallet address |
| `rpcUrl` | `string` | Optional when `provider` is supplied |
| `direction` | `"in" \| "out" \| "both"` | Defaults to `"both"` |
| `fromBlock` | `number \| bigint` | Optional start block |
| `toBlock` | `number \| bigint` | Optional end block |
| `proxy` | `string \| ProxyConfig \| null` | Optional proxy config |
| `proxyUrl` | `string \| ProxyConfig \| null` | Alias of `proxy` |
| `timeoutMs` | `number` | Optional HTTP timeout |
| `provider` | `NativeScanProvider` | Optional custom provider |

Returns `Promise<NativeTransfer[]>`.

### `scanErc20Transfers(options)`

Scans ERC20 `Transfer` logs where the wallet is sender, receiver, or both.

| Option | Type | Notes |
| --- | --- | --- |
| `wallet` | `string` | Required wallet address |
| `rpcUrl` | `string` | Optional when `provider` is supplied |
| `tokenAddress` | `string \| null` | Optional ERC20 contract filter |
| `direction` | `"in" \| "out" \| "both"` | Defaults to `"both"` |
| `fromBlock` | `number \| bigint` | Optional start block |
| `toBlock` | `number \| bigint` | Optional end block |
| `proxy` | `string \| ProxyConfig \| null` | Optional proxy config |
| `proxyUrl` | `string \| ProxyConfig \| null` | Alias of `proxy` |
| `timeoutMs` | `number` | Optional HTTP timeout |
| `provider` | `ScanProvider` | Optional custom provider |

Returns `Promise<Erc20Transfer[]>`.

### `createRpcProvider(options)`

Creates an `ethers` `JsonRpcProvider` with optional timeout and proxy support.

```ts
createRpcProvider({
  rpcUrl: string,
  proxy?: string | ProxyConfig | null,
  proxyUrl?: string | ProxyConfig | null,
  timeoutMs?: number,
})
```

### `ProxyConfig`

```ts
type ProxyConfig = {
  url: string;
  username?: string;
  password?: string;
};
```

## Development

```bash
yarn test
yarn typecheck
```

## License

MIT
