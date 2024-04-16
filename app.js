const express = require("express")
const app = express()

const { getAllTopics, getAllEndpoints, getArticleById, getAllArticles, getAllCommentsFromArticleId, postNewComment, patchArticle } = require("./controllers/controllers")

app.use(express.json())

app.get('/api', getAllEndpoints)

app.get('/api/topics', getAllTopics)

app.get('/api/articles', getAllArticles)

app.get('/api/articles/:article_id', getArticleById)

app.get('/api/articles/:article_id/comments', getAllCommentsFromArticleId)

app.post('/api/articles/:article_id/comments', postNewComment)

app.patch('/api/articles/:article_id', patchArticle)


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