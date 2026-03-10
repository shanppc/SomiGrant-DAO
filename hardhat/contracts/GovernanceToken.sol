// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
* @title   ERC20 token for Governance
* @author  Zeeshan (github/shanppc)
*/
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PGT is ERC20 {
    constructor(uint256 initialSupply) ERC20("SomniaGrant Token", "SGT") {
        _mint(msg.sender, initialSupply);
    }

}