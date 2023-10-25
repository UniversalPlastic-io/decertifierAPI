const mongoose = require("mongoose")

mongoose.set("strictQuery", true)

function mongoConnect() {
  return mongoose.connect(process.env.MONGO_URL)
}

module.exports = mongoConnect
