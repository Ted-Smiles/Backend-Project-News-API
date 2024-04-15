const { selectAllTopics, selectAllEndpoints, selectArticleById, selectAllArticles, selectAllCommentsFromArticleId }= require("../models/models")

exports.getAllEndpoints = (req, res, next) => {
    const endpoints = selectAllEndpoints()
    res.status(200).send({requestedEndpoints: endpoints})
}

exports.getAllTopics = (req, res, next) => {
    selectAllTopics()
    .then(({ rows }) => {
        const topics = rows

        res.status(200).send({ topics })
    })
    .catch((err) => {
        next(err)
    })
}

exports.getAllArticles = (req, res, next) => {
    selectAllArticles()
    .then(( { rows }) => {
        const articles = rows

        res.status(200).send({ articles })
    })
    .catch((err) => {
        next(err)
    })
}

exports.getArticleById = (req, res, next) => {
    const { article_id } = req.params
    selectArticleById(article_id)
    .then(( article ) => {
        res.status(200).send({article})
    })
    .catch((err) => {
        if (err.code === '42703') {
            err = {status: 404, msg: 'Invalid article_id'}
        }
        next(err)
    })
}

exports.getAllCommentsFromArticleId = (req, res, next) => {
    const { article_id } = req.params
    selectAllCommentsFromArticleId(article_id)
    .then (( comments ) => {
        res.status(200).send({comments})
    })
    .catch((err) => {
        if (err.code === '42703') {
            err = {status: 404, msg: 'Invalid article_id'}
        }
        next(err)
    })
}