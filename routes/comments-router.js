const commentRouter = require('express').Router()

const { deleteComment, patchComment } = require("../controllers/controllers")

commentRouter
    .route('/:comment_id')
    .patch(patchComment)
    .delete(deleteComment)    

module.exports = commentRouter