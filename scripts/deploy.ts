import { ethers } from "hardhat"

async function main() {
  // "0x4D504b1e345c1324635D74426420ac8404Cfa170"

  // const notarizerContract = await ethers.deployContract("Notarizer")

  // await notarizerContract.waitForDeployment()
  // const [deployer] = await ethers.getSigners()

  const Token = await ethers.getContractFactory("Notarizer")
  const token = await Token.deploy("0x4D504b1e345c1324635D74426420ac8404Cfa170")

  console.log(`deployed to ${token.target}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
