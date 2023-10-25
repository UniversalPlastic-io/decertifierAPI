const express = require("express")
const corsPackage = require("cors")
const morgan = require("morgan")
const rateLimit = require("express-rate-limit")
const helmet = require("helmet")
const cookieParser = require("cookie-parser")

const mongoConnect = require("./mongo")

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
app.use(morgan("dev"))
app.use(helmet())
app.use(cookieParser())
app.use(express.json({ limit: "50mb", extended: true }))
app.use(express.urlencoded({ limit: "50mb", extended: true }))

// add routes here

mongoConnect().then(() => {
  console.log("Connected to database...")
  app.listen(3000, () => {
    console.log(`App running on port ${3000}...`)
  })
})
