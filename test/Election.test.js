const { expect } = require("chai");
const { ethers } = require("hardhat");
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

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

    it ("marks candidate A as winner if they win", async function() {
      await this.election.connect(this.owner).voteA();
      await this.election.connect(this.alice).voteB();
      await this.election.connect(this.bob).voteA();
      await this.election.connect(this.carol).voteA();
      expect(await this.election.winner()).to.equal(1);
    });
  });
});
