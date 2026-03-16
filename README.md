## SomiGrant DAO – Somnia Reactivity Prototype

### Overview

SomiGrant DAO is a governance dashboard for the Somnia Testnet that showcases how to build a
**live-reactive dApp** using **Somnia Reactivity**. Users can:

- Connect their wallet on Somnia Testnet.
- Claim **1500 SGT** test tokens via a built-in faucet.
- Stake SGT to gain voting power.
- Create, vote on, finalize, and execute treasury-funded proposals.

All key actions (governance, treasury, faucet) are reflected in the UI in near real time via Somnia
Reactivity, without manual refresh or heavy polling.

### How Somnia Reactivity is used

- The `useSomniaReactivity` hook subscribes to Somnia Reactivity using the Somnia WebSocket endpoint.
- The hook listens to:
  - The **DAO contract** for proposal lifecycle events (created, voted, finalized, executed).
  - The **Faucet contract** for `FaucetClaimed` (or equivalent) events.
- Incoming logs are decoded using combined human-readable ABIs from `frontend/src/utils/contracts.js`.
- The decoded events drive:
  - A **live activity panel** (`Dashboard`) that shows recent faucet and DAO events.
  - Automatic **stats and balances refreshes** (treasury, proposals, staking, and token balances).

This makes Somnia Reactivity part of the **core user experience**: users see on-chain DAO and faucet
activity stream into the app as it happens, instead of manually refreshing.

### Faucet – 1500 SGT test tokens

- The app reads the faucet contract address from `ADDRESSES.faucet` in `frontend/src/utils/config.js`.
- The faucet contract is integrated in `frontend/src/utils/contracts.js` via `faucetABI` and exposed
  through `getContracts(runner).faucet`.
- At the top of the app, in `frontend/src/App.jsx`, there is a **“Claim 1500 SGT”** button in the
  header:
  - Requires a connected wallet on the correct Somnia Testnet network.
  - Calls `faucet.claim()` using the signer.
  - Shows clear loading, success, and error toasts around the transaction.
  - Triggers a refresh of user balances once the transaction confirms.
- When the faucet emits its claim event, Somnia Reactivity picks it up and pushes a **“Faucet claim
  observed”** toast and a new entry in the **Live Somnia activity** panel.

_Note_: The precise ABI / event names must match the deployed faucet contract; if you change the
on-chain faucet implementation, update `faucetABI` in `frontend/src/utils/contracts.js` accordingly.

### How to run and test the prototype

1. **Install and start the frontend**
   - `cd frontend`
   - `npm install`
   - `npm run dev`
   - Open the printed local URL (e.g. `http://localhost:5173`).

2. **Configure wallet**
   - Open MetaMask (or compatible wallet) and add/connect to **Somnia Testnet**:
     - Chain ID: `50312` (`0xC488`)
     - RPC: `https://dream-rpc.somnia.network`
     - Explorer: `https://shannon-explorer.somnia.network`
   - Click **Connect MetaMask** in the header and approve the connection.

3. **Use the faucet**
   - Ensure you are on Somnia Testnet and your wallet is connected.
   - Click **“Claim 1500 SGT”** in the header.
   - Wait for the faucet transaction to confirm.
   - Observe:
     - Toasts for submitted and confirmed faucet transaction.
     - Your **token balance** updating.
     - A new **faucet event** appearing in the **Live Somnia activity** panel.

4. **Exercise DAO functionality**
   - Use the **Staking** panel to stake SGT, then create a proposal requesting funds from the treasury.
   - Vote on the proposal, finalize it when the deadline passes, and execute if it passed.
   - Watch the **Stats**, **Treasury**, and **Proposal list** panels auto-refresh after each on-chain
     action, driven by Somnia Reactivity events.

### Why this fits the Somnia Reactivity track

- Somnia Reactivity is not an add-on; it is **central to the app’s UX**:
  - Governance and faucet activity are surfaced live via the Somnia Reactivity SDK.
  - Users get immediate visual feedback that their actions have been recorded on-chain.
  - The dashboard acts as a **real-time window** into DAO and faucet activity on Somnia Testnet.
- The prototype demonstrates how new teams can:
  - Integrate Somnia Reactivity with existing EVM-style smart contracts and ABIs (from Hardhat
    artifacts).
  - Build **reactive dashboards** where on-chain events continuously drive UI state, enabling richer
    DAO and community experiences on Somnia.

