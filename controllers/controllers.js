const { selectAllTopics, selectAllEndpoints, selectArticleById }= require("../models/models")

exports.getAllEndpoints = (req, res, next) => {
    const endpoints = selectAllEndpoints()
    res.status(200).send({requestedEndpoints: endpoints})
}

exports.getAllTopics = (req, res, next) => {
    selectAllTopics()
    .then(({ rows }) => {
        const topics = rows

        res.status(200).send({topics})
    })
    .catch((err) => {
        next(err)
    })
}

exports.getArticleById = (req, res, next) => {
    const { article_id } = req.params
    selectArticleById(article_id)
    .then(({ rows }) => {
        if (rows.length === 0) {
            const err = {
                status: 404,
                msg: 'Invalid article_id'
            }
            next(err)
        } else {
            const article = rows[0]
    
            res.status(200).send({article})
        }
    })
}