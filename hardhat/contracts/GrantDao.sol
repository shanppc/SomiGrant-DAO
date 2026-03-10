// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
* @title   GrantDao
* @author  Zeeshan (github/shanppc)
* @notice  Core DAO contract. Stakers propose grants, vote on them, and
* release ETH from Treasury after a 1-day timelock.
* Flow: createProposal → vote → finalizeProposal → executeProposal
*/

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IStaking {
    function stakedBalance(address user) external view returns(uint256);
    function updateLock(address user, uint256 deadline) external;
}

interface ITreasury {
function releaseFunds(address to, uint256 amount) external;
function getBalance() external view  returns(uint256);
}

contract GrantDao is ReentrancyGuard{
   struct Proposal{
    address proposer;
    string description;
    uint256 amount;
    uint256 deadline;
    uint256 votesFor;
    uint256 votesAgainst;
    uint256 executionTime;
    bool finalized;
    bool executed;
    bool passed;
   }

   uint256 public proposalCount;

    // Minimum stake required to submit a proposal — acts as spam protection
    uint256 public constant MIN_PROPOSAL_STAKE = 1000 ether;
    uint256 public constant VOTING_DURATION = 3 days;
    // Mandatory delay between finalization and execution — gives community time to react
    uint256 public constant TIMELOCK_DURATION = 1 days;

    mapping (uint256=>Proposal) public proposals;
    mapping (uint256=> mapping(address=>bool)) public hasVoted;

    IStaking public immutable staking;
    ITreasury public immutable treasury;

    event ProposalCreated(
        uint256 indexed proposalId, 
        address indexed proposer,
        uint256 amount,
        uint256 deadline
        );

    event voteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 votingPower
    );

    event proposalFinalized(
        uint256 indexed proposalId,
        bool passed
    );

    event proposalExecuted(
        uint256 indexed proposalId
    );

   constructor(address _staking, address _treasury) {
    staking  = IStaking(_staking);
    treasury = ITreasury(_treasury);
   }

   modifier proposalExists(uint256 proposalId) {
    require(proposalId > 0 && proposalId <= proposalCount, "Proposal does not exist");
    _;
   }
    // @notice Submit a grant proposal. Caller must have >= MIN_PROPOSAL_STAKE staked.
   function createProposal(string calldata description, uint256 amount) external {
     require(staking.stakedBalance(msg.sender) >= MIN_PROPOSAL_STAKE,"insufficient stake");
     require(amount > 0, "Invalid amount");
     require(treasury.getBalance( )>= amount, "insufficient trasury");

     proposalCount++;

     proposals[proposalCount] = Proposal({
        proposer: msg.sender,
        description: description,
        amount: amount,
        deadline: block.timestamp + VOTING_DURATION,
        votesFor: 0,
        votesAgainst: 0,
        executionTime: 0,
        finalized: false,
        executed: false,
        passed: false
     });
      emit ProposalCreated(proposalCount,
       msg.sender, 
       amount, 
       block.timestamp + VOTING_DURATION
       );

    } 

     /// @notice Vote on an active proposal. Voting power = staked SGT balance.
    /// @dev Tokens are locked until deadline to prevent vote-then-unstake attacks.
    function vote(uint256 proposalId, bool support) external  proposalExists(proposalId){
        Proposal storage proposal = proposals[proposalId];

        require(block.timestamp < proposal.deadline, "Voting ended");
        require(!proposal.finalized, "Already finalized");
        require(!hasVoted[proposalId][msg.sender], "Already voted");

        uint256 votingPower = staking.stakedBalance(msg.sender);
        require(votingPower > 0, "no voting power");

        if(support){
             proposal.votesFor +=votingPower;
            }
        else {
            proposal.votesAgainst += votingPower;
        }    

        hasVoted[proposalId][msg.sender] = true;

        staking.updateLock(msg.sender, proposal.deadline);

        emit voteCast(proposalId, msg.sender, support , votingPower);
    }

    /// @notice Close voting and record outcome. If passed, starts the timelock.
    function finalizeProposal(uint256 proposalId) external proposalExists(proposalId){
        Proposal storage proposal = proposals[proposalId];

         require(block.timestamp>=proposal.deadline,"Voting ongoing");
         require(!proposal.finalized,"already finalized");
         proposal.finalized = true;

         if (proposal.votesFor > proposal.votesAgainst)
         {
            proposal.passed = true;
            proposal.executionTime = block.timestamp + TIMELOCK_DURATION;
         }
         else{
            proposal.passed = false;
         }

         emit proposalFinalized(proposalId, proposal.passed);
    }

    /// @notice Execute a passed proposal and release ETH to the proposer.
    function executeProposal(uint256 proposalId) external proposalExists(proposalId) nonReentrant{
        Proposal storage proposal = proposals[proposalId];

        require(proposal.finalized,"not finalized");
        require(proposal.passed, "not passed");
        require(!proposal.executed, "already executed");
        require(block.timestamp >= proposal.executionTime, "Timelock active");

        require(treasury.getBalance() >= proposal.amount, "Treasury insufficient at execution");

        proposal.executed = true;

        treasury.releaseFunds(proposal.proposer, proposal.amount);

        emit proposalExecuted(proposalId);
    }

   }