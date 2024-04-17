const topicRouter = require('express').Router()

const { getAllTopics } = require("../controllers/controllers")

topicRouter
    .route('/')
    .get(getAllTopics)

module.exports = topicRouter