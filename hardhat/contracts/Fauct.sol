// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IERC20 {
    function transfer(address _to, uint256 _value) external returns (bool success);
    function balanceOf(address _address) external view returns(uint256);
}

contract Fauct { 
    IERC20 public immutable token; 
    address public immutable owner;
    uint256 public faucetAmount = 1500e18; 
    
    mapping(address => bool) public hasClamied;

    
    event TokensRequested(address indexed requester, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }


    constructor(address tokenAdd) {
        owner = msg.sender;
        token = IERC20(tokenAdd);
    }

    function requestTokens() external {
        require(hasClamied[msg.sender] == false, "Already Claimed");
        require(token.balanceOf(address(this)) >= faucetAmount, "Faucet is empty");

        hasClamied[msg.sender] = true;
        
        bool success = token.transfer(msg.sender, faucetAmount);
        require(success, "Transfer failed");

        emit TokensRequested(msg.sender, faucetAmount);
    }

    

    function withdrawRemainingTokens() external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        token.transfer(owner, balance);
    }

}