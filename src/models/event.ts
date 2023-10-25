const mongoose2 = require("mongoose")

const eventSchema = new mongoose2.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    numberOfDocuments: {
      type: Number,
      required: true,
    },
    documents: {
      type: [],
      required: true,
    },
    merkleTree: {
      type: [],
      required: true,
    },
    merkleRoot: {
      type: String,
      required: true,
    },
    txnId: {
      type: String,
      required: true,
    },
  },
  { collection: "events", timestamps: true }
)

const EventModel = mongoose2.model("Event", eventSchema)

module.exports = EventModel
