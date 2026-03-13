import assert from "node:assert/strict";
import test from "node:test";

import { ethers } from "ethers";

import {
  NATIVE_TRANSFER_DIRECTIONS,
  scanErc20Transfers,
  scanNativeTransfers,
} from "scan-erc20-token";

function createNativeProvider({ blocks, latestBlock, receipts }) {
  const calls = {
    getBlock: [],
    getBlockNumber: 0,
    getTransactionReceipt: [],
  };

  const provider = {
    async getBlockNumber() {
      calls.getBlockNumber += 1;
      return latestBlock;
    },

    async getBlock(blockNumber, includeTransactions) {
      calls.getBlock.push({ blockNumber, includeTransactions });
      return blocks[blockNumber] ?? {
        number: blockNumber,
        timestamp: blockNumber,
        transactions: [],
      };
    },

    async getTransactionReceipt(transactionHash) {
      calls.getTransactionReceipt.push(transactionHash);
      return receipts[transactionHash] ?? null;
    },
  };

  return { calls, provider };
}

test("scanNativeTransfers returns incoming and outgoing native transfers for top-level value transactions", async () => {
  const wallet = "0x1000000000000000000000000000000000000001";
  const contract = "0x2000000000000000000000000000000000000002";
  const sender = "0x3000000000000000000000000000000000000003";
  const contractSender = "0x4000000000000000000000000000000000000004";

  const incomingTx = {
    from: sender,
    to: wallet,
    value: 7n,
    hash: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    index: 0,
  };
  const outgoingContractCall = {
    from: wallet,
    to: contract,
    value: 5n,
    hash: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    index: 1,
  };
  const incomingFromContract = {
    from: contractSender,
    to: wallet,
    value: 9n,
    hash: "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
    index: 2,
  };

  const { calls, provider } = createNativeProvider({
    latestBlock: 10,
    blocks: {
      10: {
        timestamp: 1773055000,
        transactions: [incomingTx, outgoingContractCall, incomingFromContract],
      },
    },
    receipts: {
      [incomingTx.hash]: { status: 1 },
      [outgoingContractCall.hash]: { status: 1 },
      [incomingFromContract.hash]: { status: 1 },
    },
  });

  const incoming = await scanNativeTransfers({
    provider,
    wallet,
    direction: "in",
    fromBlock: 10,
    toBlock: 10,
  });
  const outgoing = await scanNativeTransfers({
    provider,
    wallet,
    direction: "out",
    fromBlock: 10,
    toBlock: 10,
  });

  assert.equal(calls.getBlockNumber, 0);
  assert.equal(incoming.length, 2);
  assert.equal(outgoing.length, 1);
  assert.deepEqual(incoming.map((item) => item.direction), ["in", "in"]);
  assert.equal(outgoing[0].direction, "out");
  assert.equal(outgoing[0].to, ethers.getAddress(contract));
  assert.equal(outgoing[0].amount, 5n);
  assert.equal(incoming[0].to, ethers.getAddress(wallet));
  assert.equal(incoming[1].from, ethers.getAddress(contractSender));
});

test("scanNativeTransfers duplicates self-transfers in both mode", async () => {
  const wallet = "0x5000000000000000000000000000000000000005";
  const selfTx = {
    from: wallet,
    to: wallet,
    value: 11n,
    hash: "0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
    index: 3,
  };

  const { provider } = createNativeProvider({
    latestBlock: 20,
    blocks: {
      20: {
        timestamp: 1773056000,
        transactions: [selfTx],
      },
    },
    receipts: {
      [selfTx.hash]: { status: 1 },
    },
  });

  const transfers = await scanNativeTransfers({
    provider,
    wallet,
    direction: "both",
    fromBlock: 20,
    toBlock: 20,
  });

  assert.equal(transfers.length, 2);
  assert.deepEqual(
    transfers.map((item) => item.direction),
    ["in", "out"]
  );
  assert.equal(transfers[0].tx, selfTx.hash);
  assert.equal(transfers[1].tx, selfTx.hash);
});

test("scanNativeTransfers excludes failed and zero-value transactions", async () => {
  const wallet = "0x6000000000000000000000000000000000000006";
  const failedTx = {
    from: "0x7000000000000000000000000000000000000007",
    to: wallet,
    value: 4n,
    hash: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    index: 0,
  };
  const zeroValueTx = {
    from: wallet,
    to: "0x8000000000000000000000000000000000000008",
    value: 0n,
    hash: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    index: 1,
  };

  const { calls, provider } = createNativeProvider({
    latestBlock: 30,
    blocks: {
      30: {
        timestamp: 1773057000,
        transactions: [failedTx, zeroValueTx],
      },
    },
    receipts: {
      [failedTx.hash]: { status: 0 },
    },
  });

  const transfers = await scanNativeTransfers({
    provider,
    wallet,
    direction: "both",
    fromBlock: 30,
    toBlock: 30,
  });

  assert.equal(transfers.length, 0);
  assert.deepEqual(calls.getTransactionReceipt, [failedTx.hash]);
});

test("scanNativeTransfers uses the latest-100-block fallback window", async () => {
  const wallet = "0x9000000000000000000000000000000000000009";
  const tx = {
    from: "0xa00000000000000000000000000000000000000a",
    to: wallet,
    value: 1n,
    hash: "0x1111111111111111111111111111111111111111111111111111111111111111",
    index: 0,
  };

  const { calls, provider } = createNativeProvider({
    latestBlock: 205,
    blocks: {
      105: {
        timestamp: 1773058000,
        transactions: [tx],
      },
    },
    receipts: {
      [tx.hash]: { status: 1 },
    },
  });

  const transfers = await scanNativeTransfers({
    provider,
    wallet,
    direction: "in",
  });

  assert.equal(calls.getBlockNumber, 1);
  assert.equal(calls.getBlock[0].blockNumber, 105);
  assert.equal(calls.getBlock.at(-1).blockNumber, 205);
  assert.equal(transfers.length, 1);
  assert.equal(transfers[0].block, 105);
  assert.equal(transfers[0].blockTimestamp, 1773058000);
});

test("scanNativeTransfers rejects invalid block ranges", async () => {
  const { provider } = createNativeProvider({
    latestBlock: 10,
    blocks: {},
    receipts: {},
  });

  await assert.rejects(
    () =>
      scanNativeTransfers({
        provider,
        wallet: "0xb00000000000000000000000000000000000000b",
        fromBlock: 11,
        toBlock: 10,
      }),
    /fromBlock cannot be greater than toBlock/
  );
});

test("scanNativeTransfers uses toBlock when fromBlock is omitted", async () => {
  const wallet = "0xc00000000000000000000000000000000000000c";
  const tx = {
    from: "0xd00000000000000000000000000000000000000d",
    to: wallet,
    value: 3n,
    hash: "0x2222222222222222222222222222222222222222222222222222222222222222",
    index: 0,
  };

  const { calls, provider } = createNativeProvider({
    latestBlock: 999,
    blocks: {
      44: {
        timestamp: 1773059000,
        transactions: [tx],
      },
    },
    receipts: {
      [tx.hash]: { status: 1 },
    },
  });

  const transfers = await scanNativeTransfers({
    provider,
    wallet,
    toBlock: 44,
    direction: "in",
  });

  assert.equal(calls.getBlockNumber, 1);
  assert.deepEqual(
    calls.getBlock.map((call) => call.blockNumber),
    [44]
  );
  assert.equal(transfers.length, 1);
  assert.equal(transfers[0].block, 44);
});

test("package root exports native helpers without changing the ERC20 API", async () => {
  assert.deepEqual(NATIVE_TRANSFER_DIRECTIONS, ["in", "out", "both"]);
  assert.equal(typeof scanNativeTransfers, "function");
  assert.equal(typeof scanErc20Transfers, "function");
});

test("scanNativeTransfers accepts the same provider-style options as the ERC20 scan", async () => {
  const wallet = "0xe00000000000000000000000000000000000000e";
  const tx = {
    from: "0xf00000000000000000000000000000000000000f",
    to: wallet,
    value: "0x04",
    hash: "0x3333333333333333333333333333333333333333333333333333333333333333",
    index: 2,
  };

  const proxy = {
    url: "http://proxy.example.test:8080",
    username: "alice",
    password: "secret",
  };
  const { provider } = createNativeProvider({
    latestBlock: 55,
    blocks: {
      55: {
        timestamp: 1773060000,
        transactions: [tx],
      },
    },
    receipts: {
      [tx.hash]: { status: 1 },
    },
  });

  const transfers = await scanNativeTransfers({
    provider,
    wallet,
    direction: "in",
    rpcUrl: "https://rpc.example.test",
    proxy,
    proxyUrl: "http://ignored.example.test:8080",
    timeoutMs: 15_000,
    fromBlock: 55,
    toBlock: 55,
  });

  assert.equal(transfers.length, 1);
  assert.equal(transfers[0].amount, 4n);
  assert.equal(transfers[0].direction, "in");
});
