import {
  createRpcProvider,
  scanErc20Transfers,
  type Erc20Transfer,
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

void run();
