import {
  NATIVE_TRANSFER_DIRECTIONS,
  createRpcProvider,
  scanErc20Transfers,
  scanNativeTransfers,
  type Erc20Transfer,
  type NativeTransfer,
  type NativeTransferDirection,
  type ScanNativeTransfersOptions,
} from "scan-erc20-token";

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

void run();
void runNative();
