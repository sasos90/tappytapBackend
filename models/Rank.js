/**
 * Created by saso on 10/14/16.
 */
let mongoose = require("mongoose");

// Mongoose schemas
let rankSchema = mongoose.Schema({
    name: String,
    deviceUuid: String,
    score: Number,
    levelReached: Number,
    timestamp: Number
}, { collection: "rankings" });
let Rank = mongoose.model("Rank", rankSchema);
module.exports = Rank;
