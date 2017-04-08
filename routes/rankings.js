let express = require('express');
let router = express.Router();
let mongoose = require("mongoose");
let Rank = mongoose.model("Rank");

/* GET users listing. */
router.post('/sendScore', (req, res, next) => {

    // how to create a storage item
    let request = req.body;
    let rank = new Rank({
        deviceUuid: request.deviceUuid,
        score: request.score,
        levelReached: request.levelReached,
        timestamp: request.timestamp
    });
    rank.save((err, insertedItem) => {
        if (err) {
            console.error("NOT INSERTED");
            res.send('new rank insert FAILED');
            return console.error(err);
        }
        console.log("New rank item inserted:", insertedItem);
        res.send(insertedItem);
    });
});

module.exports = router;
