const express = require("express")
const app = express()

const apiRouter = require("./routes/api-router")

const cors = require('cors')

const { getAllTopics, getAllEndpoints, getArticleById, getAllArticles, getAllCommentsFromArticleId, postNewComment, patchArticle, deleteComment, getAllUsers } = require("./controllers/controllers")

app.use(express.json())

app.use(cors())

app.use('/api', apiRouter)


app.use((req, res, next) => {
    const err = {
        status: 404,
        msg: 'Path not found'
    }
    next(err)
})

app.use((err, req, res, next) => {
    if (err.code === '23502') {
        err = {status: 400, msg: 'Invalid new entry'}
    } else if (err.code === '23503' && err.constraint === 'comments_author_fkey') {
        err = {status: 404, msg: 'Not a valid user'}
    } else if (err.code === '23503' && err.constraint == 'comments_article_id_fkey') {
        err = {status: 404, msg: 'article_id does not exist'}
    } else if (err.code === '23503' && err.constraint == 'articles_topic_fkey') {
        err = {status: 404, msg: 'topic does not exist'}
    } else if (err.code === '23503' && err.constraint == 'articles_author_fkey') {
        err = {status: 404, msg: 'author does not exist'}
    } else if (err.code === '22P02') {
        err = {status: 400, msg: 'Invalid path params'}
    } 


    if (err.status && err.msg) {
        res.status(err.status).send({ msg: err.msg });
    } else {
        res.status(500).send({ msg: 'Internal Server Error' })
    }
})

module.exports = app