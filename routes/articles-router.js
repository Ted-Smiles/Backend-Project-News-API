const articleRouter = require('express').Router()

const {  getArticleById, getAllArticles, patchArticle, getAllCommentsFromArticleId, postNewComment, postNewArticle, deleteArticle } = require("../controllers/controllers")

articleRouter
    .route('/')
    .get(getAllArticles)
    .post(postNewArticle)

articleRouter
    .route('/:article_id')
    .get(getArticleById)
    .patch(patchArticle)
    .delete(deleteArticle)
    

articleRouter
    .route('/:article_id/comments')
    .get(getAllCommentsFromArticleId)
    .post(postNewComment)

module.exports = articleRouter