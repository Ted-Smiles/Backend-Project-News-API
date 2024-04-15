const db = require("../db/connection")
const endpoints = require("../endpoints.json")

exports.selectAllEndpoints = () => {
    return endpoints
}

exports.selectAllTopics = () => {
    const queryValues = []
    let queryStr = `SELECT * FROM topics`

    return db.query(queryStr, queryValues)
}