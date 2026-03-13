import { ethers, FetchRequest } from "ethers";
import { HttpsProxyAgent } from "https-proxy-agent";
import {
  NATIVE_TRANSFER_DIRECTIONS,
  scanNativeTransfersWithProvider,
} from "./native.js";

/**
 * Topic hash of the ERC20 `Transfer(address,address,uint256)` event.
 */
export const ERC20_TRANSFER_TOPIC = ethers.id(
  "Transfer(address,address,uint256)"
);

/**
 * Supported scan directions for ERC20 transfer queries.
 */
export const ERC20_TRANSFER_DIRECTIONS = ["in", "out", "both"];

function normalizeAddress(address, fieldName) {
  if (!address) {
    throw new Error(`Missing ${fieldName}`);
  }

  return ethers.getAddress(address);
}

function addressToTopic(address) {
  return "0x000000000000000000000000" + address.slice(2).toLowerCase();
}

function resolveBlockNumber(blockNumber, fieldName) {
  if (blockNumber == null) {
    return null;
  }

  if (typeof blockNumber === "bigint") {
    if (blockNumber < 0n) {
      throw new Error(`${fieldName} must be >= 0`);
    }

    return blockNumber;
  }

  if (!Number.isInteger(blockNumber) || blockNumber < 0) {
    throw new Error(`${fieldName} must be a non-negative integer`);
  }

  return blockNumber;
}

function resolveDirection(direction) {
  if (direction == null) {
    return "both";
  }

  if (!ERC20_TRANSFER_DIRECTIONS.includes(direction)) {
    throw new Error('direction must be "in", "out", or "both"');
  }

  return direction;
}

function toProxyUrl(proxy) {
  if (!proxy) {
    return null;
  }

  if (typeof proxy === "string") {
    return proxy;
  }

  if (!proxy.url) {
    throw new Error("Missing proxy.url");
  }

  const proxyUrl = new URL(proxy.url);

  if (proxy.username != null) {
    proxyUrl.username = proxy.username;
  }

  if (proxy.password != null) {
    proxyUrl.password = proxy.password;
  }

  return proxyUrl.toString();
}

function resolveProxyUrl(options) {
  return toProxyUrl(options.proxy) ?? toProxyUrl(options.proxyUrl) ?? null;
}

/**
 * Creates an `ethers` JSON-RPC provider with optional timeout and proxy support.
 *
 * Pass `proxy` or `proxyUrl` as either a string URL or an object with
 * `url`, `username`, and `password`.
 *
 * @param {object} options Provider options.
 * @param {string} options.rpcUrl EVM JSON-RPC endpoint URL.
 * @param {string | {url: string, username?: string, password?: string} | null} [options.proxy]
 * Optional proxy configuration or proxy URL string.
 * @param {string | {url: string, username?: string, password?: string} | null} [options.proxyUrl]
 * Alias of `options.proxy`.
 * @param {number} [options.timeoutMs] Optional HTTP timeout in milliseconds.
 */
export function createRpcProvider(options) {
  const { rpcUrl, timeoutMs } = options;

  if (!rpcUrl) {
    throw new Error("Missing rpcUrl");
  }

  const request = new FetchRequest(rpcUrl);
  const proxyUrl = resolveProxyUrl(options);

  if (timeoutMs != null) {
    if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) {
      throw new Error("timeoutMs must be a positive integer");
    }

    request.timeout = timeoutMs;
  }

  if (proxyUrl) {
    request.getUrlFunc = FetchRequest.createGetUrlFunc({
      agent: new HttpsProxyAgent(proxyUrl),
    });
  }

  return new ethers.JsonRpcProvider(request);
}

/**
 * Scans top-level native transfers for a wallet.
 *
 * By default it scans both incoming and outgoing transfers. Use `direction`
 * to limit the query to only received (`in`) or sent (`out`) transfers.
 *
 * @param {object} options Scan options.
 * @param {string} options.rpcUrl EVM JSON-RPC endpoint URL.
 * @param {string} options.wallet Wallet address to scan.
 * @param {"in" | "out" | "both"} [options.direction] Scan incoming, outgoing, or both.
 * @param {number | bigint} [options.fromBlock] Optional start block.
 * If both `fromBlock` and `toBlock` are omitted, the scan starts at `latestBlock - 100`.
 * @param {number | bigint} [options.toBlock] Optional end block.
 * If both `fromBlock` and `toBlock` are omitted, the scan ends at `latestBlock`.
 * @param {string | {url: string, username?: string, password?: string} | null} [options.proxy]
 * Optional proxy configuration or proxy URL string.
 * @param {string | {url: string, username?: string, password?: string} | null} [options.proxyUrl]
 * Alias of `options.proxy`.
 * @param {number} [options.timeoutMs] Optional HTTP timeout in milliseconds.
 * @param {{
 *   getBlockNumber(): Promise<number>,
 *   getBlock(blockNumber: number, includeTransactions: boolean): Promise<{
 *     timestamp: number,
 *     transactions: Array<{
 *       from: string,
 *       to: string,
 *       value: bigint | string,
 *       hash: string,
 *       index: number
 *     }>
 *   } | null>,
 *   getTransactionReceipt(transactionHash: string): Promise<{ status: number | bigint } | null>
 * }} [options.provider] Optional custom provider implementation.
 */
export async function scanNativeTransfers(options) {
  const provider = options.provider ?? createRpcProvider(options);
  return scanNativeTransfersWithProvider({
    ...options,
    provider,
  });
}

function mapTransferLog(log, blockTimestamp) {
  return {
    token: ethers.getAddress(log.address),
    from: ethers.getAddress("0x" + log.topics[1].slice(26)),
    to: ethers.getAddress("0x" + log.topics[2].slice(26)),
    amount: ethers.toBigInt(log.data),
    tx: log.transactionHash,
    block: log.blockNumber,
    blockTimestamp,
    logIndex: log.index,
    transactionIndex: log.transactionIndex,
    data: log.data,
  };
}

/**
 * Scans ERC20 `Transfer` logs for a wallet.
 *
 * By default it scans both incoming and outgoing transfers. Use `direction`
 * to limit the query to only received (`in`) or sent (`out`) transfers.
 *
 * @param {object} options Scan options.
 * @param {string} options.rpcUrl EVM JSON-RPC endpoint URL.
 * @param {string} options.wallet Wallet address to scan.
 * @param {string | null} [options.tokenAddress] Optional ERC20 token contract filter.
 * @param {"in" | "out" | "both"} [options.direction] Scan incoming, outgoing, or both.
 * @param {number | bigint} [options.fromBlock] Optional start block.
 * If both `fromBlock` and `toBlock` are omitted, the scan starts at `latestBlock - 100`.
 * @param {number | bigint} [options.toBlock] Optional end block.
 * If both `fromBlock` and `toBlock` are omitted, the scan ends at `latestBlock`.
 * @param {string | {url: string, username?: string, password?: string} | null} [options.proxy]
 * Optional proxy configuration or proxy URL string.
 * @param {string | {url: string, username?: string, password?: string} | null} [options.proxyUrl]
 * Alias of `options.proxy`.
 * @param {number} [options.timeoutMs] Optional HTTP timeout in milliseconds.
 * @param {{
 *   getBlock(blockNumber: number): Promise<{ timestamp: number } | null>,
 *   getBlockNumber(): Promise<number>,
 *   getLogs(filter: unknown): Promise<Array<{
 *     address: string,
 *     blockNumber: number,
 *     data: string,
 *     index: number,
 *     topics: string[],
 *     transactionHash: string,
 *     transactionIndex: number
 *   }>>
 * }} [options.provider] Optional custom provider implementation.
 */
export async function scanErc20Transfers(options) {
  const wallet = normalizeAddress(options.wallet, "wallet");
  const tokenAddress = options.tokenAddress
    ? normalizeAddress(options.tokenAddress, "tokenAddress")
    : null;
  const fromBlock = resolveBlockNumber(options.fromBlock, "fromBlock");
  const toBlock = resolveBlockNumber(options.toBlock, "toBlock");
  const direction = resolveDirection(options.direction);

  if (fromBlock != null && toBlock != null && fromBlock > toBlock) {
    throw new Error("fromBlock cannot be greater than toBlock");
  }

  const provider = options.provider ?? createRpcProvider(options);
  const needsLatestBlock = toBlock == null || fromBlock == null;
  const latestBlock = needsLatestBlock ? await provider.getBlockNumber() : null;

  const resolvedToBlock = toBlock ?? latestBlock;
  const resolvedFromBlock =
    fromBlock ?? (toBlock == null ? Math.max(resolvedToBlock - 100, 0) : resolvedToBlock);
  const sharedFilter = {
    ...(tokenAddress ? { address: tokenAddress } : {}),
    fromBlock: resolvedFromBlock,
    toBlock: resolvedToBlock,
  };
  const directionTopics = {
    in: [ERC20_TRANSFER_TOPIC, null, addressToTopic(wallet)],
    out: [ERC20_TRANSFER_TOPIC, addressToTopic(wallet), null],
  };

  let logs;

  if (direction === "both") {
    const [incomingLogs, outgoingLogs] = await Promise.all([
      provider.getLogs({
        ...sharedFilter,
        topics: directionTopics.in,
      }),
      provider.getLogs({
        ...sharedFilter,
        topics: directionTopics.out,
      }),
    ]);

    const uniqueLogs = new Map();

    for (const log of [...incomingLogs, ...outgoingLogs]) {
      const key = `${log.transactionHash}:${log.index}:${log.address.toLowerCase()}`;
      uniqueLogs.set(key, log);
    }

    logs = [...uniqueLogs.values()];
  } else {
    logs = await provider.getLogs({
      ...sharedFilter,
      topics: directionTopics[direction],
    });
  }

  const blockTimestamps = new Map();
  const uniqueBlockNumbers = [...new Set(logs.map((log) => log.blockNumber))];

  for (const blockNumber of uniqueBlockNumbers) {
    const block = await provider.getBlock(blockNumber);

    if (!block) {
      throw new Error(`Block ${blockNumber} not found`);
    }

    blockTimestamps.set(blockNumber, block.timestamp);
  }

  return logs.map((log) => mapTransferLog(log, blockTimestamps.get(log.blockNumber)));
}

export { NATIVE_TRANSFER_DIRECTIONS };
