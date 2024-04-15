const db = require("../db/connection")

exports.selectAllTopics = () => {
    const queryValues = []
    let queryStr = `SELECT * FROM topics`

    return db.query(queryStr, queryValues)
}