import express from "express"
import { Request, Response } from "express"
import MerkleTree from "./merkleTree"
import { ethers } from "ethers"
import notarizerabi from "./Notarizer.json"
import basicAuth from "express-basic-auth"
import * as crypto from "crypto-js"

import * as dotenv from "dotenv"

require("dotenv").config()

const app = express()
const port = 3000

app.use(
  basicAuth({
    users: { admin: process.env.AUTH_PASSWORD! },
  })
)
app.use(express.json())

let fakeStorage: MerkleTree

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_CALL_URL)

const privateKey = process.env.PRIVATE_KEY
const wallet = new ethers.Wallet(privateKey!, provider)
const smartContractAdress = process.env.SMART_CONTRACT_ADDRESS
const contract = new ethers.Contract(
  smartContractAdress!,
  notarizerabi.abi,
  wallet
)

app.post("/notarize", async (req: Request, res: Response) => {
  const body = req.body
  const documents = body.documents
  const eventId = body.eventId
  const tree = new MerkleTree(documents)

  const merkleRoot = tree.getRoot()
  const merkleTree = tree.getTree()

  fakeStorage = tree // quitar esto para prod

  try {
    const transaction = await contract.updateMerkleRoot(eventId, merkleRoot)

    res.status(200).json({
      status: "Notarised",
      integrityCertificates: {
        merkleRoot: merkleRoot,
        merkleTree: merkleTree,
        txnId: transaction.hash,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Error notarizing " + error })
  }
})

const validate = (leaf: string, proof: string[], root: string) => {
  const proofCopy = new Array(...[proof])
  let currentHash = crypto.SHA256(leaf).toString()
  while (proofCopy.length > 0) {
    currentHash = crypto.SHA256(currentHash + proofCopy[0]).toString()
    proofCopy.shift()
  }
  return currentHash === root
}

app.post("/validate", async (req: Request, res: Response) => {
  const body = req.body
  const document = body.document
  const eventId = body.eventId

  try {
    const root = await contract.getMerkleRoot(eventId)

    const merkleTree = fakeStorage // Sacar de la db
    const index = merkleTree.leaves.indexOf(crypto.SHA256(document).toString())

    if (index >= 0) {
      const merkleProof = merkleTree.getProof(index)
      console.log("proof ", merkleProof)
      const isValid = validate(document, merkleProof, root)

      res.status(200).json({
        isValid: isValid,
        integrityCertificates: {
          merkleRoot: root,
          merkleTree: merkleTree.getTree(),
          merkleProof,
          txnId: "q123", //Sacar de DB
        },
      })
    } else {
      res.status(500).json({
        error: "The document is not part of the merkle tree s leafs",
      })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Error validating " + error })
  }
})
app.listen(port, () => {
  console.log(`Timezones by location application is running on port ${port}.`)
})
