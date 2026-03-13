<div align="center">

# Scan Wallet EVM

Scan wallet-level EVM transfer activity with a minimal, typed API.

[![npm version](https://img.shields.io/npm/v/scan-erc20-token)](https://www.npmjs.com/package/scan-erc20-token)
[![license](https://img.shields.io/github/license/tonamson/scan-erc20-token)](./LICENSE)
[![typescript](https://img.shields.io/badge/TypeScript-ready-3178C6?logo=typescript&logoColor=white)](./src/index.d.ts)
[![ethers](https://img.shields.io/badge/ethers-v6-3c3c3d)](https://github.com/ethers-io/ethers.js/)

</div>

`scan-erc20-token` helps you inspect wallet activity on any EVM-compatible chain without building custom log filters or block walkers yourself.

It supports two scan modes:

- ERC20 `Transfer(address,address,uint256)` event scanning
- Top-level native coin transfer scanning

## Capabilities

| Capability | ERC20 | Native |
| --- | --- | --- |
| Incoming / outgoing / both | Yes | Yes |
| Block range filters | Yes | Yes |
| Custom RPC URL | Yes | Yes |
| Proxy support | Yes | Yes |
| Injected provider | Yes | Yes |
| Token contract filter | Yes | No |
| Returns `bigint` amounts | Yes | Yes |

## Installation

```bash
yarn add scan-erc20-token
```

## Requirements

- Node.js with ESM support
- An EVM-compatible JSON-RPC endpoint

## Quick Start

### ERC20 transfer scan

```js
import { scanErc20Transfers } from "scan-erc20-token";

const transfers = await scanErc20Transfers({
  rpcUrl: "https://your-evm-rpc.example.com",
  wallet: "0xYourWalletAddress",
  tokenAddress: "0xYourTokenContractAddress",
  direction: "both",
  fromBlock: 100,
  toBlock: 200,
});

console.log(transfers[0]);
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

### Native transfer scan

```js
import { scanNativeTransfers } from "scan-erc20-token";

const transfers = await scanNativeTransfers({
  rpcUrl: "https://your-evm-rpc.example.com",
  wallet: "0xYourWalletAddress",
  direction: "both",
  fromBlock: 74229500,
  toBlock: 74229500,
});

console.log(transfers[0]);
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

## Proxy Support

Pass a full proxy URL:

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
} from "scan-erc20-token";

const provider = createRpcProvider({
  rpcUrl: "https://your-evm-rpc.example.com",
  timeoutMs: 10_000,
});

const erc20Transfers = await scanErc20Transfers({
  provider,
  wallet: "0xYourWalletAddress",
  tokenAddress: "0xYourTokenContractAddress",
  direction: "both",
  fromBlock: 100,
  toBlock: 200,
});

const nativeTransfers = await scanNativeTransfers({
  provider,
  wallet: "0xYourWalletAddress",
  direction: "both",
  fromBlock: 74229500,
  toBlock: 74229500,
});

console.log(erc20Transfers.length, nativeTransfers.length);
```

## TypeScript

```ts
import {
  scanErc20Transfers,
  scanNativeTransfers,
  type Erc20Transfer,
  type NativeTransfer,
} from "scan-erc20-token";

const erc20Transfers: Erc20Transfer[] = await scanErc20Transfers({
  rpcUrl: "https://your-evm-rpc.example.com",
  wallet: "0xYourWalletAddress",
  direction: "in",
});

const nativeTransfers: NativeTransfer[] = await scanNativeTransfers({
  rpcUrl: "https://your-evm-rpc.example.com",
  wallet: "0xYourWalletAddress",
  direction: "both",
});
```

## API At A Glance

### `scanErc20Transfers(options)`

Scans ERC20 `Transfer` logs where the target wallet appears as sender, receiver, or both.

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

### `scanNativeTransfers(options)`

Scans successful top-level native transfers for the target wallet.

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

## Operational Notes

- If both `fromBlock` and `toBlock` are omitted, the scan defaults to the latest 100 blocks.
- If only `toBlock` is provided, `fromBlock` defaults to `toBlock`.
- If only `fromBlock` is provided, `toBlock` defaults to the latest block.
- Native scanning covers top-level transactions with non-zero native value only.
- Internal trace-based transfers are not included in native scans.
- Returned addresses are checksum-normalized.
- Returned amounts are raw `bigint` values and are not decimal-formatted.

## Development

```bash
yarn test
yarn typecheck
```

## License

MIT
