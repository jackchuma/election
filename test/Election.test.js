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
      this.election = await this.Election.deploy("Elon Musk", "Jeff Bezos");
      await this.election.deployed();
    });

    it ("Should store names of candidates after deployment", async function() {
      expect(await this.election.candA()).to.equal("Elon Musk");
      expect(await this.election.candB()).to.equal("Jeff Bezos");
    });
  });

  context("Voting", async function() {
    this.beforeEach(async function() {
      this.election = await this.Election.deploy("Elon Musk", "Jeff Bezos");
      await this.election.deployed();
    });

    it ("Anyone can vote for candidate A", async function() {
      await this.election.connect(this.owner).voteA();
      await this.election.connect(this.alice).voteA();
      await this.election.connect(this.bob).voteA();
      await this.election.connect(this.carol).voteA();
    });

    it ("Anyone can vote for candidate B", async function() {
      await this.election.connect(this.owner).voteB();
      await this.election.connect(this.alice).voteB();
      await this.election.connect(this.bob).voteB();
      await this.election.connect(this.carol).voteB();
    });
  });
});
