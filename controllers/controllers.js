const { selectAllTopics, selectAllEndpoints }= require("../models/models")

exports.getAllEndpoints = (req, res, next) => {
    const endpoints = selectAllEndpoints()
    res.status(200).send({requestedEndpoints: endpoints})
}

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