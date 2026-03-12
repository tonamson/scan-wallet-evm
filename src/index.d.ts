import type {
  Block,
  JsonRpcProvider,
  Log,
  PerformActionFilter,
} from "ethers";

/**
 * Topic hash of the ERC20 `Transfer(address,address,uint256)` event.
 */
export declare const ERC20_TRANSFER_TOPIC: string;

/**
 * Supported scan directions.
 *
 * - `in`: only transfers received by `wallet`
 * - `out`: only transfers sent from `wallet`
 * - `both`: merge incoming and outgoing transfers
 */
export declare const ERC20_TRANSFER_DIRECTIONS: readonly [
  "in",
  "out",
  "both",
];

export type Erc20TransferDirection =
  (typeof ERC20_TRANSFER_DIRECTIONS)[number];

export interface ProxyConfig {
  /**
   * Full proxy URL, for example `http://proxy.example.com:8080`.
   */
  url: string;

  /**
   * Optional proxy username. If provided, it is injected into the proxy URL.
   */
  username?: string;

  /**
   * Optional proxy password. If provided, it is injected into the proxy URL.
   */
  password?: string;
}

export interface RpcProviderOptions {
  /**
   * EVM JSON-RPC endpoint URL.
   */
  rpcUrl: string;

  /**
   * Optional proxy configuration.
   *
   * You can pass a string URL such as `http://user:pass@host:port`
   * or an object with `url`, `username`, and `password`.
   */
  proxy?: string | ProxyConfig | null;

  /**
   * Alias of `proxy`.
   */
  proxyUrl?: string | ProxyConfig | null;

  /**
   * Optional HTTP timeout in milliseconds.
   */
  timeoutMs?: number;
}

export interface ScanErc20TransfersOptions extends RpcProviderOptions {
  /**
   * Wallet address to scan.
   */
  wallet: string;

  /**
   * Optional ERC20 token contract address.
   *
   * If provided, the RPC query is filtered to this token contract only.
   */
  tokenAddress?: string | null;

  /**
   * Optional start block.
   *
   * If omitted, the scan uses `toBlock`.
   */
  fromBlock?: number | bigint;

  /**
   * Optional end block.
   *
   * If omitted, the latest block number is used.
   */
  toBlock?: number | bigint;

  /**
   * Defaults to `both`.
   */
  direction?: Erc20TransferDirection;

  /**
   * Optional custom provider.
   *
   * If omitted, `createRpcProvider(options)` is used internally.
   */
  provider?: ScanProvider;
}

export interface Erc20Transfer {
  /**
   * ERC20 token contract address that emitted the `Transfer` log.
   */
  token: string;

  /**
   * Sender address from the event.
   */
  from: string;

  /**
   * Receiver address from the event.
   */
  to: string;

  /**
   * Raw token amount as a `bigint`.
   */
  amount: bigint;

  /**
   * Transaction hash containing the log.
   */
  tx: string;

  /**
   * Block number containing the log.
   */
  block: number;

  /**
   * Unix timestamp of the block.
   */
  blockTimestamp: number;

  /**
   * Log index inside the block.
   */
  logIndex: number;

  /**
   * Transaction index inside the block.
   */
  transactionIndex: number;

  /**
   * Raw log data field.
   */
  data: string;
}

export interface ScanProvider {
  /**
   * Returns the block for a given block number.
   */
  getBlock(blockNumber: number): Promise<Block | null>;

  /**
   * Returns the latest block number.
   */
  getBlockNumber(): Promise<number>;

  /**
   * Queries logs using an EVM log filter.
   */
  getLogs(filter: PerformActionFilter): Promise<Array<Log>>;
}

/**
 * Creates an `ethers` JSON-RPC provider with optional proxy and timeout support.
 *
 * @param options.rpcUrl EVM JSON-RPC endpoint URL.
 * @param options.proxy Optional proxy configuration or proxy URL string.
 * @param options.proxyUrl Alias of `options.proxy`.
 * @param options.timeoutMs Optional HTTP timeout in milliseconds.
 */
export declare function createRpcProvider(
  options: RpcProviderOptions
): JsonRpcProvider;

/**
 * Scans ERC20 transfer logs for the given wallet.
 *
 * If `direction` is omitted, both incoming and outgoing transfers are returned.
 *
 * @param options.rpcUrl EVM JSON-RPC endpoint URL.
 * @param options.wallet Wallet address to scan.
 * @param options.tokenAddress Optional token contract filter.
 * @param options.direction Scan incoming, outgoing, or both directions.
 * @param options.proxy Optional proxy configuration or proxy URL string.
 * @param options.proxyUrl Alias of `options.proxy`.
 * @param options.fromBlock Optional start block.
 * @param options.toBlock Optional end block.
 * @param options.timeoutMs Optional HTTP timeout in milliseconds.
 * @param options.provider Optional custom provider implementation.
 */
export declare function scanErc20Transfers(
  options: ScanErc20TransfersOptions
): Promise<Erc20Transfer[]>;
