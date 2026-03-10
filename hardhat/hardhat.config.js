require("@nomicfoundation/hardhat-toolbox");
const { vars } = require("hardhat/config");

module.exports = {
  solidity: "0.8.28",

  networks: {
    SomniaTestnet: {
      url: "https://dream-rpc.somnia.network",  
      chainId: 50312,
      accounts: [vars.get("PRIVATE_KEY")],
    },
  },

  etherscan: {
    apiKey: {
      SomniaTestnet: "no-api-key-needed-for-blockscout",  // Dummy value; Blockscout ignores it
    },
    customChains: [
      {
        network: "SomniaTestnet",
        chainId: 50312,
        urls: {
          apiURL: "https://somnia.w3us.site/api",  // Core API endpoint for verification
          browserURL: "https://somnia.w3us.site",  // Matches your link
        },
      },
    ],
  },

  // Optional: Explicitly enable Blockscout-style verification (newer Hardhat versions support it natively)
  verify: {
    blockscout: {
      enabled: true,
    },
  },
};