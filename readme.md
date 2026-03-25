# 🚀 SomiGrant DAO
**Real-Time Community Grant Funding on Somnia – Powered by Instant Reactivity**

Imagine a DAO where votes update live, treasury balances tick in real time, and every proposal or claim shows up instantly in a feed — no refreshing, no waiting. That's SomiGrant DAO: a **stake-to-vote grant system** built on Somnia Testnet, using the **Somnia Reactivity SDK** to make governance feel alive and responsive.

Perfect for funding builders in games, metaverses, social apps, and more — all on one of the fastest EVM chains out there.

[Live Demo 🌐 ](https://somi-grant-dao.vercel.app/)

(Connect your wallet on Somnia Testnet to see personal balances, stake, propose, and watch the magic happen live!)

[Video Demo ](https://youtu.be/Hmu_1G4K_Vg?si=0W2vZ5337bUExGWu)



---

## 🧩 Problem

In today's Web3 ecosystems — especially high-speed ones like Somnia focused on games, social, and metaverses — grant funding for builders often feels broken:

- **Slow & disconnected governance**: Voters refresh pages endlessly to see if votes registered or tallies changed → low engagement.
- **Lack of real-time transparency**: Treasury balances, proposal status, and community activity stay hidden or outdated → trust erodes.
- **Vulnerable voting power**: Flash-loan attacks or unstaked tokens let anyone swing decisions temporarily → unfair outcomes.
- **Static user experience**: DAOs feel like old-school forums instead of live, reactive apps → builders and participants lose interest fast.

---

## ✅ Solution — SomiGrant DAO

SomiGrant DAO fixes this by making governance **instantly responsive** and **stake-committed**. Using Somnia's Reactivity SDK, every vote, stake, proposal, or treasury move updates live — no delays, no refreshes. Staked tokens only count for voting, so decisions reflect truly committed community members. 

---

## Real-Time Magic: Somnia Reactivity at the Core

![Binance live price update](https://github.com/user-attachments/assets/0d9cae0b-8dad-4560-bd69-a1df0fc0e023)

Just like **Binance** automatically updates cryptocurrency prices in real-time without any page refresh (using WebSockets), SomiGrant DAO does the same for on-chain data.

We’ve implemented the **Somnia Reactivity SDK** to push live blockchain events directly to the frontend via WebSockets.

### What this enables:
- WebSocket subscriptions instantly deliver on-chain events (faucet claims, stakes, proposals, votes, treasury transfers)
- Live vote counters, treasury balance, and activity feed update in sub-second time
- No polling and no manual refreshing required

→ This creates a smooth, modern, and truly **real-time UX** that makes on-chain governance feel fast and engaging — just like centralized exchanges.

*(See the WebSocket configuration here: [config.js](https://github.com/shanppc/SomiGrant-DAO/blob/38500ae7122aaad2aefbd2d41ba178a04a179d39/frontend/src/utils/config.js#L19))*

---

## Smart Contracts (All on Somnia Testnet – Chain ID 50312)

| Contract          | Address                                                                 | What It Does                              |
|-------------------|-------------------------------------------------------------------------|-------------------------------------------|
| SGT Token         | [0x90F4C46466A3c953a206b8bB3BeF9cC11be8fF75](https://shannon-explorer.somnia.network/address/0x90F4C46466A3c953a206b8bB3BeF9cC11be8fF75#code) | ERC-20 governance token for staking & voting |
| Staking           | [0x53Ae18495aC7169D3730c258509f63D0eF84D9fb](https://shannon-explorer.somnia.network/address/0x53Ae18495aC7169D3730c258509f63D0eF84D9fb#code) | Handles staking/unstaking + calculates voting power |
| Treasury          | [0xB8Bd5630d02c65CD27e7B86177A3b4DC1AfB2A2D](https://shannon-explorer.somnia.network/address/0xB8Bd5630d02c65CD27e7B86177A3b4DC1AfB2A2D#code) | Holds STT funds & releases approved grants |
| DAO Governance    | [0x403671932D594b7c459eaE1491FCB49c66547914](https://shannon-explorer.somnia.network/address/0x403671932D594b7c459eaE1491FCB49c66547914#code) | Proposal creation, voting logic, execution |
| Faucet            | [0x07432a0844c54851B4DD0629c24F6cA370976d56](https://shannon-explorer.somnia.network/address/0x07432a0844c54851B4DD0629c24F6cA370976d56#code) | Drops test SGT so anyone can play          |

---

## Frontend Highlights

- Clean dark dashboard with key stats (treasury, proposals, your stake & power)
- Claim 1500 SGT button for easy onboarding
- Stake/unstake + fund treasury inputs
- Proposal creation form
- **Live Activity Feed** — the star of the show, powered by Reactivity

Built with: React, ethers.js, TailwindCSS, Somnia Reactivity SDK

---

## Tech Stack Quick View

- **Contracts**: Solidity + OpenZeppelin
- **Frontend**: React (Vite) + ethers.js + Tailwind + Somnia Reactivity SDK
- **Network**: Somnia Testnet (Shannon) – Chain ID 50312, Native: STT

---

Built with ❤️ by **Zeeshan Qureshi (Ø,G) 🟣**  
Blockchain dev exploring Web3.  
X: [@zeeshanppc](https://x.com/zeeshanppc)

For the Somnia Reactivity Mini Hackathon – making DAOs feel as fast as the future. 🚀
