import {
  NATIVE_TRANSFER_DIRECTIONS,
  createRpcProvider,
  scanErc20Transfers,
  scanNativeTransfers,
  type NativeBlockLike,
  type NativeScanProvider,
  type Erc20Transfer,
  type NativeTransfer,
  type NativeTransferDirection,
  type ScanNativeTransfersOptions,
} from "scan-wallet-evm";

const provider = createRpcProvider({
  rpcUrl: "https://bsc-mainnet.gateway.tatum.io/",
  proxy: {
    url: "http://proxy.example.com:8080",
    username: "user",
    password: "pass",
  },
});

const run = async (): Promise<Erc20Transfer[]> =>
  scanErc20Transfers({
    provider,
    rpcUrl: "https://bsc-mainnet.gateway.tatum.io/",
    wallet: "0x6AE648bECE577d8C40892b65D8050Ea6A0FB818d",
    fromBlock: 85570465,
    toBlock: 85570488,
  });

const nativeDirection: NativeTransferDirection =
  NATIVE_TRANSFER_DIRECTIONS[2];
const nativeOptions: ScanNativeTransfersOptions = {
  rpcUrl: "https://bsc-mainnet.gateway.tatum.io/",
  wallet: "0x6AE648bECE577d8C40892b65D8050Ea6A0FB818d",
  direction: nativeDirection,
  fromBlock: 85570465,
  toBlock: 85570488,
  proxy: {
    url: "http://proxy.example.com:8080",
    username: "user",
    password: "pass",
  },
  proxyUrl: "http://proxy.example.com:8080",
  timeoutMs: 15_000,
};

const runNative = async (): Promise<NativeTransfer[]> =>
  scanNativeTransfers(nativeOptions);

const prefetchedBlock: NativeBlockLike = {
  timestamp: 1767674408,
  transactions: [
    "0x6362655ba6d70bb1045694f114a51a3c2873b71a8ffd023877d722124a22d816",
  ],
  prefetchedTransactions: [
    {
      from: "0x45061A4cB95b0C744802C306e312029CA0D821E7",
      to: "0xFfbF500e9637fa82F10b3C7d62dc9B9934254888",
      value: "24259569238705576",
      hash: "0x6362655ba6d70bb1045694f114a51a3c2873b71a8ffd023877d722124a22d816",
      index: 99,
    },
  ],
};

const nativeMockProvider: NativeScanProvider = {
  async getBlockNumber() {
    return 74229500;
  },
  async getBlock() {
    return prefetchedBlock;
  },
  async getTransactionReceipt() {
    return { status: 1 };
  },
};

const runNativeWithInjectedProvider = async (): Promise<NativeTransfer[]> =>
  scanNativeTransfers({
    wallet: "0xFfbF500e9637fa82F10b3C7d62dc9B9934254888",
    provider: nativeMockProvider,
    fromBlock: 74229500,
    toBlock: 74229500,
  });

void run();
void runNative();
void runNativeWithInjectedProvider();
