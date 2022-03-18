const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Election", function () {
  before(async function() {
    this.signers = await ethers.getSigners();
    [this.owner, this.alice, this.bob, this.carol] = this.signers;
    this.Election = await ethers.getContractFactory("Election");
  });

  context("Deployment", async function() {
    this.beforeEach(async function() {
      this.election = await this.Election.deploy("Elon Musk", "Jeff Bezos", 5);
      await this.election.deployed();
    });

    it ("Should store names of candidates after deployment", async function() {
      expect(await this.election.candA()).to.equal("Elon Musk");
      expect(await this.election.candB()).to.equal("Jeff Bezos");
    });

    it ("Should store expectedVotes after deployment", async function() {
      expect((await this.election.expectedVotes()).toNumber()).to.equal(5);
    });

    it ("Counter variables should start at 0", async function() {
      expect((await this.election.aTotal()).toNumber()).to.equal(0);
      expect((await this.election.bTotal()).toNumber()).to.equal(0);
      expect((await this.election.totalVotes()).toNumber()).to.equal(0);
    });

    it ("election should be marked as active", async function() {
      expect(await this.election.active()).to.equal(true);
    });

    it ("election should be marked as not complete", async function() {
      expect(await this.election.completed()).to.equal(false);
    });

    it ("winner variable should be empty", async function() {
      expect(await this.election.winner()).to.equal(0);
    });
  });

  context("Voting", async function() {
    this.beforeEach(async function() {
      this.election = await this.Election.deploy("Elon Musk", "Jeff Bezos", 4);
      await this.election.deployed();
    });

    it ("Anyone can vote for candidate A", async function() {
      await this.election.connect(this.owner).voteA();
      await this.election.connect(this.alice).voteA();
      await this.election.connect(this.bob).voteA();
      await this.election.connect(this.carol).voteA();
    });

    it ("voteA() increments aTotal", async function() {
      expect((await this.election.aTotal()).toNumber()).to.equal(0);
      await this.election.connect(this.owner).voteA();
      expect((await this.election.aTotal()).toNumber()).to.equal(1);
      await this.election.connect(this.alice).voteA();
      expect((await this.election.aTotal()).toNumber()).to.equal(2);
      await this.election.connect(this.bob).voteA();
      expect((await this.election.aTotal()).toNumber()).to.equal(3);
      await this.election.connect(this.carol).voteA();
      expect((await this.election.aTotal()).toNumber()).to.equal(4);
    });

    it ("Each person can only vote once for candidate A", async function() {
      await this.election.connect(this.alice).voteA();
      await expect(this.election.connect(this.alice).voteA()).to.be.revertedWith("already voted");
    });

    it ("Anyone can vote for candidate B", async function() {
      await this.election.connect(this.owner).voteB();
      await this.election.connect(this.alice).voteB();
      await this.election.connect(this.bob).voteB();
      await this.election.connect(this.carol).voteB();
    });

    it ("voteB() increments bTotal", async function() {
      expect((await this.election.bTotal()).toNumber()).to.equal(0);
      await this.election.connect(this.owner).voteB();
      expect((await this.election.bTotal()).toNumber()).to.equal(1);
      await this.election.connect(this.alice).voteB();
      expect((await this.election.bTotal()).toNumber()).to.equal(2);
      await this.election.connect(this.bob).voteB();
      expect((await this.election.bTotal()).toNumber()).to.equal(3);
      await this.election.connect(this.carol).voteB();
      expect((await this.election.bTotal()).toNumber()).to.equal(4);
    });

    it ("Each person can only vote once for candidate B", async function() {
      await this.election.connect(this.alice).voteB();
      await expect(this.election.connect(this.alice).voteB()).to.be.revertedWith("already voted");
    });

    it ("Each person can only vote once for either candidate", async function() {
      await this.election.connect(this.alice).voteB();
      await this.election.connect(this.bob).voteA();
      await expect(this.election.connect(this.alice).voteA()).to.be.revertedWith("already voted");
      await expect(this.election.connect(this.bob).voteB()).to.be.revertedWith("already voted");
    });

    it ("votes are stored in mapping", async function() {
      await this.election.connect(this.owner).voteA();
      await this.election.connect(this.alice).voteB();
      await this.election.connect(this.bob).voteA();
      await this.election.connect(this.carol).voteB();
      expect(await this.election.votedFor(this.owner.address)).to.equal(1);
      expect(await this.election.votedFor(this.alice.address)).to.equal(2);
      expect(await this.election.votedFor(this.bob.address)).to.equal(1);
      expect(await this.election.votedFor(this.carol.address)).to.equal(2);
    });

    it ("keeps track of who has voted", async function() {
      expect(await this.election.hasVoted(this.owner.address)).to.equal(false);
      expect(await this.election.hasVoted(this.alice.address)).to.equal(false);
      expect(await this.election.hasVoted(this.bob.address)).to.equal(false);
      expect(await this.election.hasVoted(this.carol.address)).to.equal(false);

      await this.election.connect(this.owner).voteA();

      expect(await this.election.hasVoted(this.owner.address)).to.equal(true);
      expect(await this.election.hasVoted(this.alice.address)).to.equal(false);
      expect(await this.election.hasVoted(this.bob.address)).to.equal(false);
      expect(await this.election.hasVoted(this.carol.address)).to.equal(false);

      await this.election.connect(this.alice).voteB();

      expect(await this.election.hasVoted(this.owner.address)).to.equal(true);
      expect(await this.election.hasVoted(this.alice.address)).to.equal(true);
      expect(await this.election.hasVoted(this.bob.address)).to.equal(false);
      expect(await this.election.hasVoted(this.carol.address)).to.equal(false);

      await this.election.connect(this.bob).voteA();

      expect(await this.election.hasVoted(this.owner.address)).to.equal(true);
      expect(await this.election.hasVoted(this.alice.address)).to.equal(true);
      expect(await this.election.hasVoted(this.bob.address)).to.equal(true);
      expect(await this.election.hasVoted(this.carol.address)).to.equal(false);

      await this.election.connect(this.carol).voteB();

      expect(await this.election.hasVoted(this.owner.address)).to.equal(true);
      expect(await this.election.hasVoted(this.alice.address)).to.equal(true);
      expect(await this.election.hasVoted(this.bob.address)).to.equal(true);
      expect(await this.election.hasVoted(this.carol.address)).to.equal(true);
    });

    it ("keeps track of total votes received", async function() {
      expect((await this.election.totalVotes()).toNumber()).to.equal(0);
      await this.election.connect(this.owner).voteA();
      expect((await this.election.totalVotes()).toNumber()).to.equal(1);
      await this.election.connect(this.alice).voteB();
      expect((await this.election.totalVotes()).toNumber()).to.equal(2);
      await this.election.connect(this.bob).voteA();
      expect((await this.election.totalVotes()).toNumber()).to.equal(3);
      await this.election.connect(this.carol).voteB();
      expect((await this.election.totalVotes()).toNumber()).to.equal(4);
    });

    it ("marks election as complete when all votes are in", async function() {
      expect(await this.election.completed()).to.equal(false);
      await this.election.connect(this.owner).voteA();
      await this.election.connect(this.alice).voteB();
      await this.election.connect(this.bob).voteA();
      await this.election.connect(this.carol).voteA();
      expect(await this.election.completed()).to.equal(true);
    });

    it ("marks election as not active when all votes are in", async function() {
      expect(await this.election.completed()).to.equal(false);
      await this.election.connect(this.owner).voteA();
      await this.election.connect(this.alice).voteB();
      await this.election.connect(this.bob).voteA();
      await this.election.connect(this.carol).voteA();
      expect(await this.election.active()).to.equal(false);
    });

    it ("marks candidate A as winner if they win", async function() {
      await this.election.connect(this.owner).voteA();
      await this.election.connect(this.alice).voteB();
      await this.election.connect(this.bob).voteA();
      await this.election.connect(this.carol).voteA();
      expect(await this.election.winner()).to.equal(1);
    });

    it ("getVote() returns proper vote", async function() {
      await this.election.connect(this.owner).voteA();
      await this.election.connect(this.alice).voteB();
      await this.election.connect(this.bob).voteA();
      await this.election.connect(this.carol).voteB();
      expect(await this.election.getVote(this.owner.address)).to.equal(1);
      expect(await this.election.getVote(this.alice.address)).to.equal(2);
      expect(await this.election.getVote(this.bob.address)).to.equal(1);
      expect(await this.election.getVote(this.carol.address)).to.equal(2);
    });

    it ("Cannot vote A if election has completed", async function() {
      await this.election.connect(this.owner).voteA();
      await this.election.connect(this.alice).voteB();
      await this.election.connect(this.bob).voteA();
      await this.election.connect(this.carol).voteB();
      await expect(this.election.connect(this.signers[4]).voteA()).to.be.revertedWith("Election has completed");
    });

    it ("Cannot vote B if election has completed", async function() {
      await this.election.connect(this.owner).voteA();
      await this.election.connect(this.alice).voteB();
      await this.election.connect(this.bob).voteA();
      await this.election.connect(this.carol).voteB();
      await expect(this.election.connect(this.signers[4]).voteB()).to.be.revertedWith("Election has completed");
    });
  });

  context("Election reset", async function() {
    this.beforeEach(async function() {
      this.election = await this.Election.deploy("Elon Musk", "Jeff Bezos", 4);
      await this.election.deployed();
      await this.election.connect(this.owner).voteA();
      await this.election.connect(this.alice).voteB();
      await this.election.connect(this.bob).voteA();
    });

    it ("Election can be reset after completion", async function() {
      await this.election.connect(this.carol).voteB();
      await this.election.connect(this.owner).reset();
    });

    it ("Election can only be reset by owner", async function() {
      await this.election.connect(this.carol).voteB();
      await expect(this.election.connect(this.alice).reset()).to.be.revertedWith("caller is not the owner");
    });

    it ("Election can only be reset if completed", async function() {
      await expect(this.election.connect(this.owner).reset()).to.be.revertedWith("election is active");
    });

    it ("Reset empties candA name", async function() {
      await this.election.connect(this.carol).voteB();
      await this.election.connect(this.owner).reset();
      expect(await this.election.candA()).to.equal("");
    });

    it ("Reset empties candB name", async function() {
      await this.election.connect(this.carol).voteB();
      await this.election.connect(this.owner).reset();
      expect(await this.election.candB()).to.equal("");
    });

    it ("Reset clears expectedVotes", async function() {
      await this.election.connect(this.carol).voteB();
      await this.election.connect(this.owner).reset();
      expect((await this.election.expectedVotes()).toNumber()).to.equal(0);
    });

    it ("Reset clears aTotal", async function() {
      await this.election.connect(this.carol).voteB();
      await this.election.connect(this.owner).reset();
      expect((await this.election.aTotal()).toNumber()).to.equal(0);
    });
  });
});
