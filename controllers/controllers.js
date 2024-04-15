const { selectAllTopics }= require("../models/models")

exports.getAllTopics = (req, res, next) => {
    selectAllTopics()
    .then(({rows}) => {
        const topics = rows

        res.status(200).send({topics})
    })
    .catch((err) => {
        next(err)
    })
}