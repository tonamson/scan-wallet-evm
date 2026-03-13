import assert from "node:assert/strict";
import test from "node:test";

import { ethers } from "ethers";

import { scanErc20Transfers } from "scan-wallet-evm";

function addressToTopic(address) {
  return "0x000000000000000000000000" + address.slice(2).toLowerCase();
}

function createMockProvider({ logs, blockTimestamps, latestBlock = 0 }) {
  const calls = {
    getBlock: [],
    getBlockNumber: 0,
    getLogs: [],
  };

  const provider = {
    async getBlock(blockNumber) {
      calls.getBlock.push(blockNumber);

      if (!(blockNumber in blockTimestamps)) {
        return null;
      }

      return {
        number: blockNumber,
        timestamp: blockTimestamps[blockNumber],
      };
    },

    async getBlockNumber() {
      calls.getBlockNumber += 1;
      return latestBlock;
    },

    async getLogs(filter) {
      calls.getLogs.push(filter);
      return logs;
    },
  };

  return { calls, provider };
}

function createDirectionalMockProvider({
  incomingLogs,
  outgoingLogs,
  blockTimestamps,
  latestBlock = 0,
}) {
  const calls = {
    getBlock: [],
    getBlockNumber: 0,
    getLogs: [],
  };

  const provider = {
    async getBlock(blockNumber) {
      calls.getBlock.push(blockNumber);

      if (!(blockNumber in blockTimestamps)) {
        return null;
      }

      return {
        number: blockNumber,
        timestamp: blockTimestamps[blockNumber],
      };
    },

    async getBlockNumber() {
      calls.getBlockNumber += 1;
      return latestBlock;
    },

    async getLogs(filter) {
      calls.getLogs.push(filter);

      if (filter.topics[1] == null) {
        return incomingLogs;
      }

      return outgoingLogs;
    },
  };

  return { calls, provider };
}

test("scanErc20Transfers maps ERC20 transfer logs and block timestamps", async () => {
  const wallet = "0x1000000000000000000000000000000000000001";
  const token = "0x2000000000000000000000000000000000000002";
  const from = "0x3000000000000000000000000000000000000003";

  const amount = 29688142670000000000n;
  const log = {
    address: token,
    blockNumber: 123456,
    data: ethers.toBeHex(amount, 32),
    index: 7,
    topics: [
      ethers.id("Transfer(address,address,uint256)"),
      addressToTopic(from),
      addressToTopic(wallet),
    ],
    transactionHash:
      "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    transactionIndex: 2,
  };

  const { calls, provider } = createMockProvider({
    logs: [log],
    blockTimestamps: {
      123456: 1773052865,
    },
  });

  const transfers = await scanErc20Transfers({
    provider,
    rpcUrl: "https://rpc.example.test",
    wallet,
    fromBlock: 123450,
    toBlock: 123460,
    direction: "in",
  });

  assert.equal(calls.getBlockNumber, 0);
  assert.equal(calls.getBlock.length, 1);
  assert.equal(calls.getBlock[0], 123456);
  assert.equal(calls.getLogs.length, 1);
  assert.deepEqual(calls.getLogs[0], {
    fromBlock: 123450,
    toBlock: 123460,
    topics: [ethers.id("Transfer(address,address,uint256)"), null, addressToTopic(wallet)],
  });

  assert.equal(transfers.length, 1);
  assert.deepEqual(transfers[0], {
    amount,
    block: 123456,
    blockTimestamp: 1773052865,
    data: ethers.toBeHex(amount, 32),
    from,
    logIndex: 7,
    to: wallet,
    token,
    transactionIndex: 2,
    tx: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  });
});

test("scanErc20Transfers applies tokenAddress filter and resolves latest block when omitted", async () => {
  const wallet = "0x4000000000000000000000000000000000000004";
  const token = "0x5000000000000000000000000000000000000005";

  const firstLog = {
    address: token,
    blockNumber: 888888,
    data: ethers.toBeHex(1n, 32),
    index: 1,
    topics: [
      ethers.id("Transfer(address,address,uint256)"),
      addressToTopic("0x6000000000000000000000000000000000000006"),
      addressToTopic(wallet),
    ],
    transactionHash:
      "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    transactionIndex: 3,
  };

  const secondLog = {
    ...firstLog,
    index: 2,
    transactionHash:
      "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
  };

  const { calls, provider } = createMockProvider({
    logs: [firstLog, secondLog],
    blockTimestamps: {
      888888: 1773053000,
    },
    latestBlock: 888888,
  });

  const transfers = await scanErc20Transfers({
    provider,
    rpcUrl: "https://rpc.example.test",
    wallet,
    tokenAddress: token,
  });

  assert.equal(calls.getBlockNumber, 1);
  assert.equal(calls.getBlock.length, 1);
  assert.deepEqual(calls.getLogs[0], {
    address: token,
    fromBlock: 888788,
    toBlock: 888888,
    topics: [ethers.id("Transfer(address,address,uint256)"), null, addressToTopic(wallet)],
  });
  assert.equal(transfers.length, 2);
  assert.equal(transfers[0].blockTimestamp, 1773053000);
  assert.equal(transfers[1].blockTimestamp, 1773053000);
});

test("scanErc20Transfers defaults to the latest 100 blocks when fromBlock and toBlock are omitted", async () => {
  const wallet = "0xd00000000000000000000000000000000000000d";
  const token = "0xe00000000000000000000000000000000000000e";

  const { calls, provider } = createMockProvider({
    logs: [],
    blockTimestamps: {},
    latestBlock: 5000,
  });

  await scanErc20Transfers({
    provider,
    rpcUrl: "https://rpc.example.test",
    wallet,
    tokenAddress: token,
    direction: "in",
  });

  assert.equal(calls.getBlockNumber, 1);
  assert.deepEqual(calls.getLogs[0], {
    address: ethers.getAddress(token),
    fromBlock: 4900,
    toBlock: 5000,
    topics: [ethers.id("Transfer(address,address,uint256)"), null, addressToTopic(wallet)],
  });
});

test('scanErc20Transfers filters outgoing transfers when direction is "out"', async () => {
  const wallet = "0x7000000000000000000000000000000000000007";
  const token = "0x8000000000000000000000000000000000000008";
  const receiver = "0x9000000000000000000000000000000000000009";
  const outgoingLog = {
    address: token,
    blockNumber: 777777,
    data: ethers.toBeHex(5n, 32),
    index: 4,
    topics: [
      ethers.id("Transfer(address,address,uint256)"),
      addressToTopic(wallet),
      addressToTopic(receiver),
    ],
    transactionHash:
      "0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
    transactionIndex: 6,
  };

  const { calls, provider } = createDirectionalMockProvider({
    incomingLogs: [],
    outgoingLogs: [outgoingLog],
    blockTimestamps: {
      777777: 1773054000,
    },
  });

  const transfers = await scanErc20Transfers({
    provider,
    rpcUrl: "https://rpc.example.test",
    wallet,
    tokenAddress: token,
    fromBlock: 777770,
    toBlock: 777780,
    direction: "out",
  });

  assert.equal(calls.getLogs.length, 1);
  assert.deepEqual(calls.getLogs[0], {
    address: token,
    fromBlock: 777770,
    toBlock: 777780,
    topics: [ethers.id("Transfer(address,address,uint256)"), addressToTopic(wallet), null],
  });
  assert.equal(transfers.length, 1);
  assert.equal(transfers[0].from, wallet);
  assert.equal(transfers[0].to, receiver);
});

test('scanErc20Transfers defaults to direction "both" and deduplicates self-transfers', async () => {
  const wallet = "0xa00000000000000000000000000000000000000a";
  const token = "0xb00000000000000000000000000000000000000b";
  const incomingLog = {
    address: token,
    blockNumber: 999999,
    data: ethers.toBeHex(9n, 32),
    index: 10,
    topics: [
      ethers.id("Transfer(address,address,uint256)"),
      addressToTopic("0xc00000000000000000000000000000000000000c"),
      addressToTopic(wallet),
    ],
    transactionHash:
      "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    transactionIndex: 8,
  };
  const selfTransferLog = {
    address: token,
    blockNumber: 999999,
    data: ethers.toBeHex(10n, 32),
    index: 11,
    topics: [
      ethers.id("Transfer(address,address,uint256)"),
      addressToTopic(wallet),
      addressToTopic(wallet),
    ],
    transactionHash:
      "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    transactionIndex: 9,
  };

  const { calls, provider } = createDirectionalMockProvider({
    incomingLogs: [incomingLog, selfTransferLog],
    outgoingLogs: [selfTransferLog],
    blockTimestamps: {
      999999: 1773055000,
    },
  });

  const transfers = await scanErc20Transfers({
    provider,
    rpcUrl: "https://rpc.example.test",
    wallet,
    fromBlock: 999999,
    toBlock: 999999,
  });

  assert.equal(calls.getLogs.length, 2);
  assert.deepEqual(calls.getLogs[0].topics, [
    ethers.id("Transfer(address,address,uint256)"),
    null,
    addressToTopic(wallet),
  ]);
  assert.deepEqual(calls.getLogs[1].topics, [
    ethers.id("Transfer(address,address,uint256)"),
    addressToTopic(wallet),
    null,
  ]);
  assert.equal(transfers.length, 2);
  assert.deepEqual(
    transfers.map((transfer) => transfer.tx).sort(),
    [
      "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    ]
  );
});
