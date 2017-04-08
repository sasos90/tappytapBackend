/**
 * Created by saso on 10/14/16.
 */
var mongoose = require("mongoose");

// Mongoose schemas
var rankSchema = mongoose.Schema({
    deviceUuid: String,
    score: Number,
    levelReached: Number,
    timestamp: Number
});
var Rank = mongoose.model("Rank", rankSchema);
module.exports = Rank;
