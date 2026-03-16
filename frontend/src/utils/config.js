export const APP_NAME = 'SomiGrant DAO'

export const NETWORK = {
  chainId: 50312,
  chainIdHex: '0xC488', // 50312
  chainName: 'Somnia Testnet',
  nativeCurrency: {
    name: 'STT',
    symbol: 'STT',
    decimals: 18,
  },
  rpcUrls: [
    'https://dream-rpc.somnia.network',
  ],
  blockExplorerUrls: [
    'https://shannon-explorer.somnia.network',
  ],
}

export const ADDRESSES = {
  token: '0x90F4C46466A3c953a206b8bB3BeF9cC11be8fF75', // SGT
  staking: '0x53Ae18495aC7169D3730c258509f63D0eF84D9fb',
  treasury: '0xB8Bd5630d02c65CD27e7B86177A3b4DC1AfB2A2D',
  dao: '0x403671932D594b7c459eaE1491FCB49c66547914',
  faucet: '0x07432a0844c54851B4DD0629c24F6cA370976d56',
}

export const SOMNIA = {
  wsUrl: 'wss://dream-rpc.somnia.network/ws',
  explorerBaseUrl: 'https://shannon-explorer.somnia.network',
}