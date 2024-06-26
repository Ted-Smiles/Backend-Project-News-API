const { 
    selectAllTopics, 
    selectAllEndpoints, 
    selectArticleById, 
    selectAllArticles, 
    selectAllCommentsFromArticleId, 
    updateNewComment, 
    updateArticleVotes, 
    deleteCommentById,
    selectAllUser,
    selectUserByUsername,
    updateCommentVotes,
    updateNewArticle,
    updateNewTopic,
    deleteArticlesById } = require("../models/models")

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

exports.postNewTopic = (req, res, next) => {
    const newtopic = req.body
    updateNewTopic(newtopic)
    .then((topic) => {
        res.status(201).send({ topic })
    })
    .catch((err) => {
        next(err)
    })
}

exports.getAllUsers = (req, res, next) => {
    selectAllUser()
    .then(({ rows }) => {
        const users = rows
        res.status(200).send({ users })
    })
    .catch((err) => {
        next(err)
    })
}

exports.getUserByUsername = (req, res, next) => {
    const { username } = req.params
    selectUserByUsername(username)
    .then(( user ) => {
        res.status(200).send({ user })
    })
    .catch((err) => {
        next(err)
    })
}

exports.getAllArticles = (req, res, next) => {
    const query = req.query
    selectAllArticles(query)
    .then(( object ) => {
        const { rows: articles }  = object
        const { total_count }  = object
        res.status(200).send({ articles, total_count })
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
    const query = req.query
    const { article_id } = req.params
    selectAllCommentsFromArticleId(query, article_id)
    .then (( object ) => {
        const { rows: comments }  = object
        const { total_count }  = object
        res.status(200).send({comments, total_count})
    })
    .catch((err) => {
        next(err)
    })
}

exports.postNewComment = (req, res, next) => {
    const newComment = req.body
    const { article_id } = req.params
    updateNewComment(newComment, article_id)
    .then((comment) => {
        res.status(201).send({ comment })
    })
    .catch((err) => {
        next(err)
    })
}

exports.patchArticle = (req, res, next) => {
    const newVote = req.body
    const { article_id } = req.params
    updateArticleVotes(newVote, article_id)
    .then((article) => {
        res.status(200).send({ article })
    })
    .catch((err) => {
        next(err)
    })
}

exports.postNewArticle = (req, res, next) => {
    const newArticle = req.body
    updateNewArticle(newArticle)
    .then((article) => {
        res.status(201).send({ article })
    })
    .catch((err) => {
        next(err)
    })
}

exports.deleteArticle = (req, res, next) => {
    const { article_id } = req.params
    deleteArticlesById(article_id)
    .then(() => {
        res.status(204).send()
    })
    .catch((err) => {
        next(err)
    })
}

exports.patchComment = (req, res, next) => {
    const newVote = req.body
    const { comment_id } = req.params
    updateCommentVotes(newVote, comment_id)
    .then((comment) => {
        res.status(200).send({ comment })
    })
    .catch((err) => {
        next(err)
    })
}
exports.deleteComment = (req, res, next) => {
    const { comment_id } = req.params
    deleteCommentById(comment_id)
    .then(() => {
        res.status(204).send()
    })
    .catch((err) => {
        next(err)
    })
}

