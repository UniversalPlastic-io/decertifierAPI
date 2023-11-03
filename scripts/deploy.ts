import { ethers } from "hardhat"

async function main() {
  const Notarizer = await ethers.getContractFactory("Notarizer")
  const notarizer = await Notarizer.deploy(
    "0x4D504b1e345c1324635D74426420ac8404Cfa170"
  )

  console.log(`deployed to ${notarizer.target}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
