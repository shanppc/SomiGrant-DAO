// 1. Run this in terminal:- npx hardhat console  --network SomniaTestnet

// 2. Run these command in hardhat console

// 3. Get the contract factory
const Treasury = await ethers.getContractFactory("Treasury");

// 4. Attach to your deployed address
const treasury = await Treasury.attach("0xB8Bd5630d02c65CD27e7B86177A3b4DC1AfB2A2D");

// 4. Call the function 
await treasury.setDAO("0x403671932D594b7c459eaE1491FCB49c66547914");