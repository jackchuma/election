//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// TODO: add reset function for new election
// TODO: add function to check totalVotes vs expectedVotes and mark complete when reached

contract Election is Ownable {
    using Counters for Counters.Counter;

    string public candA;
    string public candB;
    uint256 public expectedVotes;

    Counters.Counter public aTotal;
    Counters.Counter public bTotal;
    Counters.Counter public totalVotes;

    mapping (address => bool) public hasVoted;
    mapping (address => Vote) public votedFor;

    bool public completed;
    Vote public winner;

    enum Vote {
        NotVoted,
        CandA,
        CandB
    }

    constructor(string memory _candidateA, string memory _candidateB, uint256 _totalVotes) {
        candA = _candidateA;
        candB = _candidateB;
        expectedVotes = _totalVotes;
    }

    function voteA() external {
        require(!hasVoted[msg.sender], "already voted");
        aTotal.increment();
        totalVotes.increment();
        hasVoted[msg.sender] = true;
        votedFor[msg.sender] = Vote.CandA;
    }

    function voteB() external {
        require(!hasVoted[msg.sender], "already voted");
        bTotal.increment();
        totalVotes.increment();
        hasVoted[msg.sender] = true;
        votedFor[msg.sender] = Vote.CandB;
    }

    function getVote(address _voter) external view returns (Vote _vote) {
        return votedFor[_voter];
    }
}
