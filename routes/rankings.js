let express = require("express");
let router = express.Router();
let mongoose = require("mongoose");
let Rank = mongoose.model("Rank");

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
    if (requestValid(request)) {
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
    } else {
        console.log("!!! Request is not valid! !!!");
        res.send({
            success: false
        });
    }
});

/* POST get rank. */
router.post("/getRank", (req, res, next) => {

    // how to create a storage item
    let deviceUuid = req.body.deviceUuid;
    res.send({
        rank: 198
    });
});

let requestValid = (request) => {
    // TODO: put that string to MD5
    return request.time + request.deviceUuid + request.level + request.name + request.score;
};

module.exports = router;
