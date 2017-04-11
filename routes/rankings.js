let express = require("express");
let router = express.Router();
let mongoose = require("mongoose");
let Rank = mongoose.model("Rank");
let md5 = require("md5");

router.use((req, res, next) => {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8100');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Pass to next layer of middleware
    next();
});


/* POST submit score. */
router.post("/sendScore", (req, res, next) => {

    // how to create a storage item
    let request = req.body;
    // deviceUuid is null when accessing from browser
    if (request.deviceUuid !== null && requestValid(request)) {
        let rank = new Rank({
            name: request.name,
            deviceUuid: request.deviceUuid,
            score: request.score,
            levelReached: request.levelReached,
            timestamp: request.timestamp
        });
        // update the row with the same timestamp and device id
        Rank.findOneAndUpdate({
            deviceUuid: request.deviceUuid,
            timestamp: request.timestamp
        }, {
            name: request.name,
            score: request.score,
            levelReached: request.levelReached,
        }, {
            upsert: true
        }, (err, insertedItem) => {
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
    } else {
        console.log("!!! Request is not valid! !!!");
        res.send({
            success: false
        });
    }
});

/* POST get rank. */
router.post("/getRank", (req, res, next) => {

    let deviceUuid = req.body.deviceUuid;
    Rank.count().where("deviceUuid").equals(deviceUuid).exec((err, rank) => {
        if (err) {
            res.send({
                success: false
            });
            return console.error(err);
        }

        // rank can be zero, so we add + 1
        res.send({
            rank: rank + 1,
            success: true
        });
    });
});

let requestValid = (request) => {
    let SALT = "*k9[unD1LrQSQ2_";
    return md5(request.time + request.deviceUuid + request.level + request.name + request.score + SALT) === request.hash;
};

module.exports = router;
