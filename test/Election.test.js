const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Election", function () {
  before(async function() {
    const Election = await ethers.getContractFactory("Election");
    this.election = await Election.deploy("Elon Musk", "Jeff Bezos");
    await this.election.deployed();
  });
});
