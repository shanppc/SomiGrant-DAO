// 1. Run this in terminal:- npx hardhat console  --network polkadotTestnet

// 2. Run these command in hardhat console

// 3. Get the contract factory
const Treasury = await ethers.getContractFactory("Treasury");

// 4. Attach to your deployed address
const treasury= await Treasury.attach("0xb215e6761C2574a6F5A39c0F7278caDf4dcBAb0A");

// 4. Call the function 
await treasury.setDAO("0x0cA091a19eFb4a00Cb64078544636e7Ad77d325F");