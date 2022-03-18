//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// TODO: can edit variables if election is in limbo

contract Election is Ownable {
    using Counters for Counters.Counter;

    uint8 private constant RESET_DELAY = 10;

    string public candA;
    string public candB;
    uint256 public expectedVotes;

    Counters.Counter public aTotal;
    Counters.Counter public bTotal;
    Counters.Counter public totalVotes;

    mapping (address => bool) public hasVoted;
    mapping (address => Vote) public votedFor;
    address[] public voters;

    bool public active = true;
    bool public completed;
    uint256 public resetBlockNumber;
    bool public limbo;
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
        require(!limbo, "election not active");
        require(!completed, "Election has completed");
        require(!hasVoted[msg.sender], "already voted");
        aTotal.increment();
        totalVotes.increment();
        voters.push(msg.sender);
        hasVoted[msg.sender] = true;
        votedFor[msg.sender] = Vote.CandA;
        _electionStatus();
    }

    // Can't call during limbo
    function voteB() external {
        require(!completed, "Election has completed");
        require(!hasVoted[msg.sender], "already voted");
        bTotal.increment();
        totalVotes.increment();
        voters.push(msg.sender);
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
            resetBlockNumber = block.number + uint256(RESET_DELAY);
            if (aTotal.current() > bTotal.current()) {
                winner = Vote.CandA;
            } else if (aTotal.current() < bTotal.current()) {
                winner = Vote.CandB;
            }
        }
    }

    function reset() external onlyOwner {
        require(limbo == false, "election already reset");
        require(completed == true, "election is active");
        require(block.number > resetBlockNumber, "election is locked");
        candA = "";
        candB = "";
        expectedVotes = 0;
        aTotal.reset();
        bTotal.reset();
        _clearMappings();
        totalVotes.reset();
        delete voters;
        completed = false;
        resetBlockNumber = 0;
        limbo = true;
        winner = Vote.NotVoted;
    }

    function _clearMappings() private {
        for (uint i=0; i<totalVotes.current(); i++) {
            hasVoted[voters[i]] = false;
            votedFor[voters[i]] = Vote.NotVoted;
        }
    }
}
