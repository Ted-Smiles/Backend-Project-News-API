const apiRouter = require('express').Router()
const userRouter = require("./users-router")
const articleRouter = require('./articles-router')
const topicRouter = require('./topics-router')
const commentRouter = require('./comments-router')

const { getAllEndpoints } = require("../controllers/controllers")

apiRouter.get('/', getAllEndpoints)

apiRouter.use('/users', userRouter)

apiRouter.use('/articles', articleRouter)

apiRouter.use('/comments', commentRouter)

apiRouter.use('/topics', topicRouter)

module.exports = apiRouter