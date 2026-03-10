const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GrantDAO System", function () {
  let token;
  let staking;
  let treasury;
  let dao;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("PGT");
    const initialSupply = ethers.parseUnits("1000000", 18);  // fixed: no hre. needed
    token = await Token.deploy(initialSupply);

    const Staking = await ethers.getContractFactory("Staking");
    staking = await Staking.deploy(await token.getAddress());

    const Treasury = await ethers.getContractFactory("Treasury");
    treasury = await Treasury.deploy(owner.address); 
    
    const DAO = await ethers.getContractFactory("GrantDao");
    dao = await DAO.deploy(
      await staking.getAddress(),
      await treasury.getAddress()
    );

    await staking.setDAO(await dao.getAddress());
    await treasury.setDAO(await dao.getAddress());
  });

  it("Should fund treasury", async function () {
    await owner.sendTransaction({
      to: await treasury.getAddress(),
      value: ethers.parseEther("10")
    });

    const balance = await ethers.provider.getBalance(await treasury.getAddress());
    expect(balance).to.equal(ethers.parseEther("10"));
  });

  it("Users can stake tokens", async function () {
    await token.transfer(user1.address, ethers.parseEther("2000"));

    await token.connect(user1).approve(
      await staking.getAddress(),
      ethers.parseEther("2000")
    );

    await staking.connect(user1).stake(ethers.parseEther("2000"));

    const staked = await staking.stakedBalanceOf(user1.address);
    expect(staked).to.equal(ethers.parseEther("2000"));
  });

  it("User with stake can create proposal", async function () {
    await owner.sendTransaction({
      to: await treasury.getAddress(),
      value: ethers.parseEther("10")
    });

    await token.transfer(user1.address, ethers.parseEther("2000"));

    await token.connect(user1).approve(
      await staking.getAddress(),
      ethers.parseEther("2000")
    );

    await staking.connect(user1).stake(ethers.parseEther("2000"));

    await dao.connect(user1).createProposal(
      "Build community website",
      ethers.parseEther("1")
    );

    const proposal = await dao.proposals(1);
    expect(proposal.proposer).to.equal(user1.address);
  });

  it("Users can vote on proposal", async function () {
    await owner.sendTransaction({
      to: await treasury.getAddress(),
      value: ethers.parseEther("10")
    });

    await token.transfer(user1.address, ethers.parseEther("2000"));
    await token.transfer(user2.address, ethers.parseEther("1500"));

    await token.connect(user1).approve(
      await staking.getAddress(),
      ethers.parseEther("2000")
    );

    await token.connect(user2).approve(
      await staking.getAddress(),
      ethers.parseEther("1500")
    );

    await staking.connect(user1).stake(ethers.parseEther("2000"));
    await staking.connect(user2).stake(ethers.parseEther("1500"));

    await dao.connect(user1).createProposal(
      "Grant project funding",
      ethers.parseEther("1")
    );

    await dao.connect(user1).vote(1, true);
    await dao.connect(user2).vote(1, true);

    const proposal = await dao.proposals(1);
    expect(proposal.votesFor).to.equal(ethers.parseEther("3500"));
  });

  it("Proposal can be finalized after voting period and time advances", async function () {
    // Assuming previous test created proposal #1 and voted; but to make this independent:
    // (In real tests, either reuse state or recreate minimal setup here)

    await owner.sendTransaction({
      to: await treasury.getAddress(),
      value: ethers.parseEther("10")
    });

    // Quick setup for proposal #1 in this fresh state
    await token.transfer(user1.address, ethers.parseEther("2000"));
    await token.connect(user1).approve(await staking.getAddress(), ethers.parseEther("2000"));
    await staking.connect(user1).stake(ethers.parseEther("2000"));

    // Create and vote on proposal #1 so it can later be finalized
    await dao.connect(user1).createProposal("Test finalize", ethers.parseEther("1"));
    await dao.connect(user1).vote(1, true);

    // Advance time past voting period (assuming 3 days = 259200 seconds)
    await ethers.provider.send("evm_increaseTime", [3 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    await dao.finalizeProposal(1);

    const proposal = await dao.proposals(1);
    expect(proposal.passed).to.equal(true);

    // Optional: advance more time if there's a claim/execution delay
    await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
    await ethers.provider.send("evm_mine");
    await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    // Add more expects here if needed (e.g., funds released, executed flag, etc.)
  });
});