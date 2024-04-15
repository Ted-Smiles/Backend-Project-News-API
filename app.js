const express = require("express")
const app = express()

const { getAllTopics, getAllEndpoints, getArticleById, getAllArticles, getAllCommentsFromArticleId, postNewComment } = require("./controllers/controllers")

app.use(express.json())

app.get('/api', getAllEndpoints)

app.get('/api/topics', getAllTopics)

app.get('/api/articles', getAllArticles)

app.get('/api/articles/:article_id', getArticleById)

app.get('/api/articles/:article_id/comments', getAllCommentsFromArticleId)

app.post('/api/articles/:article_id/comments', postNewComment)


app.use((req, res, next) => {
    const err = {
        status: 404,
        msg: 'Path not found'
    }
    next(err)
})

app.use((err, req, res, next) => {
    if (err.status && err.msg) {
        res.status(err.status).send({ msg: err.msg });
    } else {
        res.status(500).send({ msg: 'Internal Server Error' })
    }
})

module.exports = app