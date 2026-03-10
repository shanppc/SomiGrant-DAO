///Token Deploy Script///
/*const hre = require("hardhat");

async function main() {
  // 1. Get the deployer's account 
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying ERC20 token using account:", deployer.address);

  // Check balance before deploy (helps catch low-funds issues early)
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "PAS");


  const Token = await hre.ethers.getContractFactory("PGT");


 const initialSupply = hre.ethers.parseUnits("1000000", 18); 
  // 4. Deploy the contract
  console.log("Deploying... (please wait for confirmation)");
  const token = await Token.deploy(initialSupply);

  // 5. Wait for the transaction to be mined
  await token.waitForDeployment();

  // 6. Log useful info
  const deployedAddress = await token.getAddress();
  console.log("✅myToken deployed to:", deployedAddress);

  // Optional: Log initial balance of deployer
  const deployerBalance = await token.balanceOf(deployer.address);
  console.log("Initial supply minted to deployer:", hre.ethers.formatUnits(deployerBalance, 18), "tokens");

  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\nWaiting 30 seconds before verifying (give the block explorers time to index)...");
    await new Promise(resolve => setTimeout(resolve, 30000));

    console.log("Verifying contract on explorer...");
    await hre.run("verify:verify", {
      address: deployedAddress,
      constructorArguments: [initialSupply],
    });
  }
}

// Standard error handling + exit
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
*/

///Staking Deployment ///

/*
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const G_TOKEN = "0xBd341D0020DfBc983217a95C3973A4C190e4cE4e"; 

  console.log(`Deploying Staking contract with: ${deployer.address}`);

  const Staking = await hre.ethers.getContractFactory("Staking");
  const stakingContract = await Staking.deploy(G_TOKEN);

  await stakingContract.waitForDeployment();
  const deployedAddress = await stakingContract.getAddress();

  console.log(`Staking contract deployed to: ${deployedAddress}`);

  // Auto-Verification Logic
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\nWaiting 30 seconds for block explorers to index...");
    
    // Using a promise-based timeout
    await new Promise(resolve => setTimeout(resolve, 30000));

    console.log("Verifying contract on explorer...");
    try {
      await hre.run("verify:verify", {
        address: deployedAddress,
        constructorArguments: [G_TOKEN],
      });
      console.log("Contract verified successfully!");
    } catch (error) {
      if (error.message.toLowerCase().includes("already verified")) {
        console.log("Contract is already verified!");
      } else {
        console.error("Verification failed:", error);
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});  */

//Treasury Deploy script//
/*
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();


  console.log(`Deploying Staking contract with: ${deployer.address}`);

  const Treasury = await hre.ethers.getContractFactory("Treasury");
  const treasuryContract = await Treasury.deploy();

  await treasuryContract.waitForDeployment();
  const deployedAddress = await treasuryContract.getAddress();

  console.log(`Staking contract deployed to: ${deployedAddress}`);

  // Auto-Verification Logic
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\nWaiting 30 seconds for block explorers to index...");
    
    // Using a promise-based timeout
    await new Promise(resolve => setTimeout(resolve, 30000));

    console.log("Verifying contract on explorer...");
    try {
      await hre.run("verify:verify", {
        address: deployedAddress,
        constructorArguments: [],
      });
      console.log("Contract verified successfully!");
    } catch (error) {
      if (error.message.toLowerCase().includes("already verified")) {
        console.log("Contract is already verified!");
      } else {
        console.error("Verification failed:", error);
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); */

//DAO deploy script///

const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const StakingAddress = "0x1b13b80C84e7b8E7Ec0BEF70c76db81c81B06fd0"; 
  const TreasuryAddress = "0xb215e6761C2574a6F5A39c0F7278caDf4dcBAb0A";

  console.log(`Deploying Staking contract with: ${deployer.address}`);

  const DAO = await hre.ethers.getContractFactory("GrantDao");
  const DaoContract = await DAO.deploy(StakingAddress, TreasuryAddress );

  await DaoContract.waitForDeployment();
  const deployedAddress = await DaoContract.getAddress();

  console.log(`Staking contract deployed to: ${deployedAddress}`);

  // Auto-Verification Logic
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\nWaiting 30 seconds for block explorers to index...");
    

    await new Promise(resolve => setTimeout(resolve, 30000));

    console.log("Verifying contract on explorer...");
    try {
      await hre.run("verify:verify", {
        address: deployedAddress,
        constructorArguments: [StakingAddress, TreasuryAddress],
      });
      console.log("Contract verified successfully!");
    } catch (error) {
      if (error.message.toLowerCase().includes("already verified")) {
        console.log("Contract is already verified!");
      } else {
        console.error("Verification failed:", error);
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});