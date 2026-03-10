// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
/**
* @title   Treasury
* @author  Zeeshan (github/shanppc)
* @notice  Holds native Token on behalf of the GrantDao and releases funds only when
* instructed by the DAO after a successful governance vote.
* Investors/sponsors fund this contract by sending ETH directly to
* the contract address (received via the receive() fallback).
*/

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Treasury is Ownable,ReentrancyGuard {

    address public dao;
    bool public daoSet;

   constructor() Ownable(msg.sender) {
    
   }
    modifier onlyDAO() {
        require(msg.sender == dao, "Not DAO");
        _;
    }

    /// @notice One-time setup: binds the DAO and permanently renounces owner control.
    function setDAO(address _dao) external onlyOwner {
        require(!daoSet, "DAO already set");
        dao = _dao;
        daoSet = true;
        renounceOwnership();
    }

    /// @notice Transfers ETH to a grant recipient. Only callable by the DAO
    function releaseFunds(address to, uint256 amount) external onlyDAO nonReentrant{
        require(address(this).balance >= amount, "Insufficient balance");
        (bool success, ) = to.call{value: amount}("");
        require(success, "Transfer failed");
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Accepts direct ETH deposits from investors — no function call needed,
    // just send ETH to this contract address from your wallet or dapp.
    receive() external payable {}
}