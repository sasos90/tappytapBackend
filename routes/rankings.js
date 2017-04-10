let express = require("express");
let router = express.Router();
let mongoose = require("mongoose");
let Rank = mongoose.model("Rank");

/* POST submit score. */
router.post("/sendScore", (req, res, next) => {

    // how to create a storage item
    let request = req.body;
    let rank = new Rank({
        name: request.name,
        deviceUuid: request.deviceUuid,
        score: request.score,
        levelReached: request.levelReached,
        timestamp: request.timestamp
    });
    rank.save((err, insertedItem) => {
        if (err) {
            console.error("NOT INSERTED");
            res.send({
                success: false
            });
            return console.error(err);
        }
        res.send({
            success: true
        });
        console.log("New rank item inserted:", insertedItem);
    });
});

/* POST get rank. */
router.post("/getRank", (req, res, next) => {

    // how to create a storage item
    let deviceUuid = req.body.deviceUuid;

    res.send({
        rank: 198
    });
});

module.exports = router;
