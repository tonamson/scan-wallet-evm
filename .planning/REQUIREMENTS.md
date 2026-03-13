# Requirements: scan-erc20-token

**Defined:** 2026-03-13
**Core Value:** Developers can reliably query EVM wallet transfer history through a small, typed API that works against ordinary RPC infrastructure.

## v1.0.5 Requirements

### Native Transfer Scanning

- [x] **NATIVE-01**: Developer can scan incoming native-token transfers to a wallet within an explicit EVM block range
- [x] **NATIVE-02**: Developer can scan outgoing native-token transfers from a wallet within an explicit EVM block range
- [x] **NATIVE-03**: Developer can omit `fromBlock` and `toBlock` for native-token scans and get the same default window behavior as ERC20 scans
- [x] **NATIVE-04**: Developer can reuse the current `rpcUrl`, proxy, timeout, and injected-provider options when scanning native-token transfers

### API & Types

- [x] **API-01**: Developer can call a dedicated native-transfer scanning API without changing existing ERC20 call sites
- [x] **API-02**: TypeScript consumers receive declared options and result types for native-token transfer scanning

### Documentation & Verification

- [x] **DOC-01**: Developer can follow README examples to scan native-token transfers and understand the feature's scope limits
- [x] **DOC-02**: Automated tests cover native incoming, outgoing, and default-range scanning with mocked provider data

## v1.1+ Requirements

### Expanded Native Coverage

- **NATIVE-05**: Developer can scan internal native transfers exposed only through tracing APIs
- **API-03**: Developer can request a merged native + ERC20 wallet activity timeline from one high-level API

## Out of Scope

| Feature | Reason |
|---------|--------|
| Internal transaction tracing | Not portable across standard JSON-RPC providers; too large for this patch milestone |
| Cross-chain normalization metadata (symbols, fiat value, explorer links) | Adds external concerns unrelated to core transfer discovery |
| Replacing the ERC20 API with a generic "all assets" scanner | Would force avoidable migration risk onto current users |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| NATIVE-01 | Phase 1 | Complete |
| NATIVE-02 | Phase 1 | Complete |
| NATIVE-03 | Phase 1 | Complete |
| NATIVE-04 | Phase 2 | Complete |
| API-01 | Phase 2 | Complete |
| API-02 | Phase 2 | Complete |
| DOC-01 | Phase 3 | Complete |
| DOC-02 | Phase 3 | Complete |

**Coverage:**
- v1.0.5 requirements: 8 total
- Mapped to phases: 8
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-13*
*Last updated: 2026-03-13 after Phase 3 verification*
