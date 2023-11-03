const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Notarizer Smart Contract", function () {
  let notarizer

  before(async function () {
    const [owner] = await ethers.getSigners()
    let smartContractOwner = owner.adress
    const Notarizer = await ethers.getContractFactory("Notarizer")
    notarizer = await Notarizer.deploy(owner.address)
  })

  it("should deploy the Notarizer contract", async function () {
    console.log(notarizer.address)
    expect(notarizer.address).to.not.equal(0)
  })

  it("should have the correct owner address", async function () {
    let owner = await notarizer.owner()
    const [ethersSigners] = await ethers.getSigners()
    expect(owner).equal(ethersSigners.address)
  })

  it("should update and retrieve a merkle root", async function () {
    const id = 1
    const newMerkleRoot = "newRoot"
    const bussinessId = "business123"

    await notarizer.updateMerkleRoot(id, newMerkleRoot, bussinessId)
    const result = await notarizer.getMerkleRoot(id)
    expect(result).to.equal(newMerkleRoot)

    const resultBussinessId = await notarizer.getMerkleRootBussinessId(id)
    expect(resultBussinessId).to.equal(bussinessId)
  })

  it("should revert if trying to update an id that already contains data", async function () {
    const id = 1
    const newMerkleRoot = "newRoot"
    const bussinessId = "business123"

    await await expect(
      notarizer.updateMerkleRoot(id, newMerkleRoot, bussinessId)
    ).to.be.revertedWith("There is already a value stored for that id")
  })

  it("should get merkle data", async function () {
    const id = 1
    const newMerkleRoot = "newRoot"
    const bussinessId = "business123"

    const merkleData = await notarizer.getMerkleData(id)
    expect(merkleData.merkleRoot).to.equal(newMerkleRoot)
    expect(merkleData.bussinessId).to.equal(bussinessId)
  })
})
