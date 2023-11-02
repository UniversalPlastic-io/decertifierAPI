import express from "express"
import corsPackage from "cors"
import { rateLimit } from "express-rate-limit"
import { Request, Response } from "express"
import { MerkleTree, validateLeaf } from "./merkleTree"
import { ethers } from "ethers"
import notarizerabi from "./Notarizer.json"
import * as dotenv from "dotenv"
const mongoConnect = require("./mongo.ts")
const EventModel = require("./models/event")
require("dotenv").config()

const app = express()

const cors = corsPackage({
  origin: "*",
})

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 min
  max: 100,
  standardHeaders: false,
  legacyHeaders: false,
})

app.use(cors)
app.use(limiter)
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb", extended: true }))

const port = 3000

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

  try {
    const transaction = await contract.updateMerkleRoot(eventId, merkleRoot)
    const event = new EventModel({
      id: eventId,
      numberOfDocuments: documents.length,
      merkleRoot: merkleRoot,
      merkleTree: merkleTree,
      documents: documents,
      txnId: transaction.hash,
    })
    await event.save()
    res.status(200).json({
      status: "Notarised",
      numberOfDocuments: documents.length,
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

app.post("/validate", async (req: Request, res: Response) => {
  const body = req.body
  const document = body.document
  const eventId = body.eventId

  try {
    const root = await contract.getMerkleRoot(eventId)
    const merkleTreeObject = await EventModel.findOne({ id: eventId })

    if (!merkleTreeObject) {
      return res.status(500).json({
        error: "No merkle tree found",
      })
    }
    const merkleTree = new MerkleTree(merkleTreeObject.documents)
    const index = merkleTreeObject.documents.indexOf(document)
    if (index >= 0) {
      const merkleProof = merkleTree.getProof(index)
      const isValid = validateLeaf(document, merkleProof, root)

      res.status(200).json({
        isValid: isValid,
        integrityCertificates: {
          merkleRoot: root,
          merkleTree: merkleTree.getTree(),
          merkleProof,
          txnId: merkleTreeObject.txnId, //Sacar de DB
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

mongoConnect().then(() => {
  console.log("Connected to database...")
  app.listen(3000, () => {
    console.log(`App running on port ${3000}...`)
  })
})
