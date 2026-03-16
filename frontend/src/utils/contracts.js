import { Contract } from 'ethers'
import { ADDRESSES } from './config'

export const erc20ABI = [
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
]

export const stakingABI = [
  'function stake(uint256 amount)',
  'function unstake(uint256 amount)',
  'function stakedBalance(address user) view returns (uint256)',
]

export const daoABI = [
  'function proposalCount() view returns (uint256)',
  'function createProposal(string description, uint256 amount)',
  'function vote(uint256 proposalId, bool support)',
  'function finalizeProposal(uint256 proposalId)',
  'function executeProposal(uint256 proposalId)',
  'function proposals(uint256) view returns (address,string,uint256,uint256,uint256,uint256,uint256,bool,bool,bool)',
  // Reactivity feeds these events; decoding is best-effort (ABI must match contract)
  'event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string description, uint256 amount, uint256 deadline)',
  'event voteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 votingPower)',
  'event ProposalFinalized(uint256 indexed proposalId, bool passed)',
  'event ProposalExecuted(uint256 indexed proposalId)',
]

export const faucetABI = [
  'function requestTokens()',
  // Optional event; included to support Somnia Reactivity decoding if present on-chain.
  'event TokensRequested(address indexed requester, uint256 amount)',
]

export function getContracts(runner) {
  return {
    token: new Contract(ADDRESSES.token, erc20ABI, runner),
    staking: new Contract(ADDRESSES.staking, stakingABI, runner),
    dao: new Contract(ADDRESSES.dao, daoABI, runner),
    faucet: new Contract(ADDRESSES.faucet, faucetABI, runner),
  }
}

