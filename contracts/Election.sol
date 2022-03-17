//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Election is Ownable {
    using Counters for Counters.Counter;

    string public candA;
    string public candB;

    Counters.Counter public aTotal;
    Counters.Counter public bTotal;

    mapping (address => bool) public hasVoted;

    constructor(string memory _candidateA, string memory _candidateB) {
        candA = _candidateA;
        candB = _candidateB;
    }

    function voteA() external {
        require(!hasVoted[msg.sender], "already voted");
        aTotal.increment();
        hasVoted[msg.sender] = true;
    }

    function voteB() external {
        require(!hasVoted[msg.sender], "already voted");
        bTotal.increment();
        hasVoted[msg.sender] = true;
    }
}
