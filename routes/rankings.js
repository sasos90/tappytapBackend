let express = require("express");
let router = express.Router();
let mongoose = require("mongoose");
let Rank = mongoose.model("Rank");
let md5 = require("md5");

// TODO: Remove that ON PRODUCTION
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
    // TODO: Enable request validation ON PRODUCTION
    if (request.deviceUuid !== null && requestValid(request)) {
        let rank = new Rank({
            name: request.name,
            deviceUuid: request.deviceUuid,
            score: request.score,
            levelReached: request.levelReached,
            timestamp: request.time
        });
        // update the row with the same timestamp and device id
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
                    // update data
                    rankItem.score = request.score;
                    rankItem.levelReached = request.levelReached;

                    rankItem.save((err) => {
                        if (err) {
                            res.json({
                                success: false
                            });
                            return console.error(err);
                        }

                        getRankForScore(request.deviceUuid, request.score, (status) => {
                            if (status.success) {
                                res.json({
                                    success: true,
                                    rank: status.rank
                                });
                            } else {
                                res.json({
                                    success: false
                                });
                            }
                        });
                        console.log("Rank updated:", rankItem);
                    });
                } else {
                    // not the best score of the day!
                    getRankForScore(request.deviceUuid, request.score, (status) => {
                        if (status.success) {
                            res.json({
                                success: true,
                                rank: status.rank
                            });
                        } else {
                            res.json({
                                success: false
                            });
                        }
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

                    getRankForScore(rank.deviceUuid, rank.score, (status) => {
                        if (status.success) {
                            res.json({
                                success: true,
                                rank: status.rank
                            });
                        } else {
                            res.json({
                                success: false
                            });
                        }
                    });
                    console.log("New rank item inserted:", rank);
                });
            }
        });
    } else {
        console.log("!!! Request is not valid! !!!");
        res.json({
            success: false
        });
    }
});

/* POST get rank. */
router.post("/getRank", (req, res, next) => {

    let deviceUuid = req.body.deviceUuid;

    getRank(deviceUuid, (status) => {
        if (status.success) {
            res.json({
                success: true,
                rank: status.rank,
                maxScore: status.maxScore,
                maxLevel: status.maxLevel
            });
        } else {
            res.json({
                success: false
            });
        }
    });
});

/* POST get rank for sore. */
router.post("/getRankForScore", (req, res, next) => {

    let request = req.body;

    getRankForScore(request.deviceUuid, request.score, (status) => {
        if (status.success) {
            res.json({
                success: true,
                rank: status.rank
            });
        } else {
            res.json({
                success: false
            });
        }
    });
});

/* POST get all time highscores. */
router.post("/getHighscores", (req, res, next) => {

    let deviceUuid = req.body.deviceUuid;

    // TODO: Highscores are not properly sorted...
    Rank.aggregate([
        {
            $group: {
                _id: "$deviceUuid",
                maxScore: { $max: "$score" },
                maxLevel: { $max: "$levelReached" },
                name: { $last: "$name" }
            }
        },
        { $sort : { maxScore: -1 } },
        { $limit: 10 }
    ], (err, highscores) => {
        if (err) {
            console.log("Error occured on getting highscores!");
            res.json({ success: false });
            return console.error(err);
        }

        let isTop10 = false;
        for (let rank of highscores) {
            if (rank._id === deviceUuid) {
                isTop10 = true;
            }
        }
        if (isTop10) {
            res.json({
                success: true,
                allTime: highscores,
                userRank: null
            });
        } else {
            getRank(deviceUuid, (status) => {
                if (status.success) {
                    res.json({
                        success: true,
                        allTime: highscores,
                        userRank: {
                            rank: status.rank,
                            maxScore: status.maxScore
                        }
                    });
                } else {
                    res.json({
                        success: false
                    });
                }
            });
        }
    });
});

let getRank = (deviceUuid, callback) => {
    Rank.find({
        deviceUuid: deviceUuid
    }).sort({
        score: -1
    }).limit(1).exec((err, rank) => {
        if (err) {
            callback({ success: false });
            console.log("Error occured on finding the max score!");
            return console.error(err);
        }

        if (rank.length > 0) {
            let maxScore = rank[0].score;
            let maxLevel = rank[0].levelReached;

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
                        _id: "$deviceUuid"
                    }
                }
            ], (err, list) => {
                if (err) {
                    console.log("Error occured on grouping the rankings when searching for rank!");
                    callback({ success: false });
                    return console.error(err);
                }

                console.log("GET RANK -> " + deviceUuid);
                console.log("Max Score: " + maxScore, "Ranks before: ", list);

                // rank can be zero, so we add + 1
                callback({
                    success: true,
                    rank: list.length + 1,
                    maxScore: maxScore,
                    maxLevel: maxLevel
                });
            });
        } else {
            console.log("No rank for you yet!", "deviceUuid: " + deviceUuid);
            callback({ success: false });
        }
    });
};

let getRankForScore = (deviceUuid, score, callback) => {

    // get rank
    Rank.aggregate([
        {
            $match: {
                score: {
                    $gt: score
                }
            }
        },
        {
            $group: {
                _id: "$deviceUuid"
            }
        }
    ], (err, list) => {
        if (err) {
            callback({ success: false });
            return console.error(err);
        }

        console.log("GET RANK FOR SCORE");
        console.log("Ranks before: ", list);

        // rank can be zero, so we add + 1
        callback({
            success: true,
            rank: list.length + 1
        });
    });
};

let requestValid = (request) => {
    let SALT = "*k9[unD1LrQSQ2_";
    return md5(request.time + request.deviceUuid + request.levelReached + request.name + request.score + SALT) === request.hash;
};

module.exports = router;
