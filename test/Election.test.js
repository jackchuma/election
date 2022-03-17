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

  context("Variable Setting", async function() {
    this.beforeEach(async function() {
      this.election = await this.Election.deploy("Elon Musk", "Jeff Bezos");
      await this.election.deployed();
    });

    it ("Should be able to change name of candidate A", async function() {
      await this.election.connect(this.owner).setCandA("Jefferey");
      expect(await this.election.candA()).to.equal("Jefferey");
    });

    it ("Only owner can change name of candidate A", async function() {
      await expect(this.election.connect(this.alice).setCandA("Jefferey")).to.be.revertedWith("caller is not the owner");
    })

    it ("Should be able to change name of candidate B", async function() {
      await this.election.connect(this.owner).setCandB("Jefferey");
      expect(await this.election.candB()).to.equal("Jefferey");
    });
  });
});
