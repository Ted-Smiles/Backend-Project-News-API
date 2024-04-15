const db = require("../db/connection")
const endpoints = require("../endpoints.json")

exports.selectAllEndpoints = () => {
    return endpoints
}

exports.selectAllTopics = () => {
    let queryStr = `SELECT * FROM topics`

    return db.query(queryStr)
}

exports.selectArticleById = (id) => {
    let queryStr = `SELECT * FROM articles`

    queryStr += ` WHERE article_id = ${id}`

    return db.query(queryStr)
}