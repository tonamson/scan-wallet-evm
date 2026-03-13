import { ethers } from "ethers";

const NATIVE_TRANSFER_DIRECTIONS = ["in", "out", "both"];

function normalizeAddress(address, fieldName) {
  if (!address) {
    throw new Error(`Missing ${fieldName}`);
  }

  return ethers.getAddress(address);
}

function resolveBlockNumber(blockNumber, fieldName) {
  if (blockNumber == null) {
    return null;
  }

  if (typeof blockNumber === "bigint") {
    if (blockNumber < 0n) {
      throw new Error(`${fieldName} must be >= 0`);
    }

    return Number(blockNumber);
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

  if (!NATIVE_TRANSFER_DIRECTIONS.includes(direction)) {
    throw new Error('direction must be "in", "out", or "both"');
  }

  return direction;
}

function resolveBlockBounds({ fromBlock, toBlock }, latestBlock) {
  const resolvedToBlock = toBlock ?? latestBlock;
  const resolvedFromBlock =
    fromBlock ?? (toBlock == null ? Math.max(resolvedToBlock - 100, 0) : resolvedToBlock);

  return {
    fromBlock: resolvedFromBlock,
    toBlock: resolvedToBlock,
  };
}

function normalizeBlock(block, blockNumber) {
  if (!block) {
    throw new Error(`Block ${blockNumber} not found`);
  }

  if (!Array.isArray(block.transactions)) {
    throw new Error(`Block ${blockNumber} is missing transactions`);
  }

  return block;
}

function mapNativeTransfer({ blockTimestamp, direction, transaction }) {
  return {
    from: ethers.getAddress(transaction.from),
    to: ethers.getAddress(transaction.to),
    amount: ethers.toBigInt(transaction.value),
    tx: transaction.hash,
    block: transaction.blockNumber,
    blockTimestamp,
    transactionIndex: transaction.index,
    direction,
  };
}

async function getSuccessfulReceipt(provider, transactionHash) {
  const receipt = await provider.getTransactionReceipt(transactionHash);

  if (!receipt) {
    throw new Error(`Receipt ${transactionHash} not found`);
  }

  return receipt;
}

function matchDirections(transaction, wallet) {
  const from = ethers.getAddress(transaction.from);
  const to = ethers.getAddress(transaction.to);
  const matchesIncoming = to === wallet;
  const matchesOutgoing = from === wallet;

  return {
    in: matchesIncoming,
    out: matchesOutgoing,
  };
}

/**
 * Internal provider-driven native transfer scan used by Phase 1 execution.
 *
 * Expected provider shape:
 * - `getBlockNumber(): Promise<number>`
 * - `getBlock(blockNumber: number, includeTransactions: boolean): Promise<{ timestamp: number, transactions: Array<TransactionLike> } | null>`
 * - `getTransactionReceipt(txHash: string): Promise<{ status: number | bigint } | null>`
 */
export async function scanNativeTransfersWithProvider(options) {
  const wallet = normalizeAddress(options.wallet, "wallet");
  const fromBlock = resolveBlockNumber(options.fromBlock, "fromBlock");
  const toBlock = resolveBlockNumber(options.toBlock, "toBlock");
  const direction = resolveDirection(options.direction);

  if (fromBlock != null && toBlock != null && fromBlock > toBlock) {
    throw new Error("fromBlock cannot be greater than toBlock");
  }

  const provider = options.provider;

  if (!provider) {
    throw new Error("Missing provider");
  }

  const latestBlock = fromBlock == null || toBlock == null ? await provider.getBlockNumber() : null;
  const bounds = resolveBlockBounds({ fromBlock, toBlock }, latestBlock);
  const transfers = [];

  for (let blockNumber = bounds.fromBlock; blockNumber <= bounds.toBlock; blockNumber += 1) {
    const block = normalizeBlock(await provider.getBlock(blockNumber, true), blockNumber);

    for (const transaction of block.transactions) {
      if (!transaction || transaction.to == null) {
        continue;
      }

      const value = ethers.toBigInt(transaction.value);

      if (value === 0n) {
        continue;
      }

      const { in: matchesIncoming, out: matchesOutgoing } = matchDirections(transaction, wallet);

      if (
        (direction === "in" && !matchesIncoming) ||
        (direction === "out" && !matchesOutgoing) ||
        (direction === "both" && !matchesIncoming && !matchesOutgoing)
      ) {
        continue;
      }

      const receipt = await getSuccessfulReceipt(provider, transaction.hash);

      if (receipt.status !== 1 && receipt.status !== 1n) {
        continue;
      }

      const normalizedTransaction = {
        ...transaction,
        blockNumber,
      };

      if (direction === "in") {
        transfers.push(
          mapNativeTransfer({
            blockTimestamp: block.timestamp,
            direction: "in",
            transaction: normalizedTransaction,
          })
        );
        continue;
      }

      if (direction === "out") {
        transfers.push(
          mapNativeTransfer({
            blockTimestamp: block.timestamp,
            direction: "out",
            transaction: normalizedTransaction,
          })
        );
        continue;
      }

      if (matchesIncoming) {
        transfers.push(
          mapNativeTransfer({
            blockTimestamp: block.timestamp,
            direction: "in",
            transaction: normalizedTransaction,
          })
        );
      }

      if (matchesOutgoing) {
        transfers.push(
          mapNativeTransfer({
            blockTimestamp: block.timestamp,
            direction: "out",
            transaction: normalizedTransaction,
          })
        );
      }
    }
  }

  return transfers;
}
