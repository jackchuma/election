//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Election {
    string public _candA;
    string public _candB;

    constructor(string memory _candidateA, string memory _candidateB) {
        _candA = _candidateA;
        _candB = _candidateB;
    }
}
