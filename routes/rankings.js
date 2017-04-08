let express = require('express');
let router = express.Router();
let mongoose = require("mongoose");
let Rank = mongoose.model("Rank");

/* GET users listing. */
router.post('/sendScore', (req, res, next) => {
    // how to create a storage item
    let rank = new Rank({
        deviceUuid: "deviceUuid1",
        score: 113,
        levelReached: 4,
        timestamp: 1491644023
    });
    rank.save((err, insertedItem) => {
        if (err) {
            console.error("NOT INSERTED");
            res.send('new rank insert FAILED');
            return console.error(err);
        }
        console.log("New rank item inserted:", insertedItem);
        res.send('new rank inserted');
    });
});

module.exports = router;
