const articleRouter = require('express').Router()

const {  getArticleById, getAllArticles, patchArticle, getAllCommentsFromArticleId, postNewComment } = require("../controllers/controllers")

articleRouter
    .route('/')
    .get(getAllArticles)

articleRouter
    .route('/:article_id')
    .get(getArticleById)
    .patch(patchArticle)


articleRouter
    .route('/:article_id/comments')
    .get(getAllCommentsFromArticleId)
    .post(postNewComment)

module.exports = articleRouter