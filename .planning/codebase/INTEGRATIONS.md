# External Integrations

**Analysis Date:** 2026-03-13

## APIs & External Services

**EVM JSON-RPC Endpoints:**
- User-supplied blockchain RPC service - used to fetch logs, latest block numbers, and block timestamps
  - SDK/Client: `ethers.JsonRpcProvider` created in `src/index.js`
  - Auth: not implemented by this library; if an RPC vendor requires credentials, the consumer must encode them in `rpcUrl`
  - Endpoints used: JSON-RPC methods behind `getLogs`, `getBlockNumber`, and `getBlock`

**HTTP(S) Proxy:**
- Optional outbound proxy - used when the caller supplies `proxy` or `proxyUrl`
  - Integration method: `https-proxy-agent` attached through `FetchRequest.createGetUrlFunc(...)`
  - Auth: optional proxy username/password merged into the proxy URL
  - Scope: affects provider HTTP transport only

## Data Storage

**Databases:**
- None observed in this repository

**File Storage:**
- None observed in runtime code

**Caching:**
- None implemented; every scan delegates directly to the provided RPC provider

## Authentication & Identity

**Auth Provider:**
- None

**OAuth Integrations:**
- None

## Monitoring & Observability

**Error Tracking:**
- None built in

**Analytics:**
- None

**Logs:**
- None; the library does not emit logs or metrics

## CI/CD & Deployment

**Hosting:**
- Not applicable at library runtime
- The package is intended to be embedded inside another script/service rather than deployed standalone

**CI Pipeline:**
- No CI configuration is present in the checked-in files reviewed for this map

## Environment Configuration

**Development:**
- Required runtime inputs come from the consuming application, not this repository
- Mock providers in `test/scan-erc20.test.js` avoid any real RPC secrets or live endpoints

**Staging:**
- No dedicated staging setup is defined in-repo

**Production:**
- Secrets management is the consumer's responsibility because this package only accepts raw connection options

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Integration Notes For `src`

- `scanErc20Transfers(...)` can avoid network construction entirely when the caller injects a custom `provider`
- The narrow provider contract is documented in `src/index.d.ts`, which makes the core logic testable without a real chain
- There is no built-in retry, pagination, throttling, or circuit breaking around RPC calls

*Integration audit: 2026-03-13*
*Update when adding/removing external services*
