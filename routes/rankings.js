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
    // if (request.deviceUuid !== null && requestValid(request)) {
        let rank = new Rank({
            name: request.name,
            deviceUuid: request.deviceUuid,
            score: request.score,
            levelReached: request.levelReached,
            timestamp: request.time
        });
        // update the row with the same timestamp and device id
        // TODO: check if score is better then the actual stored in the database.
        Rank.findOne({
            deviceUuid: request.deviceUuid,
            timestamp: request.time
        }, (err, rankItem) => {
            if (err) {
                console.error("Error occured in finding the rank");
                res.json({
                    success: false
                });
                return console.error(err);
            }

            if (rankItem !== null) {
                // update
                if (request.score > rankItem.score) {
                    rankItem.score = request.score;
                    rankItem.save((err) => {
                        if (err) {
                            res.json({
                                success: false
                            });
                            return console.error(err);
                        }

                        res.json({
                            success: true
                        });
                        console.log("Rank updated:", rankItem);
                    });
                } else {
                    // not the best score of the day!
                    res.json({
                        success: true
                    });
                }
            } else {
                // insert
                rank.save((err) => {
                    if (err) {
                        res.json({
                            success: false
                        });
                        return console.error(err);
                    }

                    res.json({
                        success: true
                    });
                    console.log("New rank item inserted:", rankItem);
                });
            }
        });
    /*} else {
        console.log("!!! Request is not valid! !!!");
        res.json({
            success: false
        });
    }*/
});

/* POST get rank. */
router.post("/getRank", (req, res, next) => {

    let deviceUuid = req.body.deviceUuid;

    Rank.find({
        deviceUuid: deviceUuid
    }).sort({
        score: -1
    }).limit(1).exec((err, rank) => {
        if (err) {
            res.json({
                success: false
            });
            return console.error(err);
        }

        if (rank.length > 0) {
            let maxScore = rank[0].score;

            // get rank
            Rank.aggregate([
                {
                    $match: {
                        score: {
                            $gt: maxScore
                        }
                    }
                },
                {
                    $group: {
                        _id: "$deviceUuid"/*,
                        maxScore: {$max:"$score"}*/
                    }
                }
            ], (err, list) => {
                if (err) {
                    res.json({
                        success: false
                    });
                    return console.error(err);
                }

                // rank can be zero, so we add + 1
                res.json({
                    rank: list.length + 1,
                    success: true
                });
            });
        } else {
            res.json({
                success: false
            });
        }
    });
});

let requestValid = (request) => {
    let SALT = "*k9[unD1LrQSQ2_";
    return md5(request.time + request.deviceUuid + request.levelReached + request.name + request.score + SALT) === request.hash;
};

module.exports = router;
