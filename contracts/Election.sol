//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// TODO: add reset function for new election
// TODO: can edit variables if election is not active

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

    bool public active = true;
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
        require(!completed, "Election has completed");
        require(!hasVoted[msg.sender], "already voted");
        aTotal.increment();
        totalVotes.increment();
        hasVoted[msg.sender] = true;
        votedFor[msg.sender] = Vote.CandA;
        _electionStatus();
    }

    function voteB() external {
        require(!completed, "Election has completed");
        require(!hasVoted[msg.sender], "already voted");
        bTotal.increment();
        totalVotes.increment();
        hasVoted[msg.sender] = true;
        votedFor[msg.sender] = Vote.CandB;
        _electionStatus();
    }

    function getVote(address _voter) external view returns (Vote _vote) {
        return votedFor[_voter];
    }

    function _electionStatus() private {
        if (totalVotes.current() >= expectedVotes) {
            completed = true;
            active = false;
            if (aTotal.current() > bTotal.current()) {
                winner = Vote.CandA;
            } else if (aTotal.current() < bTotal.current()) {
                winner = Vote.CandB;
            }
        }
    }

    function reset() external {
        
    }
}
