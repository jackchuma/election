const { expect } = require("chai");
const { ethers } = require("hardhat");
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

describe("Election", function () {
  before(async function() {
    this.signers = ethers.getSigners();
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
      await this.election.setCandA("Jefferey");
      expect(await this.election.candA()).to.equal("Jefferey");
    });
  });
});
