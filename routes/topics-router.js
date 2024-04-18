const topicRouter = require('express').Router()

const { getAllTopics, postNewTopic } = require("../controllers/controllers")

topicRouter
    .route('/')
    .get(getAllTopics)
    .post(postNewTopic)

module.exports = topicRouter