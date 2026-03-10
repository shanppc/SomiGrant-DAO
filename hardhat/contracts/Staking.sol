// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
* @title  Staking
* @author  Zeeshan (github/shanppc)
* @notice  Users stake SGT tokens here to earn voting power in the GrantDao.
* Tokens are locked per-proposal while a user's vote is active.
* DAO address is set once post-deploy, then ownership is renounced.
*/

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Staking is ReentrancyGuard, Ownable {
   IERC20 public immutable governanceToken;
   address public  dao;
   uint256 public totalStaked;
   bool public daoSet;

   mapping (address=> uint256 ) private _stakedBalance;
   mapping (address=> uint256 ) private _lockUntil;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event LockUpdated(address indexed user, uint256 deadline);

   modifier onlyDAO() {
        require(msg.sender == dao,"Not Dao");
        _;
    }
   constructor(address token) Ownable(msg.sender) {
    governanceToken = IERC20(token);
    }
   
   // Stake SGT to gain voting power.
   function stake(uint256 _amount) external nonReentrant{
    require(_amount>0, "Can't stake 0");
    totalStaked += _amount;
    _stakedBalance[msg.sender] += _amount;
     governanceToken.transferFrom(msg.sender, address(this), _amount);

     emit Staked(msg.sender, _amount);
   }
    // unstake after lock period
   function unStake(uint256 _amount) external nonReentrant {
    require(_amount>0, "Can't unstake 0");
    require(_stakedBalance[msg.sender] >= _amount, "insufficient balance");
    require(block.timestamp >= _lockUntil[msg.sender],"locked");

    totalStaked -= _amount;
    _stakedBalance[msg.sender] -= _amount;
    governanceToken.transfer(msg.sender, _amount);

    emit Unstaked(msg.sender, _amount);
   }

     //@notice Called by GrantDao on every vote to lock the voter's tokens
    function updateLock(address user, uint256 deadline) external onlyDAO {
        require(deadline > block.timestamp, "invaild deadline");

        if (deadline > _lockUntil[user]) {
            _lockUntil[user] = deadline;

            emit LockUpdated(user, deadline);
        }  } 

    function stakedBalance(address user) public view returns(uint256){
        return _stakedBalance[user];
    }

    // Helper for callers expecting stakedBalanceOf()
    function stakedBalanceOf(address user) external view returns(uint256){
        return _stakedBalance[user];
    }    
     
   function lockUntil(address user) public view returns(uint256) {
    return _lockUntil[user];
   }
   
    // @notice One-time setup: binds the DAO and permanently renounces owner control.
   function setDAO(address _dao) external onlyOwner  {
    require(!daoSet, "DAO already set");

    dao = _dao;
    daoSet = true;
    renounceOwnership();
   }

 }
