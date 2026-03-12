# Scan wallet transaction token ERC20

Scan all incoming and outgoing ERC20 token transfers of an EVM wallet

Supports:
- custom `rpcUrl`
- optional proxy
- optional `fromBlock`
- optional `toBlock`
- optional `direction` filter: `in`, `out`, `both`
- optional token contract filter via `tokenAddress`
- JavaScript and TypeScript consumers

## Install

```bash
yarn add scan-erc20-token
```

## JavaScript

```js
import { scanErc20Transfers } from "scan-erc20-token";

const transfers = await scanErc20Transfers({
  rpcUrl: "https://your-evm-rpc.example.com",
  wallet: "0xYourWalletAddress",
  tokenAddress: "0xYourTokenContractAddress",
  direction: "both",
  proxy: "http://127.0.0.1:7890",
  fromBlock: 100,
  toBlock: 200,
});

console.log(transfers[0]);
```

Example response shape:

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

Proxy with username/password:

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

You can also pass proxy credentials directly in the URL:

```js
const transfers = await scanErc20Transfers({
  rpcUrl: "https://your-evm-rpc.example.com",
  wallet: "0xYourWalletAddress",
  proxy: "http://my-user:my-pass@proxy.example.com:8080",
});
```

## TypeScript

```ts
import { scanErc20Transfers, type Erc20Transfer } from "scan-erc20-token";

const transfers: Erc20Transfer[] = await scanErc20Transfers({
  rpcUrl: "https://your-evm-rpc.example.com",
  wallet: "0xYourWalletAddress",
  direction: "in",
  fromBlock: 100,
  toBlock: 200,
});
```

## Reuse A Provider

```js
import { createRpcProvider, scanErc20Transfers } from "scan-erc20-token";

const provider = createRpcProvider({
  rpcUrl: "https://your-evm-rpc.example.com",
  proxy: {
    url: "http://proxy.example.com:8080",
    username: "my-user",
    password: "my-pass",
  },
});

const transfers = await scanErc20Transfers({
  provider,
  rpcUrl: "https://your-evm-rpc.example.com",
  wallet: "0xYourWalletAddress",
  tokenAddress: "0xYourTokenContractAddress",
  direction: "both",
  fromBlock: 100,
  toBlock: 200,
});
```

## API

```ts
scanErc20Transfers({
  rpcUrl: string,
  wallet: string,
  tokenAddress?: string | null,
  direction?: "in" | "out" | "both",
  proxy?: string | ProxyConfig | null,
  proxyUrl?: string | ProxyConfig | null,
  fromBlock?: number | bigint,
  toBlock?: number | bigint,
  timeoutMs?: number,
  provider?: JsonRpcProvider,
}): Promise<Erc20Transfer[]>
```

```ts
createRpcProvider({
  rpcUrl: string,
  proxy?: string | ProxyConfig | null,
  proxyUrl?: string | ProxyConfig | null,
  timeoutMs?: number,
}): JsonRpcProvider
```

```ts
type ProxyConfig = {
  url: string
  username?: string
  password?: string
}
```

```ts
type Erc20Transfer = {
  token: string
  from: string
  to: string
  amount: bigint
  tx: string
  block: number
  blockTimestamp: number
  logIndex: number
  transactionIndex: number
  data: string
}
```

## Notes

If `toBlock` is omitted, the latest block is used.
If `fromBlock` is omitted, it scans only `toBlock`.
If `tokenAddress` is provided, the RPC query filters by that contract address directly.
If `direction` is omitted, it scans both incoming and outgoing transfers.
Each returned transfer includes `blockTimestamp`.
Some RPC providers have strict rate limits. For example, free plans may reject repeated `getBlock` calls with `429 Too Many Requests`.

## Tests

Run the standard test suite:

```bash
yarn test
```

This runs the Node.js test runner with mocked provider data.
Tests do not require a real RPC endpoint and do not expose live mainnet URLs or personal transaction hashes.
